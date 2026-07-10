#!/usr/bin/env python3
"""
pixelate.py — turn a detailed AI illustration into a true chunky 16-bit sprite,
matching the marketing-combat fighter roster (public/assets/fighters/*.png).

Nano Banana etc. output smooth halftone illustrations, not chunky pixel-art. This
runs the post-pass the roster used (…_pixel_6x): downscale to a small native grid →
quantize to a limited palette (optionally SHARED with the fighter roster so a new
set sits in the same colour world) → nearest-neighbour upscale so pixels stay hard.

Usage
-----
  # one image, defaults calibrated to the roster
  python3 scripts/pixelate.py in.png -o out.png

  # a folder, all pixelated with a palette SHARED across the batch + roster
  python3 scripts/pixelate.py docs/"the organizers"/raw -o public/assets/demo/organizers \
      --match-ref "public/assets/fighters/*.png" --colors 32 --native-h 168 --scale 2

  # slice a sheet (3 cols x 2 rows) into cells, then pixelate each
  python3 scripts/pixelate.py roster-sheet.png -o out/ --grid 3x2 \
      --names crew-01,crew-02,crew-03,crew-04,crew-05,_discard

Notes
-----
- --match-ref builds ONE adaptive palette from the reference images (e.g. the five
  fighters) and remaps every input to it → instant cross-consistency + roster match.
  Omit it to build an adaptive palette per-image instead.
- --native-h is the sprite's true pixel height before upscaling (smaller = chunkier).
  Roster busts read ~150–170px native; 168 is a good default.
- --scale N nearest-upscales the native grid so hard pixels are baked into the file
  (the site also sets image-rendering:pixelated, so scale is mostly for crisp export).
"""
import argparse, glob, os, sys
from PIL import Image


def gather(inputs):
    paths = []
    for it in inputs:
        if os.path.isdir(it):
            for e in ("png", "jpg", "jpeg", "webp"):
                paths += glob.glob(os.path.join(it, f"*.{e}"))
        else:
            paths += glob.glob(it)
    return sorted(p for p in paths if os.path.isfile(p))


def build_shared_palette(ref_glob, colors):
    refs = gather([ref_glob])
    if not refs:
        sys.exit(f"--match-ref matched no files: {ref_glob}")
    tile = 64
    canvas = Image.new("RGB", (tile, tile * len(refs)))
    for i, p in enumerate(refs):
        im = Image.open(p).convert("RGB").resize((tile, tile), Image.LANCZOS)
        canvas.paste(im, (0, i * tile))
    pal = canvas.convert("P", palette=Image.ADAPTIVE, colors=colors)
    print(f"  shared palette: {colors} colours from {len(refs)} ref image(s)")
    return pal


def slice_grid(img, cols, rows):
    w, h = img.size
    cw, ch = w // cols, h // rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cells.append(img.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)))
    return cells


def pixelate(img, native_h, colors, scale, shared_pal, dither):
    img = img.convert("RGB")
    w, h = img.size
    nh = native_h
    nw = max(1, round(w * nh / h))
    small = img.resize((nw, nh), Image.LANCZOS)
    d = Image.FLOYDSTEINBERG if dither else Image.NONE
    if shared_pal is not None:
        q = small.quantize(palette=shared_pal, dither=d)
    else:
        q = small.quantize(colors=colors, method=Image.FASTOCTREE, dither=d)
    out = q.convert("RGB")
    if scale and scale != 1:
        out = out.resize((nw * scale, nh * scale), Image.NEAREST)
    return out


def main():
    ap = argparse.ArgumentParser(description="Pixelate illustrations into roster-matched 16-bit sprites.")
    ap.add_argument("inputs", nargs="+", help="image file(s), globs, or a folder")
    ap.add_argument("-o", "--out", required=True, help="output file (single) or folder")
    ap.add_argument("--native-h", type=int, default=168, help="native sprite height in px before upscale (default 168)")
    ap.add_argument("--colors", type=int, default=32, help="palette size (default 32)")
    ap.add_argument("--scale", type=int, default=2, help="nearest-neighbour upscale factor (default 2)")
    ap.add_argument("--match-ref", default=None, help="glob of reference images to build ONE shared palette (e.g. roster)")
    ap.add_argument("--grid", default=None, help="slice each input into a CxR grid of cells first, e.g. 3x2")
    ap.add_argument("--names", default=None, help="comma list of output stems for grid cells; '_discard' skips a cell")
    ap.add_argument("--no-dither", action="store_true", help="disable Floyd–Steinberg dithering")
    args = ap.parse_args()

    paths = gather(args.inputs)
    if not paths:
        sys.exit(f"no input images matched: {args.inputs}")

    shared_pal = build_shared_palette(args.match_ref, args.colors) if args.match_ref else None
    dither = not args.no_dither

    out_is_dir = args.grid is not None or os.path.isdir(args.out) or len(paths) > 1 or args.out.endswith(os.sep)
    if out_is_dir:
        os.makedirs(args.out, exist_ok=True)

    names = args.names.split(",") if args.names else None

    for p in paths:
        img = Image.open(p)
        stem = os.path.splitext(os.path.basename(p))[0]
        if args.grid:
            cols, rows = (int(x) for x in args.grid.lower().split("x"))
            cells = slice_grid(img, cols, rows)
            for i, cell in enumerate(cells):
                nm = names[i] if names and i < len(names) else f"{stem}_{i:02d}"
                if nm == "_discard":
                    continue
                res = pixelate(cell, args.native_h, args.colors, args.scale, shared_pal, dither)
                dst = os.path.join(args.out, f"{nm}.png")
                res.save(dst)
                print(f"  {os.path.basename(p)} cell {i} → {dst}  ({res.size[0]}x{res.size[1]})")
        else:
            res = pixelate(img, args.native_h, args.colors, args.scale, shared_pal, dither)
            dst = os.path.join(args.out, f"{stem}.png") if out_is_dir else args.out
            res.save(dst)
            print(f"  {os.path.basename(p)} → {dst}  ({res.size[0]}x{res.size[1]})")


if __name__ == "__main__":
    main()
