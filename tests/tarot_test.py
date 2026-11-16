"""The moon box's tarot (js/tarot.js, js/tarotdata.js, tarot/).

Run from the repository root:  python3 tests/tarot_test.py
On a phone held sideways: tapping the moon box on the right bookcase opens the deck; tapping the deck shuffles it; it
splits into three piles to cut; three cards are dealt face down as the past, the present and the future; each turns over
when tapped (reversed ones upside down); once all three are up a line reads the spread; tapping a card reads it, with
Waite's own words a tap away; New reading starts again; the close button and tapping outside close it.
Also checks the deck: 78 different cards, every picture present and the same size, every card with plain meanings and
Waite's words (only the Two of Cups has no reversed meaning in Waite), and over many shuffles every card turns up and
about a third come up reversed. Pictures go to tests/screenshots/tarot/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SHOTS, "tarot")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:6,species:4,id:1,day:3,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,"
        "catTrust:.1,free:{x:400,y:918},name:'Tuffet'});localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    from PIL import Image
    ids = ["M%02d" % i for i in range(22)] + [s + "%02d" % r for s in "WCSP" for r in range(1, 15)]
    for k in ids + ["back"]:
        p = os.path.join(ROOT, "tarot", k + ".png")
        check(os.path.exists(p) and Image.open(p).size == (72, 124), f"tarot/{k}.png should exist, 72x124")
    serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, has_touch=True)
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        d = await pg.evaluate("()=>({n:TAROT.length,ids:new Set(TAROT.map(c=>c.id)).size,plain:TAROT.every(c=>c.u&&c.r&&c.n),waite:TAROT.filter(c=>!c.wu||!c.wr).map(c=>c.id)})")
        check(d["n"] == 78 and d["ids"] == 78, f"the deck should be 78 different cards {d}")
        check(d["plain"], "every card should have plain meanings, upright and reversed")
        check(d["waite"] == ["C02"], f"only the Two of Cups should lack Waite's reversed words, got {d['waite']}")
        st = await pg.evaluate("""()=>{const seen=new Set();let rev=0,n=0;for(let i=0;i<1500;i++){tr={step:'deck'};tarotShuffle({classList:{add(){}}});for(const x of tr.deck.slice(0,3)){seen.add(x.c.id);rev+=x.rev;n++}}tr=null;return {seen:seen.size,rev:rev/n}}""")
        check(st["seen"] == 78, f"over many shuffles every card should turn up, saw {st['seen']}")
        check(.3 < st["rev"] < .4, f"about a third should come up reversed, got {st['rev']:.2f}")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        await pg.evaluate("()=>{__step(2);capClear();}")
        x, y = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+(MOONBOX.x+MOONBOX.w/2)*S,r.top+(MOONBOX.y+MOONBOX.h/2)*S];}")
        await pg.mouse.click(x, y)
        check(await pg.evaluate("()=>!!tarotEl&&!!document.querySelector('.tdeck')"), "tapping the moon box should open the deck")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "1_deck.png"))
        await pg.click(".tdeck")
        await pg.evaluate("()=>__step(1.2)")
        check(await pg.locator(".tpile").count() == 3, "after shuffling, the deck should split into three piles to cut")
        await pg.screenshot(path=os.path.join(OUT, "2_cut.png"))
        await pg.locator(".tpile").nth(1).click()
        check(await pg.locator(".tflip").count() == 3, "three cards should be dealt")
        labels = await pg.evaluate("()=>[...document.querySelectorAll('.tlab')].map(l=>l.textContent)")
        check(labels == ["The past", "The present", "The future"], f"the spread should be past, present, future: {labels}")
        three = await pg.evaluate("()=>tr.cards.map(x=>x.c.id)")
        check(len(set(three)) == 3, f"three different cards {three}")
        # make the second one reversed, to see it upside down
        await pg.evaluate("()=>{tr.cards[1].rev=true}")
        for i in range(3):
            await pg.locator(".tflip").nth(i).click()
            await pg.evaluate("()=>__step(.4)")
        faces = await pg.evaluate("()=>[...document.querySelectorAll('.tflip img')].map(i=>i.src.split('/').pop()+(i.classList.contains('trev')?' R':''))")
        check(all(not f.startswith("back") for f in faces) and faces[1].endswith(" R"), f"all three should be turned, the reversed one upside down: {faces}")
        say = await pg.evaluate("()=>document.querySelector('.tsay').textContent")
        check("Major Arcana" in say and "New reading" in say, f"the spread should be read as a whole: {say}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "3_spread.png"))
        await pg.locator(".tflip").nth(1).click()
        read = await pg.evaluate("()=>document.querySelector('.tread').innerText")
        want = await pg.evaluate("()=>[tr.cards[1].c.n,tr.cards[1].c.r]")
        check(want[0] in read and "(reversed)" in read and want[1] in read and "Right now" in read, f"reading the present card: {read!r} {want}")
        await pg.click(".twaite")
        q = await pg.evaluate("()=>{const q=document.querySelector('.tquote');return q.hidden?'':q.textContent}")
        check("Waite, 1910" in q, f"Waite's own words should show: {q!r}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "4_read.png"))
        await pg.click(".tback")
        check(await pg.evaluate("()=>!document.querySelector('.tread')"), "back to the spread")
        await pg.click(".tagain")
        check(await pg.evaluate("()=>!!document.querySelector('.tdeck')"), "New reading should bring the deck back")
        await pg.click(".tarot .tx")
        check(await pg.evaluate("()=>!tarotEl"), "the close button should close the box")
        await pg.mouse.click(x, y)
        ox, oy = await pg.evaluate("()=>{const r=tarotEl.getBoundingClientRect(),b=tarotEl.querySelector('.tbox').getBoundingClientRect();return [(r.left+b.left)/2,r.top+r.height/2]}")
        await pg.mouse.click(ox, oy)  # the dimmed room beside the box
        check(await pg.evaluate("()=>!tarotEl"), "tapping outside should close the box")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS tarot_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
