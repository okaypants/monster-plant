"""Positioning audit (no fixes): does every plant's pot, and the cat, rest on its surface?

Run from the repository root:  python tests/position_audit.py
Renders every species (16) at every age in every spot it can use, and the cat in every nap spot and pose (plus walking
on the floor and next to plants), measures the lowest drawn pixel (the pot's bottom, the cat's paws or body) against the
surface in the room art, and saves cropped close-ups as contact sheets in tests/screenshots/positions/ (one per spot,
one for the cat), plus off_by_more_than_2px.txt. In each close-up: cyan/magenta = the surface's top face (back and front
edge), red = the measured bottom.

How it measures: each picture is drawn twice, with and without the plant (or cat); the lowest changed pixel row in the
middle of it is its bottom. Plants asleep in the armchair are measured with the chair front hidden (it's drawn over them),
then shown as you'd see them.
"""
import asyncio, base64, io, os
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "positions")
AGES = {0: "seed", 1: "sprout", 4: "kid", 6: "teen", 8: "adult"}
# top face of each surface, read from room_day.png (first and last row you can stand on); floors use the placement line
BANDS = {"sill": (540, 564), "desk": (526, 558), "crate": (616, 639), "books": (630, 652), "chair": (640, 660), "bed": (867, 888)}
RUG = {"rug front left": (300, 918), "rug front center": (545, 918), "rug front right": (1250, 918),
       "rug back left": (300, 790), "rug back center": (545, 790), "rug back right": (1250, 790)}

PLANT_JS = """async(items)=>{const out=[];const cf=CHAIR_FRONT.slice();
 const reset=()=>{Object.assign(st,{others:[],nap:0,listen:0,over:0,overType:'',lightState:'ok',lightBad:0,glare:0,dryLv:0,witherLv:0,burnLv:0,puddleLv:0,mv:null,grump:0,walk:null,
   needs:{thirst:0,hunger:0,attention:0},dayT:.3,curtain:'open',lamp:true,desk:true,started:true});drag.on=false;BOING.ox=BOING.oy=BOING.vx=BOING.vy=0;parts.length=0;T=0;blink=0;cat.x=-999;};
 for(const it of items){reset();st.species=it.sp;st.stage=it.stage;st.night=!!it.night;st.place={seed:it.spot,baby:it.spot};if(it.free)st.free={x:it.free[0],y:it.free[1]};
  pickChair();const box=plantBoxRaw(),cx=Math.round(box.x+box.w/2),hw=Math.max(14,Math.round(box.w*.3));
  if(it.night)CHAIR_FRONT.length=0;draw();const A=g.getImageData(0,0,W,H).data;const s0=st.stage;st.stage=-1;draw();const B=g.getImageData(0,0,W,H).data;st.stage=s0;
  let bottom=-1;for(let y=H-1;y>=0&&bottom<0;y--)for(let x=Math.max(0,cx-hw);x<Math.min(W,cx+hw);x++){const i=(y*W+x)*4;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>40){bottom=y;break;}}
  CHAIR_FRONT.length=0;CHAIR_FRONT.push(...cf);draw(); // as you'd see it
  const cw=Math.max(150,Math.min(360,Math.round(box.w*1.2))),y0=Math.max(0,(bottom<0?box.y+box.h:bottom)-150),c=document.createElement('canvas');c.width=cw;c.height=Math.min(200,H-y0);
  c.getContext('2d').drawImage(cv,cx-cw/2,y0,cw,c.height,0,0,cw,c.height);out.push({bottom,y0,x0:cx-cw/2,url:c.toDataURL()});}
 CHAIR_FRONT.length=0;CHAIR_FRONT.push(...cf);return out;}"""

CAT_JS = """async(items)=>{const out=[];
 for(const it of items){Object.assign(st,{others:[],stage:it.plant?8:-1,species:3,night:false,dayT:.3,curtain:'open',started:true,nap:0,lightState:'ok',dryLv:0,witherLv:0,burnLv:0,puddleLv:0,over:0,mv:null});
  if(it.plant)st.free={x:it.plant[0],y:it.plant[1]};T=0;blink=0;parts.length=0;BOING.ox=BOING.oy=0;
  let s=it.spot==='byplant'?plantSideSpot():it.spot==='floor'?{x:it.x,y:925,sc:.6}:CAT_SPOTS[it.spot];
  Object.assign(cat,{spot:it.spot,x:s.x,y:s.y,sc:s.sc,pose:it.pose,dir:1,path:null,pets:0,t:0,shyT:0,
   state:{curl:'sleep',loaf:'sleep',side:'sleep',sit:'sniff',pet:'pet',walk1:'walk',walk2:'walk'}[it.pose]});
  if(it.pose.startsWith('walk')){cat.state='walk';T=it.pose==='walk2'?1/12:0;}
  const b=catBox();if(!b){out.push({bottom:-1,y0:0,x0:0,url:''});continue;}const cx=Math.round(b.x+b.w/2),hw=Math.round(b.w*.3);
  draw();const A=g.getImageData(0,0,W,H).data;const keep=cat.x;cat.x=-999;draw();const B=g.getImageData(0,0,W,H).data;cat.x=keep;
  let bottom=-1;for(let y=H-1;y>=0&&bottom<0;y--)for(let x=Math.max(0,cx-hw);x<Math.min(W,cx+hw);x++){const i=(y*W+x)*4;if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>40){bottom=y;break;}}
  draw();const cw=Math.max(140,b.w+60),y0=Math.max(0,Math.min(H-170,(bottom<0?b.y+b.h:bottom)-120)),c=document.createElement('canvas');c.width=cw;c.height=Math.min(170,H-y0);
  c.getContext('2d').drawImage(cv,cx-cw/2,y0,cw,c.height,0,0,cw,c.height);out.push({bottom,y0,x0:cx-cw/2,surfY:s.y,url:c.toDataURL()});}
 return out;}"""


def judge(bottom, band):
    lo, hi = band
    if bottom < 0:
        return "not drawn", None
    if bottom < lo - 2:
        return "floating", lo - bottom
    if bottom > hi + 2:
        return "sinking", bottom - hi
    return "resting", 0


def tile(r, label, band, verdict):
    im = Image.open(io.BytesIO(base64.b64decode(r["url"].split(",")[1]))).convert("RGB")
    d = ImageDraw.Draw(im)
    for yy, col in ((band[0], (0, 255, 255)), (band[1], (255, 0, 255))):
        if 0 <= yy - r["y0"] < im.height:
            d.line((0, yy - r["y0"], im.width, yy - r["y0"]), fill=col)
    if r["bottom"] >= 0:
        d.line((0, r["bottom"] - r["y0"], im.width, r["bottom"] - r["y0"]), fill=(255, 0, 0), width=2)
    scale = 200 / im.height
    im = im.resize((max(1, round(im.width * scale)), 200), Image.NEAREST)
    cell = Image.new("RGB", (im.width, 236), (25, 16, 27))
    cell.paste(im, (0, 0))
    d = ImageDraw.Draw(cell)
    off = verdict[0] != "resting"
    d.text((4, 204), label, fill=(253, 235, 201))
    d.text((4, 220), verdict[0] + (f" {verdict[1]} px" if verdict[1] else ""), fill=(255, 110, 110) if off else (200, 209, 69))
    return cell


def sheet(name, cells):
    per_row = 8
    rows = [cells[i:i + per_row] for i in range(0, len(cells), per_row)]
    w = max(sum(c.width + 6 for c in r) for r in rows) + 6
    out = Image.new("RGB", (w, 34 + len(rows) * 242), (25, 16, 27))
    ImageDraw.Draw(out).text((8, 10), name, fill=(253, 235, 201))
    y = 34
    for r in rows:
        x = 6
        for c in r:
            out.paste(c, (x, y)); x += c.width + 6
        y += 242
    out.save(os.path.join(OUT, name.replace(" ", "_") + ".png"), optimize=True)


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    report = []
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

        plans = []  # (sheet, band, items)
        for spot in ("sill", "desk"):
            plans.append((f"windowsill" if spot == "sill" else "desk", BANDS[spot], [dict(sp=s, stage=a, spot=spot) for a in (0, 1) for s in range(16)]))
        for spot in ("crate", "books"):
            plans.append(("milk crate" if spot == "crate" else "book stack", BANDS[spot], [dict(sp=s, stage=4, spot=spot) for s in range(16)]))
        for name, (x, y) in RUG.items():
            plans.append((name, (y, y), [dict(sp=s, stage=a, free=[x, y]) for a in (6, 8) for s in range(16)]))
        plans.append(("armchair asleep", BANDS["chair"], [dict(sp=s, stage=a, night=True) for a in (4, 6, 8) for s in range(16)]))
        for name, band, items in plans:
            res = await pg.evaluate(PLANT_JS, items)
            cells = []
            for it, r in zip(items, res):
                label = f"#{it['sp'] + 1} {AGES[it['stage']]}"
                v = judge(r["bottom"], band)
                cells.append(tile(r, label, band, v))
                if v[0] != "resting":
                    report.append((name, label, v))
            sheet(name, cells)
            print(f"{name}: {len(items)} pictures, {sum(1 for r in report if r[0] == name)} off")

        cat_items = []
        for spot in ("bed", "rug", "chair", "sill", "crate", "books"):
            for pose in ("curl", "loaf", "side", "sit", "pet"):
                cat_items.append(dict(spot=spot, pose=pose))
        for x in (400, 800, 1200):
            for pose in ("walk1", "walk2"):
                cat_items.append(dict(spot="floor", pose=pose, x=x))
        for name, xy in RUG.items():
            for pose in ("curl", "loaf", "side", "sit", "pet"):
                cat_items.append(dict(spot="byplant", pose=pose, plant=list(xy), where=name))
        res = await pg.evaluate(CAT_JS, cat_items)
        cells = []
        for it, r in zip(cat_items, res):
            band = BANDS[it["spot"]] if it["spot"] in BANDS else (r.get("surfY", 925),) * 2
            where = {"floor": f"walking x{it.get('x')}", "byplant": f"by plant, {it.get('where')}"}.get(it["spot"], it["spot"])
            label = f"{where}: {it['pose']}"
            v = judge(r["bottom"], band) if r["url"] else ("not drawn", None)
            if r["url"]:
                cells.append(tile(r, label, band, v))
            if v[0] != "resting":
                report.append(("cat", label, v))
        sheet("cat", cells)
        print(f"cat: {len(cat_items)} pictures, {sum(1 for r in report if r[0] == 'cat')} off")
        await b.close()
        if errs:
            print("page errors:", errs[:3])

    lines = ["Positioning audit: everything off by more than 2 px (floating = above the surface, sinking = into it).", ""]
    for name in dict.fromkeys(r[0] for r in report):
        rows = [r for r in report if r[0] == name]
        lines.append(f"{name} ({len(rows)}):")
        lines += [f"  {lab}: {v[0]}" + (f" {v[1]} px" if v[1] else "") for _, lab, v in rows]
        lines.append("")
    if not report:
        lines.append("Nothing is off by more than 2 px.")
    open(os.path.join(OUT, "off_by_more_than_2px.txt"), "w").write("\n".join(lines))
    print(f"{len(report)} off by more than 2 px; list in tests/screenshots/positions/off_by_more_than_2px.txt")


if __name__ == "__main__":
    asyncio.run(main())
