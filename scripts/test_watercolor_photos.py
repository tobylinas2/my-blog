#!/usr/bin/env python3
"""Plain-assert tests for watercolor_photos page mapping (no pytest needed).

Run: python3 scripts/test_watercolor_photos.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from watercolor_photos import narrative_page_map


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


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print(f"PASS {name}")
    print("all mapping tests passed")
