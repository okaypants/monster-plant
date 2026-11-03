"""Cat shots: the cat in every spot and every frame, as you'd see him in the room.

Run from the repository root:  python tests/cat_shots.py
For each nap spot (cat bed, rug, armchair, windowsill, milk crate, book stack), next to a grown plant at each front rug spot,
and walking on the floor, it draws every frame he can show there (both frames of each nap pose, sit and blink, yawn,
petted with the back-scratcher, belly-up) and saves a close-up with room around it to tests/screenshots/cat/, one sheet
per spot. Next to a plant it also checks that no cat pixel lands on a plant pixel (he's never behind or inside it).
Exit code 0 = all good, 1 = he overlapped a plant or a frame didn't draw.
"""
import asyncio, base64, io, os, sys
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve
from position_audit import NAP_FRAMES, RUG

OUT = os.path.join(SHOTS, "cat")
SPOTS = {"bed": "cat bed", "rug": "rug", "chair": "armchair", "sill": "windowsill", "crate": "milk crate", "books": "book stack"}

SHOT_JS = """async(it)=>{
 Object.assign(st,{others:[],stage:it.plant?8:-1,species:it.sp||3,night:false,dayT:.3,curtain:'open',started:true,nap:0,lightState:'ok',dryLv:0,dryRaw:0,witherLv:0,burnLv:0,puddleLv:0,over:0,mv:null,listen:0});
 if(it.plant)st.free={x:it.plant[0],y:it.plant[1]};T=0;blink=0;parts.length=0;BOING.ox=BOING.oy=0;
 const s=it.spot==='byplant'?plantSideSpot():it.spot==='floor'?{x:it.x,y:925,sc:.6}:CAT_SPOTS[it.spot];
 const F={curl1:['sleep','curl',9,0],curl2:['sleep','curl',9,.9],loaf1:['sleep','loaf',0,0],loaf2:['sleep','loaf',9,0],side1:['sleep','side',9,0],side2:['sleep','side',9,.9],
  sit1:['sniff','sit',0,.5],sit2:['wake','sit',2,.1],yawn:['wake','sit',0,0],pet1:['pet','pet',0,0],pet2:['pet','pet',0,.3],belly:['pet','pet',0,0,1,1],
  walk1:['walk','walk',0,0],walk2:['walk','walk',0,.2],walkL1:['walk','walk',0,0,-1],walkL2:['walk','walk',0,.2,-1]}[it.pose];
 Object.assign(cat,{spot:it.spot,x:s.x,y:s.y,sc:s.sc,state:F[0],pose:F[1],t:F[2],dir:F[4]||1,belly:!!F[5],path:null,pets:0,shyT:0});T=F[3];
 const b=catBox();if(!b)return {err:'not drawn'};
 const fx0=fx;fx=()=>{};const grab=()=>{draw();return g.getImageData(0,0,W,H).data;};
 const A=grab(),keep=cat.x;cat.x=-9999;const B=grab();cat.x=keep;let overlap=0;
 if(it.plant){const s0=st.stage;st.stage=-1;const C=grab();cat.x=-9999;const D=grab();cat.x=keep;st.stage=s0; // C: cat, no plant; D: neither
  for(let i=0;i<A.length;i+=4){const catPx=Math.abs(C[i]-D[i])+Math.abs(C[i+1]-D[i+1])+Math.abs(C[i+2]-D[i+2])>40,plantPx=Math.abs(B[i]-D[i])+Math.abs(B[i+1]-D[i+1])+Math.abs(B[i+2]-D[i+2])>40;if(catPx&&plantPx)overlap++;}}
 fx=fx0;draw();
 const pb=it.plant?plantBox():null,x0=Math.max(0,Math.min(b.x,pb?pb.x:b.x)-60),x1=Math.min(W,Math.max(b.x+b.w,pb?pb.x+pb.w:0)+60),y0=Math.max(0,Math.min(b.y-90,pb?pb.y-20:b.y)),y1=Math.min(H,b.y+b.h+60);
 const c=document.createElement('canvas');c.width=x1-x0;c.height=y1-y0;c.getContext('2d').drawImage(cv,x0,y0,c.width,c.height,0,0,c.width,c.height);
 return {url:c.toDataURL(),overlap};}"""


def save_sheet(name, cells):
    h = 260
    tiles = []
    for label, url in cells:
        im = Image.open(io.BytesIO(base64.b64decode(url.split(",")[1]))).convert("RGB")
        im = im.resize((max(1, round(im.width * h / im.height)), h), Image.NEAREST)
        t = Image.new("RGB", (im.width, h + 20), (25, 16, 27)); t.paste(im, (0, 0))
        ImageDraw.Draw(t).text((4, h + 4), label, fill=(253, 235, 201)); tiles.append(t)
    per = 6
    rows = [tiles[i:i + per] for i in range(0, len(tiles), per)]
    w = max(sum(t.width + 6 for t in r) for r in rows) + 6
    out = Image.new("RGB", (w, 30 + len(rows) * (h + 26)), (25, 16, 27))
    ImageDraw.Draw(out).text((8, 8), name, fill=(253, 235, 201))
    y = 30
    for r in rows:
        x = 6
        for t in r:
            out.paste(t, (x, y)); x += t.width + 6
        y += h + 26
    out.quantize(256, method=Image.Quantize.MEDIANCUT).save(os.path.join(OUT, name.replace(" ", "_").replace(",", "") + ".png"), optimize=True)  # 256 colors: small enough to commit


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    bad = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();s.started=true;s.stage=8;s.giftSeed=1;s.mode='actions';localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>__step(8)")
        plans = [(label, [dict(spot=k, pose=f) for f in NAP_FRAMES]) for k, label in SPOTS.items()]
        for where, xy in RUG.items():
            if where.startswith("rug front"):
                for sp in (2, 7):  # a narrow and a wide adult
                    plans.append((f"by plant, {where}, species {sp + 1}", [dict(spot="byplant", pose=f, plant=list(xy), sp=sp) for f in NAP_FRAMES]))
        plans.append(("walking", [dict(spot="floor", pose=f, x=x) for x in (400, 1200) for f in ("walk1", "walk2", "walkL1", "walkL2")]))
        for name, items in plans:
            cells = []
            for it in items:
                r = await pg.evaluate(SHOT_JS, it)
                if r.get("err"):
                    bad.append(f"{name} {it['pose']}: {r['err']}"); continue
                if r["overlap"]:
                    bad.append(f"{name} {it['pose']}: {r['overlap']} cat pixels on the plant")
                cells.append((it["pose"] + (f" x{it['x']}" if "x" in it else ""), r["url"]))
            save_sheet(name, cells)
            print(f"{name}: {len(cells)} frames")
        await b.close()
    if errs:
        bad.append("page errors: " + "; ".join(errs[:3]))
    print("\n".join(bad) if bad else "All frames drawn; never on a plant.")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    sys.exit(asyncio.run(main()))
