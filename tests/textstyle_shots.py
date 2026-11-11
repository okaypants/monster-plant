"""One text style for every word (Jackie, Nov 10): pictures of each piece and the built-in accessibility checks.

Run from the repository root:  python3 tests/textstyle_shots.py
On an iPhone 13 held sideways, day and night: the start menu, a caption pill, a monster's and the cat's speech bubbles, a choice
card (a monster asking to go), Sloth's note and letter (mint), the empty FILES drawer, a journal page, the name tags and the
FILES placard, a story page, the seed choice, the Good morning card and a quiz question. Checks:
  - every text color is at least 4.5:1 against its paper, every symbol and section icon at least 3:1;
  - no word on screen is smaller than 14px (the journal and letter are scaled to fit, so this is measured on screen);
  - each monster has its own look (tint, name color, symbol), and names show their symbol;
  - Yes and Not yet differ by icon and word, are the same size side by side, with a short line under each;
  - captions and bubbles are at most two lines; one message at a time (a caption waits while a choice card is open);
  - words pop in (stepped), and with the phone's reduce-motion setting they just appear.
Pictures go to tests/screenshots/textstyle/ (plus a contact sheet, sheet_day.png and sheet_night.png). Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "textstyle")
SAVE = ("()=>{const s=fresh();const kid=()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;};"
        "Object.assign(s,{started:true,stage:8,species:3,id:1,giftSeed:1,mode:'actions',dayT:%s,night:false,catTrust:.7,catName:'Biscuit',ge:.5,lc:-.5,nge:.5,nlc:-.5,"
        "pref:'shade',free:{x:800,y:918},nextId:5,name:'Zib Wigglebottom',adultDay:0,goNext:99,letterRolled:99,goRolled:99,breedDay:99,"
        "others:[Object.assign(kid(),{id:2,stage:8,species:7,ge:-.6,lc:.6,nge:-.5,nlc:.5,pref:'sun',free:{x:300,y:900},name:'Pip Mossmuffin',adultDay:0})]});"
        "localStorage.setItem(KEY,JSON.stringify(s));}")

# every visible element with its own words: on-screen font size and contrast against the paper it sits on
TEXT_AUDIT = r"""(sel)=>{
 const hex=c=>{const m=c.match(/\d+(\.\d+)?/g);if(!m)return null;return m.slice(0,3).map(Number).concat(m.length>3?+m[3]:1);};
 const parse=v=>{v=(v||'').trim();if(!v)return null;if(v[0]==='#'){const h=v.slice(1);return [0,2,4].map(i=>parseInt(h.substr(i,2),16)).concat(1);}return hex(v);};
 const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const paper=el=>{for(let e=el;e&&e!==document.documentElement;e=e.parentElement){const cs=getComputedStyle(e);
   if(e.classList.contains('tsb')){const v=parse(cs.getPropertyValue('--bg'));if(v)return v;}
   const b=parse(cs.backgroundColor);if(b&&b[3]>.9)return b;}return null;};
 const out=[];
 for(const root of document.querySelectorAll(sel))for(const el of [root,...root.querySelectorAll('*')]){
  if(![...el.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim()))continue;
  const r=el.getBoundingClientRect();if(!r.width||!el.offsetWidth)continue;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;
  const k=r.width/el.offsetWidth,size=parseFloat(cs.fontSize)*k,bg=paper(el),fg=parse(cs.color);
  out.push({t:[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue).join('').trim().slice(0,40),size:Math.round(size*10)/10,ratio:bg&&fg?Math.round(ratio(fg,bg)*100)/100:null,cls:el.className||el.tagName});}
 return out;}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails, shots = [], {"day": [], "night": []}
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        phone = p.devices["iPhone 13 landscape"]

        async def audit(pg, sel, what):
            await pg.wait_for_timeout(300)  # measured after the pop (it runs on real time)
            cut = await pg.evaluate("(sel)=>[...document.querySelectorAll(sel)].flatMap(r=>[r,...r.querySelectorAll('.jpage,.spage')]).filter(e=>e.scrollHeight>e.clientHeight+1&&getComputedStyle(e).overflow==='hidden').map(e=>e.className)", sel)
            check(not cut, f"{what}: words cut off at the bottom of {cut}")
            for t in await pg.evaluate(TEXT_AUDIT, sel):
                check(t["size"] >= 13.9, f"{what}: '{t['t']}' is {t['size']}px on screen ({t['cls']})")
                check(t["ratio"] is None or t["ratio"] >= 4.5, f"{what}: '{t['t']}' contrast {t['ratio']}:1 ({t['cls']})")

        for when, dayT in (("day", ".3"), ("night", ".92")):
            ctx = await b.new_context(**phone)
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE % dayT)
            await pg.reload(wait_until="load")

            async def shot(name):
                await pg.wait_for_timeout(350)  # the pops run on real time
                path = os.path.join(OUT, f"{when}_{name}.png")
                await pg.screenshot(path=path)
                shots[when].append((name, path))

            # the start menu
            await audit(pg, ".screen", "start menu")
            await shot("01_start_menu")
            await pg.click(".screen button")
            await pg.evaluate("()=>{if(%s)st.night=true;__step(12);capClear();}" % ("true" if when == "night" else "false"))

            # looks: one each, never shared; name tags show the symbol
            r = await pg.evaluate("()=>({looks:allRaw().map(q=>q.look),tags:[...document.querySelectorAll('#nameTags button')].map(t=>!!t.querySelector('img.tssym'))})")
            check(len(set(r["looks"])) == len(r["looks"]) == 2, f"two monsters should have two different looks: {r['looks']}")
            check(r["tags"] and all(r["tags"]), f"every name tag should show its symbol: {r['tags']}")
            r = await pg.evaluate("""()=>{const L=LOOKS.concat([CAT_LOOK]);const lum=h=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);};return .2126*f(parseInt(h.substr(1,2),16))+.7152*f(parseInt(h.substr(3,2),16))+.0722*f(parseInt(h.substr(5,2),16));};
              const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};const bad=[];
              for(const l of L){if(cr(l.name,l.tint)<4.5)bad.push(l.k+' name/tint');if(cr(l.name,TS.paper)<4.5)bad.push(l.k+' name/paper');if(cr(l.name,TS.mint)<4.5)bad.push(l.k+' name/mint');if(cr(l.name,l.rib)<3)bad.push(l.k+' symbol/ribbon');if(cr(TS.ink,l.tint)<4.5)bad.push(l.k+' ink/tint');}
              for(const [a,c,n,m] of [[TS.rust,TS.paper,'rust icons',3],[TS.rust,TS.paper,'rust headings',4.5],[TS.ink,TS.sage,'ink on sage',4.5],[TS.mintInk,TS.mint,'mint ink',4.5],[TS.brassInk,TS.brass,'brass',4.5],[TS.ink,TS.paper,'ink',4.5],[TS.ink,TS.toffee,'ribbon plane',3]])if(cr(a,c)<m)bad.push(n);
              return bad;}""")
            check(not r, f"palette contrast: {r}")

            # caption pill, then the monster's and the cat's speech bubbles
            for name, line, who in (("02_caption_pill", "Zib is full. Maybe later.", None), ("03_bubble_monster", "Zib waves every leaf at you.", 1),
                                    ("04_bubble_cat", "Biscuit lets you give pets now.", "cat")):
                await pg.evaluate("([t,w])=>{capClear();CAP.seen.clear();tell(t,{kind:'important',who:w});__step(.6);}", [line, who])
                r = await pg.evaluate("""()=>{const ci=cap.querySelector('.ci'),ct=cap.querySelector('.ct'),cs=getComputedStyle(ci);
                  return {show:cap.classList.contains('show'),talk:cap.classList.contains('talk'),lines:Math.round(ct.getBoundingClientRect().height/parseFloat(cs.lineHeight)),
                   names:[...cap.querySelectorAll('.tsname')].map(n=>({t:n.textContent,sym:!!n.querySelector('img.tssym'),c:n.style.color})),
                   anim:cs.animationName,tint:cs.getPropertyValue('--tint').trim(),align:cs.textAlign};}""")
                check(r["show"] and r["talk"] == (who is not None), f"{name}: wrong kind {r}")
                check(r["lines"] <= 2, f"{name}: {r['lines']} lines")
                check(r["names"] and all(n["sym"] for n in r["names"]), f"{name}: names need their symbol {r['names']}")
                check(r["anim"] == "tspop", f"{name}: should pop in (animation {r['anim']})")
                check(r["align"] in ("left", "start"), f"{name}: text should be left-aligned ({r['align']})")
                if who == 1:
                    check(r["tint"].upper() == (await pg.evaluate("()=>lookOf(st).tint")).upper(), f"the monster's bubble isn't its tint: {r['tint']}")
                if who == "cat":
                    check(r["tint"].upper() == "#ECE7E1", f"the cat's bubble isn't its tint: {r['tint']}")
                await audit(pg, "#caption", name)
                await shot(name)
            await pg.evaluate("()=>capClear()")

            # a choice card: a monster asking to go
            await pg.evaluate("()=>{goAsk(2);__step(.2);}")
            r = await pg.evaluate("""()=>{const b=[...document.querySelectorAll('.bubble .tsbtn')],R=b.map(x=>x.getBoundingClientRect());
              return {words:b.map(x=>x.textContent.trim()),icons:b.map(x=>x.querySelector('img').src),w:R.map(x=>Math.round(x.width)),h:R.map(x=>Math.round(x.height)),
               row:R.length===2&&Math.abs(R[0].top-R[1].top)<2&&R[0].right<=R[1].left,subs:[...document.querySelectorAll('.bubble .tssub')].map(s=>s.textContent),
               yes:getComputedStyle(b[0]).getPropertyValue('--bg').trim()};}""")
            check(r["words"] == ["Yes", "Not yet"], f"choice words: {r['words']}")
            check(r["icons"][0] != r["icons"][1], "Yes and Not yet need different icons")
            check(abs(r["w"][0] - r["w"][1]) <= 1 and abs(r["h"][0] - r["h"][1]) <= 1 and r["row"], f"choices should be the same size side by side: {r}")
            check(len(r["subs"]) == 2 and all(r["subs"]), f"a short line under each choice: {r['subs']}")
            check(r["yes"].upper() == "#CFE3C2", f"Yes should be sage: {r['yes']}")
            # one message at a time: a caption waits while the card is open
            await pg.evaluate("()=>{tell('A caption that should wait.',{kind:'important'});__step(1);}")
            check(not await pg.evaluate("()=>cap.classList.contains('show')"), "a caption showed while a choice card was open")
            await audit(pg, ".bubble", "choice card")
            await shot("05_choice_card")
            await pg.evaluate("()=>{closeBubble();__step(1);}")
            check(await pg.evaluate("()=>cap.classList.contains('show')&&CAP.cur.t==='A caption that should wait.'"), "the waiting caption didn't come back after the card closed")
            await pg.evaluate("()=>{capClear();st.goAgain=null;allRaw().forEach(q=>delete q.goAgain);}")

            # Sloth's note (mint, with the stamp) and letter
            await pg.evaluate("()=>{slothAsk();__step(.2);}")
            r = await pg.evaluate("()=>({mint:document.querySelector('.bubble').classList.contains('tsmint'),stamp:!!document.querySelector('.bubble .jlstamp img'),bg:getComputedStyle(document.querySelector('.bubble')).getPropertyValue('--bg').trim()})")
            check(r["mint"] and r["stamp"] and r["bg"].upper() == "#E4F4EA", f"Sloth's note should be mint with a stamp: {r}")
            await audit(pg, ".bubble", "Sloth's note")
            await shot("06_sloth_note")
            await pg.evaluate("()=>{closeBubble();st.letterNote='sill';st.letterFor=1;openLetter();__step(.2);}")
            check(await pg.evaluate("()=>getComputedStyle(document.querySelector('.jletter')).getPropertyValue('--bg').trim().toUpperCase()==='#E4F4EA'"), "the letter isn't mint")
            await audit(pg, ".jletter", "letter")
            await shot("07_sloth_letter")
            await pg.evaluate("()=>{closeLetter();letterClear();__step(.2);capClear();}")

            # the empty FILES drawer, a journal page
            await pg.evaluate("()=>{openArchive();__step(.5);}")
            await pg.wait_for_timeout(250)
            await audit(pg, ".journal", "FILES drawer")
            await shot("08_files_drawer")
            await pg.evaluate("()=>{closeJournal();openJournal('p1');__step(.3);}")
            r = await pg.evaluate("""()=>({icons:[...document.querySelectorAll('.jlab')].filter(l=>l.querySelector('img')).map(l=>l.textContent),
              unseen:[...document.querySelectorAll('.jstamp.jfaint')].map(s=>s.textContent),ribs:[...document.querySelectorAll('.jrib')].map(r=>!!r.querySelector('img.tssym'))})""")
            check({"Likes", "Quirks"} <= set(r["icons"]), f"Likes and Quirks need their rust icons: {r['icons']}")
            check(r["unseen"] and all(t == "not seen yet" for t in r["unseen"]), f"unseen quirks should say 'not seen yet': {r['unseen'][:3]}")
            check(r["ribs"] and all(r["ribs"]), "every ribbon should show its symbol")
            await audit(pg, ".journal", "journal page")
            await shot("09_journal_page")
            await pg.evaluate("()=>{closeJournal();__step(.3);}")

            # a story page, the seed choice (day) or the Good morning card (night)
            await pg.evaluate("()=>{startReading(1,BOOKS[0],null);__step(.3);}")
            await audit(pg, ".story", "story")
            await shot("12_story")
            await pg.evaluate("()=>{closeStory(true);__step(.3);}")
            if when == "day":
                await pg.evaluate("()=>{st.seedOffer={ids:[1,2],seed:freshPlant()};offerAt=0;offerTick();__step(.2);}")
                check(await pg.evaluate("()=>!!bubble&&bubble.querySelectorAll('.tsbtn').length===2"), "the seed choice card didn't open")
                check(await pg.evaluate("()=>[...bubble.querySelectorAll('.tsbtn')].every(x=>x.scrollWidth<=x.clientWidth+1)"), "a choice button's words don't fit")
                check(await pg.evaluate("()=>{const R=[...bubble.querySelectorAll('.tsbtn')].map(x=>x.getBoundingClientRect());return Math.abs(R[0].width-R[1].width)<=1&&Math.abs(R[0].height-R[1].height)<=1;}"), "the seed choices should be the same size")
                await audit(pg, ".bubble", "seed choice")
                await shot("13_seed_choice")
                await pg.evaluate("()=>{closeBubble();st.seedOffer=null;__step(.2);}")
            else:
                c = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+840*S,r.top+120*S];}")
                await pg.mouse.click(*c)
                await pg.evaluate("()=>__step(.2)")
                check(await pg.evaluate("()=>!!bubble&&bubble.textContent.includes('Wake up')"), "the Good morning card didn't open at night")
                await audit(pg, ".bubble", "Good morning card")
                await shot("13_good_morning_card")
                await pg.evaluate("()=>{closeBubble();__step(.2);}")

            # the room: name tags, the FILES placard; and a close-up of the placard
            await shot("10_room_name_tags")
            await audit(pg, "#nameTags", "name tags")
            path = os.path.join(OUT, f"{when}_11_placard_closeup.png")
            clip = await pg.evaluate("()=>{const c=cv.getBoundingClientRect();return {x:c.left+(PLACARD.x-30)*S,y:c.top+(PLACARD.y-20)*S,width:150*S,height:90*S};}")
            await pg.screenshot(path=path, clip=clip, scale="device")
            shots[when].append(("11_placard_closeup", path))
            fails += [f"{when}: page error: {e}" for e in errs]
            await ctx.close()

        # reduce motion: words just appear
        ctx = await b.new_context(**phone, reduced_motion="reduce")
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE % ".3")
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        r = await pg.evaluate("()=>{__step(12);capClear();tell('Zib waves.',{kind:'important',who:1});__step(.6);return getComputedStyle(cap.querySelector('.ci')).animationName;}")
        check(r == "none", f"with reduce motion the caption should just appear (animation {r})")
        await pg.evaluate("()=>{capClear();st=fresh();quiz();__step(.2);}")
        await audit(pg, ".screen", "quiz")
        await pg.wait_for_timeout(200)
        await pg.screenshot(path=os.path.join(OUT, "day_14_quiz_question.png"))
        shots["day"].append(("14_quiz_question", os.path.join(OUT, "day_14_quiz_question.png")))
        await ctx.close()
        await b.close()

    # contact sheets
    try:
        from PIL import Image, ImageDraw
        for when, L in shots.items():
            ims = [(n, Image.open(pth).convert("RGB")) for n, pth in L]
            tw = 560
            ims = [(n, im.resize((tw, round(im.height * tw / im.width)))) for n, im in ims]
            cols, th = 3, max(im.height for _, im in ims)
            rows = (len(ims) + cols - 1) // cols
            sheet = Image.new("RGB", (cols * (tw + 12) + 12, rows * (th + 34) + 12), "white")
            d = ImageDraw.Draw(sheet)
            for i, (n, im) in enumerate(ims):
                x, y = 12 + (i % cols) * (tw + 12), 12 + (i // cols) * (th + 34)
                d.text((x, y), f"{when}: {n[3:].replace('_', ' ')}", fill="black")
                sheet.paste(im, (x, y + 18))
            sheet.save(os.path.join(OUT, f"sheet_{when}.png"))
    except ImportError:
        pass
    for f in fails:
        print("FAIL", f)
    print("PASS textstyle_shots" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
