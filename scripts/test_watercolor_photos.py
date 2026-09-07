#!/usr/bin/env python3
"""Plain-assert tests for watercolor_photos page mapping (no pytest needed).

Run: python3 scripts/test_watercolor_photos.py
"""

import io
import os
import sys

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from watercolor_photos import (
    MAX_BYTES,
    MAX_SIDE,
    export_original,
    narrative_page_map,
    plan_originals,
)


def test_default_is_reverse_page_order():
    assert narrative_page_map(4) == {1: 4, 2: 3, 3: 2, 4: 1}


def test_page_order_override():
    # TOB-383 liangzhu: user-confirmed true chronological order of PDF pages
    order = [1, 2, 3, 16, 4, 11, 12, 15, 13, 14, 5, 6, 7, 8, 9, 10]
    m = narrative_page_map(16, order)
    assert m[1] == 1 and m[4] == 16 and m[8] == 15 and m[16] == 10
    assert sorted(m.values()) == list(range(1, 17))


def test_page_order_rejects_bad_input():
    bad_inputs = [
        ([1, 2], 4),                    # wrong length
        ([1] * 16, 16),                 # not a permutation
        ([0, 2, 3, 4], 4),              # out of range
        ([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 2], 16),  # dup
    ]
    for bad, count in bad_inputs:
        try:
            narrative_page_map(count, bad)
        except SystemExit:
            pass
        else:
            raise AssertionError(f"expected SystemExit for {bad}")


def test_plan_originals_lists_body_photos_in_k_order():
    # guizhou default reverse mapping: k -> PDF page (N - k + 1)
    mapping = narrative_page_map(3)
    plan = plan_originals(mapping, [2, 1, 3, 2], "guizhou")  # dup k deduped, sorted
    assert plan == [
        (1, 3, "guizhou-01.jpg"),
        (2, 2, "guizhou-02.jpg"),
        (3, 1, "guizhou-03.jpg"),
    ]


def test_plan_originals_never_includes_cover():
    # the orig set backs the TravelPhoto toggle only; the hero cover stays stylized
    for count in (1, 16, 25):
        mapping = narrative_page_map(count)
        names = [name for _, _, name in plan_originals(mapping, mapping, "liangzhu")]
        assert "cover.jpg" not in names
        assert names == [f"liangzhu-{k:02d}.jpg" for k in range(1, count + 1)]


def test_export_original_matches_painted_set_spec():
    # same resize ceiling and JPEG budget as the watercolor outputs (TOB-384)
    img = Image.new("RGB", (2400, 1200), (200, 180, 150))
    data, w, h = export_original(img)
    assert (w, h) == (1600, 800)  # longest side capped at MAX_SIDE
    assert w <= MAX_SIDE and h <= MAX_SIDE
    assert len(data) <= MAX_BYTES
    replay = Image.open(io.BytesIO(data))
    assert replay.size == (w, h)

    # images already under the ceiling pass through unscaled
    small = Image.new("RGB", (800, 600), (90, 90, 90))
    _, sw, sh = export_original(small)
    assert (sw, sh) == (800, 600)


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print(f"PASS {name}")
    print("all mapping tests passed")
