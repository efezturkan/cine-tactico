#!/usr/bin/env python3
"""Wikidata'dan film ve dizi katalogu çeker. Uydurma alan yazmaz."""

import json
import re
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "content" / "ingest" / "wikidataBulk.json"
UA = "CineXOX/1.0 (catalog import)"
VERIFIED_ON = "2026-11-01"

GENRE = {
    "action film": "ACTION",
    "action": "ACTION",
    "adventure film": "ADVENTURE",
    "adventure": "ADVENTURE",
    "animated film": "ANIMATION",
    "animation": "ANIMATION",
    "anime": "ANIMATION",
    "biographical film": "BIOGRAPHY",
    "biopic": "BIOGRAPHY",
    "comedy film": "COMEDY",
    "comedy": "COMEDY",
    "crime film": "CRIME",
    "crime": "CRIME",
    "documentary film": "DOCUMENTARY",
    "documentary": "DOCUMENTARY",
    "drama film": "DRAMA",
    "drama": "DRAMA",
    "family film": "FAMILY",
    "family": "FAMILY",
    "fantasy film": "FANTASY",
    "fantasy": "FANTASY",
    "historical film": "HISTORY",
    "history": "HISTORY",
    "horror film": "HORROR",
    "horror": "HORROR",
    "musical film": "MUSICAL",
    "musical": "MUSICAL",
    "mystery film": "MYSTERY",
    "mystery": "MYSTERY",
    "romance film": "ROMANCE",
    "romantic film": "ROMANCE",
    "romance": "ROMANCE",
    "science fiction film": "SCI_FI",
    "science fiction": "SCI_FI",
    "sci-fi film": "SCI_FI",
    "sports film": "SPORT",
    "sport": "SPORT",
    "thriller film": "THRILLER",
    "thriller": "THRILLER",
    "war film": "WAR",
    "war": "WAR",
    "western film": "WESTERN",
    "western": "WESTERN",
}


def curl_json(url, params):
    cmd = ["curl", "-sG", url, "-A", UA, "--max-time", "120"]
    for key, value in params:
        cmd.extend(["--data-urlencode", f"{key}={value}"])
    last = "boş"
    for attempt in range(6):
        try:
            raw = subprocess.check_output(cmd)
            if not raw.strip():
                raise ValueError("boş yanıt")
            data = json.loads(raw)
        except Exception as exc:
            last = str(exc)
            time.sleep(3 + attempt * 5)
            continue
        if isinstance(data, dict) and data.get("error", {}).get("code") == "too-many-requests":
            time.sleep(8 + attempt * 6)
            continue
        return data
    raise RuntimeError(f"istek başarısız: {last}")


def sparql(query):
    data = curl_json(
        "https://query.wikidata.org/sparql",
        [("query", query), ("format", "json")],
    )
    time.sleep(0.4)
    return data["results"]["bindings"]


def qid_list(query):
    rows = sparql(query)
    found = []
    seen = set()
    for row in rows:
        qid = row["item"]["value"].rsplit("/", 1)[-1]
        if qid in seen:
            continue
        seen.add(qid)
        found.append((qid, int(row["s"]["value"])))
    return found


def existing_types():
    films = set()
    series = set()
    movie_text = (ROOT / "src" / "data" / "movies.ts").read_text(encoding="utf-8")
    for match in re.finditer(r'sourceIds:\s*\{\s*wikidata:\s*"(Q\d+)"', movie_text):
        window = movie_text[max(0, match.start() - 900) : match.start()]
        if 'mediaType: "SERIES"' in window:
            series.add(match.group(1))
        else:
            films.add(match.group(1))
    pilot = (ROOT / "src" / "content" / "ingest" / "pilotRecords.ts").read_text(encoding="utf-8")
    for block in re.split(r"\n  \{", pilot):
        qid = re.search(r'"wikidataId": "(Q\d+)"', block)
        kind = re.search(r'"contentType": "(MOVIE|TV_SERIES)"', block)
        if not qid or not kind:
            continue
        if kind.group(1) == "TV_SERIES":
            series.add(qid.group(1))
        else:
            films.add(qid.group(1))
    return films, series


def entity_batches(qids, size=8):
    for i in range(0, len(qids), size):
        chunk = qids[i : i + size]
        data = curl_json(
            "https://www.wikidata.org/w/api.php",
            [
                ("action", "wbgetentities"),
                ("ids", "|".join(chunk)),
                ("props", "labels|claims"),
                ("languages", "en|tr"),
                ("format", "json"),
            ],
        )
        time.sleep(0.25)
        yield data.get("entities", {})


def claim_ids(claims, prop):
    found = []
    for statement in claims.get(prop, []):
        snak = statement.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        value = snak.get("datavalue", {}).get("value")
        if isinstance(value, dict) and value.get("id"):
            found.append((value["id"], statement.get("qualifiers", {})))
    return found


def claim_times(claims, prop):
    years = []
    for statement in claims.get(prop, []):
        snak = statement.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        time_value = snak.get("datavalue", {}).get("value", {}).get("time", "")
        if len(time_value) >= 5 and time_value[1:5].isdigit():
            years.append(int(time_value[1:5]))
    return years


def monolingual(claims, prop):
    found = []
    for statement in claims.get(prop, []):
        snak = statement.get("mainsnak", {})
        if snak.get("snaktype") != "value":
            continue
        value = snak.get("datavalue", {}).get("value", {})
        if value.get("text"):
            found.append((value["text"], value.get("language")))
    return found


def qualifier_year(qualifiers):
    for snak in qualifiers.get("P585", []):
        if snak.get("snaktype") != "value":
            continue
        time_value = snak.get("datavalue", {}).get("value", {}).get("time", "")
        if len(time_value) >= 5 and time_value[1:5].isdigit() and "-00-" not in time_value[:8]:
            return int(time_value[1:5])
        if len(time_value) >= 5 and time_value[1:5].isdigit():
            return int(time_value[1:5])
    return None


def award_org(label):
    text = label.lower()
    if any(word in text for word in ("submission", "shortlist", "fipresci")):
        return None
    if "academy award" in text or text == "oscar" or text.startswith("oscar "):
        return "OSCAR"
    if "bafta" in text:
        return "BAFTA"
    if "golden globe" in text:
        return "GOLDEN_GLOBE"
    if "palme d'or" in text or "palme d’or" in text or text.startswith("cannes film festival") or text.startswith("cannes best") or text.startswith("cannes grand"):
        return "CANNES"
    if "golden lion" in text or text.startswith("venice film festival"):
        return "VENICE"
    if "golden bear" in text or text.startswith("berlin international") or text.startswith("berlinale"):
        return "BERLIN"
    return None


def resolve(qids, props):
    resolved = {}
    unique = [qid for qid in dict.fromkeys(qids) if qid]
    for i in range(0, len(unique), 40):
        chunk = unique[i : i + 40]
        data = curl_json(
            "https://www.wikidata.org/w/api.php",
            [
                ("action", "wbgetentities"),
                ("ids", "|".join(chunk)),
                ("props", "labels|claims"),
                ("languages", "en|tr"),
                ("format", "json"),
            ],
        )
        time.sleep(0.2)
        for eid, entity in data.get("entities", {}).items():
            if entity.get("missing"):
                continue
            labels = entity.get("labels", {})
            claims = entity.get("claims", {})
            record = {
                "en": (labels.get("en") or {}).get("value"),
                "tr": (labels.get("tr") or {}).get("value"),
            }
            for prop in props:
                statements = claims.get(prop, [])
                if not statements or statements[0].get("mainsnak", {}).get("snaktype") != "value":
                    continue
                record[prop] = statements[0]["mainsnak"]["datavalue"]["value"]
            resolved[eid] = record
        print(f"  çözüldü {min(i + 40, len(unique))}/{len(unique)}", flush=True)
    return resolved


def label_of(resolved, qid):
    row = resolved.get(qid) or {}
    return row.get("tr") or row.get("en")


def main():
    print("film listesi", flush=True)
    films = qid_list(
        """
        SELECT ?item ?s WHERE {
          ?item wdt:P31 wd:Q11424 ; wikibase:sitelinks ?s .
          FILTER(?s >= 35)
        }
        ORDER BY DESC(?s)
        LIMIT 720
        """
    )
    print("dizi listesi", flush=True)
    series = qid_list(
        """
        SELECT ?item ?s WHERE {
          VALUES ?type { wd:Q5398426 wd:Q1259759 }
          ?item wdt:P31 ?type ; wikibase:sitelinks ?s .
          FILTER(?s >= 20)
        }
        ORDER BY DESC(?s)
        LIMIT 260
        """
    )
    known_films, known_series = existing_types()
    known = known_films | known_series
    film_ids = {qid for qid, _ in films}
    series_ids = {qid for qid, _ in series}
    rank = {qid: score for qid, score in films + series}
    fetch_ids = []
    seen = set()
    for qid, _ in films + series:
        if qid not in seen:
            seen.add(qid)
            fetch_ids.append(qid)
    for qid in known:
        if qid not in seen:
            seen.add(qid)
            fetch_ids.append(qid)
    print(f"çekilecek {len(fetch_ids)}", flush=True)

    cache_path = Path("/tmp/cinexox-extracted.json")
    extracted = {}
    if cache_path.exists():
        extracted = json.loads(cache_path.read_text(encoding="utf-8"))
        print(f"önbellek {len(extracted)}", flush=True)
    pending = [qid for qid in fetch_ids if qid not in extracted]
    done = len(fetch_ids) - len(pending)
    for entities in entity_batches(pending):
        for eid, entity in entities.items():
            if entity.get("missing"):
                continue
            labels = entity.get("labels", {})
            claims = entity.get("claims", {})
            extracted[eid] = {
                "en": (labels.get("en") or {}).get("value"),
                "tr": (labels.get("tr") or {}).get("value"),
                "years": claim_times(claims, "P577") or claim_times(claims, "P580"),
                "originals": monolingual(claims, "P1476"),
                "countries": [qid for qid, _ in claim_ids(claims, "P495")],
                "languages": [qid for qid, _ in claim_ids(claims, "P364")],
                "genres": [qid for qid, _ in claim_ids(claims, "P136")],
                "directors": [qid for qid, _ in claim_ids(claims, "P57")],
                "writers": [qid for qid, _ in claim_ids(claims, "P58")][:5],
                "actors": [qid for qid, _ in claim_ids(claims, "P161")][:12],
                "awards": [
                    ("WINNER", qid, qualifier_year(quals))
                    for qid, quals in claim_ids(claims, "P166")
                ]
                + [
                    ("NOMINEE", qid, qualifier_year(quals))
                    for qid, quals in claim_ids(claims, "P1411")
                ],
            }
        done += 8
        cache_path.write_text(json.dumps(extracted), encoding="utf-8")
        print(f"  yapım {min(done, len(fetch_ids))}/{len(fetch_ids)}", flush=True)

    ref_ids = []
    for row in extracted.values():
        ref_ids.extend(row["countries"])
        ref_ids.extend(row["languages"])
        ref_ids.extend(row["genres"])
        ref_ids.extend(row["directors"])
        ref_ids.extend(row["writers"])
        ref_ids.extend(row["actors"])
        ref_ids.extend(award[1] for award in row["awards"])
    print(f"referans {len(set(ref_ids))}", flush=True)
    resolved = resolve(ref_ids, ["P297", "P218", "P569"])

    productions = []
    country_labels = {}
    language_labels = {}
    for qid, row in extracted.items():
        if qid in known_series:
            content_type = "TV_SERIES"
        elif qid in known_films:
            content_type = "MOVIE"
        elif qid in series_ids and qid not in film_ids:
            content_type = "TV_SERIES"
        else:
            content_type = "MOVIE"
        title = row["en"] or row["tr"]
        if not title or not row["years"]:
            continue
        valid_years = [value for value in row["years"] if 1888 <= value <= 2026]
        if not valid_years:
            continue
        year = min(valid_years)
        countries = []
        for country_id in row["countries"]:
            info = resolved.get(country_id) or {}
            iso = info.get("P297")
            if not isinstance(iso, str) or len(iso) != 2:
                continue
            if iso not in countries:
                countries.append(iso)
            country_labels[iso] = info.get("tr") or info.get("en") or iso
        languages = []
        for language_id in row["languages"]:
            info = resolved.get(language_id) or {}
            code = info.get("P218")
            if not isinstance(code, str) or not re.fullmatch(r"[a-z]{2}", code):
                continue
            if code not in languages:
                languages.append(code)
            language_labels[code] = info.get("tr") or info.get("en") or code
        genres = []
        for genre_id in row["genres"]:
            name = ((resolved.get(genre_id) or {}).get("en") or "").strip().lower()
            genre = GENRE.get(name)
            if genre and genre not in genres:
                genres.append(genre)
        if content_type == "MOVIE" and (not row["directors"] or not genres):
            if qid not in known:
                continue
        if content_type == "TV_SERIES" and not row["actors"] and qid not in known:
            continue
        directors = row["directors"]
        if content_type == "TV_SERIES" and len(directors) > 3:
            directors = []
        else:
            directors = directors[:3]
        credits = []
        for role, people in (
            ("DIRECTOR", directors),
            ("WRITER", row["writers"] if content_type == "MOVIE" else []),
            ("ACTOR", row["actors"]),
        ):
            for person_id in people:
                name = (resolved.get(person_id) or {}).get("en")
                if not name:
                    continue
                birth = (resolved.get(person_id) or {}).get("P569")
                birth_year = None
                if isinstance(birth, dict):
                    raw = birth.get("time", "")
                    if len(raw) >= 5 and raw[1:5].isdigit():
                        birth_year = int(raw[1:5])
                credits.append(
                    {
                        "wikidataId": person_id,
                        "name": name,
                        "role": role,
                        **({"birthYear": birth_year} if birth_year else {}),
                    }
                )
        aliases = []
        originals = row["originals"]
        original = originals[0][0] if originals and originals[0][0] != title else None
        if row["tr"] and row["tr"] != title and row["tr"] != original:
            aliases.append({"text": row["tr"], "kind": "LOCALIZED_TITLE", "languageId": "tr"})
        awards = []
        seen_awards = set()
        winner_keys = set()
        for result, award_id, award_year in row["awards"]:
            award_label = (resolved.get(award_id) or {}).get("en")
            if not award_label:
                continue
            org = award_org(award_label)
            if not org:
                continue
            key = (org, award_label, result)
            if key in seen_awards:
                continue
            if result == "NOMINEE" and (org, award_label, "WINNER") in winner_keys:
                continue
            seen_awards.add(key)
            if result == "WINNER":
                winner_keys.add(key)
            award = {
                "organizationId": org,
                "category": award_label,
                "result": result,
                "recipient": "PRODUCTION",
                "externalId": award_id,
            }
            if award_year:
                award["year"] = award_year
            awards.append(award)
        awards = [
            award
            for award in awards
            if not (
                award["result"] == "NOMINEE"
                and (award["organizationId"], award["category"], "WINNER") in winner_keys
            )
        ]
        productions.append(
            {
                "wikidataId": qid,
                "contentType": content_type,
                "title": title,
                "year": year,
                "countryIds": countries,
                "originalLanguageIds": languages,
                "genreIds": genres,
                "aliases": aliases,
                **({"originalTitle": original} if original else {}),
                "credits": credits,
                "awards": awards,
                "sitelinks": rank.get(qid, 0),
                "known": qid in known,
            }
        )

    productions.sort(key=lambda item: item["sitelinks"], reverse=True)
    chosen = []
    movie_count = 0
    series_count = 0
    for item in productions:
        if item["known"]:
            chosen.append(item)
            continue
        if item["contentType"] == "MOVIE" and movie_count < 460:
            chosen.append(item)
            movie_count += 1
        elif item["contentType"] == "TV_SERIES" and series_count < 160:
            chosen.append(item)
            series_count += 1
    for item in chosen:
        item.pop("sitelinks", None)
        item.pop("known", None)
    payload = {
        "fetchedAt": VERIFIED_ON,
        "source": "Wikidata",
        "countryLabels": country_labels,
        "languageLabels": language_labels,
        "productions": chosen,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"yazıldı film+ {movie_count} dizi+ {series_count} toplam {len(chosen)} bayt {OUT.stat().st_size}",
        flush=True,
    )


if __name__ == "__main__":
    main()
