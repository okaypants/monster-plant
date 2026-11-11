"""Sloth's paw (Jackie, Nov 10): Sloth, PhD delivers by paw through the window instead of paper airplane.

Run from the repository root:  python3 tests/paw_shots.py
Checks:
  - a letter: the envelope paw slides in slowly (whole pixels), sets the envelope on the sill one step, slides out empty;
    the envelope stays on the sill and opens the letter (paw-print stamp, signed "— Sloth, PhD");
  - curtains closed: the delivery waits, and comes soon after the curtains open; closing them mid-reach finishes it at once;
  - night: the delivery waits for morning; dragging or a story open also makes it wait;
  - the seedling: the seed paw brings a seed packet in the morning; tapping it plants the seed in the little pot;
  - sending a seed: the packet goes on the sill and the empty paw comes, picks it up and takes it away;
  - "A very slow paw reaches in through the window…" only the first time ever;
  - old saves with a note on the sill show an envelope there; the debug drawer has "Paw delivery now".
Pictures go to tests/screenshots/paw/: each paw mid-reach, and the envelope and the seed packet on the sill at day and golden hour.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "paw")
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:5,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.1,name:'Zib Wigglebottom',"
        "free:{x:1250,y:918},nextId:3,goNext:99,breedDay:99,goRolled:99,letterRolled:99%s});localStorage.setItem(KEY,JSON.stringify(s));}")
CLIP = {"x": 300, "y": 400, "width": 320, "height": 175}  # room pixels: the lower window and the sill


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942}, device_scale_factor=2)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))

        async def load(extra=""):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE % extra)
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(10);capClear();CAP.log.length=0;const c=CAT_SPOTS.bed;Object.assign(cat,{spot:'bed',x:c.x,y:c.y,sc:c.sc,state:'sleep',pose:'curl',nap:9999,path:null});}")

        async def shot(name):
            c = await pg.evaluate("(c)=>{const r=cv.getBoundingClientRect();return {x:r.left+c.x*S,y:r.top+c.y*S,width:c.width*S,height:c.height*S};}", CLIP)
            await pg.screenshot(path=os.path.join(OUT, name + ".png"), clip=c)

        # 1. a letter for the adult: the envelope paw
        await load()
        r = await pg.evaluate("""()=>{letterLand(1);const out=[];let t=0;while(t<12){__step(.1,50);t+=.1;if(paw){const q=pawPose();out.push({t:+paw.t.toFixed(2),R:q.R,y:q.y,pic:q.c.width});}}
          return {out,item:st.sillItem,wait:st.pawWait,log:CAP.log.concat(CAP.q).map(l=>l.t)};}""")
        steps = r["out"]
        check(steps and all(isinstance(s["R"], int) and float(s["y"]).is_integer() for s in steps), "the paw should only move in whole pixels")
        ins = [s for s in steps if s["t"] < 3]
        check(ins and ins[0]["R"] > 700 and all(a["R"] >= b2["R"] for a, b2 in zip(ins, ins[1:])), f"it should slide in from the right, slowly: {ins[:3]}")
        check(r["item"] == "envelope" and not r["wait"], f"the envelope should be left on the sill: {r['item']}, waiting {r['wait']}")
        check(r["log"].count("A very slow paw reaches in through the window…") == 1, f"the first-time caption: {r['log']}")
        await pg.evaluate("()=>{capClear();letterClear();st.sillItem=null;letterLand(1);__step(4.6,50);}")  # second time: mid-reach
        check(await pg.evaluate("()=>!!paw&&!CAP.q.concat(CAP.cur?[CAP.cur]:[]).some(i=>/slow paw/.test(i.t))"), "the paw caption came back a second time")
        await shot("1_envelope_paw_mid_reach")
        await pg.evaluate("()=>{__step(9,50);}")
        await shot("2_envelope_on_sill_day")
        await pg.evaluate("()=>{st.dayT=.6;__step(.5);}")
        await shot("3_envelope_on_sill_golden")
        r = await pg.evaluate("()=>{st.dayT=.3;__step(.2);const b=sillBox();const c=cv.getBoundingClientRect();return [c.left+(b.x+b.w/2)*S,c.top+(b.y+b.h/2)*S];}")
        await pg.mouse.click(*r)
        await pg.evaluate("()=>__step(.3)")
        r = await pg.evaluate("()=>({sign:(document.querySelector('.jlsign')||{}).textContent,stamp:!!document.querySelector('.jletter .jlstamp img')})")
        check(r["sign"] == "— Sloth, PhD" and r["stamp"], f"tapping the envelope opens the letter, signed — Sloth, PhD, with a paw-print stamp: {r}")
        await pg.screenshot(path=os.path.join(OUT, "4_letter.png"))
        await pg.evaluate("()=>{closeLetter();letterClear();st.sillItem=null;__step(.5);}")

        # 2. curtains closed: it waits, then comes soon after they open; closing mid-reach finishes it
        r = await pg.evaluate("""()=>{st.curtain='closed';__step(2);letterLand(1);__step(15,50);const waited=!paw&&st.pawWait==='envelope'&&st.sillItem!=='envelope';
          st.curtain='open';let t=0;while(!paw&&t<10){__step(.1,50);t+=.1;}const came=+t.toFixed(1);__step(1.5,50);st.curtain='closed';__step(.1);
          return {waited,came,done:!paw&&st.sillItem==='envelope'&&!st.pawWait};}""")
        check(r["waited"], "with the curtains closed the delivery should wait")
        check(r["came"] <= 4, f"after the curtains open it should come soon (came after {r['came']} s)")
        check(r["done"], "curtains closing mid-reach: it should finish at once")
        await pg.evaluate("()=>{letterClear();st.sillItem=null;st.curtain='open';__step(2);}")

        # 3. night, dragging and a story: it waits
        r = await pg.evaluate("""()=>{st.night=true;letterLand(1);__step(15,50);const night=!paw&&st.pawWait==='envelope';st.night=false;
          drag.down=true;__step(6,50);const dragging=!paw;drag.down=false;let t=0;while(!paw&&t<10){__step(.1,50);t+=.1;}const morning=!!paw;
          return {night,dragging,morning};}""")
        check(r["night"], "at night the delivery should wait for morning")
        check(r["dragging"], "while dragging, the delivery should wait")
        check(r["morning"], "in the morning (and not dragging) it should come")
        await pg.evaluate("()=>{__step(10,50);letterClear();st.sillItem=null;}")

        # 4. the seedling: the seed paw brings a packet in the morning; tap it to plant
        await load(",slothSend:6")
        r = await pg.evaluate("()=>{st.night=true;wake();__step(4.6,50);return {paw:!!paw&&paw.kind,plants:plantCount()};}")
        check(r["paw"] == "seed" and r["plants"] == 1, f"the seedling should come by the seed paw, not appear by itself: {r}")
        await shot("5_seed_paw_mid_reach")
        await pg.evaluate("()=>{__step(9,50);capClear();}")
        await shot("6_seed_packet_on_sill_day")
        await pg.evaluate("()=>{st.dayT=.6;__step(.5);}")
        await shot("7_seed_packet_on_sill_golden")
        r = await pg.evaluate("()=>{st.dayT=.3;__step(.2);const b=sillBox();const c=cv.getBoundingClientRect();return [c.left+(b.x+b.w/2)*S,c.top+(b.y+b.h/2)*S];}")
        await pg.mouse.click(*r)
        r = await pg.evaluate("()=>{__step(.3);return {plants:plantCount(),item:st.sillItem,gift:st.giftSeed};}")
        check(r["plants"] == 2 and not r["item"] and r["gift"] == 1, f"tapping the packet should plant the seed: {r}")

        # 5. sending a seed: the empty paw takes the packet
        await load(",others:[Object.assign(" + OTHER + ",{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:760,y:918}})]")
        await pg.evaluate("()=>{st.seedOffer={ids:[1,2],seed:freshPlant()};seedSend();__step(4.6,50);}")
        check(await pg.evaluate("()=>!!paw&&paw.kind==='take'&&st.sillItem==='send'"), "sending: the packet waits on the sill and the empty paw comes for it")
        await shot("8_empty_paw_reaching_for_packet")
        await pg.evaluate("()=>__step(2.6,50)")
        check(await pg.evaluate("()=>!!paw&&st.sillItem===null"), "the paw should have picked the packet up")
        await shot("9_paw_taking_packet")
        r = await pg.evaluate("()=>{const n=st.seedsSent||0;__step(6,50);return {paw:!!paw,sent:(st.seedsSent||0)-n,log:CAP.log.concat(CAP.q).map(l=>l.t)};}")
        check(not r["paw"] and r["sent"] == 1 and "Off it goes to Sloth, PhD." in r["log"], f"after it leaves, the seed is sent: {r}")

        # 6. an old save with a note on the sill, and debug
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE % ",letterNote:'sill',letterFor:1,adultDay:0")
        await pg.reload(wait_until="load")
        check(await pg.evaluate("()=>st.sillItem==='envelope'"), "an old save's note on the sill should be an envelope there")
        await pg.click(".screen button")
        await pg.click("#dbgBtn")
        check(await pg.evaluate("()=>[...document.querySelectorAll('#dbg button')].some(b=>b.textContent==='Paw delivery now')"), "debug: Paw delivery now")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS paw_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
