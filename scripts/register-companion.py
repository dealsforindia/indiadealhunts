"""Measure opaque character landmarks; export registration, never modify source drawings."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def measure(image):
    image = image.convert('RGBA')
    width, height = image.size
    mask = image.getchannel('A').point(lambda value: 255 if value >= 220 else 0)
    bounds = mask.getbbox()
    # Central hair region excludes a raised hand from the height measurement.
    hair = mask.crop((int(width*.4), 0, int(width*.65), int(height*.4))).getbbox()
    if not bounds or not hair:
        raise ValueError('Missing character landmarks')
    bottom = bounds[3]
    feet = mask.crop((0, max(0, bottom-int(height*.045)), width, bottom)).getbbox()
    aspect = width/height
    rw, rh = min(1, aspect/(36/46)), min(1, (36/46)/aspect)
    top = hair[1]/height*rh+(1-rh)/2
    floor = bottom/height*rh+(1-rh)/2
    center = (feet[0]+feet[2])/2/width*rw+(1-rw)/2
    scale = .82/(floor-top)
    return {'scale': round(scale, 5), 'x': round((.5-center*scale)*100, 5), 'y': round((.955-floor*scale)*100, 5)}

atlas = Image.open(ROOT/'public/brand/pixel-neel-catch.webp')
data = {'poses': [measure(atlas.crop((n*360, 0, (n+1)*360, 460))) for n in range(16)], 'reactions': {}}
for directory in sorted((ROOT/'public/brand/expressions').iterdir()):
    if directory.is_dir():
        files = sorted(directory.glob('*.webp'))
        if files:
            data['reactions'][directory.name] = [measure(Image.open(p)) for p in files]
data['holding'] = measure(Image.open(ROOT/'public/brand/approved-catcher.webp'))
(ROOT/'src/utils/companion-registration.json').write_text(json.dumps(data, indent=2)+'\n', encoding='utf-8')
print('Registered16 catch poses,', sum(map(len,data['reactions'].values())), 'individual reaction frames and approved holding pose.')
