"""
Builds the voxel head on the Field manual bio page from Ben's photo.

    pip install "rembg[cpu]" scipy
    curl -L -o /tmp/midas-small.onnx https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
    python3 scripts/voxel-head/build-head.py /tmp/midas-small.onnx [preview-dir]

1. rembg cuts Ben out of public/images/ben-stewart.jpg.
2. The photo is averaged into 6px cells and the colours cut to a small palette.
3. Each cell gets a depth in cells: the silhouette is inflated into a rounded
   bust, the head gets its own dome on top, the MiDaS depth model pushes the
   hand and mic forward, and a few hand-placed bumps add the nose, brow,
   glasses and beard.
4. Writes app/demo/redesigns/manual/bio/voxel-data.ts (palette, colour index
   and depth per cell) and the flat fallback public/images/voxel/ben-flat.png,
   which shows before the 3D version loads and when WebGL is off.
"""

import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PHOTO = os.path.join(ROOT, 'public/images/ben-stewart.jpg')
CELL = 6
CROP = (2, 24, 278, 342)  # x0, y0, x1, y1 in photo pixels
PAD = 3  # empty cells round the edge so the bust can turn without clipping
COLOURS = 22


def cutout(im):
    from rembg import new_session, remove
    out = remove(im, session=new_session('isnet-general-use'))
    return np.asarray(out)[..., 3].astype(np.float32) / 255


def midas(im, model):
    import onnxruntime as ort
    w, h = im.size
    x = np.asarray(im.resize((256, 256), Image.BICUBIC)).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    d = ort.InferenceSession(model).run(None, {'0': x})[0][0]
    return np.asarray(Image.fromarray(d).resize((w, h), Image.BICUBIC))


def cells(a, x0, y0, gw, gh):
    """Average a photo-sized array into the cell grid."""
    sub = a[y0:y0 + gh * CELL, x0:x0 + gw * CELL]
    return sub.reshape(gh, CELL, gw, CELL, *sub.shape[2:]).mean(axis=(1, 3))


def inflate(mask, r):
    """Rounds a flat silhouette into a pillow: a quarter circle of radius r at the edge."""
    d = ndimage.distance_transform_edt(mask)
    d = np.minimum(d, r)
    return np.sqrt(np.maximum(0, d * (2 * r - d))) * mask


def bump(gx, gy, cx, cy, rx, ry, h):
    """A soft elliptical bump of height h centred on a photo-pixel position."""
    u = ((gx * CELL + CROP[0] + CELL / 2) - cx) / rx
    v = ((gy * CELL + CROP[1] + CELL / 2) - cy) / ry
    return h * np.clip(1 - (u * u + v * v), 0, 1) ** 0.7


def main():
    model = sys.argv[1]
    preview = sys.argv[2] if len(sys.argv) > 2 else None
    im = Image.open(PHOTO).convert('RGB')
    rgb = np.asarray(im).astype(np.float32)
    alpha = cutout(im)
    depth = midas(im, model)

    x0, y0, x1, y1 = CROP
    gw, gh = (x1 - x0) // CELL, (y1 - y0) // CELL
    a = cells(alpha, x0, y0, gw, gh)
    col = cells(rgb * alpha[..., None], x0, y0, gw, gh) / np.maximum(a[..., None], 1e-3)
    md = cells(depth, x0, y0, gw, gh)
    mask = a > 0.5
    # Drop specks the cut-out leaves behind.
    lab, n = ndimage.label(mask)
    sizes = ndimage.sum(mask, lab, range(1, n + 1))
    mask = lab == (1 + int(np.argmax(sizes)))
    mask = ndimage.binary_fill_holes(mask)

    gy, gx = np.mgrid[0:gh, 0:gw].astype(np.float32)
    px = gx * CELL + x0 + CELL / 2
    py = gy * CELL + y0 + CELL / 2

    # Head: the part of the silhouette inside an ellipse round the face and hair.
    head = mask & ((((px - 138) / 70) ** 2 + ((py - 112) / 88) ** 2) <= 1)
    m = md[mask]
    near = np.clip((md - np.percentile(m, 5)) / (np.percentile(m, 98) - np.percentile(m, 5)), 0, 1)

    body = inflate(mask, 7) * 0.9 + near * 4
    face = 4 + inflate(head, 9) * 1.1
    face += bump(gx, gy, 106, 140, 13, 18, 2.6)   # nose
    face += bump(gx, gy, 128, 205 - 40, 40, 34, 1.6)  # beard and jaw
    face += bump(gx, gy, 132, 104, 46, 10, 0.8)   # brow and glasses
    z = np.where(head, np.maximum(face, body), body) * mask
    z = np.round(z).astype(int)
    z = np.where(mask, np.maximum(z, 1), 0)

    # Palette: median cut over the cell colours, a touch more contrast first.
    c = np.clip((col - 128) * 1.08 + 128 + 4, 0, 255)
    pix = Image.fromarray(c.astype(np.uint8))
    q = pix.quantize(colors=COLOURS, method=Image.Quantize.MEDIANCUT)
    pal = np.array(q.getpalette()[:COLOURS * 3]).reshape(-1, 3)
    idx = np.asarray(q).astype(int)

    # Pad the grid with empty cells.
    W, H = gw + 2 * PAD, gh + 2 * PAD
    C = np.full((H, W), -1, int)
    Z = np.zeros((H, W), int)
    C[PAD:PAD + gh, PAD:PAD + gw] = np.where(mask, idx, -1)
    Z[PAD:PAD + gh, PAD:PAD + gw] = z

    used = sorted(set(C[C >= 0].tolist()))
    remap = {u: i for i, u in enumerate(used)}
    palette = ['#%02x%02x%02x' % tuple(int(v) for v in pal[u]) for u in used]
    flat = [remap[v] + 1 if v >= 0 else 0 for v in C.flatten().tolist()]

    out = os.path.join(ROOT, 'app/demo/redesigns/manual/bio/voxel-data.ts')
    with open(out, 'w') as f:
        f.write('// Generated by scripts/voxel-head/build-head.py. Do not edit by hand.\n')
        f.write(f'export const VOXEL = {{\n  w: {W},\n  h: {H},\n')
        f.write(f'  palette: {json.dumps(palette)},\n')
        f.write("  /** Palette index + 1 per cell, row by row; '0' is empty. Base 36. */\n")
        f.write(f"  colour: '{''.join(np.base_repr(v, 36).lower() for v in flat)}',\n")
        f.write("  /** Depth in cells per cell, base 36. */\n")
        f.write(f"  depth: '{''.join(np.base_repr(int(v), 36).lower() for v in Z.flatten())}',\n")
        f.write('} as const;\n')

    rgba = np.zeros((H, W, 4), np.uint8)
    for i, v in enumerate(flat):
        if v:
            r, g, b = pal[used[v - 1]]
            rgba[i // W, i % W] = (r, g, b, 255)
    os.makedirs(os.path.join(ROOT, 'public/images/voxel'), exist_ok=True)
    Image.fromarray(rgba).save(os.path.join(ROOT, 'public/images/voxel/ben-flat.png'), optimize=True)
    print(f'{W}x{H} cells, {int(mask.sum())} columns, {len(palette)} colours, depth 0..{Z.max()}')

    if preview:
        Image.fromarray(rgba).resize((W * 8, H * 8), Image.NEAREST).save(os.path.join(preview, 'flat.png'))
        zz = (Z / max(Z.max(), 1) * 255).astype(np.uint8)
        Image.fromarray(zz).resize((W * 8, H * 8), Image.NEAREST).save(os.path.join(preview, 'z.png'))


if __name__ == '__main__':
    main()
