"""App Store 6.9" frames (1320x2868), flat and high contrast, from the REAL captures in ../launch-pack/raw-screens.

    python compose_v3.py            # needs Pillow

Only a headline and rounded corners are added. No bezel, no 3D, no gradients: the game's own dark editorial UI does the talking (Apple 2.3.7)."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "..", "launch-pack", "raw-screens")
W, H = 1320, 2868
BG, CREAM, GOLD = (11, 13, 18), (244, 241, 234), (217, 164, 65)
SERIF = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

# (raw file, output name, headline line 1, headline line 2 in gold)
SETS = {
    "en": [("01", "01-twelve-seconds", "Twelve seconds.", "No excuses."),
           ("02", "02-reverse-frame", "Name the", "shared star."),
           ("03", "03-daily-reel", "Today's board.", "Same for all."),
           ("04", "04-instant-search", "1,000+ films.", "Instant search."),
           ("05", "05-offline", "No ads. No login.", "Offline.")],
    "tr": [("01", "01-on-iki-saniye", "On iki saniye.", "Bahane yok."),
           ("02", "02-ters-kadraj", "Ortak yıldızı", "bul."),
           ("03", "03-gunun-kadraji", "Bugünün tahtası.", "Herkese aynı."),
           ("04", "04-aninda-arama", "1.000+ yapım.", "Anında arama."),
           ("05", "05-cevrimdisi", "Reklamsız. Hesapsız.", "Çevrimdışı.")],
}


def font(path, size):
    return ImageFont.truetype(path, size)


def frame(lang, raw_id, name, l1, l2, size):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    wm = "C R O S S · C U T"
    f = font(SANS, 38)
    d.text(((W - d.textlength(wm, font=f)) / 2, 120), wm, font=f, fill=GOLD)
    hf = font(SERIF, size)
    y = 215
    d.text(((W - d.textlength(l1, font=hf)) / 2, y), l1, font=hf, fill=CREAM)
    d.text(((W - d.textlength(l2, font=hf)) / 2, y + int(size * 1.22)), l2, font=hf, fill=GOLD)
    top = y + int(size * 2.45) + 60
    shot = Image.open(os.path.join(RAW, lang, raw_id + ".png")).convert("RGB")
    pw = 1180
    ph = int(shot.size[1] * pw / shot.size[0])
    shot = shot.resize((pw, ph), Image.LANCZOS)
    x = (W - pw) // 2
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, pw - 1, ph + 400), 96, fill=255)
    border = Image.new("RGB", (pw + 8, ph + 8), (70, 58, 36))
    bm = Image.new("L", (pw + 8, ph + 8), 0)
    ImageDraw.Draw(bm).rounded_rectangle((0, 0, pw + 7, ph + 408), 100, fill=255)
    img.paste(border, (x - 4, top - 4), bm)
    img.paste(shot, (x, top), mask)
    out_dir = os.path.join(HERE, lang)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, name + ".png")
    img.save(path, optimize=True)
    print("wrote", path)


def common_size(items):
    """One headline size for the whole set: the largest that fits the widest line."""
    probe = ImageDraw.Draw(Image.new("RGB", (W, 10)))
    size = 156
    while size > 60 and max(probe.textlength(t, font=font(SERIF, size)) for it in items for t in (it[2], it[3])) > W - 130:
        size -= 2
    return size


if __name__ == "__main__":
    for lang, items in SETS.items():
        size = common_size(items)
        print(lang, "headline size", size)
        for item in items:
            frame(lang, *item, size)
