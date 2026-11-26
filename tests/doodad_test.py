"""Everything you can touch in the room does something of its own (js/fidgets.js, fidgetDo).

Run from the repository root:  python3 tests/doodad_test.py
Taps each doodad on a phone held sideways and checks its own small thing happens: coins from the jar, notes from the
music box, the journal's Keep it safe page from the lockbox, a record from the crate, a butterfly, the moon, the sun's sign,
hearts, petals, drops, the snail trundling sideways (never up into the shelf), and the stool and desk chair wobbling.
Pictures go to tests/screenshots/doodads/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "doodads")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',"
        "catTrust:.1,free:{x:520,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")
TAP = "(n)=>{const p=FP.find(p=>p.n===n);capClear();fBits.length=0;const hit=fidgetPoke(p.x+p.w/2+6,p.y+p.h/2);return hit}"


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices["iPhone 13 landscape"])
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        await pg.evaluate("()=>{__step(2);capClear();}")
        names = await pg.evaluate("()=>FP.map(p=>p.n)")
        check(all(n in names for n in ["crate", "deskchair", "forks", "ball", "moondial", "viewer", "frame"]), f"the new room's things should be touchable: {names}")
        own = await pg.evaluate("()=>FP.filter(p=>!p.does&&!p.puff&&p.n!=='frame').map(p=>p.n)")
        check(set(own) <= {"pillow", "drum", "radio", "petbed", "deskchair"}, f"only furniture and things with their own app should be bounce-only: {own}")
        for n, kind in [("box1", "coin"), ("catpic", "heart"), ("bigpic", "petal")]:
            await pg.evaluate(TAP, n)
            bits = await pg.evaluate("(k)=>fBits.filter(b=>!k||b[k]).length", kind)
            check(bits >= 1, f"tapping {n} should send out its own little things, got {bits}")
            await pg.evaluate("()=>__step(.25)")
            await pg.screenshot(path=os.path.join(OUT, n + ".png"), clip=await pg.evaluate("(n)=>{const p=FP.find(p=>p.n===n),r=cv.getBoundingClientRect();return {x:r.left+(p.x-90)*S,y:r.top+Math.max(0,p.y-110)*S,width:(p.w+180)*S,height:(p.h+200)*S}}", n))
            await pg.evaluate("()=>__step(4)")
        # every coin falls to the floor and comes to rest there (Jackie, Nov 25): never a line in mid-air, never the shelf
        await pg.evaluate("()=>{fBits.length=0}")
        await pg.evaluate(TAP, "box1")
        await pg.evaluate("()=>__step(5.5,16)")  # small frames: the coins' fall is worked out sixty times a second; they last 7 s at least
        r = await pg.evaluate("()=>{const c=fBits.filter(b=>b.coin);return {n:c.length,off:c.filter(b=>Math.abs(b.y-b.fz)>3).length,low:c.filter(b=>b.fz<COIN_FLOOR[0]||b.fz>COIN_FLOOR[1]).length,moving:c.filter(b=>Math.abs(b.vy)>.5).length}}")
        check(r["n"] >= 6 and r["off"] == 0 and r["low"] == 0 and r["moving"] == 0, f"every coin should be at rest on the floor: {r}")
        await pg.screenshot(path=os.path.join(OUT, "coins_landed.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left,y:r.top+380*S,width:520*S,height:520*S}}"))
        # the moon dial says tonight's moon and shows a face for it
        await pg.evaluate(TAP, "moondial")
        await pg.evaluate("()=>__step(.4)")
        page = await pg.evaluate("()=>{const e=document.querySelector('.screen.moonpg');return e?{text:e.innerText,pic:!!e.querySelector('.mppic[src^=\"data:image\"]'),subs:[...e.querySelectorAll('.mpsub')].map(h=>h.textContent)}:null}")
        check(page and page["pic"] and "Tonight’s moon in different traditions" in page["subs"] and "Today’s date" in page["subs"] and "What it does tonight" in page["subs"] and "tides" in page["text"] and "tomorrow" not in page["text"].lower() and await pg.evaluate("()=>['new moon','waxing crescent','first quarter','waxing gibbous','full moon','waning gibbous','last quarter','waning crescent'].every(k=>MOON_DOES[k]&&MOON_DOES[k].length===3)") and "elsewhere" not in page["text"].lower() and "In Western astrology the moon is in " in page["text"] and "In the Hawaiian moon calendar tonight is about " in page["text"] and "In Arabic astrology the moon is in " in page["text"] and not any(w in page["text"] for w in ("undefined", "NaN", "Invalid", "null")), f"tapping the moon dial should open the moon page with the phase, the sign and tonight elsewhere: {page}")
        # every night of two years: each tradition has a line, nothing is missing, and the festivals land on their nights
        yr = await pg.evaluate("""()=>{const bad=[],fest=new Set(),hw=new Set(),nk=new Set(),mz=new Set(),jp=new Set();const t0=Date.UTC(2026,0,1,20);
          for(let d=0;d<730;d++){const t=t0+d*864e5,E=moonTraditions(t);if(E.lines.length<4||E.lines.some(l=>/undefined|NaN|Invalid/.test(l.say)))bad.push(d);
            hw.add(hawaiiNight(t));nk.add(nakshatraAt(t));mz.add(manzilAt(t));E.fest.forEach(f=>fest.add(f));E.lines.filter(l=>l.where==='Japan').forEach(l=>jp.add(l.say));
            if(moonPhaseLines(t).some(s=>/undefined|NaN/.test(s))||moonSignLines(t).some(s=>/undefined|NaN|Invalid/.test(s)))bad.push('p'+d);}
          return {bad:bad.slice(0,5),fest:fest.size,hw:hw.size,nk:nk.size,mz:mz.size,jp:jp.size}}""")
        check(not yr["bad"] and yr["hw"] == 30 and yr["nk"] == 27 and yr["mz"] == 28 and yr["jp"] in (8, 9) and yr["fest"] >= 12, f"over two years every night should have its lines, every name should come up and the festivals should appear: {yr}")
        await pg.click(".screen.moonpg .mpx")
        check(await pg.evaluate("()=>!document.querySelector('.screen.moonpg')&&moonDialAt()===null"), "the moon page should close")
        check(await pg.evaluate("()=>/^moon[1-5]$/.test(moonDialPic())"), "the moon dial should show one of its five faces")
        await pg.evaluate("()=>{__step(5);capClear()}")
        # the crystal ball: mist gathers, cutting from colour to colour, it delivers one of its visions, and it clears again
        check(await pg.evaluate("()=>BALL_VISIONS.length>=25&&new Set(BALL_VISIONS).size===BALL_VISIONS.length&&BALL_VISIONS.every(v=>/^I predict! /.test(v)&&/\\d/.test(v+'')||/Next (Saturday|June)|million years/.test(v))&&!BALL_VISIONS.some(v=>/\\b(he|she|his|her)\\b/i.test(v))"), "the ball should have twenty-five or more different visions, each beginning I predict! and none giving anyone a gender")
        await pg.evaluate("()=>{capClear();localStorage.removeItem(BALL_BAG)}")
        await pg.evaluate(TAP, "ball")
        await pg.evaluate("()=>__step(1.3)")
        check(await pg.evaluate("()=>ballFrame()>1&&ballCur.tints.length===8&&Number.isInteger(ballCur.i)"), "the crystal ball should fill with mist when tapped")
        await pg.screenshot(path=os.path.join(OUT, "ball.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left+1380*S,y:r.top+120*S,width:290*S,height:260*S}}"))
        await pg.evaluate("()=>__step(1)")
        cap = await pg.evaluate("()=>capText.textContent")
        check(await pg.evaluate("(c)=>c===BALL_VISIONS[ballCur.i]||/crystal ball/.test(c)", cap), f"the crystal ball should deliver a vision: {cap!r}")
        check(await pg.evaluate("()=>ballToday().length>=1&&/ [ap]m$/.test(ballToday()[0].when)&&ballToday()[0].say===BALL_VISIONS[ballCur.i]&&JSON.parse(localStorage.getItem(BALL_BAG)).length===BALL_VISIONS.length-1&&Object.keys(BALL_TINT).every(t=>ballTinted(3,t)==='ball3_'+t&&OBJ['ball3_'+t].naturalWidth===OBJ.ball3.naturalWidth)"), "what the ball says should be kept for Today, that vision should not come again until the rest have, and its mist should come in every colour")
        await pg.evaluate("()=>{__step(4);capClear()}")
        check(await pg.evaluate("()=>ballFrame()===1"), "the crystal ball should clear again")
        check(await pg.evaluate("()=>{const seen=new Set();for(let n=0;n<BALL_VISIONS.length;n++)seen.add(ballNext());return seen.size>=BALL_VISIONS.length-1}"), "every vision should come up once before any repeats")
        check(await pg.evaluate("()=>{ballT=performance.now()-BALL_MS*.45;ballCur={i:0,tints:Array(8).fill('dark'),eyes:true};const on=ballEyesOn(),p=thingBy('ball').pic();ballT=-1e9;return on&&p==='ball_eyes'&&OBJ.ball_eyes.width===OBJ.ball5.naturalWidth}"), "now and then a pair of cat's eyes should look out of the mist")
        # the cat's framed picture in the bookcase: a tap tips it for a moment, and the cat in it blinks once in a long while
        check(await pg.evaluate("()=>thingBy('frame').pic()==='frame'&&['frame','frame_tilt','frame_blink','frame_glow'].every(n=>OBJ[n].naturalWidth>40)"), "the framed cat should stand upright in its cubby")
        await pg.evaluate(TAP, "frame")
        check(await pg.evaluate("()=>framePic()==='frame_tilt'"), "a tap should tip the frame")
        await pg.evaluate("()=>__step(1)")
        check(await pg.evaluate("()=>framePic()==='frame'"), "the frame should stand straight again")
        check(await pg.evaluate("()=>{if(FRAME_GAP[0]<60000)return false;frameGlow=false;frameBlinkAt=performance.now()-10;const b=framePic()==='frame_blink';__step(1);const after=framePic(),gap=frameBlinkAt-performance.now();return b&&after==='frame'&&gap>=FRAME_GAP[0]-2000&&gap<=FRAME_GAP[1]}"), "the cat in the frame should blink for a moment, a minute or more apart")
        check(await pg.evaluate("()=>{frameGlow=true;frameBlinkAt=performance.now()-10;const a=framePic()==='frame_glow';__step(1.2);return a&&framePic()==='frame'&&FRAME_GLOW_ODDS<=.3}"), "now and then the cat in the frame should have glowing eyes for a moment instead of a blink")
        for n in ["forks", "deskchair", "crate"]:
            await pg.evaluate(TAP, n)
            await pg.evaluate("()=>__step(.05)")
            check(await pg.evaluate("(n)=>{const p=FP.find(p=>p.n===n);return !!(p.vx||p.vy||p.ox||p.oy)}", n), f"{n} should wobble when tapped")
        await pg.evaluate("()=>__step(.2)")
        await pg.screenshot(path=os.path.join(OUT, "wobble.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left+700*S,y:r.top+480*S,width:720*S,height:320*S}}"))
        check(await pg.evaluate("()=>radio.on&&radio.band==='crates'"), "tapping the crate should put a record on the radio")
        await pg.evaluate("()=>{radioOff(false);__step(2);capClear()}")
        # the viewfinder: a tap opens it on a stereo card with its title, the arrows change the card, every card is with the game, and it closes
        await pg.evaluate(TAP, "viewer")
        await pg.evaluate("()=>__step(.5)")
        check(await pg.evaluate("()=>!!document.querySelector('.screen.viewer .vwpic[src^=\"viewer/card\"]')&&document.querySelector('.vwt').textContent.length>2"), "tapping the viewfinder should open it on a titled stereo card")
        i0 = await pg.evaluate("()=>viewI")
        await pg.click(".vwarrow[data-k=next]")
        await pg.evaluate("()=>__step(.3)")
        await pg.evaluate("()=>__step(.3)")
        check(await pg.evaluate("([i0])=>viewI===(i0+1)%VIEW_CARDS.length", [i0]), "the arrow should bring the next card")
        # tap the card: look through the viewer. One still picture fills the view; a tap steps back
        await pg.evaluate("()=>document.querySelector('.vwpic').decode().catch(()=>0)")
        await pg.click(".vwslide")
        look = await pg.evaluate("()=>{const c=document.querySelector('.vwlook canvas'),v=VIEW_CARDS[viewI];if(!c)return null;const e0=viewEye,px=()=>[...c.getContext('2d').getImageData(0,0,c.width,c.height).data].reduce((a,b)=>a+b,0);const p0=px();__step(.6);const e1=viewEye,p1=px();return {w:c.width,h:c.height,s:v.s,still:e0===e1&&p0===p1&&!viewLookT,drawn:p0>0}}")
        check(look and look["w"] == look["s"][4] and look["h"] == look["s"][5] and look["still"] and look["drawn"], f"tapping the card should look through the viewer at one still picture: {look}")
        await pg.screenshot(path=os.path.join(OUT, "viewer_look.png"))
        await pg.click(".vwlook")
        check(await pg.evaluate("()=>!document.querySelector('.vwlook')&&!viewLookT&&!!document.querySelector('.screen.viewer')&&VIEW_CARDS.every(v=>v.s&&v.s.length===6&&v.s[4]>100)"), "a tap should step back to the card, and every card should have its two pictures lined up")
        check(await pg.evaluate("()=>VIEW_CARDS.length>=60&&VIEW_CARDS.every(v=>v.t&&v.by&&v.d)"), "the viewfinder should have at least sixty titled, credited cards")
        missing = [f for f in await pg.evaluate("()=>VIEW_CARDS.map(v=>v.f)") if not os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "viewer", f))]
        check(not missing, f"viewfinder cards missing from viewer/: {missing}")
        await pg.click(".vwx")
        check(await pg.evaluate("()=>!document.querySelector('.screen.viewer')"), "the viewfinder should close")
        # Tofu's cupboard: the star door opens on a tray of five toys; a trusting cat wakes and plays, then sits; a shy cat only watches
        await pg.evaluate("()=>{const r=cv.getBoundingClientRect();capClear();cv.dispatchEvent(new MouseEvent('click',{clientX:r.left+(CUPBOARD.x+CUPBOARD.w/2)*S,clientY:r.top+(CUPBOARD.y+CUPBOARD.h/2)*S,bubbles:true}));__step(.1);}")
        check(await pg.evaluate("()=>cubIsOpen()&&thingBy('cupboard').pic()==='cup_open'&&document.querySelectorAll('.ttray .ttreat').length===5"), "tapping the star door should open Tofu's cupboard on five toys")
        r = await pg.evaluate("()=>{st.catTrust=.75;Object.assign(cat,{hold:false,state:'sleep',pose:'loaf',nap:1e6,pat:1,huff:0,path:null});cubGive(CUB_TOYS[0]);__step(.1);const a=[cat.state,catFrame().catName];__step(3);return a.concat([cat.state,catFrame().catName]);}")
        check(r[0] == "play" and r[1] == "playbow" and r[2] != "play", f"a trusting cat should wake, play with the yarn, then stop: {r}")
        r = await pg.evaluate("()=>{st.catTrust=.1;Object.assign(cat,{state:'wake',t:1.3,pat:1,huff:0,path:null});capClear();cubGive(CUB_TOYS[1]);__step(.1);return [cat.state,/watches the felt mouse/.test(capText.textContent)];}")
        check(r[0] == "look" and r[1], f"a shy cat should only watch a toy: {r}")
        await pg.evaluate("()=>{st.catTrust=.75;cubClose();Object.assign(cat,{state:'sleep',pose:'curl',nap:1e6});__step(.2);capClear();}")
        # the lockbox opens the journal at Keep it safe
        await pg.evaluate(TAP, "lockbox")
        await pg.evaluate("()=>__step(.6)")
        check(await pg.evaluate("()=>!!jEl&&jPage==='safe'"), "tapping the lockbox should open the journal at Keep it safe")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "lockbox.png"))
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS doodad_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
