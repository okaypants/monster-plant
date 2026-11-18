"""The moon box's I Ching (js/iching.js, data/iching.json).

Run from the repository root:  python3 tests/iching_test.py
Checks the book (64 hexagrams, each with a different six-line figure, a name, a plain meaning, the Chinese Judgment and six
line texts, and Legge's English for all seven), that the coins come up 6, 7, 8 and 9 about as often as they should, then
plays a reading on a phone held sideways: the box's menu has the I Ching, six tosses draw six lines from the bottom, the
right hexagram is named, changing lines give a second one, a hexagram's page has the original and Legge's words and the
changing lines, the same reading comes back the same day, and a new one tomorrow. Pictures go to tests/screenshots/iching/.
Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "iching")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',"
        "catTrust:.1,free:{x:1250,y:918},name:'Zib Wigglebottom'});localStorage.setItem(KEY,JSON.stringify(s));}")


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
        await pg.evaluate("()=>localStorage.removeItem('mp-iching')")
        d = await pg.evaluate("""async()=>{const H=await ichingLoad();return {n:H.length,figs:new Set(H.map(h=>h.b)).size,order:H.every((h,i)=>h.k===i+1),
          full:H.filter(h=>!(h.zh&&h.py&&h.en&&h.m&&h.jz&&h.je&&h.lz.length===6&&h.le.length===6&&h.lz.every(Boolean)&&h.le.every(t=>t&&t.length>20))).map(h=>h.k),
          one:H[0].b,two:H[1].b,three:H[2].b,last:H[63].b,odd:H.filter(h=>/[{}<>@\\[\\]]/.test(h.je+h.le.join(''))).map(h=>h.k)}}""")
        check(d["n"] == 64 and d["figs"] == 64 and d["order"], f"the book should be 64 different hexagrams in order {d}")
        check(d["full"] == [] and d["odd"] == [], f"every hexagram needs its names, meaning, Chinese and Legge's words: {d}")
        check(d["one"] == "111111" and d["two"] == "000000" and d["three"] == "100010" and d["last"] == "010101", f"the figures should match the book (1 all solid, 2 all broken, 3 thunder under water, 64 water under fire): {d}")
        st = await pg.evaluate("""()=>{const c={6:0,7:0,8:0,9:0};for(let i=0;i<8000;i++){const s=[0,1,2].map(()=>tarotRand(2)?3:2).reduce((a,b)=>a+b);c[s]++}return c}""")
        check(abs(st["6"] / 8000 - .125) < .02 and abs(st["9"] / 8000 - .125) < .02 and abs(st["7"] / 8000 - .375) < .03 and abs(st["8"] / 8000 - .375) < .03, f"three coins should give 6 and 9 one time in eight each, 7 and 8 three in eight each: {st}")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        await pg.evaluate("()=>{__step(2);capClear();}")
        x, y = await pg.evaluate("()=>{const r=cv.getBoundingClientRect();return [r.left+(MOONBOX.x+MOONBOX.w/2)*S,r.top+(MOONBOX.y+MOONBOX.h/2)*S];}")
        await pg.mouse.click(x, y)
        menu = await pg.evaluate("()=>[...document.querySelectorAll('.tmenu .tmitem')].map(b=>b.dataset.k)")
        check(menu == ["tarot", "charts", "iching"], f"the box's menu should offer tarot, charts and the I Ching: {menu}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "0_menu.png"))
        await pg.click(".tmitem[data-k=iching]")
        await pg.wait_for_selector(".itoss")
        check(await pg.locator(".icoin").count() == 3 and await pg.locator(".imain .iline.iempty").count() == 6, "the I Ching should open on three coins and six empty lines")
        say = await pg.evaluate("()=>document.querySelector('.tsay').textContent")
        check("question" not in say.lower() and "six times" in say, f"it should say how to toss, with no question asked: {say}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "1_coins.png"))
        # a real tap, then five tosses with the faces chosen: 7, then 8 9 8 6 7 -> 1 0 1 0 0 1, lines 3 and 5 changing
        await pg.click(".itoss")
        await pg.evaluate("()=>__step(.7)")
        got = await pg.evaluate("()=>ich.lines.slice()")
        check(len(got) == 1 and got[0] in (6, 7, 8, 9) and await pg.locator(".imain .iline.iempty").count() == 5, f"one toss should draw one line {got}")
        check("add up to " + str(got[0] if got else "") in await pg.evaluate("()=>document.querySelector('.tsay').textContent"), "after a toss it should say what the coins add up to")
        await pg.evaluate("()=>{ich.lines=[]}")
        for i, f in enumerate([[2, 2, 3], [3, 3, 2], [3, 3, 3], [3, 3, 2], [2, 2, 2], [2, 2, 3]]):
            await pg.evaluate("(f)=>{ichingToss(f);__step(.7)}", f)
            if i == 2:
                await pg.evaluate("()=>capClear()")
                await pg.screenshot(path=os.path.join(OUT, "2_three_lines.png"))
        r = await pg.evaluate("""()=>{const P=ichingPair(ich.lines);return {lines:ich.lines,first:P.first.b,second:P.second&&P.second.b,chg:P.chg,picks:document.querySelectorAll('.ipick').length,
          names:[...document.querySelectorAll('.iname')].map(n=>n.textContent),want:[P.first.k+'. '+P.first.py+', '+P.first.en,P.second.k+'. '+P.second.py+', '+P.second.en],
          sum:document.querySelector('.tsumtx').textContent,m:[P.first.m,P.second.m],saved:JSON.parse(localStorage.getItem('mp-iching')).lines}}""")
        check(r["lines"] == [7, 8, 9, 8, 6, 7] and r["first"] == "101001" and r["second"] == "100011" and r["chg"] == [2, 4], f"six tosses should make the hexagram and, with lines 3 and 5 changing, a second one: {r}")
        check(r["picks"] == 2 and r["names"] == r["want"], f"both hexagrams should be shown with their names: {r['names']}")
        check(r["m"][0] in r["sum"] and r["m"][1] in r["sum"] and "Lines 3 and 5 are changing" in r["sum"] and r["saved"] == r["lines"], f"the summary should give both meanings and name the changing lines: {r['sum']}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "3_reading.png"))
        await pg.click(".ipick[data-w='0']")
        page = await pg.evaluate("()=>{const P=ichingPair(ich.lines),h=P.first;return {t:document.querySelector('.iread').innerText,jz:h.jz,je:h.je,l3:h.lz[2],e5:h.le[4]}}")
        t = page["t"]
        check(all(k in t for k in ["The two halves.", "The original.", "James Legge, 1882.", "How to read it.", "The third line, changing.", "The fifth line, changing.", "The book."]) and page["jz"] in t and page["je"] in t and page["l3"] in t and page["e5"] in t and "The second line" not in t, f"the hexagram's page should have the original, Legge's words and the two changing lines: {t!r}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "4_page.png"))
        await pg.click(".iread .tback")
        await pg.click(".ipick[data-w='1']")
        t2 = await pg.evaluate("()=>document.querySelector('.iread').innerText")
        check("turns into" in t2 and "changing." not in t2, f"the second hexagram's page should say what it is, with no changing lines: {t2!r}")
        await pg.click(".iread .tback")
        # the same day: the same reading, no coins
        await pg.click(".tarot .tx")
        await pg.mouse.click(x, y)
        await pg.click(".tmitem[data-k=iching]")
        await pg.wait_for_selector(".ipick")
        check(await pg.evaluate("()=>!document.querySelector('.itoss')&&ich.lines.join()==='7,8,9,8,6,7'&&document.querySelector('.tnote').textContent.includes('today’s reading')"), "the same day, the box should show today's hexagram again")
        # no changing lines: one hexagram
        await pg.evaluate("()=>{localStorage.setItem('mp-iching',JSON.stringify({day:tarotToday(),lines:[7,7,7,7,7,7]}));tarotMenu()}")
        await pg.click(".tmitem[data-k=iching]")
        await pg.wait_for_selector(".ipick")
        check(await pg.evaluate("()=>document.querySelectorAll('.ipick').length===1&&document.querySelector('.iname').textContent==='1. Qián, Heaven'&&document.querySelector('.tsumtx').textContent.includes('No lines are changing')"), "six solid lines with none changing should be Heaven alone")
        # all six changing in the first hexagram: the extra text for that case
        await pg.evaluate("()=>{localStorage.setItem('mp-iching',JSON.stringify({day:tarotToday(),lines:[9,9,9,9,9,9]}));tarotMenu()}")
        await pg.click(".tmitem[data-k=iching]")
        await pg.wait_for_selector(".ipick")
        await pg.click(".ipick[data-w='0']")
        check(await pg.evaluate("()=>{const t=document.querySelector('.iread').innerText;return t.includes('All six lines changing.')&&t.includes(ICH[0].xz)&&document.querySelectorAll('.iname')[1].textContent==='2. Kūn, Earth'}"), "six changing solid lines should turn Heaven into Earth and show the text for that")
        await pg.click(".iread .tback")
        # the next day: the coins are back
        await pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem('mp-iching'));s.day='2000-01-01';localStorage.setItem('mp-iching',JSON.stringify(s));tarotMenu()}")
        await pg.click(".tmitem[data-k=iching]")
        await pg.wait_for_selector(".itoss")
        check(await pg.locator(".imain .iline.iempty").count() == 6, "on a new day the coins should be back")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS iching_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
