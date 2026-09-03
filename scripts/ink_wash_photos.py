#!/usr/bin/env python3
"""Extract photos from the Guizhou trip scan PDF and render them as a
visually unified ink-wash (水墨) image set for the blog.

The PDF stores photos in reverse chronological order: narrative index k
(1-based) lives on page (N - k + 1). Outputs are named guizhou-<k>.jpg so
numbers follow the travelogue narrative.

Usage:
  python3 scripts/ink_wash_photos.py \
      --pdf /path/to/scan.pdf \
      --out-dir public/images/travel/guizhou

  # render only some narrative indexes (for tuning)
  python3 scripts/ink_wash_photos.py --pdf ... --only 11,16

  # rebuild the "original vs ink-wash" contact sheet
  python3 scripts/ink_wash_photos.py --pdf ... --out-dir ... \
      --collage-out /tmp/guizhou-compare.jpg

  # verify output specs after a run
  python3 scripts/ink_wash_photos.py --pdf ... --out-dir ... --verify

The PDF itself is NOT committed to the repo; keep it outside and pass the
path via --pdf. Requires PyMuPDF (fitz) and Pillow.
"""

import argparse
import io
import math
import sys
from pathlib import Path

import fitz
from PIL import Image, ImageChops, ImageFilter, ImageOps

DEFAULT_OUT_DIR = "public/images/travel/guizhou"

MAX_SIDE = 1600
MAX_BYTES = 600 * 1024

PAPER = (247, 241, 227)
INK = (38, 34, 30)

QUALITY_LADDER = (86, 82, 78, 74, 70)

CROPS = {
    11: (0.02, 0.10, 0.98, 0.86),
    25: (0.03, 0.12, 0.97, 0.85),
}


def extract_page_image(doc: fitz.Document, page_no: int) -> Image.Image:
    page = doc[page_no - 1]
    images = page.get_images(full=True)
    if not images:
        raise RuntimeError(f"page {page_no} has no embedded image")
    xref = images[0][0]
    pix = fitz.Pixmap(doc, xref)
    if pix.alpha:
        pix = fitz.Pixmap(pix, 0)
    if pix.colorspace and pix.colorspace.n > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")


def narrative_page_map(count: int) -> dict[int, int]:
    return {k: count + 1 - k for k in range(1, count + 1)}


def _scale_lut(lo: float, hi: float, gain: float = 1.0) -> tuple:
    span = max(hi - lo, 1e-6)
    return tuple(max(0, min(255, round((v - lo) * gain * 255.0 / span))) for v in range(256))


def _tone_ink_lut(depth: float, gamma: float = 1.25, floor: float = 0.0, cap: float = 255.0) -> tuple:
    lut = []
    for v in range(256):
        t = (255.0 - v) / 255.0
        ink = (t ** gamma) * depth
        ink = max(floor, min(cap / 255.0, ink))
        lut.append(round(ink * 255))
    return tuple(lut)


def duotone(density: Image.Image) -> Image.Image:
    inv = 255.0
    bands = []
    for ch in range(3):
        lo = PAPER[ch]
        delta = INK[ch] - lo
        lut = tuple(round(lo + delta * (v / inv)) for v in range(256))
        bands.append(density.point(lut))
    return Image.merge("RGB", bands)


def ink_wash(img: Image.Image) -> Image.Image:
    s = max(img.size)
    g = ImageOps.autocontrast(img.convert("L"), cutoff=1)

    r_line = max(1.0, s * 0.0016)
    b_small = g.filter(ImageFilter.GaussianBlur(r_line))
    b_big = g.filter(ImageFilter.GaussianBlur(r_line * 3.0))
    lines = ImageChops.difference(b_small, b_big).point(_scale_lut(9, 56, gain=1.4))

    wash = g.filter(ImageFilter.GaussianBlur(max(2.0, s * 0.012)))
    wash = wash.point(_tone_ink_lut(depth=0.97, gamma=1.25, cap=244))

    density = ImageChops.add(
        wash.point(lambda v: round(v * 0.95)),
        lines.point(lambda v: round(v * 0.55)),
        scale=1.0,
        offset=0,
    )
    density = density.filter(ImageFilter.GaussianBlur(max(0.6, s * 0.0008)))
    density = density.point(lambda v: min(255, round(v * 1.12)))

    out = duotone(density)

    grain = Image.effect_noise((img.width, img.height), 18).filter(
        ImageFilter.GaussianBlur(0.6)
    )
    grain = grain.point(lambda v: min(255, max(0, round(238 + (v - 128) * 0.28))))
    out = ImageChops.multiply(out, grain.convert("RGB"))
    return out


def apply_crop(img: Image.Image, k: int) -> Image.Image:
    crop = CROPS.get(k)
    if not crop:
        return img
    w, h = img.size
    l, t, r, b = crop
    return img.crop((round(l * w), round(t * h), round(r * w), round(b * h)))


def fit_max_side(img: Image.Image, max_side: int) -> Image.Image:
    s = max(img.size)
    if s <= max_side:
        return img
    scale = max_side / s
    return img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))), Image.LANCZOS)


def encode_jpeg(img: Image.Image) -> bytes:
    for q in QUALITY_LADDER:
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) <= MAX_BYTES:
            return data
    return data


def render_outputs(doc: fitz.Document, args) -> None:
    count = len(doc)
    if count != args.count:
        raise SystemExit(f"expected {args.count} pages, found {count}")
    mapping = narrative_page_map(count)
    wanted = set(args.only) if args.only else set(mapping)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for k in sorted(wanted):
        src = apply_crop(extract_page_image(doc, mapping[k]), k)
        art = fit_max_side(ink_wash(src), args.max_side)
        data = encode_jpeg(art)
        (out_dir / f"guizhou-{k:02d}.jpg").write_bytes(data)
        print(f"guizhou-{k:02d}.jpg  {art.width}x{art.height}  {len(data) / 1024:.0f} KB")

    cover_src_k = args.cover_from
    src = apply_crop(extract_page_image(doc, mapping[cover_src_k]), cover_src_k)
    art = fit_max_side(ink_wash(src), args.max_side)
    if args.cover_wide:
        target = 3 / 2
        w, h = art.size
        if w / h > target:
            nw = round(h * target)
            art = art.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w / target)
            art = art.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    data = encode_jpeg(art)
    (out_dir / "cover.jpg").write_bytes(data)
    print(f"cover.jpg  {art.width}x{art.height}  {len(data) / 1024:.0f} KB  (from k={cover_src_k})")


def make_collage(doc: fitz.Document, args) -> None:
    count = len(doc)
    mapping = narrative_page_map(count)
    wanted = sorted(set(args.only) if args.only else mapping)

    cols = 5
    cell_w, cell_h = 372, 300
    label_h = 18
    rows = math.ceil(len(wanted) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + label_h)), PAPER)

    from PIL import ImageDraw

    draw = ImageDraw.Draw(sheet)
    thumb_w = cell_w // 2 - 6
    thumb_h = cell_h - 12

    for i, k in enumerate(wanted):
        src = apply_crop(extract_page_image(doc, mapping[k]), k)
        art = ink_wash(src)
        r, c = divmod(i, cols)
        x0 = c * cell_w
        y0 = r * (cell_h + label_h)
        for j, im in enumerate((src, art)):
            tw, th = fit_max_side(im, max(thumb_w, thumb_h)).size
            if tw / th > thumb_w / thumb_h:
                tw = thumb_w
                th = round(tw * im.height / im.width)
            else:
                th = thumb_h
                tw = round(th * im.width / im.height)
            tw, th = min(tw, im.width), min(th, im.height)
            thumb = im.resize((tw, th), Image.LANCZOS)
            cx = x0 + 6 + j * (cell_w // 2) + (thumb_w - tw) // 2
            cy = y0 + 6 + (thumb_h - th) // 2
            sheet.paste(thumb, (cx, cy))
        draw.text((x0 + 8, y0 + cell_h - 2), f"k={k:02d} | PDF p{mapping[k]:02d} | original vs ink-wash", fill=(70, 60, 50))

    sheet.save(args.collage_out, "JPEG", quality=82, optimize=True)
    print(f"collage -> {args.collage_out}  {sheet.width}x{sheet.height}")


def verify_outputs(args) -> int:
    out_dir = Path(args.out_dir)
    expected = {f"guizhou-{k:02d}.jpg" for k in range(1, 26)} | {"cover.jpg"}
    missing = expected - {p.name for p in out_dir.glob("*.jpg")}
    if missing:
        print(f"MISSING: {sorted(missing)}")
        return 1
    total = 0
    failures = 0
    for path in sorted(out_dir.glob("*.jpg")):
        with Image.open(path) as im:
            w, h = im.size
        size = path.stat().st_size
        total += size
        ok = max(w, h) <= MAX_SIDE and size <= MAX_BYTES
        failures += 0 if ok else 1
        print(f"{path.name:20s} {w:4d}x{h:<4d} {size / 1024:6.0f} KB  {'OK' if ok else 'FAIL'}")
    print(f"total: {total / (1024 * 1024):.1f} MB / 12 MB  {'OK' if total <= 12 * 1024 * 1024 else 'FAIL'}")
    return 1 if failures or total > 12 * 1024 * 1024 else 0


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--pdf", required=True)
    ap.add_argument("--out-dir", default=DEFAULT_OUT_DIR)
    ap.add_argument("--count", type=int, default=25)
    ap.add_argument("--only", type=lambda v: [int(x) for x in v.split(",")])
    ap.add_argument("--cover-from", type=int, default=11)
    ap.add_argument("--cover-wide", action="store_true")
    ap.add_argument("--max-side", type=int, default=MAX_SIDE)
    ap.add_argument("--collage-out")
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()

    doc = fitz.open(args.pdf)
    try:
        if args.verify:
            sys.exit(verify_outputs(args))
        render_outputs(doc, args)
        if args.collage_out:
            make_collage(doc, args)
    finally:
        doc.close()


if __name__ == "__main__":
    main()
