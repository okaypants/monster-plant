"""Sleepy closed eyes on the pumpkin (Jackie, Nov 16: she didn't like it with its eyes open).
Run from the repository root:  python3 tools/pumpkin_eyes.py   (reads the cut frames as they came from tools/season_cut.py, from git)
Only the eyes change. Frames 1-3: each eye arc is turned upside down in place (a closed, sleepy curve), with its own pixels;
the spot it leaves (and the see-through pinholes the keying left along it) is filled from the pumpkin just above and below it. Everything else is untouched.
(The lit night frame isn't used: Jackie likes only the closed eyes and the black mouth, so the pumpkin wears this face at night too.)
"""
import io, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage

def orig(i):
    return np.array(Image.open(io.BytesIO(subprocess.check_output(["git", "show", f"7700439:pumpkin{i}.png"]))).convert("RGBA"))

def fill(a, m):
    """fill masked pixels per column from the nearest unmasked pixel above or below"""
    out = a.copy()
    for x in np.where(m.any(0))[0]:
        ys = np.where(m[:, x])[0]
        for run in np.split(ys, np.where(np.diff(ys) > 1)[0] + 1):
            t, b = run[0] - 1, run[-1] + 1
            for y in run:
                out[y, x] = a[t, x] if y - t <= b - y else a[b, x]
    return out

def pinholes(a):
    """the keying left a few see-through pinholes along the eye arcs (inside the pumpkin, not open to the outside)"""
    op = a[..., 3] > 0
    return ndimage.binary_fill_holes(op) & ~op

def eyes(a):
    """the two eye arcs: big dark components in the face band"""
    dark = (a[..., 3] > 0) & (a[..., :3].sum(-1) < 250)
    lab, n = ndimage.label(dark)
    out = []
    for c in range(1, n + 1):
        ys, xs = np.where(lab == c)
        if 1500 < len(ys) < 2000:
            out.append(lab == c)
    return sorted(out, key=lambda m: np.where(m)[1].min())

def flip_eyes(a):
    es = eyes(a)
    assert len(es) == 2
    grow = np.zeros(a.shape[:2], bool)
    for m in es:
        grow |= ndimage.binary_dilation(m, iterations=4)  # the arc and its soft edge
    near = ndimage.binary_dilation(grow, iterations=12)
    b = fill(a, (grow & (a[..., 3] > 0)) | (near & pinholes(a)))
    for m in es:
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        mm = m[y0:y1, x0:x1][::-1, ::-1]
        px = a[y0:y1, x0:x1][::-1, ::-1]
        b[y0:y1, x0:x1][mm] = px[mm]
    return b, es

frames = {i: orig(i) for i in range(1, 4)}
for i in (1, 2, 3):
    b, _ = flip_eyes(frames[i])
    Image.fromarray(b).save(f"pumpkin{i}.png")
