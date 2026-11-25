#!/usr/bin/env python3
"""2022-2026 popüler filmleri Wikidata'dan (CC0) çeker ve wikidataBulk.json'a YALNIZCA EKLER.

Mevcut kayıtlar değişmez. Eksik yönetmen, tür ya da oyuncusu olan kayıt alınmaz (uydurma alan yok).
Kullanım: python3 scripts/fetch_wikidata_recent.py [en_fazla_film]
"""
import importlib.util
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("catalog", ROOT / "scripts" / "fetch_wikidata_catalog.py")
cat = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cat)

LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 240
MIN_SITELINKS = 13
YEARS = [2022, 2023, 2024, 2025, 2026]
CACHE = Path("/tmp/cinexox-recent-extracted.json")


def year_query(year):
    return f"""
    SELECT DISTINCT ?item ?s WHERE {{
      ?item wdt:P31 wd:Q11424 ; wikibase:sitelinks ?s ; wdt:P577 ?d .
      FILTER(?s >= {MIN_SITELINKS})
      FILTER(?d >= "{year}-01-01T00:00:00Z"^^xsd:dateTime && ?d < "{year + 1}-01-01T00:00:00Z"^^xsd:dateTime)
    }}
    ORDER BY DESC(?s)
    LIMIT 330
    """


def main():
    existing = json.loads(cat.OUT.read_text(encoding="utf-8"))
    have = {p["wikidataId"] for p in existing["productions"]}
    candidates = []
    for year in YEARS:
        rows = cat.qid_list(year_query(year))
        print(f"{year}: {len(rows)} aday", flush=True)
        candidates.extend(rows)
    candidates = [(q, s) for q, s in candidates if q not in have]
    candidates.sort(key=lambda r: r[1], reverse=True)
    fetch_ids = [q for q, _ in dict(candidates).items()]
    rank = dict(candidates)
    print(f"çekilecek {len(fetch_ids)}", flush=True)

    extracted = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    pending = [q for q in fetch_ids if q not in extracted]
    for entities in cat.entity_batches(pending):
        for eid, entity in entities.items():
            if entity.get("missing"):
                continue
            labels = entity.get("labels", {})
            claims = entity.get("claims", {})
            extracted[eid] = {
                "en": (labels.get("en") or {}).get("value"),
                "tr": (labels.get("tr") or {}).get("value"),
                "years": cat.claim_times(claims, "P577") or cat.claim_times(claims, "P580"),
                "originals": cat.monolingual(claims, "P1476"),
                "countries": [q for q, _ in cat.claim_ids(claims, "P495")],
                "languages": [q for q, _ in cat.claim_ids(claims, "P364")],
                "genres": [q for q, _ in cat.claim_ids(claims, "P136")],
                "directors": [q for q, _ in cat.claim_ids(claims, "P57")],
                "writers": [q for q, _ in cat.claim_ids(claims, "P58")][:5],
                "actors": [q for q, _ in cat.claim_ids(claims, "P161")][:12],
                "awards": [("WINNER", q, cat.qualifier_year(qs)) for q, qs in cat.claim_ids(claims, "P166")]
                + [("NOMINEE", q, cat.qualifier_year(qs)) for q, qs in cat.claim_ids(claims, "P1411")],
            }
        CACHE.write_text(json.dumps(extracted), encoding="utf-8")
    ref_ids = []
    for row in extracted.values():
        for key in ("countries", "languages", "genres", "directors", "writers", "actors"):
            ref_ids.extend(row[key])
        ref_ids.extend(a[1] for a in row["awards"])
    resolved = cat.resolve(ref_ids, ["P297", "P218", "P569"])

    film_ids = set(fetch_ids)
    productions, country_labels, language_labels = cat.build_productions(
        {q: extracted[q] for q in fetch_ids if q in extracted}, resolved, set(), set(), set(), set(), film_ids, rank
    )
    good = []
    for item in productions:
        movie_actors = [c for c in item["credits"] if c["role"] == "ACTOR"]
        directors = [c for c in item["credits"] if c["role"] == "DIRECTOR"]
        if item["year"] < 2022 or len(movie_actors) < 3 or not directors or not item["genreIds"]:
            continue
        good.append(item)
    good.sort(key=lambda it: rank.get(it["wikidataId"], 0), reverse=True)
    good = good[:LIMIT]
    for item in good:
        item.pop("sitelinks", None)
        item.pop("known", None)
    existing["productions"].extend(good)
    existing["countryLabels"].update({k: v for k, v in country_labels.items() if k not in existing["countryLabels"]})
    existing["languageLabels"].update({k: v for k, v in language_labels.items() if k not in existing["languageLabels"]})
    cat.OUT.write_text(json.dumps(existing, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"eklendi {len(good)} film, toplam {len(existing['productions'])}, bayt {cat.OUT.stat().st_size}", flush=True)


if __name__ == "__main__":
    main()
