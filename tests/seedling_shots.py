"""Seedling pot shots: every seedling stage (soil, first sprout, bigger sprout) and both frames on the windowsill and the desk.

Run from the repository root:  python tests/seedling_shots.py
Checks each pot's lowest drawn pixel rests on the spot's surface line (SURFACE in js/room.js, within 2 px), that it's drawn
with whole pixels at half size, and that the pot doesn't move between frames (1 px allowed: the drawings differ by a pixel here and there). Saves close-ups, a room view of each spot and a
contact sheet to tests/screenshots/seedlings/.
"""
import asyncio, base64, io, os, sys
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "seedlings")
# stage 0 = soil; stage 1 with timer < 15 = first sprout, timer >= 15 = bigger sprout
STAGES = [("soil", 0, 0), ("sprout", 1, 2), ("bigger sprout", 1, 20)]
SHOT_JS = """async(it)=>{Object.assign(st,{others:[],nap:0,listen:0,over:0,lightState:'ok',lightBad:0,glare:0,dryLv:0,witherLv:0,burnLv:0,puddleLv:0,mv:null,
  needs:{thirst:0,hunger:0,attention:0},dayT:.3,curtain:'open',lamp:true,desk:true,started:true,night:false,stage:it.stage,timer:it.timer,place:{seed:it.spot}});
 drag.on=false;parts.length=0;cat.x=-999;T=it.frame/.6+.01;
 const f=seedFrame(),box=plantBoxRaw(),cx=Math.round(box.x+box.w/2),hw=Math.round(box.w*.3);
 draw();const A=g.getImageData(0,0,W,H).data;const s0=st.stage;st.stage=-1;draw();const B=g.getImageData(0,0,W,H).data;st.stage=s0;draw();
 let bottom=-1,left=W,right=-1;for(let y=H-1;y>=0;y--)for(let x=Math.max(0,box.x-4);x<Math.min(W,box.x+box.w+4);x++){const i=(y*W+x)*4;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>40){if(bottom<0)bottom=y;if(y>bottom-20){left=Math.min(left,x);right=Math.max(right,x);}}}
 const cw=240,ch=200,x0=cx-cw/2,y0=SPOT[it.spot].y-ch+30,c=document.createElement('canvas');c.width=cw;c.height=ch;c.getContext('2d').drawImage(cv,x0,y0,cw,ch,0,0,cw,ch);
 const r=document.createElement('canvas');r.width=560;r.height=320;r.getContext('2d').drawImage(cv,cx-280,SPOT[it.spot].y-260,560,320,0,0,560,320);
 return {file:f.src.split('/').pop(),bottom,left,right,line:SPOT[it.spot].y,y0,box:[box.x,box.y,box.w,box.h],url:c.toDataURL(),room:r.toDataURL()};}"""


def pic(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(",")[1]))).convert("RGB")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    bad = []
    cells = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();s.started=true;s.stage=0;s.giftSeed=1;s.mode='actions';localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>__step(2)")
        for spot in ("sill", "desk"):
            for name, stage, timer in STAGES:
                pots = []
                for frame in (0, 1):
                    r = await pg.evaluate(SHOT_JS, dict(spot=spot, stage=stage, timer=timer, frame=frame))
                    pots.append((r["left"], r["right"], r["bottom"]))
                    off = r["bottom"] - r["line"]
                    label = f"{'windowsill' if spot == 'sill' else 'desk'} · {name} · frame {frame + 1}"
                    if abs(off) > 2:
                        bad.append(f"{label}: bottom {r['bottom']} vs surface {r['line']} ({'+' if off > 0 else ''}{off} px)")
                    im = pic(r["url"])
                    d = ImageDraw.Draw(im)
                    d.line((0, r["line"] - r["y0"], im.width, r["line"] - r["y0"]), fill=(0, 255, 255))
                    im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
                    cell = Image.new("RGB", (im.width, im.height + 34), (25, 16, 27))
                    cell.paste(im, (0, 0))
                    d = ImageDraw.Draw(cell)
                    d.text((4, im.height + 4), label, fill=(253, 235, 201))
                    d.text((4, im.height + 18), f"{r['file']}  bottom {r['bottom']} / line {r['line']}  pot {r['right'] - r['left'] + 1} px wide", fill=(200, 209, 69) if abs(off) <= 2 else (255, 110, 110))
                    cells.append(cell)
                    pic(r["room"]).save(os.path.join(OUT, f"{spot}_{name.replace(' ', '_')}_{frame + 1}.png"))
                if any(abs(a - b) > 1 for a, b in zip(pots[0], pots[1])):  # the two drawings differ by a pixel here and there
                    bad.append(f"{spot} {name}: the pot moves between frames {pots}")
        kid = await pg.evaluate("""()=>{const im=BABY[0];return [im.naturalWidth,im.naturalHeight];}""")
        await b.close()
    per = 6
    w = cells[0].width
    out = Image.new("RGB", (per * (w + 6) + 6, 40 + 2 * (cells[0].height + 6)), (25, 16, 27))
    ImageDraw.Draw(out).text((8, 12), "Seedling pot: soil, first sprout, bigger sprout x 2 frames (cyan = surface line; close-ups at 2x)", fill=(253, 235, 201))
    for i, c in enumerate(cells):
        out.paste(c, (6 + (i % per) * (w + 6), 40 + (i // per) * (c.height + 6)))
    out.save(os.path.join(OUT, "seedlings_sheet.png"), optimize=True)
    # size check: the seedling pot at its in-game size next to baby_01 at its in-game size (kids are drawn 1:1), bottoms lined up
    sd = Image.open("seedling_soil1.png").convert("RGBA")
    sd = sd.resize((sd.width // 2, sd.height // 2), Image.NEAREST)
    kd = Image.open("baby_01.png").convert("RGBA")
    cmp = Image.new("RGBA", (sd.width + kd.width + 30, max(sd.height, kd.height) + 10), (235, 225, 205, 255))
    cmp.alpha_composite(sd, (10, cmp.height - 5 - sd.height))
    cmp.alpha_composite(kd, (20 + sd.width, cmp.height - 5 - kd.height))
    cmp = cmp.resize((cmp.width * 2, cmp.height * 2), Image.NEAREST)
    cmp.convert("RGB").save(os.path.join(OUT, "size_vs_baby_01.png"))
    for e in errs:
        bad.append("page error: " + e)
    print("\n".join(bad) if bad else "all seedling pots rest on their surface, frames line up")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
