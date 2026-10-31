import sys, glob, math
from PIL import Image
files = sorted(glob.glob(sys.argv[1]))
out = sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4; maxh = int(sys.argv[4]) if len(sys.argv) > 4 else 1100
ims = [Image.open(f) for f in files]
w = max(i.width for i in ims)
cells = [i.crop((0, 0, i.width, min(i.height, maxh))) for i in ims]
rows = math.ceil(len(cells) / cols)
rh = [max(c.height for c in cells[r*cols:(r+1)*cols]) for r in range(rows)]
sheet = Image.new('RGB', (cols * w, sum(rh)), 'white')
y = 0
for r in range(rows):
    for c in range(cols):
        k = r*cols + c
        if k < len(cells): sheet.paste(cells[k], (c*w, y))
    y += rh[r]
sheet.save(out); print(out, sheet.size, len(cells))
