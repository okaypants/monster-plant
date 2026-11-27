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
        page = await pg.evaluate("()=>{const e=document.querySelector('.screen.moonpg');return e?{text:e.innerText,pic:/moon\\/h\\d\\d\\.jpg$/.test(e.querySelector('.mppic').getAttribute('src'))&&/Hevelius, 1647/.test(e.querySelector('.mpcredit').textContent),subs:[...e.querySelectorAll('.mpsub')].map(h=>h.textContent)}:null}")
        check(page and page["pic"] and "Tonight’s moon in different traditions" in page["subs"] and "Today’s date" in page["subs"] and "What it does tonight" in page["subs"] and "tides" in page["text"] and "tomorrow" not in page["text"].lower() and await pg.evaluate("()=>['new moon','waxing crescent','first quarter','waxing gibbous','full moon','waning gibbous','last quarter','waning crescent'].every(k=>MOON_DOES[k]&&MOON_DOES[k].length===3)") and "elsewhere" not in page["text"].lower() and "In Western astrology the moon is in " in page["text"] and "In the Hawaiian moon calendar tonight is about " in page["text"] and "In Arabic astrology the moon is in " in page["text"] and not any(w in page["text"] for w in ("undefined", "NaN", "Invalid", "null")), f"tapping the moon dial should open the moon page with the phase, the sign and tonight elsewhere: {page}")
        # every night of two years: each tradition has a line, nothing is missing, and the festivals land on their nights
        yr = await pg.evaluate("""()=>{const bad=[],fest=new Set(),hw=new Set(),nk=new Set(),mz=new Set(),jp=new Set();const t0=Date.UTC(2026,0,1,20);
          for(let d=0;d<730;d++){const t=t0+d*864e5,E=moonTraditions(t);if(E.lines.length<4||E.lines.some(l=>/undefined|NaN|Invalid/.test(l.say)))bad.push(d);
            hw.add(hawaiiNight(t));nk.add(nakshatraAt(t));mz.add(manzilAt(t));E.fest.forEach(f=>fest.add(f));E.lines.filter(l=>l.where==='Japan').forEach(l=>jp.add(l.say));
            if(moonPhaseLines(t).some(s=>/undefined|NaN/.test(s))||moonSignLines(t).some(s=>/undefined|NaN|Invalid/.test(s)))bad.push('p'+d);}
          return {bad:bad.slice(0,5),fest:fest.size,hw:hw.size,nk:nk.size,mz:mz.size,jp:jp.size}}""")
        check(not yr["bad"] and yr["hw"] == 30 and yr["nk"] == 27 and yr["mz"] == 28 and yr["jp"] in (8, 9) and yr["fest"] >= 12, f"over two years every night should have its lines, every name should come up and the festivals should appear: {yr}")
        check(await pg.evaluate("()=>{const day=864e5,seen=new Set();for(let d=0;d<30;d++)seen.add(moonPlate(MOON_NEW0+d*day));const full=moonPlate(MOON_NEW0+14.77*day),nw=moonPlate(MOON_NEW0+.1*day),q=moonPlate(MOON_NEW0+7.4*day);return MOON_PLATE_AGE.length===28&&seen.size>=24&&nw==='moon/h01.jpg'&&(full==='moon/h14.jpg'||full==='moon/h15.jpg')&&(q==='moon/h07.jpg'||q==='moon/h08.jpg')}"), "the moon page should show Hevelius's plate for the night: the empty circle at new moon, a full one at full, a half at the quarter")
        missing = [f for f in ["h%02d.jpg" % i for i in range(1, 29)] if not os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "moon", f))]
        check(not missing, f"moon plates missing from moon/: {missing}")
        await pg.click(".screen.moonpg .mpx")
        check(await pg.evaluate("()=>!document.querySelector('.screen.moonpg')&&moonDialAt()===null"), "the moon page should close")
        check(await pg.evaluate("()=>/^moon[1-5]w?$/.test(moonDialPic())"), "the moon dial should show one of its faces")
        r = await pg.evaluate("()=>{const o=MOON_TEST,f=a=>{MOON_TEST=a;return moonDialPic();},out=[f(4),f(7.4),f(11),f(14.8),f(18),f(22.1),f(26)];MOON_TEST=o;return out;}")
        check(r == ['moon1', 'moon4w', 'moon3w', 'moon2', 'moon3', 'moon4', 'moon5'], "the dial's face is lit on the same side as the window's moon through the month: " + str(r))
        await pg.evaluate("()=>{__step(5);capClear()}")
        # the crystal ball: mist gathers, cutting from colour to colour, it delivers one of its visions, and it clears again
        check(await pg.evaluate("()=>BALL_VISIONS.length>=25&&new Set(BALL_VISIONS.map(v=>v.t)).size===BALL_VISIONS.length&&BALL_VISIONS.every(v=>v.t&&v.by&&/\\d/.test(v.t)&&/[.]$/.test(v.t)&&!/[.]$/.test(v.by)&&ballSay(v)===v.t+' \u2014 '+v.by+'.')&&!BALL_VISIONS.some(v=>/\\b(he|she|his|her)\\b/i.test(v.t+' '+v.by))"), "the ball should have twenty-five or more different visions, each a dated prediction with who foretold it after a dash, and none giving anyone a gender")
        await pg.evaluate("()=>{capClear();localStorage.removeItem(BALL_BAG)}")
        await pg.evaluate(TAP, "ball")
        await pg.evaluate("()=>__step(1.3)")
        check(await pg.evaluate("()=>ballFrame()>1&&ballCur.tints.length===8&&Number.isInteger(ballCur.i)"), "the crystal ball should fill with mist when tapped")
        await pg.screenshot(path=os.path.join(OUT, "ball.png"), clip=await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return {x:r.left+1380*S,y:r.top+120*S,width:290*S,height:260*S}}"))
        await pg.evaluate("()=>__step(1)")
        cap = await pg.evaluate("()=>capText.textContent")
        check(await pg.evaluate("(c)=>c===ballSay(BALL_VISIONS[ballCur.i])||/crystal ball/.test(c)", cap), f"the crystal ball should deliver a vision: {cap!r}")
        check(await pg.evaluate("()=>ballToday().length>=1&&/ [ap]m$/.test(ballToday()[0].when)&&ballToday()[0].say===ballSay(BALL_VISIONS[ballCur.i])&&JSON.parse(localStorage.getItem(BALL_BAG)).length===BALL_VISIONS.length-1&&Object.keys(BALL_TINT).every(t=>ballTinted(3,t)==='ball3_'+t&&OBJ['ball3_'+t].naturalWidth===OBJ.ball3.naturalWidth)"), "what the ball says should be kept for Today, that vision should not come again until the rest have, and its mist should come in every colour")
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
        check(await pg.evaluate("()=>!document.querySelector('.vwlook')&&!viewLookT&&!!document.querySelector('.screen.viewer')&&VIEW_CARDS.every(v=>v.s&&v.s.length===6&&v.s[4]>100&&v.s[2]>=v.s[0]+v.s[4])"), "a tap should step back to the card, and every card should have its two pictures lined up")
        check(await pg.evaluate("()=>VIEW_CARDS.length>=60&&VIEW_CARDS.every(v=>v.t&&v.by&&v.d)"), "the viewfinder should have at least sixty titled, credited cards")
        missing = [f for f in await pg.evaluate("()=>VIEW_CARDS.map(v=>v.f)") if not os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "viewer", f))]
        check(not missing, f"viewfinder cards missing from viewer/: {missing}")
        await pg.click(".vwx")
        check(await pg.evaluate("()=>!document.querySelector('.screen.viewer')"), "the viewfinder should close")
        # Tofu's cupboard: the star door opens on a tray of five toys; a trusting cat wakes and plays, then sits; a shy cat only watches
        await pg.evaluate("()=>{const r=cv.getBoundingClientRect();capClear();cv.dispatchEvent(new MouseEvent('click',{clientX:r.left+(CUPBOARD.x+CUPBOARD.w/2)*S,clientY:r.top+(CUPBOARD.y+CUPBOARD.h/2)*S,bubbles:true}));__step(.1);}")
        check(await pg.evaluate("()=>cubIsOpen()&&thingBy('cupboard').pic()==='cup_open'&&[...document.querySelectorAll('.ttray .cubpick')].map(b=>b.textContent).join()==='Cat toys,Decorations,String lights'"), "tapping the star door should open the cupboard and ask: cat toys, decorations or string lights")
        # decorations: the list, putting one up, what stands where, and taking it down
        await pg.click(".cubpick >> text=Decorations")
        n = await pg.evaluate("()=>document.querySelectorAll('.cubdecor .cubpick:not(.cubdown)').length")
        check(n == 30 and n == await pg.evaluate("()=>DECOR_SETS.length"), f"the cupboard should list all thirty occasions: {n}")
        check(await pg.evaluate("()=>DECOR_SETS.every(s=>['w','w_dim','s'].every(k=>DECOR_IMG[s.id+'_'+k]&&DECOR_IMG[s.id+'_'+k].naturalWidth>20)&&(s.floor==='pumpkin'||s.floor==='tree'||DECOR_IMG[s.floor].naturalWidth>40))"), "every occasion should have a picture for the window, the shelf and the floor")
        check(await pg.evaluate("()=>DECOR_SETS.every(s=>{const w=DECOR_IMG[s.id+'_w'],sh=DECOR_IMG[s.id+'_s'];return w.naturalWidth>=232&&w.naturalWidth<=240&&sh.naturalWidth<=78&&sh.naturalHeight<=80&&DECOR_IMG[s.id+'_w_dim'].naturalWidth===w.naturalWidth})"), "each piece should be sized for its space: the garland as wide as the window, the shelf piece to fit the cubby")
        await pg.click(".cubdecor .cubpick[data-id=christmas]")
        await pg.evaluate("()=>__step(.5)")
        dec = await pg.evaluate("()=>({on:st.decor,open:!!cubEl,cap:capText.textContent,b:decorBoxes().map(b=>[b.n,b.x,b.y,b.w,b.h]),floor:seasonOut(),frame:thingBy('frame').pic()})")
        check(dec["on"] == "christmas" and not dec["open"] and "decorated for Christmas" in dec["cap"] and [b[0] for b in dec["b"]] == ["christmas_s"] and dec["floor"] == "tree" and dec["frame"] is None, f"choosing Christmas should put its piece on the shelf in the framed cat's place and the tree on the floor spot, with nothing on the desk: {dec}")
        await pg.wait_for_function("()=>LIGHTS_META&&ok(TOP_MASK)&&ok(LIGHTS_IMG.multi_on)&&ok(LIGHTS_IMG.warm_off)")
        wall = await pg.evaluate("()=>{const px=(x,y,w,h)=>[...g.getImageData(x,y,w||1,h||1).data].join(),at=[[600,40,400,50],[1125,112,230,30],[90,60,60,40]];draw();const on=at.map(p=>px(...p));const d=drawStringLights;drawStringLights=()=>{};draw();const off=at.map(p=>px(...p));drawStringLights=d;draw();"
                                 "const n=st.night;st.night=true;const lit=lightsLit(),strand=lightsStrand(),B=LIGHTS_META[strand].bulbs.length,o=lightsOut(B);st.night=false;const day=lightsLit();st.night=n;lightsTap();const tOff=lightsLit();lightsTap();const on2=lightsLit();const sd=st.decor;st.decor=null;const plain=lightsStrand();st.decor=sd;"
                                 "return {top:on[0]!==off[0],wall:on[1]===off[1],plant:on[2]===off[2],lit,day,strand,plain,B,out:o.length,inRange:o.every(i=>i>=0&&i<B),tapOff:tOff,tapOn:on2}}")
        check(wall["top"] and wall["wall"] and wall["plant"], f"the string lights should run along the top of the wall, behind the plant, with no garland left on the right-hand wall: {wall}")
        r = await pg.evaluate("()=>{const px=()=>[...g.getImageData(600,40,400,50).data].join();draw();const on=px();lightsSet(false);draw();const off=px(),flag=st.noLights;lightsSet(true);draw();return {changed:on!==off,flag,back:px()===on||!st.noLights};}")
        check(r["changed"] and r["flag"] is True and r["back"], f"the string lights can be taken down and hung again: {r}")
        r = await pg.evaluate("()=>{const sd=st.decor;lightsPick('lantern');const a=lightsStrand();st.decor=null;const b=lightsStrand();lightsPick('');const c=lightsStrand();st.decor=sd;const d=lightsStrand();cubOpen();const menu=[...document.querySelectorAll('.cubpick')].map(x=>x.textContent);cubLights();const L=[...document.querySelectorAll('.cublightsmenu .cubpick')].map(x=>x.textContent);cubDecor();const inDecor=[...document.querySelectorAll('.cubdecor .cubpick')].some(x=>/string lights/i.test(x.textContent));cubClose();return {a,b,c,d,menu,n:L.length,first:L[0],inDecor};}")
        check(r["a"] == "lantern" and r["b"] == "lantern" and r["c"] == "ember" and r["d"] == "multi" and "String lights" in r["menu"] and r["n"] == 9 and r["first"] == "Take the string lights down" and not r["inDecor"], f"string lights should have their own list in the cupboard, with a strand you choose staying up and Seasonal going back to the occasion's or the season's: {r}")
        r = await pg.evaluate("()=>{cubOpen();cubDecor();const heads=[...document.querySelectorAll('.cubdecor .cubhead')].map(x=>x.textContent),names=[...document.querySelectorAll('.cubdecor .cubpick:not(.cubdown)')].map(x=>x.textContent);cubClose();return {heads,first:names.slice(0,4),n:names.length};}")
        check(r["heads"] == ["Seasons", "Holidays"] and r["first"] == ["Spring", "Summer", "Fall", "Winter"] and r["n"] == 30, f"decorations should be listed as four seasons and then the holidays: {r}")
        check(wall["lit"] and wall["day"] and wall["strand"] == "multi" and wall["plain"] == "ember" and wall["B"] > 20 and wall["out"] == 2 and wall["inRange"] and wall["tapOff"] is False and wall["tapOn"] is True, f"the lights should be lit day and night, multicolour for Christmas and the season's strand on ordinary days (orange and purple in autumn), with two bulbs dark at a time, and a tap should turn them off and on: {wall}")
        check(await pg.evaluate("()=>{lightsAt=performance.now()-10;const a=lightsDim();__step(LIGHTS_STEP/1000+.02,16);const b=lightsDim();__step(2);const c=lightsDim();return a&&!b&&!c&&lightsAt-performance.now()>=LIGHTS_GAP[0]-2500}"), "the garland's lights should blink now and then, then stay lit for a while")
        check(await pg.evaluate("()=>{const c=document.createElement('canvas');c.width=WIN_MASK.naturalWidth;c.height=WIN_MASK.naturalHeight;const x=c.getContext('2d');x.drawImage(WIN_MASK,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;const at=(px,py)=>d[((py-WIN_AT.y)*c.width+(px-WIN_AT.x))*4+3];return n>40000&&n<90000&&at(446,300)>0&&at(270,300)===0&&at(630,300)===0}"), "the garland should show only in the window's opening, never over the curtains at its sides")
        await pg.screenshot(path=os.path.join(OUT, "decor.png"))
        check(await pg.evaluate("()=>DECOR_SETS.every(s=>{st.decor=s.id;const B=decorBoxes(),sh=B.find(b=>b.k==='s'),f=seasonBox();return B.length===1&&sh.x>=54&&sh.x+sh.w<=140&&sh.y>=352&&sh.y+sh.h===438&&f&&f.k===s.floor&&f.w>50&&f.w<=180&&(s.floor==='pumpkin'||s.floor==='tree'||!seasonPoke(f.x+5,f.y+5))})"), "in every set the shelf piece should stand in the cubby and the floor piece on the floor spot, and nothing on the desk")
        check(await pg.evaluate("()=>{st.decor='autumn';const a=seasonOut()==='pumpkin'&&thingBy('frame').pic()===null;st.decor=null;return a&&seasonOut()===null&&thingBy('frame').pic()==='frame'&&decorBoxes().length===0}"), "Autumn's floor piece should be the pumpkin, and with no decorations up the floor spot should be empty and the framed cat back")
        await pg.evaluate("()=>{st.decor='christmas';capClear();const r=cv.getBoundingClientRect();cubOpen();cubDecor()}")
        check(await pg.evaluate("()=>document.querySelector('.cubdecor .cubpick.on').dataset.id==='christmas'&&!!document.querySelector('.cubdown')"), "the set that is up should be marked, with a button to take it down")
        await pg.click(".cubdown")
        check(await pg.evaluate("()=>!st.decor&&decorBoxes().length===0"), "taking them down should clear the room")
        await pg.evaluate("()=>{capClear();cubOpen()}")
        await pg.click(".cubpick >> text=Cat toys")
        check(await pg.evaluate("()=>document.querySelectorAll('.ttray .ttreat').length===5"), "Cat toys should show the five toys")
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
