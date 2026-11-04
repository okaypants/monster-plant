"""One perspective: every sprite's size comes from its spot's depth (where the furniture touches the floor).

Run from the repository root:  python tests/perspective_shots.py
Puts a seedling, a kid, a teen, an adult and the cat at every spot (windowsill, desk, armchair, book stack, crate,
back / middle / front of the rug, cat bed), one at a time, and crops each at the same scale so they line up side by side
in tests/screenshots/perspective/every_spot.png. Then the two-kids-asleep case (one in the armchair, one on the book
stack) in two_kids_asleep.png, and the debug Depth lines view in depth_lines.png.
Checks: a teen is ~1.45x a kid and an adult ~1.9x at every spot, every sprite's scale is depthK(its spot's depth),
sizes only shrink going back, the cat keeps the same size next to each age everywhere, and the two sleeping kids come out
the same size. Exit code 1 if a check fails.
"""
import asyncio, io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "perspective")
SPECIES = 0  # its kid, teen and adult drawings are all at least AGE_REF tall, so the 1.45x / 1.9x hold exactly
# name, x, surface row (where the pot or paws rest), depth key or depth row, asleep in the armchair?
SPOTS = [
    ("windowsill", 478, 564, "sill", False),
    ("desk", 1236, 558, "desk", False),
    ("armchair", 628, 656, "chair", True),
    ("book stack", 978, 652, "books", False),
    ("milk crate", 338, 639, "crate", False),
    ("rug, back", 1000, 790, 790, False),
    ("rug, middle", 1000, 854, 854, False),
    ("rug, front", 545, 918, 918, False),
    ("cat bed", 1578, 888, "bed", False),
]
AGES = [("seedling", 1), ("kid", 4), ("teen", 6), ("adult", 8)]
CW, CH, ABOVE = 360, 640, 600  # every crop: same size and scale, the surface row 600 px down
BASE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:%d,id:1,day:3,dayT:.37,giftSeed:1,mode:'actions',"
        "curtain:'open',others:[],catTrust:.3,pref:'shade',needs:{thirst:0,hunger:0,attention:0}});localStorage.setItem(KEY,JSON.stringify(s));}") % SPECIES
# put the plant (or nothing) at a made-up spot 'T' with the given depth, and the cat at another or off-screen
PLACE = """([x,y,d,stage,chair,catOn])=>{
 SPOT.T={x,y};SPOT.OFF={x:-3000,y:900};DEPTH.T=typeof d==='string'?DEPTH[d]:d;
 window.__spot=stage<0?'OFF':'T';spotKey=()=>window.__spot;
 st.stage=Math.max(0,stage);st.timer=-1e9;st.nap=chair?999:0;st.night=false;chairId=chair&&stage>=4?st.id:null;
 Object.assign(cat,{hold:true,force:null,state:'sniff',pose:'loaf',nap:1e6,t:0,path:null,huff:0,belly:false,
   spot:'T',x:catOn?x:-3000,y,sc:catSc(DEPTH.T)});
 BOING.ox=BOING.oy=0;capClear();__step(.05);
 const b=plantBox(),cb=catBox();return {h:b.h,w:b.w,k:stage>=4?b.scale:b.seedK,dk:depthK(DEPTH.T),cat:cb?cb.h:0,catK:cb?cb.k:0};}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    try:
        font = ImageFont.load_default(size=22)
        small = ImageFont.load_default(size=17)
    except TypeError:
        font = small = ImageFont.load_default()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(BASE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>__step(8)")

        async def room():
            await pg.wait_for_timeout(120)
            return Image.open(io.BytesIO(await pg.locator("#c").screenshot())).convert("RGB")

        def crop(im, x, y):
            c = Image.new("RGB", (CW, CH), (40, 28, 40))
            x0, y0 = int(x - CW / 2), int(y - ABOVE)
            c.paste(im.crop((max(0, x0), max(0, y0), min(im.width, x0 + CW), min(im.height, y0 + CH))), (max(0, -x0), max(0, -y0)))
            return c

        rows, sizes = [], {}
        for name, x, y, d, chair in SPOTS:
            cells, sz = [], {}
            for age, stage in AGES:
                r = await pg.evaluate(PLACE, [x, y, d, stage, chair and stage >= 4, False])
                sz[age] = r
                cells.append(crop(await room(), x, y))
            r = await pg.evaluate(PLACE, [x, y, d, -1, False, True])
            sz["cat"] = r
            cells.append(crop(await room(), x, y))
            rows.append((name, sz["kid"]["dk"], d if isinstance(d, int) else await pg.evaluate(f"()=>DEPTH['{d}']"), cells, sz))
            sizes[name] = sz
            # the age relationships hold at every depth
            tk, ak = sz["teen"]["h"] / sz["kid"]["h"], sz["adult"]["h"] / sz["kid"]["h"]
            check(abs(tk - 1.45) < .03, f"{name}: teen is {tk:.2f}x a kid (want 1.45)")
            check(abs(ak - 1.9) < .03, f"{name}: adult is {ak:.2f}x a kid (want 1.9)")
            print(f"{name:12s} depth {rows[-1][2]:>4} scale {sz['kid']['dk']*100:5.1f}%  seedling {sz['seedling']['h']:5.0f}  kid {sz['kid']['h']:5.0f}  teen {sz['teen']['h']:5.0f} ({tk:.2f}x)  adult {sz['adult']['h']:5.0f} ({ak:.2f}x)  cat {sz['cat']['cat']:4.0f} ({sz['cat']['cat']/sz['kid']['h']:.2f} of a kid)")
        # the same curve everywhere: size / depthK is the same at every spot, and nothing grows going back
        for age in ("seedling", "kid", "teen", "adult"):
            base = [sizes[n][age]["h"] / sizes[n][age]["dk"] for n, *_ in SPOTS]
            check(max(base) - min(base) < 2.5, f"{age}: size isn't one curve of depth ({min(base):.1f}..{max(base):.1f} at 100%)")
        cats = [sizes[n]["cat"]["catK"] / sizes[n]["cat"]["dk"] for n, *_ in SPOTS]
        check(max(cats) - min(cats) < 1e-6, "the cat's scale isn't one curve of depth")
        order = sorted(SPOTS, key=lambda s: rows[[r[0] for r in rows].index(s[0])][2])
        hs = [sizes[s[0]]["adult"]["h"] for s in order]
        check(all(a <= b + .5 for a, b in zip(hs, hs[1:])), "an adult farther back is drawn bigger than one in front")
        k = sizes["armchair"]["kid"]["h"], sizes["book stack"]["kid"]["h"]
        check(abs(k[0] - k[1]) < 2, f"a kid in the armchair ({k[0]:.0f}) and on the book stack ({k[1]:.0f}) aren't the same size")

        # every species: the teen and adult relationship to its kid (squat drawings aren't blown up, so these can be less)
        rs = await pg.evaluate("""()=>{const o=[];for(let s=0;s<16;s++){st.species=s;const h={};for(const[a,g]of[['kid',4],['teen',6],['adult',8]]){st.stage=g;h[a]=plantBox().h;}o.push([s,h.teen/h.kid,h.adult/h.kid]);}st.species=%d;return o;}""" % SPECIES)
        print("every species, teen/kid and adult/kid:", " ".join(f"{s + 1}:{t:.2f}/{a:.2f}" for s, t, a in rs))

        # the sheet
        LW, PAD, HEAD = 230, 8, 46
        sheet = Image.new("RGB", (LW + 5 * (CW + PAD), HEAD + len(rows) * (CH + PAD)), (250, 240, 228))
        dr = ImageDraw.Draw(sheet)
        for i, t in enumerate(["seedling", "kid", "teen", "adult", "cat"]):
            dr.text((LW + i * (CW + PAD) + CW // 2, HEAD // 2), t, fill=(60, 30, 40), font=font, anchor="mm")
        for j, (name, dk, depth, cells, sz) in enumerate(rows):
            y = HEAD + j * (CH + PAD)
            dr.text((12, y + CH // 2 - 40), name, fill=(60, 30, 40), font=font)
            dr.text((12, y + CH // 2 - 8), f"depth {depth}", fill=(90, 60, 70), font=small)
            dr.text((12, y + CH // 2 + 16), f"scale {dk * 100:.0f}%", fill=(90, 60, 70), font=small)
            if name == "armchair":
                dr.text((12, y + CH // 2 + 40), "(asleep)", fill=(90, 60, 70), font=small)
            for i, c in enumerate(cells):
                sheet.paste(c, (LW + i * (CW + PAD), y))
        sheet.save(os.path.join(OUT, "every_spot.png"))

        # the two kids asleep: one in the armchair, one on the book stack (same species, so same size)
        await pg.reload(wait_until="load")
        await pg.evaluate("""()=>{const s=fresh();Object.assign(s,{started:true,stage:4,species:%d,id:1,nextId:2,day:3,dayT:.37,giftSeed:1,mode:'actions',curtain:'open',
          place:{baby:'crate'},nap:999,needs:{thirst:0,hunger:0,attention:0},catTrust:.3});
          const o=JSON.parse(JSON.stringify(s));for(const k of ['started','day','dayT','mode','curtain','giftSeed','catTrust','nextId'])delete o[k];o.id=2;o.place={baby:'books'};s.others=[o];
          localStorage.setItem(KEY,JSON.stringify(s));}""" % SPECIES)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(1);capClear();Object.assign(cat,{hold:true,x:1578,y:SURFACE.bed,spot:'bed',sc:CAT_SPOTS.bed.sc,state:'sleep',pose:'curl',nap:1e6});__step(.1);}")
        two = await pg.evaluate("()=>{const o=[];eachPlant(()=>o.push({id:st.id,chair:onChair(),spot:onChair()?'armchair':spotKey(),h:plantBox().h,w:plantBox().w}));return o;}")
        print("two kids asleep:", two)
        check(len(two) == 2 and any(t["chair"] for t in two) and any(t["spot"] == "books" for t in two), f"two-kids setup: {two}")
        check(len(two) == 2 and abs(two[0]["h"] - two[1]["h"]) < 2, f"the two sleeping kids aren't the same size: {two}")
        full = await room()
        full.save(os.path.join(OUT, "two_kids_asleep.png"))

        # the debug Depth lines view
        await pg.evaluate("()=>{depthLines=true;__step(.1);}")
        (await room()).save(os.path.join(OUT, "depth_lines.png"))
        await pg.evaluate("()=>{depthLines=false;}")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/perspective/")
    if fails:
        sys.exit(1)
    print("PASS: one perspective curve; ages keep 1.45x / 1.9x; the sleeping kids match")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
