"""Builds store-page-preview.html: a self-contained App Store page mockup (search result + product page)
from the REAL store screenshots in store/en and store/tr, the real app icon and the copy in APP_STORE_SUBMISSION.md.

    python build_store_preview.py        # needs Pillow

Nothing here is published. Ratings are shown as "none yet" on purpose (no fake reviews)."""
import base64, io, json, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
ICON = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")


def b64_jpeg(path, width=472, quality=68):
    im = Image.open(path).convert("RGB")
    im = im.resize((width, int(im.size[1] * width / im.size[0])), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def b64_png(path, width=192):
    im = Image.open(path).convert("RGBA")
    im = im.resize((width, width), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


SHOTS = {
    "en": ["01-twelve-seconds", "02-reverse-frame", "03-daily-reel", "04-instant-search", "05-offline"],
    "tr": ["01-on-iki-saniye", "02-ters-kadraj", "03-gunun-kadraji", "04-aninda-arama", "05-cevrimdisi"],
}

COPY = {
    "en": {
        "name": "Crosscut: Movie Trivia Duel",
        "subtitle": "12 seconds. 9 squares. 1 film.",
        "category": "Games · Trivia",
        "get": "GET",
        "open": "OPEN",
        "back": "Search",
        "cancel": "Cancel",
        "games": "Games",
        "preview": "Preview",
        "device": "iPhone",
        "promo": "Quiz apps hand you four options and an ad. Crosscut hands you a clock. Name the film that fits both clues before twelve seconds run out. Works offline. No account.",
        "desc": [
            "Not a quiz. A duel.",
            "Every square is two clues. Name the film that fits both, in twelve seconds, before the bot blocks your line.",
            "No ads. No account. No signal needed.",
            "<b>THE RULES</b>",
            "Nine squares. Three in a row wins. A wrong answer burns your try on that square. The clock does not wait.",
            "<b>THREE WAYS TO PLAY</b>",
            "• Classic Duel: directors, actors, decades, genres and awards cross on a 3x3 board. Easy, Medium and Hard bots, each with its own style.",
            "• Reverse Frame: two films meet at a square. Name the actor who is in both.",
            "• Cinephile Concept: cult themes against genres and awards.",
            "<b>ONE BOARD A DAY</b>",
            "Daily Reel: the same nine squares for everyone, one attempt, and a result card that shows your score and spoils nothing.",
            "<b>THE CATALOG</b>",
            "1,000+ films and series. Instant title search in English and Turkish, with alternate titles. Two films, one title? The year tells them apart.",
            "<b>THE ROOM</b>",
            "Dim the house lights. Aim the projector beam. Add 35mm grain, or paint the room red.",
            "<b>THE FINE PRINT</b>",
            "Free. No ads. No in-app purchases. No tracking. Plays fully offline.",
            "Not affiliated with or endorsed by any studio, film database or the people named in the puzzles."
        ],
        "whatsnew": "What's New",
        "version": "Version 1.0",
        "now": "Now",
        "notes": "First release. Duels against Easy, Medium and Hard bots, Reverse Frame, Daily Reel, Auditorium Ambience.",
        "more": "more",
        "strip": [
            [
                "RATINGS",
                "—",
                "No ratings yet"
            ],
            [
                "AGE",
                "4+",
                "Years Old"
            ],
            [
                "CATEGORY",
                "★",
                "Trivia"
            ],
            [
                "DEVELOPER",
                "☺",
                "Efe Öztürkan"
            ],
            [
                "LANGUAGE",
                "EN",
                "+ 1 MORE"
            ]
        ],
        "privacy": "App Privacy",
        "privacy_title": "Data Not Collected",
        "privacy_text": "The developer does not collect any data from this app.",
        "see": "See Details",
        "info": "Information",
        "rows": [
            [
                "Seller",
                "Efe Öztürkan"
            ],
            [
                "Size",
                "7 MB"
            ],
            [
                "Category",
                "Games"
            ],
            [
                "Compatibility",
                "iPhone · Requires iOS 15.0 or later"
            ],
            [
                "Languages",
                "English, Turkish"
            ],
            [
                "Age Rating",
                "4+"
            ],
            [
                "Copyright",
                "© 2026 Efe Öztürkan"
            ],
            [
                "Price",
                "Free"
            ]
        ],
        "links": [
            "App Support",
            "Privacy Policy"
        ]
    },
    "tr": {
        "name": "Crosscut: Film Bilgi Düellosu",
        "subtitle": "12 saniye. 9 kare. 1 film.",
        "category": "Oyunlar · Bilgi Yarışması",
        "get": "AL",
        "open": "AÇ",
        "back": "Ara",
        "cancel": "İptal",
        "games": "Oyunlar",
        "preview": "Önizleme",
        "device": "iPhone",
        "promo": "Quiz uygulamaları sana dört şık ve bir reklam verir. Crosscut bir saat verir. İki ipucuna da uyan filmi 12 saniye dolmadan bul. İnternetsiz çalışır. Hesap yok.",
        "desc": [
            "Quiz değil, düello.",
            "Her kare iki ipucu. İkisine de uyan filmi 12 saniyede bul, bot hattını kesmeden üçlüyü kur.",
            "Reklam yok. Hesap yok. İnternet gerekmez.",
            "<b>KURALLAR</b>",
            "Dokuz kare. Üç kare yan yana gelen kazanır. Yanlış cevap o karedeki hakkını yakar. Sayaç beklemez.",
            "<b>ÜÇ OYUN BİÇİMİ</b>",
            "• Klasik Düello: yönetmen, oyuncu, dönem, tür ve ödül 3x3 tahtada kesişir. Kolay, Orta ve Zor botların her birinin kendi tarzı var.",
            "• Ters Kadraj: iki film bir karede buluşur. İkisinde de oynayan oyuncuyu bul.",
            "• Sinefil Konsept: kült temalar, türler ve ödüllerle karşı karşıya.",
            "<b>GÜNDE BİR TAHTA</b>",
            "Günün Kadrası: herkese aynı dokuz kare, tek hak, skorunu gösteren ve hiçbir şey sızdırmayan sonuç kartı.",
            "<b>KATALOG</b>",
            "1.000'den fazla film ve dizi. Türkçe ve İngilizce anında başlık araması, alternatif adlarla. Aynı adlı iki film mi var? Yıl ayırır.",
            "<b>SALON</b>",
            "Salon ışıklarını kıs. Projeksiyon huzmesini ayarla. 35mm gren ekle ya da salonu kırmızıya boya.",
            "<b>KÜÇÜK PUNTO</b>",
            "Ücretsiz. Reklam yok. Uygulama içi satın alma yok. Takip yok. Tamamen çevrimdışı çalışır.",
            "Herhangi bir stüdyo, film veritabanı veya bulmacalarda adı geçen kişilerle bağlantılı ya da onaylı değildir."
        ],
        "whatsnew": "Yenilikler",
        "version": "Sürüm 1.0",
        "now": "Şimdi",
        "notes": "İlk sürüm. Kolay, Orta ve Zor botlarla düello, Ters Kadraj, Günün Kadrası, Salon Işığı.",
        "more": "daha fazla",
        "strip": [
            [
                "DEĞERLENDİRME",
                "—",
                "Henüz yok"
            ],
            [
                "YAŞ",
                "4+",
                "Yaş"
            ],
            [
                "KATEGORİ",
                "★",
                "Bilgi Yarışması"
            ],
            [
                "GELİŞTİRİCİ",
                "☺",
                "Efe Öztürkan"
            ],
            [
                "DİL",
                "TR",
                "+ 1 DİĞER"
            ]
        ],
        "privacy": "Uygulama Gizliliği",
        "privacy_title": "Veri Toplanmaz",
        "privacy_text": "Geliştirici bu uygulamadan hiçbir veri toplamaz.",
        "see": "Ayrıntılar",
        "info": "Bilgi",
        "rows": [
            [
                "Satıcı",
                "Efe Öztürkan"
            ],
            [
                "Boyut",
                "7 MB"
            ],
            [
                "Kategori",
                "Oyunlar"
            ],
            [
                "Uyumluluk",
                "iPhone · iOS 15.0 veya üstü"
            ],
            [
                "Diller",
                "İngilizce, Türkçe"
            ],
            [
                "Yaş Sınırı",
                "4+"
            ],
            [
                "Telif Hakkı",
                "© 2026 Efe Öztürkan"
            ],
            [
                "Fiyat",
                "Ücretsiz"
            ]
        ],
        "links": [
            "Uygulama Desteği",
            "Gizlilik Politikası"
        ]
    }
}

TEMPLATE = open(os.path.join(HERE, "store_preview_template.html"), encoding="utf-8").read()
data = {
    "icon": b64_png(ICON),
    "copy": COPY,
    "shots": {lang: [b64_jpeg(os.path.join(HERE, lang, n + ".png")) for n in names] for lang, names in SHOTS.items()},
}
html = TEMPLATE.replace("/*__DATA__*/", "const DATA = " + json.dumps(data, ensure_ascii=False) + ";")
out = os.path.join(HERE, "store-page-preview.html")
open(out, "w", encoding="utf-8").write(html)
print("wrote", out, f"{len(html) / 1024:.0f} KB")
