"""Calm-down checks and screenshots: the sleeping cat's breathing, the slow Zzz, and drying out in the sun.

Run from the repository root:  python tests/calm_shots.py
Plays the real game loop at normal speed (speed 2) and checks:
  - the sleeping cat shows ONE frame per pose and only breathes in code: a 1 px rise every ~4.6 s, never more;
  - Zzz (cat and plants): one at a time, a new one every 12-20 s per sleeper, never two at once;
  - how long a plant in full sun takes to gray and get thirsty (printed in plain words).
Screenshots of the sleeping cat (breathing out, breathing in, with a Zzz), a sleeping plant with its Zzz, and a plant in
full sun as it dries go to tests/screenshots/calm/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "calm")
BASE = "s.mode='actions';s.giftSeed=1;s.others=[];s.stage=8;s.species=3;s.speed=2;"
CAT_CLIP = "()=>{const b=catBox();return {x:Math.max(0,b.x-90),y:Math.max(0,b.y-110),width:b.w+180,height:Math.min(942-Math.max(0,b.y-110),b.h+150)};}"
PLANT_CLIP = "()=>{const b=plantBox();const x=Math.max(0,b.x-60),y=Math.max(0,b.y-120);return {x,y,width:Math.min(1670-x,b.w+260),height:Math.min(942-y,b.h+150)};}"


async def page_for(b, save):
    ctx = await b.new_context(viewport={"width": 1670, "height": 942})
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate("()=>{const s=fresh();s.started=true;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
    await pg.reload(wait_until="load")
    await pg.click(".screen button")
    await pg.evaluate("()=>__step(8)")
    return ctx, pg, errs


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # 1 + 2: the cat asleep on the rug (each pose) next to a sleeping plant, 3 minutes of real play
        ctx, pg, errs = await page_for(b, BASE + "s.dayT=.3;s.free={x:300,y:918};")
        for pose in ("curl", "loaf", "side"):
            r = await pg.evaluate("""(pose)=>{const s=CAT_SPOTS.rug;Object.assign(cat,{spot:'rug',x:s.x,y:s.y,sc:s.sc,pose,state:'sleep',nap:1e9,path:null,pets:0,hold:false});st.nap=1e9;
             const frames=new Set(),zz=[],breath=[];let lastZ=null;
             for(let i=0;i<3600;i++){__step(.05);frames.add(catFrame().catName);breath.push(catBreath());
              const z=zzNow&&T-zzNow.t0<=ZZ_LIFE?zzNow.id+'@'+zzNow.t0.toFixed(2):null;if(z&&z!==lastZ)zz.push([zzNow.id,zzNow.t0]);lastZ=z;}
             let changes=0;for(let i=1;i<breath.length;i++)if(breath[i]!==breath[i-1])changes++;
             return {frames:[...frames],changes,maxB:Math.max(...breath),zz};}""", pose)
            if len(r["frames"]) != 1:
                fails.append(f"cat {pose}: {len(r['frames'])} frames while asleep ({r['frames']}), expected one")
            if r["maxB"] > 1:
                fails.append(f"cat {pose}: breathing moved {r['maxB']} px")
            breaths = r["changes"] / 2
            if not (180 / 5.2 <= breaths <= 180 / 4):
                fails.append(f"cat {pose}: {breaths} breaths in 3 minutes, expected one every 4-5 s")
            starts = r["zz"]
            for prev, nxt in zip(starts, starts[1:]):
                if nxt[1] - prev[1] < 4.5:
                    fails.append(f"two Zzz at once ({prev} then {nxt})")
            for who in {s[0] for s in starts}:
                ts = [t for w, t in starts if w == who]
                gaps = [round(b - a, 1) for a, b in zip(ts, ts[1:])]
                if any(gp < 12 - .1 for gp in gaps):
                    fails.append(f"{who} Zzz too often: gaps {gaps}")
                print(f"cat {pose}: {who} Zzz every {gaps} s (each one floats up for 4.5 s)")
            print(f"cat {pose}: frame {r['frames']}, {breaths:.0f} breaths in 3 min")
            # pictures: breathing out, breathing in, and with a Zzz floating up
            await pg.evaluate("()=>{for(let i=0;i<200&&catBreath()!==0;i++)__step(.05);}")
            await pg.screenshot(path=os.path.join(OUT, f"cat_{pose}_breath_out.png"), clip=await pg.evaluate(CAT_CLIP))
            await pg.evaluate("()=>{for(let i=0;i<200&&catBreath()!==1;i++)__step(.05);}")
            await pg.screenshot(path=os.path.join(OUT, f"cat_{pose}_breath_in.png"), clip=await pg.evaluate(CAT_CLIP))
            await pg.evaluate("()=>{zzNext.cat=T;zzNow=null;__step(.05);__step(1.5);}")
            await pg.screenshot(path=os.path.join(OUT, f"cat_{pose}_zzz.png"), clip=await pg.evaluate(CAT_CLIP))
        # the sleeping plant with its Zzz
        await pg.evaluate("()=>{st.needs.thirst=0;st.dryRaw=0;cat.x=-999;cat.state='walk';cat.hold=true;zzNow=null;zzNext['p'+st.id]=T;__step(.05);__step(1.5);}")
        await pg.screenshot(path=os.path.join(OUT, "plant_asleep_zzz.png"), clip=await pg.evaluate(PLANT_CLIP))
        fails += errs
        await ctx.close()

        # 3: a sun-lover in full sun at midday: how fast it dries, and how the gray comes on
        ctx, pg, errs = await page_for(b, BASE + "s.pref='sun';s.dayT=.3;s.curtain='open';s.free={x:470,y:852};")
        r = await pg.evaluate("""()=>{st.needs.thirst=0;const at={};let t=0,shot=[];
          for(let i=0;i<60*600&&st.needs.thirst<.95;i++){st.dayT=.37;__step(.05);t+=.05;for(const v of[.45,.6,.9])if(at[v]==null&&st.needs.thirst>=v)at[v]=t;}
          const li=spotInfo(spotKey());return {at,sun:li.sun,L:li.L,glare:st.glare};}""")
        if not r["sun"]:
            fails.append("the full-sun plant isn't in the sun patch")
        mins = {k: v / 60 for k, v in r["at"].items()}
        print(f"full sun (light {r['L']:.2f}): starts graying after {mins['0.45']:.1f} min, thirsty after {mins['0.6']:.1f} min, fully gray after {mins['0.9']:.1f} min (real minutes at normal speed)")
        if mins["0.6"] < 2.5:
            fails.append(f"dries too fast in full sun: thirsty after {mins['0.6']:.1f} min")
        for th in (0, .55, .7, .85, .95):
            await pg.evaluate(f"()=>{{st.needs.thirst={th};st.dryRaw=0;st.dayT=.37;__step(.1);}}")
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=os.path.join(OUT, f"full_sun_thirst_{int(th * 100):02d}.png"), clip=await pg.evaluate(PLANT_CLIP))
        fails += errs
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/calm/")
    if fails:
        sys.exit(1)
    print("PASS: one still frame per sleeping pose with a slow 1 px breath; one slow Zzz at a time; slower drying in the sun")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
