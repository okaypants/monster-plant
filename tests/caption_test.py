"""Captions: the speech bubble, and how often lines can show.

Run from the repository root:  python tests/caption_test.py
On an iPhone 13 held sideways (and on a laptop-sized screen), day and night: the bubble sits at the top, never covers a
plant's face, is small but readable on the phone, has a tail toward the plant or cat only when they're "speaking", and
stays up about 1 s per 4 words (at least 3 s). Then the rules:
  - no line (but the important ones) twice within 10 minutes; voice lines never repeat one of the last 15 picked;
  - teaching tips once ever (still remembered after a reload);
  - at most one ambient line every 45-90 s, none while carrying, dragging or reading;
  - important lines always get through, even while you're busy.
Then 60 minutes of play (two plants, the cat, petting, watering, snacks, books) at normal speed, counting every line,
printed as a table. Pictures go to tests/screenshots/captions/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from collections import Counter
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "captions")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,giftSeed:1,mode:'actions',dayT:%s,night:%s,catTrust:.7,"
        "ge:.6,lc:-.6,nge:.5,nlc:-.5,pref:'shade',free:{x:1250,y:918},nextId:5,"
        "others:[Object.assign((()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})(),{id:2,stage:8,species:7,ge:-.6,lc:.6,nge:-.5,nlc:.5,pref:'sun',free:{x:300,y:900}})]});"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
LONG = "Your little seed is on the window sill growing, or move it to the desk and turn on the lamp."


async def page_for(b, device, night=False):
    ctx = await b.new_context(**device)
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
    await pg.evaluate(SAVE % (".92" if night else ".3", "false"))
    await pg.reload(wait_until="load")
    await pg.click(".screen button")
    await pg.evaluate("()=>{__step(12);capClear();}")
    return ctx, pg, errs


SHOW = """([t,o])=>{capClear();CAP.seen.clear();tell(t,o);__step(.6);const c=cap.getBoundingClientRect(),cv0=cv.getBoundingClientRect(),tl=capTail.getBoundingClientRect();
 const r={x0:(c.left-cv0.left)/S,y0:(c.top-cv0.top)/S,x1:(c.right-cv0.left)/S,y1:(c.bottom-cv0.top)/S};const faces=capFaces();
 return {show:cap.classList.contains('show'),tail:getComputedStyle(capTail).display!=='none'&&cap.classList.contains('talk'),tailX:(tl.left+tl.width/2-cv0.left)/S,
  font:parseFloat(getComputedStyle(cap.querySelector('.ci')).fontSize),cx:(r.x0+r.x1)/2,top:r.y0,bottom:r.y1,
  covers:faces.some(f=>f.x1>r.x0&&f.x0<r.x1&&f.y0<r.y1&&f.y1>r.y0),dur:CAP.cur?CAP.cur.dur:0,plantX:(()=>{let x=null;withPlant(o.who,()=>{const b=plantBox();x=b.x+b.w/2;});return x;})()};}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        phone = p.devices["iPhone 13 landscape"]
        laptop = {"viewport": {"width": 1440, "height": 812}}

        # 1: the look, phone and laptop, day and night, with and without a tail
        for dev_name, dev in (("phone", phone), ("laptop", laptop)):
            for night in (False, True):
                ctx, pg, errs = await page_for(b, dev, night)
                when = "night" if night else "day"
                r = await pg.evaluate(SHOW, [LONG, {"kind": "important"}])
                check(r["show"] and not r["tail"], f"{dev_name} {when}: a tip should show with no tail ({r})")
                check(r["top"] < 60, f"{dev_name} {when}: bubble isn't at the top (y {r['top']:.0f})")
                check(not r["covers"], f"{dev_name} {when}: the bubble covers a plant's face")
                over = await pg.evaluate("()=>{const a=cap.getBoundingClientRect();return [...document.querySelectorAll('#fsBtn,#dbgBtn')].some(b=>{const r=b.getBoundingClientRect();return r.width&&a.right>r.left&&a.left<r.right&&a.bottom>r.top&&a.top<r.bottom;});}")
                check(not over, f"{dev_name} {when}: the bubble overlaps the buttons at the top right")
                check(6 <= r["dur"] <= 8 and abs(r["dur"] - min(8, max(3, 2 + .3 * len(LONG.split())))) < .01, f"duration {r['dur']} for {len(LONG.split())} words (the longest lines stay 6-8 s)")
                if dev_name == "phone":
                    check(16 <= r["font"] <= 20, f"phone font {r['font']} px (small but readable)")
                await pg.wait_for_timeout(400)  # the pop runs on real time
                await pg.screenshot(path=os.path.join(OUT, f"{dev_name}_{when}_tip_no_tail.png"))
                r = await pg.evaluate(SHOW, ["It leans into your hand.", {"kind": "info", "who": 1}])
                check(r["show"] and r["tail"], f"{dev_name} {when}: a plant's line should have a tail")
                check(abs(r["tailX"] - r["plantX"]) < abs(r["cx"] - r["plantX"]), f"{dev_name} {when}: the tail doesn't lean toward the plant (tail {r['tailX']:.0f}, plant {r['plantX']:.0f})")
                check(3 <= r["dur"] <= 5, f"a short line stays {r['dur']} s, expected 3-5 s")
                await pg.wait_for_timeout(400)  # the pop runs on real time
                await pg.screenshot(path=os.path.join(OUT, f"{dev_name}_{when}_plant_speaking_tail.png"))
                if not night and dev_name == "phone":
                    r = await pg.evaluate(SHOW, ["The cat sniffs your hand. A start.", {"kind": "info", "who": "cat"}])
                    check(r["tail"], "the cat's line should have a tail")
                    await pg.wait_for_timeout(700)
                    await pg.screenshot(path=os.path.join(OUT, "phone_day_cat_tail.png"))
                    # an adult dragged up high: the bubble moves aside rather than cover its face
                    r = await pg.evaluate("""()=>{st.free={x:835,y:790};__step(.1);capClear();CAP.seen.clear();tell('Testing a bubble over a tall plant in the middle of the room.',{kind:'important'});__step(.6);
                      const c=cap.getBoundingClientRect(),cv0=cv.getBoundingClientRect(),r={x0:(c.left-cv0.left)/S,y0:(c.top-cv0.top)/S,x1:(c.right-cv0.left)/S,y1:(c.bottom-cv0.top)/S};
                      return capFaces().some(f=>f.x1>r.x0&&f.x0<r.x1&&f.y0<r.y1&&f.y1>r.y0);}""")
                    check(not r, "the bubble covers the face of a plant in the middle of the room")
                    # no fade: it pops in, in stepped frames (Jackie, Nov 10: one text style)
                    an = await pg.evaluate("()=>getComputedStyle(cap.querySelector('.ci')).animationName")
                    check(an == "tspop", f"the caption should pop in ({an})")
                fails += errs
                await ctx.close()

        # 2: the rules
        ctx, pg, errs = await page_for(b, laptop)
        r = await pg.evaluate("""()=>{capClear();CAP.seen.clear();const a=tell('Too little for that yet.',{kind:'info'});__step(4);const b=tell('Too little for that yet.',{kind:'info'});
          __step(601);const c=tell('Too little for that yet.',{kind:'info'});return [a,b,c];}""")
        check(r == [True, False, True], f"same line within 10 minutes: {r} (expected shown, refused, shown again after 10 min)")
        r = await pg.evaluate("""()=>{capClear();delete st.taught.testTip;const a=tell('A test tip.',{kind:'teach',key:'testTip'});__step(700);const b=tell('A test tip.',{kind:'teach',key:'testTip'});save();return [a,b];}""")
        check(r == [True, False], f"teaching tip twice: {r}")
        await pg.reload(wait_until="load"); await pg.click(".screen button"); await pg.evaluate("()=>__step(12)")
        check(await pg.evaluate("()=>tell('A test tip.',{kind:'teach',key:'testTip'})") is False, "a teaching tip came back after a reload")
        r = await pg.evaluate("""()=>{capClear();CAP.seen.clear();CAP.lastAmb=-1e9;const a=tell('ambient one',{kind:'ambient'});__step(5);const b=tell('ambient two',{kind:'ambient'});
          __step(40);const c=tell('ambient three',{kind:'ambient'});__step(60);held.tool='can';const d=tell('ambient four',{kind:'ambient'});
          const e=tell('A seed! (important)',{kind:'important'});__step(.6);const shown=CAP.cur&&CAP.cur.t;held.tool=null;return [a,b,c,d,e,shown];}""")
        check(r[:5] == [True, False, False, False, True] and r[5] == "A seed! (important)", f"ambient pacing / busy / important: {r}")
        r = await pg.evaluate("""()=>{capClear();CAP.seen.clear();for(const k in LINE_HIST)delete LINE_HIST[k];const out=[];for(let i=0;i<12;i++){const t=line('idle');out.push(t);if(t)CAP.seen.set(t,performance.now());}return out;}""")
        picked = [t for t in r if t]
        check(len(picked) == len(set(picked)), f"a voice line repeated within its shuffle bag: {picked}")
        check(r[len(picked):] == [""] * (12 - len(picked)), f"when every line was used recently it should stay quiet: {r}")
        fails += errs
        await ctx.close()

        # 3: an hour of play, counting every line
        ctx, pg, errs = await page_for(b, laptop)
        log = await pg.evaluate("""()=>{capClear();CAP.seen.clear();CAP.log.length=0;st.mode='visit';const t0=performance.now();
          for(let s=0;s<3600;s+=.5){__step(.5);const m=Math.round(s*2);
           if(m%40===0&&cat.state==='sleep'){petCat();}                           // pet the cat every 20 s
           if(m%60===0){const b=plantBox();mx=b.x+b.w/2;my=b.y+b.h/2;pet();}      // pet a plant every 30 s
           if(m%240===0){held.tool='can';__step(1);useTool();}                   // water every 2 min
           if(m%600===0){held.tool='snack';held.item=SNACKS[(m/600)%SNACKS.length];useTool();} // a snack every 5 min
           if(m%900===0){held.tool='book';held.item=BOOKS[(m/900)%BOOKS.length];useTool();}   // read every 7.5 min
           if(m%300===0)swapIn(0);                                               // switch plants now and then
           if(st.dayT>.69)st.dayT=.1;}                                           // keep it daytime
          return CAP.log.map(e=>({t:e.t,kind:e.kind,at:(e.at-t0)/1000}));}""")
        amb = [e for e in log if e["kind"] == "ambient"]
        gaps = [round(b2["at"] - a2["at"]) for a2, b2 in zip(amb, amb[1:])]
        check(all(g >= 45 for g in gaps), f"ambient lines closer than 45 s: {gaps}")
        last = {}
        for e in log:
            if e["kind"] != "important" and e["t"] in last and e["at"] - last[e["t"]] < 600:
                fails.append(f"repeated within 10 min: {e['t']!r}")
            last[e["t"]] = e["at"]
        c = Counter((e["kind"], e["t"]) for e in log)
        print(f"\nOne hour of play ({len(log)} lines; ambient gaps {min(gaps) if gaps else '-'}-{max(gaps) if gaps else '-'} s):")
        for (kind, t), n in c.most_common():
            print(f"  {n:3d}x  {kind:9s}  {t[:90]}")
        fails += errs
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/captions/")
    if fails:
        sys.exit(1)
    print("PASS: the bubble sits at the top, tails only for speakers, and lines don't nag")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
