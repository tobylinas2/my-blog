#!/usr/bin/env python3
"""Extract photos from the Guizhou trip scan PDF and repaint them as a
visually unified watercolor (水彩) image set via the gpt-image-2 edits API.

The PDF stores photos in reverse chronological order: narrative index k
(1-based) lives on page (N - k + 1). Outputs are named guizhou-<k>.jpg and
follow the travelogue narrative.

Requirements:
  - env SHUAI_API_KEY: image-generation API key (never committed)
  - env SHUAI_API_BASE: optional, default https://api.shuaiapi.com
  - PyMuPDF (fitz), Pillow, requests

Usage:
  python3 scripts/watercolor_photos.py --pdf /path/to/scan.pdf \
      --out-dir public/images/travel/guizhou

  # render only some narrative indexes (tuning / retrying failures)
  python3 scripts/watercolor_photos.py --pdf ... --only 11,16

  # rebuild the "original vs watercolor" contact sheet
  python3 scripts/watercolor_photos.py --pdf ... --collage-out /tmp/compare.jpg

  # verify output specs after a run
  python3 scripts/watercolor_photos.py --pdf ... --out-dir ... --verify

The PDF itself is NOT committed to the repo; pass its path via --pdf.
Generated images are paid per call; failed tasks are not billed. Result
URLs expire in ~1h, so images are downloaded immediately.
"""

import argparse
import io
import math
import os
import sys
import tempfile
import threading
import time
from pathlib import Path

import fitz
import requests
from PIL import Image, ImageDraw
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

DEFAULT_OUT_DIR = "public/images/travel/guizhou"
MODEL = "gpt-image-2"
MAX_SIDE = 1600
MAX_BYTES = 600 * 1024
QUALITY_LADDER = (82, 78, 74, 70, 66)
API_LONGEST = 1536
POLL_INTERVAL = 4
POLL_TIMEOUT = 600
CONCURRENCY = 6

PROMPT = (
    "Redraw this exact photograph as a traditional watercolor painting. "
    "Preserve the original composition, subject, perspective and all key "
    "details. Soft translucent watercolor washes with gentle color bleeding "
    "and wet-on-wet gradients, delicate darker accents, and leave natural "
    "highlights as unpainted warm cream paper. Subtle cold-press paper "
    "texture across the whole image. Warm, soft, slightly muted palette. "
    "Painterly and airy, like a hand-painted travel journal illustration. "
    "Not a photo filter, not ink monochrome. No text, no borders, no frames."
)

CROPS = {
    11: (0.02, 0.10, 0.98, 0.86),
    25: (0.03, 0.12, 0.97, 0.85),
}

_tls = threading.local()


def session() -> requests.Session:
    if getattr(_tls, "s", None) is None:
        s = requests.Session()
        s.trust_env = False
        s.mount(
            "https://",
            HTTPAdapter(
                max_retries=Retry(
                    total=3,
                    backoff_factor=2,
                    status_forcelist=[429, 500, 502, 503, 504],
                    allowed_methods=None,
                )
            ),
        )
        _tls.s = s
    return _tls.s


def auth_headers() -> dict:
    key = os.environ.get("SHUAI_API_KEY")
    if not key:
        raise SystemExit("env SHUAI_API_KEY is required (image API key)")
    return {"Authorization": f"Bearer {key}"}


def extract_page_image(doc: fitz.Document, page_no: int) -> Image.Image:
    page = doc[page_no - 1]
    images = page.get_images(full=True)
    if not images:
        raise RuntimeError(f"page {page_no} has no embedded image")
    pix = fitz.Pixmap(doc, images[0][0])
    if pix.alpha:
        pix = fitz.Pixmap(pix, 0)
    if pix.colorspace and pix.colorspace.n > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")


def narrative_page_map(count: int) -> dict[int, int]:
    return {k: count + 1 - k for k in range(1, count + 1)}


def apply_crop(img: Image.Image, k: int) -> Image.Image:
    crop = CROPS.get(k)
    if not crop:
        return img
    w, h = img.size
    l, t, r, b = crop
    return img.crop((round(l * w), round(t * h), round(r * w), round(b * h)))


def api_size(width: int, height: int, cover_3_2: bool = False) -> str:
    if cover_3_2:
        return "1536x1024"
    scale = API_LONGEST / max(width, height)
    w = max(512, round(width * scale / 16) * 16)
    h = max(512, round(height * scale / 16) * 16)
    if w < h:
        h, w = min(h, 1536), w
    else:
        w, h = min(w, 1536), h
    return f"{w}x{h}"


def submit_edit(ref_path: Path, size: str, quality: str) -> str:
    last_err = None
    for attempt in range(3):
        try:
            with open(ref_path, "rb") as f:
                resp = session().post(
                    f"{os.environ.get('SHUAI_API_BASE', 'https://api.shuaiapi.com')}/v1/images/edits/async",
                    headers=auth_headers(),
                    data={
                        "model": MODEL,
                        "prompt": PROMPT,
                        "size": size,
                        "quality": quality,
                        "response_format": "url",
                    },
                    files={"image[]": (ref_path.name, f, "image/jpeg")},
                    timeout=120,
                )
            if resp.status_code in (401, 403):
                raise SystemExit(f"API auth/permission error {resp.status_code}: {resp.text[:200]}")
            if resp.status_code == 429 and "上限" in resp.text:
                time.sleep(30)
                last_err = RuntimeError(resp.text[:200])
                continue
            resp.raise_for_status()
            return resp.json()["task_id"]
        except SystemExit:
            raise
        except Exception as e:
            last_err = e
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"submit failed after retries: {last_err}")


def poll_task(task_id: str) -> str:
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        try:
            q = session().get(
                f"{os.environ.get('SHUAI_API_BASE', 'https://api.shuaiapi.com')}/v1/images/tasks/{task_id}",
                headers=auth_headers(),
                timeout=30,
            ).json()
        except Exception as e:
            time.sleep(POLL_INTERVAL)
            continue
        status = q.get("status")
        if status == "succeeded":
            return q["result"]["data"][0]["url"]
        if status == "failed":
            raise RuntimeError(f"task failed: {json_message(q)}")
        time.sleep(POLL_INTERVAL)
    raise RuntimeError("task poll timeout")


def json_message(q: dict) -> str:
    err = q.get("error") or {}
    return err.get("message") if isinstance(err, dict) else str(err)


def download(url: str) -> Image.Image:
    for attempt in range(3):
        try:
            r = session().get(url, timeout=180)
            r.raise_for_status()
            return Image.open(io.BytesIO(r.content)).convert("RGB")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


def encode_jpeg(img: Image.Image) -> bytes:
    data = b""
    for q in QUALITY_LADDER:
        buf = io.BytesIO()
        img.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) <= MAX_BYTES:
            return data
    return data


def fit_max_side(img: Image.Image, max_side: int) -> Image.Image:
    s = max(img.size)
    if s <= max_side:
        return img
    scale = max_side / s
    return img.resize(
        (max(1, round(img.width * scale)), max(1, round(img.height * scale))),
        Image.LANCZOS,
    )


def repaint(k: int, src: Image.Image, out_path: Path, quality: str, cover_3_2: bool) -> str:
    size = api_size(src.width, src.height, cover_3_2=cover_3_2)
    with tempfile.TemporaryDirectory() as td:
        ref = Path(td) / f"ref-{k:02d}.jpg"
        thumb = src.copy()
        thumb.thumbnail((API_LONGEST, API_LONGEST), Image.LANCZOS)
        thumb.save(ref, "JPEG", quality=90)
        task_id = submit_edit(ref, size, quality)
        url = poll_task(task_id)
        art = download(url)
    art = fit_max_side(art, MAX_SIDE)
    data = encode_jpeg(art)
    out_path.write_bytes(data)
    note = "cover" if cover_3_2 else f"page {k}"
    return f"{out_path.name}  {art.width}x{art.height}  {len(data) / 1024:.0f} KB  ({note}, size {size})"


def worker(k: int, src: Image.Image, out_dir: Path, quality: str, cover_3_2: bool) -> str:
    name = "cover.jpg" if cover_3_2 else f"guizhou-{k:02d}.jpg"
    out_path = out_dir / name
    try:
        return repaint(k, src, out_path, quality, cover_3_2)
    except Exception as e:
        return f"{name}  FAILED: {e}"


def render(args) -> int:
    doc = fitz.open(args.pdf)
    try:
        count = len(doc)
        if count != args.count:
            raise SystemExit(f"expected {args.count} pages, found {count}")
        mapping = narrative_page_map(count)
        wanted = sorted(set(args.only) if args.only else set(mapping))

        out_dir = Path(args.out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        jobs = []
        for k in wanted:
            src = apply_crop(extract_page_image(doc, mapping[k]), k)
            jobs.append((k, src, out_dir / f"guizhou-{k:02d}.jpg", args.quality, False))
        cover_k = args.cover_from
        if not args.skip_cover:
            src = apply_crop(extract_page_image(doc, mapping[cover_k]), cover_k)
            jobs.append((cover_k, src, out_dir / "cover.jpg", args.quality, True))

        from concurrent.futures import ThreadPoolExecutor, as_completed

        failures = []
        with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
            futures = {
                ex.submit(worker, k, src, out_path.parent, quality, c3): out_path.name
                for k, src, out_path, quality, c3 in jobs
            }
            for fut in as_completed(futures):
                line = fut.result()
                print(line, flush=True)
                if "FAILED" in line:
                    failures.append(futures[fut])

        if failures:
            print(f"FAILED ({len(failures)}): {sorted(failures)}")
            print("rerun with --only <k comma list> to retry")
            return 1
        return 0
    finally:
        doc.close()


def make_collage(doc: fitz.Document, args) -> None:
    count = len(doc)
    mapping = narrative_page_map(count)
    wanted = sorted(set(args.only) if args.only else mapping)

    cols = 5
    cell_w, cell_h = 372, 300
    label_h = 18
    rows = math.ceil(len(wanted) / cols)
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + label_h)), (247, 241, 227))
    draw = ImageDraw.Draw(sheet)
    thumb_w = cell_w // 2 - 6
    thumb_h = cell_h - 12

    for i, k in enumerate(wanted):
        src = apply_crop(extract_page_image(doc, mapping[k]), k)
        out = Path(args.out_dir) / f"guizhou-{k:02d}.jpg"
        if not out.exists():
            continue
        art = Image.open(out).convert("RGB")
        r, c = divmod(i, cols)
        x0 = c * cell_w
        y0 = r * (cell_h + label_h)
        for j, im in enumerate((src, art)):
            tw, th = fit_max_side(im, max(thumb_w, thumb_h)).size
            if tw / th > thumb_w / thumb_h:
                tw = thumb_w
                th = max(1, round(tw * im.height / im.width))
            else:
                th = thumb_h
                tw = max(1, round(th * im.width / im.height))
            tw, th = min(tw, im.width), min(th, im.height)
            thumb = im.resize((tw, th), Image.LANCZOS)
            cx = x0 + 6 + j * (cell_w // 2) + (thumb_w - tw) // 2
            cy = y0 + 6 + (thumb_h - th) // 2
            sheet.paste(thumb, (cx, cy))
        draw.text((x0 + 8, y0 + cell_h - 2), f"k={k:02d} | PDF p{mapping[k]:02d} | original vs watercolor", fill=(70, 60, 50))

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
    ap.add_argument("--skip-cover", action="store_true")
    ap.add_argument("--quality", default="high")
    ap.add_argument("--concurrency", type=int, default=CONCURRENCY)
    ap.add_argument("--max-side", type=int, default=MAX_SIDE)
    ap.add_argument("--collage-out")
    ap.add_argument("--collage-only", action="store_true")
    ap.add_argument("--verify", action="store_true")
    args = ap.parse_args()

    if args.verify:
        sys.exit(verify_outputs(args))

    if args.collage_only:
        if not args.collage_out:
            raise SystemExit("--collage-only requires --collage-out")
        doc = fitz.open(args.pdf)
        try:
            make_collage(doc, args)
        finally:
            doc.close()
        sys.exit(0)

    code = render(args)
    if code == 0 and args.collage_out:
        doc = fitz.open(args.pdf)
        try:
            make_collage(doc, args)
        finally:
            doc.close()
    sys.exit(code)


if __name__ == "__main__":
    main()
