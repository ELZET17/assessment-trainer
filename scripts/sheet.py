import sys, glob
from PIL import Image
pat, out, cols, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
files = sorted(glob.glob(pat))
cells = []
for f in files:
    im = Image.open(f).convert('RGB')
    scale = w / im.width
    im = im.resize((w, int(im.height * scale)))
    cells.append(im.crop((0, 0, w, min(h, im.height))))
rows = (len(cells) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (w + 6), rows * (h + 6)), (120, 120, 120))
for i, c in enumerate(cells):
    sheet.paste(c, ((i % cols) * (w + 6), (i // cols) * (h + 6)))
sheet.save(out); print(out, sheet.size, len(cells))
