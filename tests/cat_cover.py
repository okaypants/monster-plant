"""The cat is never hidden behind a plant.

Run from the repository root:  python tests/cat_cover.py
Puts plants in every spot (grown plants all over the rug, including right in front of the milk crate, book stack, armchair
and cat bed; kids on the crate or book stack; seedlings on the windowsill or desk), lets the cat pick a nap spot and walk
there through the real game loop again and again, and measures how much of him is covered once he settles, from the
rendered room (pixels that change when he's drawn, with and without the plants). He must never be more than 20% covered.
Then a plant is moved in front of a napping cat: he must get up after a moment, walk somewhere visible and settle again.
Saves a picture of every settle to tests/screenshots/cover/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "cover")

# layouts: grown plants' (x, y) on the rug; kid on 'crate'/'books' or none; seedling on 'sill'/'desk' or none
LAYOUTS = [
    ([(300, 900), (978, 900), (1460, 918)], "crate", "sill"),   # in front of the crate, the book stack, the cat bed
    ([(640, 900), (1250, 918)], "books", "desk"),                 # in front of the armchair
    ([(338, 918), (760, 918), (1400, 860)], None, None),
    ([(500, 800), (900, 800), (1300, 800)], "crate", None),      # back of the rug
    ([(250, 918), (1000, 918), (1460, 900)], "books", "sill"),
    ([(400, 860), (700, 860), (1100, 860)], None, "desk"),
    ([(560, 918), (1460, 918)], None, None),
    ([(320, 840), (980, 840), (1450, 840)], "crate", "desk"),
]

SETUP_JS = """(L)=>{const [grown,kid,seed]=L;
 const mk=(o)=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return Object.assign(q,{id:o.id,started:true,nap:0,needs:{thirst:0,hunger:0,attention:0},lightState:'ok',lightBad:0,ge:0,lc:0,nge:0,nlc:0},o);};
 let id=1;const ps=grown.map(([x,y],i)=>mk({id:id++,stage:8,species:(i*5+2)%16,free:{x,y},place:{grown:'rugC'}}));
 if(kid)ps.push(mk({id:id++,stage:4,species:6,place:{baby:kid}}));if(seed)ps.push(mk({id:id++,stage:1,species:9,timer:-1e9,place:{seed}}));
 const a=ps.shift();for(const k of Object.keys(st))if(!GLOBAL.has(k))delete st[k];Object.assign(st,a,{others:ps,night:false,dayT:.3,curtain:'open',started:true,mode:'actions',speed:2});
 Object.assign(cat,{spot:'bed',x:1578,y:SURFACE.bed,sc:.62,state:'wake',t:2.7,pets:0,shyT:0,path:null,hold:false,hidden:0,retry:0});
 return ps.length+1;}"""

# how much of the cat is covered, from the rendered room: cat pixels visible with the plants vs without them
MEASURE_JS = """()=>{const sz=sleepZ,fx0=fx;sleepZ=()=>{};fx=()=>{};const grab=()=>{draw();return g.getImageData(0,0,W,H).data;};const keep=cat.x;
 const diff=(A,B)=>{let n=0;for(let i=0;i<A.length;i+=4)if(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2])>30)n++;return n;};
 const A=grab();cat.x=-9999;const B=grab();cat.x=keep;
 const o=st.others,s0=st.stage;st.others=[];st.stage=-1;const C=grab();cat.x=-9999;const D=grab();cat.x=keep;st.others=o;st.stage=s0;
 sleepZ=sz;fx=fx0;draw();const all=diff(C,D),vis=diff(A,B);return {cover:all?1-vis/all:0,spot:cat.spot,x:Math.round(cat.x),pose:cat.pose,game:catCover(cat.x,cat.y,cat.sc,catFrame())};}"""

SETTLE_JS = """()=>{for(let i=0;i<2400;i++){__step(.05);if(cat.state==='sleep'&&cat.t>.5)return true;}return false;}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails, n = [], 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate("()=>{const s=fresh();s.started=true;s.stage=8;s.giftSeed=1;s.mode='actions';s.catTrust=.95;localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        await pg.evaluate("()=>__step(8)")
        for li, L in enumerate(LAYOUTS):
            await pg.evaluate(SETUP_JS, list(L))
            await pg.evaluate("()=>__step(1)")
            for r in range(6):  # he picks a spot, walks there and settles, six times per layout
                await pg.evaluate("()=>{Object.assign(cat,{state:'wake',t:2.7,path:null});}")
                if not await pg.evaluate(SETTLE_JS):
                    fails.append(f"layout {li}: the cat never settled ({await pg.evaluate('()=>cat.state')})"); continue
                m = await pg.evaluate(MEASURE_JS)
                n += 1
                tag = f"layout {li} settle {r}: {m['spot']} x{m['x']} {m['pose']}, {m['cover'] * 100:.0f}% covered"
                if m["cover"] > .2 + .02:
                    fails.append(tag)
                    await pg.screenshot(path=os.path.join(OUT, f"FAIL_layout{li}_{r}.png"))
                elif r == 0:
                    await pg.screenshot(path=os.path.join(OUT, f"layout{li}.png"))
                print(tag)
            # a plant wanders in front of the napping cat: he gets up after a moment and moves somewhere visible
            await pg.evaluate("""()=>{const s=CAT_SPOTS.crate;Object.assign(cat,{spot:'crate',x:s.x,y:s.y,sc:s.sc,pose:'loaf',state:'sleep',t:5,nap:1e9,path:null,hidden:0});
              st.place.baby='books';for(const o of st.others)if(o.place)o.place.baby='books';st.stage=8;st.free={x:330,y:905};st.walk=null;}""")
            await pg.evaluate("()=>__step(.2)")
            before = await pg.evaluate(MEASURE_JS)
            await pg.evaluate("()=>__step(4)")
            moved = await pg.evaluate("()=>cat.state!=='sleep'||cat.spot!=='crate'")
            if before["cover"] > .2 and not moved:
                fails.append(f"layout {li}: a plant moved in front of the napping cat ({before['cover'] * 100:.0f}% covered) and he stayed put")
            if await pg.evaluate(SETTLE_JS):
                m = await pg.evaluate(MEASURE_JS); n += 1
                print(f"layout {li} after a plant moved in front ({before['cover'] * 100:.0f}%): {m['spot']} x{m['x']}, {m['cover'] * 100:.0f}% covered")
                if m["cover"] > .2 + .02:
                    fails.append(f"layout {li}: settled {m['cover'] * 100:.0f}% covered after moving")
            else:
                fails.append(f"layout {li}: never settled again after a plant moved in front")
            if li == 0:
                await pg.screenshot(path=os.path.join(OUT, "moved_after_plant_came_in_front.png"))
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print(f"{n} settles measured; pictures in tests/screenshots/cover/")
    if fails:
        sys.exit(1)
    print("PASS: the cat never settles more than 20% covered by a plant, and moves when one comes in front of him")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
