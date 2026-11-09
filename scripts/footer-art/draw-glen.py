"""
"The glen": an original engraved-style landscape for the Field manual footer.
A Highland glen in blue and cream: two ranges, a loch, a bothy at the end of a
path, four walkers and a dog heading out, geese overhead.

Everything is procedural: tone fields rendered through line screens (fall-line
hatching on the hills, cross-hatching in shadow, wavy lines on the water,
perspective lines on the moor), plus hand-placed shapes drawn with PIL.
Rendered at 2x and downsampled.

usage: python3 scripts/footer-art/draw-glen.py public/images/footer [preview]
(needs numpy and Pillow; writes glen.jpg and, at full size, glen-ink.jpg)
"""
import math
import sys

import numpy as np
from PIL import Image, ImageDraw

OUT = sys.argv[1]
PREVIEW = len(sys.argv) > 2
W, H = (1200, 675) if PREVIEW else (2400, 1350)
S = 2
w, h = W * S, H * S
K = w / 4800  # scale factor for pixel constants tuned at full size

BLUE = np.array([0, 53, 147], np.float32)
CREAM = np.array([251, 236, 220], np.float32)
INK_DARK = np.array([23, 21, 18], np.float32)
PAPER = np.array([242, 236, 223], np.float32)

ys = np.arange(h, dtype=np.float32)[:, None]
xs = np.arange(w, dtype=np.float32)[None, :]


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def noise1d(n, cells, seed, octaves=5, persist=0.5):
    r = np.random.default_rng(seed)
    x = np.linspace(0, 1, n)
    out = np.zeros(n)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = int(cells * 2 ** o)
        grid = np.linspace(0, 1, c + 2)
        out += amp * np.interp(x, grid, r.random(c + 2))
        tot += amp
        amp *= persist
    return (out / tot - 0.5).astype(np.float32)


def smooth1d(a, rad):
    rad = max(1, int(rad))
    k = np.exp(-0.5 * (np.arange(-3 * rad, 3 * rad + 1) / rad) ** 2)
    k /= k.sum()
    pad = np.pad(a, 3 * rad, mode='edge')
    return np.convolve(pad, k, mode='valid').astype(np.float32)


def noise2(gh, gw, seed, size=None):
    size = size or (w, h)
    r = np.random.default_rng(seed)
    a = r.random((max(2, int(gh)), max(2, int(gw)))).astype(np.float32)
    return np.asarray(Image.fromarray(a, mode='F').resize(size, Image.BICUBIC))


def fbm2(gh, gw, seed, octaves=4, size=None):
    out, amp, tot = 0, 1.0, 0.0
    for o in range(octaves):
        out = out + amp * noise2(gh * 2 ** o, gw * 2 ** o, seed + 17 * o, size)
        tot += amp
        amp *= 0.5
    return out / tot


def vnoise(gx, gz, seed, cells=512):
    """Value noise at arbitrary coordinates (for the perspective ground)."""
    r = np.random.default_rng(seed)
    grid = r.random((cells, cells)).astype(np.float32)
    x0 = np.floor(gx)
    z0 = np.floor(gz)
    fx = gx - x0
    fz = gz - z0
    fx = fx * fx * (3 - 2 * fx)
    fz = fz * fz * (3 - 2 * fz)
    x0 = x0.astype(np.int64) % cells
    z0 = z0.astype(np.int64) % cells
    x1 = (x0 + 1) % cells
    z1 = (z0 + 1) % cells
    a = grid[z0, x0]
    b = grid[z0, x1]
    c = grid[z1, x0]
    d = grid[z1, x1]
    return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + d * fx) * fz


def vfbm(gx, gz, seed, octaves=3):
    out, amp, tot = 0, 1.0, 0.0
    for o in range(octaves):
        f = 2 ** o
        out = out + amp * vnoise(gx * f + 13.7 * o, gz * f + 7.1 * o, seed + o)
        tot += amp
        amp *= 0.5
    return out / tot


def cover(u, tone, grad):
    """Line-screen coverage: lines at integer u, width = tone of the period."""
    f = u - np.floor(u)
    dist = np.minimum(f, 1 - f)
    c = np.clip((tone * 0.5 - dist) / np.maximum(grad, 1e-5) + 0.5, 0, 1)
    return np.where(tone > 0.02, c, 0).astype(np.float32)


def gradmag(u):
    gy, gx = np.gradient(u)
    return np.sqrt(gx * gx + gy * gy)


# ---------------------------------------------------------------- ridges
xn = np.linspace(0, 1, w, dtype=np.float32)


def ridge(base, peaks, rough, seed, cells=10):
    """Skyline y (fraction of height) for each column."""
    y = np.full(w, base, np.float32)
    lift = np.zeros(w, np.float32)
    for (px, hgt, wid, p) in peaks:
        t = np.abs(xn - px) / wid
        bump = hgt * np.clip(1 - t, 0, 1) ** p
        lift = np.maximum(lift, bump) + 0.25 * np.minimum(lift, bump)
    y = y - lift
    y = y + rough * noise1d(w, cells, seed, octaves=6, persist=0.55)
    return y


# Far range: long ridge left, the big pyramid right of centre.
r1 = ridge(0.705, [(0.05, 0.085, 0.20, 1.2), (0.27, 0.065, 0.16, 1.4),
                   (0.47, 0.035, 0.12, 1.5), (0.66, 0.175, 0.17, 1.15),
                   (0.86, 0.095, 0.15, 1.3), (1.02, 0.07, 0.14, 1.3)],
           0.020, 11, cells=14)
# Near range: two shoulders framing the glen; the middle sinks out of sight.
r2 = ridge(0.86, [(-0.02, 0.215, 0.34, 1.05), (0.20, 0.10, 0.16, 1.6),
                  (1.03, 0.205, 0.30, 1.0), (0.82, 0.07, 0.12, 1.7)],
           0.018, 23, cells=12)
R1 = r1 * h
R2 = r2 * h

ink = np.ones((h, w), np.float32)  # sky is solid blue


def hills(R, seed, sp, lean_k, haze, cross_sp, dark=0.0, contrast=0.40):
    """Tone + ink for a range whose skyline (px) is R."""
    d = ys - R[None, :]
    dp_ = np.maximum(d, 0)
    slope = np.gradient(R)  # dy/dx in px/px
    s1 = smooth1d(slope, 14 * K * 2)
    s2 = smooth1d(slope, 90 * K * 2)
    depth_t = np.clip(d / (240 * K * 2), 0, 1)
    xi = np.clip(xs + 0.32 * dp_, 0, w - 1)
    col = np.arange(w, dtype=np.float32)
    sl = np.interp(xi, col, s1) * (1 - depth_t) + np.interp(xi, col, s2) * depth_t
    face = np.tanh(sl * 3.0)  # -1 lit (faces the light, upper left), +1 in shadow

    lean = np.clip(lean_k * smooth1d(slope, 40 * K * 2), -1.1, 1.1)
    lp = np.abs(np.gradient(lean)).max() + 1e-6
    L0 = 0.55 * math.e / lp  # keeps d * lean' below ~0.55: no folds
    disp = dp_ * np.exp(-dp_ / L0) * lean[None, :]
    xsh = xs - disp

    # Gullies: streaks that run down the fall lines.
    g_line = noise1d(w * 2, 120, seed + 1, octaves=4, persist=0.62)
    g_idx = np.clip(((xsh / w) * 0.5 + 0.25) * (2 * w - 1), 0, 2 * w - 1).astype(np.int64)
    gully = g_line[g_idx] * 2  # ~[-1, 1]
    patch = fbm2(8, 22, seed + 2, octaves=3)
    rock = fbm2(16, 36, seed + 3, octaves=4)

    tone = (0.34 + contrast * face + 0.40 * gully * (0.3 + patch) + 0.14 * depth_t + dark)
    near_ridge = smoothstep(20 * K * 2, 0, d) * smoothstep(0.2, -0.4, face)
    tone = tone - 0.30 * near_ridge
    tone = np.where(rock > 0.64, tone * 0.3, tone)  # bare, sunlit rock
    tone = np.clip(np.maximum(tone, 0.07 + 0.05 * patch) * haze[0] + haze[1], 0, 1)

    wob = 0.30 * (noise2(70, 200, seed + 4) - 0.5) + 0.12 * (noise2(300, 600, seed + 6) - 0.5)
    u = xsh / (sp * K * 2) + wob
    a = cover(u, np.minimum(tone, 0.85), gradmag(u))
    # Break the lines into strokes where the tone is light.
    dash = noise2(40, int(w / (sp * K * 2)), seed + 7)
    a = a * smoothstep(0.55 * (1 - tone) - 0.06, 0.55 * (1 - tone) + 0.06, dash)
    u2 = (ys + 0.30 * xs) / (cross_sp * K * 2) + 0.30 * (noise2(40, 90, seed + 5) - 0.5)
    b = cover(u2, np.clip((tone - 0.46) * 1.7, 0, 0.8), gradmag(u2))
    return np.maximum(a, b), tone, d >= 0


ink1, tone1, m1 = hills(R1, 100, sp=6.0, lean_k=0.9, haze=(0.80, 0.0), cross_sp=5.5)
ink = np.where(m1, ink1, ink)

# ------------------------------------------------------------------ loch
y_lt = (0.778 + 0.0025 * noise1d(w, 8, 31)) * h
m_l = ys >= y_lt[None, :]
ry = np.clip(2 * y_lt[None, :] - ys, 0, h - 1).astype(np.int64)
rx = np.broadcast_to(np.arange(w), (h, w))
rows = slice(int(0.76 * h), int(0.86 * h))
ref = np.zeros((h, w), np.float32)
ref[rows] = tone1[ry[rows], rx[rows]]
streak = noise2(140, 10, 41)
loch_tone = np.clip(0.06 + 0.95 * ref * (0.5 + 0.9 * streak), 0, 0.92)
loch_tone = np.where(streak > 0.78, 0.0, loch_tone)
uw = ys / (3.6 * K * 2) + 0.35 * (noise2(30, 220, 42) - 0.5)
ink_l = cover(uw, loch_tone, gradmag(uw))
ink = np.where(m_l, ink_l, ink)

# ------------------------------------------------------------ near range
ink2, tone2, m2 = hills(R2, 200, sp=7.5, lean_k=1.0, haze=(1.0, 0.04), cross_sp=6.5, dark=0.06, contrast=0.45)
ink = np.where(m2, ink2, ink)
d2 = ys - R2[None, :]
ink = np.where((d2 >= 0) & (d2 < 2.6 * K * 2) & (R2[None, :] < 0.83 * h), 1.0, ink)

# ------------------------------------------------------------------ moor
yh = 0.795
y_m = (0.812 + 0.004 * noise1d(w, 6, 51) + 0.03 * smoothstep(0.30, 0.0, xn)
       + 0.025 * smoothstep(0.78, 1.0, xn)) * h
y_m = np.minimum(y_m, np.maximum(R2, 0.812 * h))  # meet the toes of the near range
top = int(y_m.min()) - 2
sub_y = ys[top:]
gz = 1.0 / np.maximum(sub_y / h - yh, 1e-3)
gx = (xs / w - 0.5) * gz
m_m = sub_y >= y_m[None, :]

path_c = -1.05 + 0.42 * np.sin(gz * 0.33 + 0.9) - 0.004 * gz
path_d = np.abs(gx - path_c)
path_w = 0.12
on_path = path_d < path_w
verge = smoothstep(path_w + 0.07, path_w, path_d) * (1 - on_path)

ground = vfbm(gx * 3.0, gz * 3.0, 61)
hummock = vfbm(gx * 0.7, gz * 0.45, 65)
clump_n = vfbm(gx / 0.30, gz / 0.20, 62)
clump = smoothstep(0.54, 0.58, clump_n) * smoothstep(path_w + 0.03, path_w + 0.25, path_d)
far = smoothstep(16, 46, gz)
tone_m = 0.04 + 0.10 * ground + 0.22 * np.clip(hummock - 0.48, 0, 1)
tone_m = tone_m + clump * far * (0.25 + 0.25 * vfbm(gx * 7, gz * 7, 63))
tone_m = tone_m * (1 - far) + far * (0.05 + 0.14 * ground)
# Heather and scrub: blobs drawn in perspective, then shaded from the upper left.
from PIL import ImageFilter
bimg = Image.new('L', (w, h - top), 0)
db = ImageDraw.Draw(bimg)
brng = np.random.default_rng(77)


def pc(gzv):
    return -1.05 + 0.42 * math.sin(gzv * 0.33 + 0.9) - 0.004 * gzv


bushes = []
for _ in range(int(3200)):
    yv = 0.818 + 0.21 * brng.random() ** 0.85
    xv = -0.06 + 1.12 * brng.random()
    gzv = 1.0 / (yv - yh)
    gxv = (xv - 0.5) * gzv
    edge = float(np.clip(1 - min(xv, 1 - xv) * 2.6, 0, 1))
    r_u = (0.06 + 0.09 * brng.random()) * (1 + 0.8 * edge * brng.random())
    if abs(gxv - pc(gzv)) < 0.17 + r_u:
        continue
    dens = float(vnoise(np.array(gxv / 0.8), np.array(gzv / 0.5), 78))
    if brng.random() > np.clip(dens * 1.7 - 0.95 + edge * 0.5, 0, 1):
        continue
    r = r_u / gzv * w
    if r < 2 * K * 2:
        continue
    cx, cy = xv * w, yv * h - top
    circ = []
    for _c in range(brng.integers(5, 12)):
        ang = brng.random() * math.pi
        dist = brng.random() ** 0.6
        px = cx + math.cos(ang) * r * 0.9 * dist
        py = cy - r * 0.40 - math.sin(ang) * r * 0.40 * dist
        rr = r * (0.28 + 0.26 * brng.random())
        rr = min(rr, (cy - py) / 0.85 + rr * 0.1)
        circ.append((px, py, rr))
    bushes.append((cy, cx, r, circ))

bushes.sort()
timg = Image.new('L', (w, h - top), 0)
dt = ImageDraw.Draw(timg)
for cy, cx, r, circ in bushes:
    # cast shadow to the right, then the dark body, then lit caps (upper left)
    dt.ellipse([cx - 0.5 * r, cy - 0.12 * r, cx + 1.5 * r, cy + 0.10 * r], fill=150)
    db.ellipse([cx - 0.5 * r, cy - 0.12 * r, cx + 1.5 * r, cy + 0.10 * r], fill=255)
    for px, py, rr in circ:
        dt.ellipse([px - rr, py - rr * 0.85, px + rr, py + rr * 0.85], fill=200)
        db.ellipse([px - rr, py - rr * 0.85, px + rr, py + rr * 0.85], fill=255)
    for px, py, rr in circ:
        q = rr * 0.58
        ox, oy = px - 0.28 * rr, py - 0.32 * rr
        dt.ellipse([ox - q, oy - q * 0.8, ox + q, oy + q * 0.8], fill=55)
Mb = np.asarray(bimg, np.float32) / 255
Tb = np.asarray(timg.filter(ImageFilter.GaussianBlur(1.2 * K * 2)), np.float32) / 255
inner = np.asarray(bimg.filter(ImageFilter.MinFilter(5)), np.float32) / 255
tb = np.clip(Tb + 0.22 * (vfbm(gx * 14, gz * 14, 79) - 0.5), 0, 1)
tone_m = np.where(Mb > 0.5, tb, tone_m)
bush_edge = (Mb > 0.5) & (inner < 0.5)
tone_m = np.where(on_path, 0.015, tone_m) + 0.42 * verge
tone_m = np.clip(tone_m, 0, 1)

row_y = sub_y[:, 0] / h
sp_m = (2.8 + 8 * smoothstep(0.81, 1.0, row_y)) * K * 2
u_row = np.cumsum(1.0 / sp_m)[:, None]
um = u_row + 0.22 * (noise2(50, 120, 64, size=(w, h - top)) - 0.5)
a = cover(um, np.minimum(tone_m, 0.85), gradmag(um))
mdash = noise2(160, 30, 68, size=(w, h - top))
a = a * np.maximum(smoothstep(0.42 * (1 - tone_m) - 0.05, 0.42 * (1 - tone_m) + 0.05, mdash), on_path * 0)
uc = (xs * 0.9 + sub_y * 0.55) / (sp_m[:, None] * 0.9) * 0.55
b = cover(uc, np.clip((tone_m - 0.42) * 1.7, 0, 0.8), gradmag(uc))
ink_m = np.maximum(a, b)
ink_m = np.where(bush_edge & (sub_y > 0.83 * h), np.maximum(ink_m, 0.95), ink_m)
ink[top:] = np.where(m_m, ink_m, ink[top:])
# A bank line where the moor meets the water and the hills.
dm = ys - y_m[None, :]
ink = np.where((dm >= 0) & (dm < 2.4 * K * 2), np.maximum(ink, 0.9), ink)

# ----------------------------------------------------------- drawn layer
pos = Image.new('L', (w, h), 0)    # ink on
neg = Image.new('L', (w, h), 0)    # ink off (cream)
dp = ImageDraw.Draw(pos)
dn = ImageDraw.Draw(neg)
rng = np.random.default_rng(5)


def ground_xy(gxv, gzv):
    return (0.5 + gxv / gzv) * w, (yh + 1.0 / gzv) * h


def path_center(gzv):
    return -1.05 + 0.42 * math.sin(gzv * 0.33 + 0.9) - 0.004 * gzv


# Grass tufts across the near moor (not on the path).
tus = lambda gxv, gzv: vnoise(np.array(gxv / 0.5), np.array(gzv / 0.35), 69)
for _ in range(int(1500 * (K ** 0.5))):
    t = rng.random() ** 0.7
    yv = (0.845 + 0.155 * t)
    gzv = 1.0 / (yv - yh)
    xv = rng.random()
    gxv = (xv - 0.5) * gzv
    if abs(gxv - path_center(gzv)) < 0.16:
        continue
    if tus(gxv, gzv) < 0.5 + 0.2 * rng.random():
        continue
    L = (5 + 34 * t ** 1.8) * K * 2
    cx, cy = xv * w, yv * h
    for _b in range(rng.integers(3, 8)):
        ang = (rng.random() - 0.5) * 1.2
        ll = L * (0.6 + 0.6 * rng.random())
        mx = cx + math.sin(ang) * ll * 0.45 + (rng.random() - 0.5) * 2
        my = cy - ll * 0.55
        ex = cx + math.sin(ang * 1.6) * ll
        ey = cy - ll * math.cos(ang * 0.8)
        wd = max(1, int((1.0 + 1.6 * t) * K * 2))
        dp.line([(cx, cy), (mx, my), (ex, ey)], fill=255, width=wd, joint='curve')


def walker(x, y, hp, flip=1, step=0):
    """A walker seen from behind, pack on, poles out. (x, y) = between the feet."""
    u = hp / 10.0
    f = flip
    # legs
    lx = [(x - 0.55 * u, y - 4.2 * u), (x - 0.75 * u, y - (0.0 if step == 0 else 0.7 * u))]
    rx_ = [(x + 0.55 * u, y - 4.2 * u), (x + 0.65 * u, y - (0.8 * u if step == 0 else 0.0))]
    dp.line(lx, fill=255, width=max(2, int(0.95 * u)))
    dp.line(rx_, fill=255, width=max(2, int(0.95 * u)))
    # hips and jacket
    dp.polygon([(x - 1.15 * u, y - 6.0 * u), (x + 1.15 * u, y - 6.0 * u),
                (x + 1.0 * u, y - 3.9 * u), (x - 1.0 * u, y - 3.9 * u)], fill=255)
    # arms and poles
    for side, reach, foot in ((-1, 2.2, 2.9), (1, 2.0, 2.4)):
        sx, sy = x + side * 1.25 * u, y - 7.4 * u
        hx, hy = x + side * reach * u, y - 5.0 * u
        dp.line([(sx, sy), (hx, hy)], fill=255, width=max(2, int(0.7 * u)))
        dp.line([(hx, hy - 0.4 * u), (x + side * foot * u * f, y + 0.25 * u)], fill=255, width=max(1, int(0.22 * u)))
    # pack with a rolled mat on top
    dp.rounded_rectangle([x - 1.45 * u, y - 8.5 * u, x + 1.45 * u, y - 4.7 * u], radius=0.6 * u, fill=255)
    dp.rounded_rectangle([x - 1.75 * u, y - 9.3 * u, x + 1.75 * u, y - 8.45 * u], radius=0.42 * u, fill=255)
    # a lit edge on the pack (light from the left)
    dn.line([(x - 1.15 * u, y - 8.1 * u), (x - 1.15 * u, y - 5.2 * u)], fill=255, width=max(1, int(0.32 * u)))
    dn.line([(x - 1.45 * u, y - 8.9 * u), (x + 0.6 * u, y - 8.9 * u)], fill=255, width=max(1, int(0.22 * u)))
    # head and hat
    dp.ellipse([x - 0.75 * u, y - 10.75 * u, x + 0.75 * u, y - 9.2 * u], fill=255)
    dp.ellipse([x - 0.3 * u, y - 11.25 * u, x + 0.3 * u, y - 10.65 * u], fill=255)


def dog(x, y, hp):
    u = hp / 10.0
    dp.ellipse([x - 2.6 * u, y - 4.6 * u, x + 1.8 * u, y - 2.6 * u], fill=255)  # body
    dp.ellipse([x + 1.2 * u, y - 5.9 * u, x + 3.0 * u, y - 4.2 * u], fill=255)  # head
    dp.polygon([(x + 1.5 * u, y - 5.6 * u), (x + 1.9 * u, y - 6.8 * u), (x + 2.3 * u, y - 5.6 * u)], fill=255)  # ear
    dp.line([(x - 2.4 * u, y - 4.2 * u), (x - 3.6 * u, y - 5.8 * u)], fill=255, width=max(1, int(0.5 * u)))  # tail
    for lx_, off in ((-2.0, 0.3), (-1.3, -0.3), (0.8, 0.3), (1.4, -0.2)):
        dp.line([(x + lx_ * u, y - 3.2 * u), (x + (lx_ + off) * u, y)], fill=255, width=max(1, int(0.5 * u)))


def bothy(x, y, size):
    """Gable end to us, side wall running back to the right."""
    u = size / 10.0
    gw, wh, rh = 5.2 * u, 3.6 * u, 2.6 * u
    sd, sr = 6.0 * u, -1.0 * u  # side depth (x) and rise (y) for perspective
    gable = [(x, y), (x + gw, y), (x + gw, y - wh), (x + gw / 2, y - wh - rh), (x, y - wh)]
    side = [(x + gw, y), (x + gw + sd, y + sr), (x + gw + sd, y - wh + sr), (x + gw, y - wh)]
    roof = [(x + gw / 2, y - wh - rh), (x + gw / 2 + sd, y - wh - rh + sr),
            (x + gw + sd + 0.4 * u, y - wh + sr + 0.2 * u), (x + gw + 0.4 * u, y - wh + 0.2 * u)]
    dn.polygon(gable, fill=255)
    dn.polygon(side, fill=255)
    lw = max(2, int(0.35 * u))
    dp.polygon(roof, fill=255)
    dp.line(gable + [gable[0]], fill=255, width=lw)
    dp.line(side, fill=255, width=lw)
    # side wall in shade: a few hatch lines
    for i in range(1, 7):
        t = i / 7
        xa = x + gw + sd * t
        dp.line([(xa, y + sr * t - 0.2 * u), (xa, y - wh + sr * t + 0.3 * u)], fill=255, width=max(1, int(0.22 * u)))
    # door and a small window
    dp.rectangle([x + gw * 0.38, y - 2.2 * u, x + gw * 0.62, y], fill=255)
    dp.rectangle([x + gw + sd * 0.45, y - wh * 0.62 + sr * 0.45, x + gw + sd * 0.62, y - wh * 0.32 + sr * 0.5], fill=255)
    # chimney on the far gable, a curl of smoke
    cx = x + gw + sd - 0.6 * u
    cy = y - wh + sr - 0.2 * u
    dp.rectangle([cx - 0.5 * u, cy - 1.9 * u, cx + 0.5 * u, cy], fill=255)
    pts = [(cx + math.sin(i * 0.55) * 0.7 * u + i * 0.5 * u, cy - 2.2 * u - i * 0.75 * u) for i in range(12)]
    dp.line(pts, fill=255, width=max(1, int(0.3 * u)), joint='curve')


# Bothy where the path meets the loch.
bz = 46.0
bx, by = ground_xy(path_center(bz), bz)
bothy(bx - 10 * K * 2, by, 40 * K * 2)

# Four walkers and a dog, heading in.
for i, (gzv, step) in enumerate(((9.4, 0), (11.2, 1), (13.4, 0), (16.2, 1))):
    cx = path_center(gzv) + (0.03 if i % 2 else -0.03)
    x, y = ground_xy(cx, gzv)
    hp = (0.34 / gzv) * w
    walker(x, y, hp, step=step)
dz = 10.0
x, y = ground_xy(path_center(dz) + 0.12, dz)
dog(x, y, (0.34 / dz) * w * 0.5)

# A skein of geese between the peaks (cream on the sky).
gx0, gy0 = 0.385 * w, 0.505 * h
for i in range(9):
    side = -1 if i % 2 else 1
    k = (i + 1) // 2
    bxg = gx0 - k * 26 * K * 2
    byg = gy0 + side * k * 13 * K * 2 + (rng.random() - 0.5) * 6 * K
    s = (7.5 - 0.25 * k) * K * 2
    flap = (rng.random() - 0.5) * 0.6
    pts = [(bxg - s, byg + s * (0.15 + flap)), (bxg - s * 0.5, byg - s * 0.32), (bxg, byg + s * 0.02),
           (bxg + s * 0.5, byg - s * 0.32), (bxg + s, byg + s * (0.15 - flap))]
    dn.line(pts, fill=255, width=max(2, int(2.6 * K * 2)), joint='curve')

posa = np.asarray(pos, np.float32) / 255
nega = np.asarray(neg, np.float32) / 255
ink = ink * (1 - nega)
ink = np.maximum(ink, posa)

# ------------------------------------------------------------ finish
grain = noise2(h // 3, w // 3, 91)
sky = (ys < R1[None, :]) & (ys < R2[None, :])
density = np.where(sky, 1.0 - 0.025 * grain, 0.9 + 0.1 * grain)
ink_f = np.clip(ink * density, 0, 1)


def render(fg, bg, name):
    rgb = bg[None, None, :] + (fg - bg)[None, None, :] * ink_f[..., None]
    paper = (noise2(h // 2, w // 2, 92) - 0.5) * 10
    rgb = rgb + paper[..., None] * (1 - ink_f[..., None])
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB')
    im = im.resize((W, H), Image.LANCZOS)
    im.save(f'{OUT}/{name}.jpg', quality=86, optimize=True, progressive=True)


render(BLUE, CREAM, 'glen')
if not PREVIEW:
    render(INK_DARK, PAPER, 'glen-ink')
print('done', W, H)
