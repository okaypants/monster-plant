"""The moon box's tarot (js/tarot.js, js/tarotdata.js, tarot/).

Run from the repository root:  python3 tests/tarot_test.py
On a phone held sideways: tapping the moon box on the right bookcase opens the deck; tapping the deck shuffles it; it
splits into three piles to cut; three cards are dealt face down as the past, the present and the future; each turns over
when tapped (reversed ones upside down), and its name, its place in parentheses and its meaning appear under it; once all
three are up a line reads the spread; tapping a card opens the zoom with the card's details. The Celtic Cross shows a map
of the cross and one card at a time beside it. Each spread (card of the day, three cards, the Celtic Cross laid out as Waite gives it) can be
read once a calendar day: opening the box again shows today's cards face up, and the next day the deck is back. The close
button and tapping outside close it.
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
        await pg.evaluate("()=>localStorage.removeItem('mp-tarot')")
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
        menu = await pg.evaluate("()=>[...document.querySelectorAll('.tmenu .tmitem')].map(b=>b.dataset.k)")
        check(menu[:2] == ["tarot", "charts"] and not await pg.evaluate("()=>!!document.querySelector('.tdeck')"), f"the box should open on its menu: {menu}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "0_menu.png"))
        await pg.click(".tmitem[data-k=charts]")
        check(await pg.evaluate("()=>!!document.querySelector('.chwrap')"), "Charts on the menu should open the charts")
        await pg.click(".tbk")
        check(await pg.evaluate("()=>!!document.querySelector('.tmenu')&&!document.querySelector('.chwrap')"), "Moon box in the top row should go back to the menu")
        await pg.click(".tmitem[data-k=tarot]")
        check(await pg.evaluate("()=>!!tarotEl&&!!document.querySelector('.tdeck')"), "Tarot on the menu should open the deck")
        topics = await pg.evaluate("()=>[...document.querySelectorAll('.ttopic')].map(b=>b.textContent+(b.classList.contains('on')?'*':''))")
        check(topics == ["Everything*", "Work", "People", "Mind", "Home"], f"under the deck: what the reading is about, one word each, Everything picked: {topics}")
        await pg.click(".ttopic[data-t=work]")
        check(await pg.evaluate("()=>tr.topic==='work'&&document.querySelector('.ttopic.on').dataset.t==='work'&&!/question/i.test(document.querySelector('.tsay').textContent)"), "tapping Work should pick it")
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
        under = await pg.evaluate("()=>[...document.querySelectorAll('.tthree .tslot')].map((s,i)=>[s.querySelector('.tlab').textContent,tr.cards[i].c.n+(tr.cards[i].rev?', reversed':''),s.querySelector('.tmn').textContent,tarotMean(i)])")
        check([u[0] for u in under] == [under[0][1] + " (the past)", under[1][1] + " (the present)", under[2][1] + " (the future)"] and under[1][1].endswith(", reversed") and all(u[2] == u[3] for u in under), f"under each card: its name, its place in parentheses, its meaning: {under}")
        say = await pg.evaluate("()=>document.querySelector('.tsay').textContent")
        check("Major Arcana" in say and "comes tomorrow" in say, f"the spread should be read as a whole, and say a new one comes tomorrow: {say}")
        ks = await pg.evaluate("()=>tr.cards.map(x=>TAROT_K[x.c.id][x.rev?1:0])")
        summ = await pg.evaluate("()=>document.querySelector('.tsay .tsumtx').textContent")
        check(summ.startswith("For your work, this reading moves from " + ks[0] + " in the past, through " + ks[1] + " now, toward " + ks[2] + ".") and "question" not in say, f"the summary should put each card's short meaning in its place, with no mention of a question: {summ}")
        wands = await pg.evaluate("()=>tr.cards.filter(x=>x.c.id[0]==='W').length")
        check(("suit that speaks most about work" in summ) and (("None of the cards are Wands" in summ) == (wands == 0)) and await pg.evaluate("()=>JSON.parse(localStorage.getItem(TAROT_KEY)).topic.three==='work'"), f"the summary should point at the Wands for a reading about work, and the pick should be kept with today's reading: {summ}")
        check(await pg.evaluate("()=>Object.keys(TAROT_K).length===78&&TAROT.every(c=>TAROT_K[c.id]&&TAROT_K[c.id].length===2&&TAROT_K[c.id].every(w=>w&&w===w.trim()&&!/[.:;]/.test(w)))"), "every card needs a short meaning upright and reversed")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "3_spread.png"))
        await pg.locator(".tflip").nth(1).click()
        read = await pg.evaluate("()=>document.querySelector('.tread').innerText")
        want = await pg.evaluate("()=>[tr.cards[1].c.n,TAROT_MR[tr.cards[1].c.id]]")
        check(read.startswith(want[0] + ", reversed (the present)") and want[1] in read, f"the zoom starts with the card and its place: {read!r} {want}")
        check(all(k in read for k in ["In the picture.", "In the deck.", "In astrology.", "The artist."]), f"the zoom should have the card's details: {read!r}")
        parts = await pg.evaluate("()=>{const c=tr.cards[1].c;return [c.wr||c.wu,TAROT_MR[c.id],c.r,TAROT_M[c.id]]}")
        check("A. E. Waite, 1910." in read and parts[0] in read and "Waite in plain words." in read and parts[2] in read and "If it were upright." in read and parts[3] in read, f"the card's page should have Waite's own words, the same in plain words and the upright meaning: {read!r}")
        check(await pg.evaluate("()=>TAROT.every(c=>TAROT_MR[c.id]&&TAROT_M[c.id])&&tarotMean(1)===TAROT_MR[tr.cards[1].c.id]&&tarotMean(0)===(tr.cards[0].rev?TAROT_MR:TAROT_M)[tr.cards[0].c.id]"), "the meaning under a card should be the modern reading, upright or reversed")
        check(await pg.evaluate("()=>TAROT.every(c=>TAROT_M[c.id]&&c.wu)&&Object.keys(TAROT_X).every(k=>TAROT.some(c=>c.id===k))"), "every card needs Waite's words and a reading for today")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "4_read.png"))
        await pg.click(".tbk")
        check(await pg.evaluate("()=>!document.querySelector('.tread')"), "back to the spread")
        check(await pg.evaluate("()=>!!document.querySelector('.tspread')&&!document.querySelector('.tmenu')&&!document.querySelector('.tbk').hidden"), "the back button should close a card's page first, not leave the spread")
        # once a day: the same three come back face up, no deck; the button is ticked
        await pg.click(".tarot .tx")
        await pg.mouse.click(x, y)
        await pg.click(".tmitem[data-k=tarot]")
        again = await pg.evaluate("()=>({deck:!!document.querySelector('.tdeck'),cards:tr&&tr.cards.map(x=>x.c.id),up:[...document.querySelectorAll('.tflip img')].every(i=>!i.src.endsWith('back.png')),tick:document.querySelector('.tspick[data-k=three]').textContent})")
        check(not again["deck"] and again["cards"] == three and again["up"] and "✓" in again["tick"], f"the same day, the box should show today's three cards face up, no deck {again} {three}")
        # card of the day: one card
        await pg.click(".tspick[data-k=one]")
        await pg.click(".tdeck")
        await pg.evaluate("()=>__step(1.2)")
        await pg.locator(".tpile").nth(0).click()
        check(await pg.locator(".tflip").count() == 1, "card of the day should deal one card")
        await pg.locator(".tflip").nth(0).click()
        await pg.evaluate("()=>{__step(.4);capClear()}")
        one = await pg.evaluate("()=>[document.querySelector('.tone .tlab').textContent,tr.cards[0].c.n,tr.cards[0].rev,document.querySelector('.tone .tmn').textContent,tarotMean(0)]")
        check(one[0] == one[1] + (", reversed" if one[2] else "") and "(" not in one[0] and one[3] == one[4], f"the card of the day should have its name and meaning under it, with no place in parentheses: {one}")
        await pg.screenshot(path=os.path.join(OUT, "5_card_of_the_day.png"))
        # the Celtic Cross: ten cards, the second laid across the first, four in a column
        await pg.click(".tspick[data-k=cross]")
        await pg.click(".tdeck")
        await pg.evaluate("()=>__step(1.2)")
        await pg.locator(".tpile").nth(2).click()
        check(await pg.locator(".tflip").count() == 10, "the Celtic Cross should deal ten cards")
        for i in range(10):  # the Turn card button turns them in order, 1 to 10 (card 2 lies across card 1, so the button is the sure way)
            check(await pg.locator(".tfocus .tnext").text_content() == f"Turn card {i + 1}", f"the button should offer card {i + 1}")
            await pg.click(".tfocus .tnext")
            await pg.evaluate("()=>__step(.4)")
        geo = await pg.evaluate("""()=>{const r=i=>document.querySelector('.tcross .ts'+i+' .tflip').getBoundingClientRect(),c=i=>{const b=r(i);return [b.left+b.width/2,b.top+b.height/2,b.width,b.height]};return [0,1,2,3,4,5,6,7,8,9].map(c)}""")
        g = geo
        check(abs(g[0][0] - g[1][0]) < 3 and abs(g[0][1] - g[1][1]) < 3 and g[1][2] > g[1][3], f"card 2 should lie across card 1 {g[0]} {g[1]}")
        check(g[2][1] < g[0][1] < g[3][1] and g[4][0] < g[0][0] < g[5][0], "cards 3 and 4 above and below, 5 and 6 left and right")
        check(all(g[k][0] > g[5][0] for k in (6, 7, 8, 9)) and g[6][1] > g[7][1] > g[8][1] > g[9][1], "cards 7 to 10 in a column on the right, rising")
        foc = await pg.evaluate("()=>[tr.focus,document.querySelector('.tfocus .tlab').textContent,document.querySelector('.tfocus .tmn').textContent,tarotTitle(9),tarotMean(9),!!document.querySelector('.tcross .ts9.tsel')]")
        check(foc[0] == 9 and foc[1] == "10. " + foc[3] and foc[1].endswith("(what will come)") and foc[2] == foc[4] and foc[5], f"the card just turned should be shown large beside the map with its name, place and meaning: {foc}")
        await pg.locator(".tcross .ts2 .tflip").click(force=True)
        check(await pg.evaluate("()=>tr.focus===2&&document.querySelector('.tfocus .tlab').textContent.includes('(what crowns you)')&&!document.querySelector('.tread')"), "tapping a turned card on the map should show it beside the map")
        await pg.click(".tfnav .tnext:has-text('Next')")
        check(await pg.evaluate("()=>tr.focus===3"), "Next card should move to the next place")
        await pg.click(".tfbig")
        read_where = await pg.evaluate("()=>document.querySelector('.tread .tname').textContent")
        check(read_where.endswith("(what is beneath you)"), f"tapping the large card opens its zoom: {read_where}")
        await pg.evaluate("()=>{document.querySelector('.tread').remove();capClear()}")
        await pg.screenshot(path=os.path.join(OUT, "6_celtic_cross.png"))
        # the Celtic Cross summary is long: it shows cut short with a button that opens all of it
        check(await pg.locator(".tfsum .tmore").count() == 1, "a summary too long for the spread page should have a button to read all of it")
        await pg.click(".tfsum .tmore")
        full = await pg.evaluate("()=>document.querySelector('.tsumfull').innerText")
        names = await pg.evaluate("()=>tr.cards.map(x=>x.c.n)")
        check(full.startswith("Celtic Cross") and "ou are surrounded by" in full and all(n in full for n in names), f"the whole summary should list all ten cards: {full[:200]}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "6b_summary.png"))
        await pg.click(".tbk")
        # the next day, a new reading
        await pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem(TAROT_KEY));s.day='2000-01-01';localStorage.setItem(TAROT_KEY,JSON.stringify(s))}")
        await pg.click(".tarot .tx")
        await pg.mouse.click(x, y)
        await pg.click(".tmitem[data-k=tarot]")
        check(await pg.evaluate("()=>!!document.querySelector('.tdeck')&&!document.querySelector('.tspick[data-k=three]').textContent.includes('✓')"), "on a new day, the deck should be back")
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
