"""Birth charts and horoscopes (js/sky.js, js/charts.js, data/cities.json).

Run from the repository root:  python3 tests/charts_test.py
The sky: planet places on 1 Jan 2000 against the published ones (within half a degree), Saturn retrograde then, Jupiter
into Gemini (May 2024), Saturn into Aries (May 2025), the March 2026 equinox, a full moon, Mercury retrograde in Aug 2024,
and a rising sign at the equator. Birth times: local times turn into the right moment, daylight saving included.
The game: the moon box's Charts button lists you, the cat and each monster that has sprouted; a monster sprouting now keeps
its birth minute; one without it gets an estimate marked "about"; the cat is born 1.34 years before the game began; your birthday is entered with a city picked from the
world list; every chart has its sun, moon and planets, a line for today and lines for each pair; no he or she anywhere.
Pictures go to tests/screenshots/charts/. Exit code 1 if a check fails.
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, serve

OUT = os.path.join(SHOTS, "charts")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:12,dayT:.3,mode:'actions',curtain:'open',giftSeed:1,catTrust:.6,catName:'Tofu',free:{x:400,y:918},name:'Zib',"
        "bornAt:Date.parse('2026-11-02T21:14:00Z'),catBornAt:Date.parse('2026-11-02T21:05:00Z'),"
        "others:[Object.assign(freshPlant(),{stage:4,timer:600,name:'Pip'})]});localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    serve()
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 844, "height": 390}, device_scale_factor=2, timezone_id="America/Los_Angeles")
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        j2000 = await pg.evaluate("()=>{const c=skyChart(Date.UTC(2000,0,1,12));const o={};for(const k of SKY_BODIES)o[k]=[c[k].lon,c[k].rx];return o}")
        want = {"sun": 280.37, "moon": 223.32, "mercury": 271.89, "venus": 241.57, "mars": 327.96, "jupiter": 25.25, "saturn": 40.40}
        for k, v in want.items():
            check(abs(j2000[k][0] - v) < .5, f"{k} on 1 Jan 2000: {j2000[k][0]:.2f}, published {v}")
        check(j2000["saturn"][1] and not j2000["jupiter"][1], "Saturn was retrograde on 1 Jan 2000, Jupiter wasn't")
        dates = await pg.evaluate("""()=>{const s=(d,b)=>skySign(skyLon(b,Date.parse(d))).name;return [s('2024-05-24','jupiter'),s('2024-05-26','jupiter'),s('2025-05-23','saturn'),s('2025-05-26','saturn'),s('2026-03-20T14:00Z','sun'),s('2026-03-20T16:00Z','sun'),
          Math.round((skyLon('moon',Date.parse('2024-01-25T17:54Z'))-skyLon('sun',Date.parse('2024-01-25T17:54Z'))+360)%360),
          skyChart(Date.parse('2024-08-15')).mercury.rx,skyChart(Date.parse('2024-09-15')).mercury.rx]}""")
        check(dates[:6] == ["Taurus", "Gemini", "Pisces", "Aries", "Pisces", "Aries"], f"sign changes: {dates[:6]}")
        check(abs(dates[6] - 180) <= 1, f"a full moon is opposite the sun: {dates[6]}")
        check(dates[7] and not dates[8], "Mercury retrograde mid-August 2024, direct mid-September")
        asc = await pg.evaluate("()=>{const t=Date.UTC(2000,0,1,12),d=skyDay(t),S=skyEl('sun',d),Ls=rev(S[5]+S[2]);const lon=rev(-(Ls+180+12*15));return Math.round(skyAsc(t,0,lon))}")
        check(asc in (89, 90, 91), f"at the equator with the spring point overhead, the rising degree should be 90: {asc}")
        utc = await pg.evaluate("()=>[wallToUTC(1990,6,14,8,30,'Asia/Manila'),wallToUTC(2024,6,1,12,0,'America/New_York'),wallToUTC(2024,0,1,12,0,'America/New_York')].map(t=>new Date(t).toISOString())")
        # Manila kept daylight saving from 21 May to 28 July 1990 (the IANA time-zone rules), so 8:30 that morning was 23:30 UT the day before
        check(utc == ["1990-07-13T23:30:00.000Z", "2024-07-01T16:00:00.000Z", "2024-01-01T17:00:00.000Z"], f"local birth times to moments: {utc}")
        # the game
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button[data-k=go]")
        await asyncio.sleep(.8)
        check(await pg.evaluate("()=>{const q=freshPlant();Object.assign(st,{});let got=null;withPlant(st.id,()=>{});return true}"), "setup")
        sprout = await pg.evaluate("()=>{const q=Object.assign(freshPlant(),{stage:0});const keep=st.others;st.others=(st.others||[]).concat([q]);let t=null;withPlant(q.id,()=>{stageUp();t=st.bornAt});st.others=keep;return t&&Math.abs(t-Date.now())<5000}")
        check(sprout, "a seed sprouting should keep its birth minute")
        await pg.evaluate("()=>{capClear();openTarot();tarotStart('charts')}")
        await pg.wait_for_function("()=>!!document.querySelector('.chname')", timeout=20000)
        people = await pg.evaluate("()=>[...document.querySelectorAll('.chp')].map(b=>b.textContent)")
        check(people == ["You", "Tofu", "Zib", "Pip"], f"the charts list: you, the cat, each sprouted monster: {people}")
        check(await pg.evaluate("()=>st.home&&st.home.tz==='America/Los_Angeles'"), "where you play comes from the phone's time zone")
        texts = []
        for name in ["Tofu", "Zib", "Pip"]:
            await pg.click(f".chp >> text={name}")
            t = await pg.evaluate("()=>document.querySelector('.chcard').innerText")
            texts.append(t)
            check(all(w in t for w in ["Sun in", "Moon in", "Rising in", "Mercury in", "Venus in", "Mars in", "Jupiter in", "Saturn in", "TODAY", "TOGETHER"]), f"{name}'s chart should be whole: {t[:200]}")
        check("about" in texts[2], "Pip has no saved birth minute, so the date should say about")
        cat = await pg.evaluate("()=>{const p=chartPeople().find(p=>p.k==='cat');return [(st.catBornAt-p.t)/(365.2425*864e5),new Date(p.t).toISOString().slice(0,10)]}")
        check(abs(cat[0] - 1.34) < .001 and cat[1] == "2025-07-01", f"the cat should be born 1.34 years before the game started: {cat}")
        check(texts[0].split("\n")[1].startswith("Born July 1, 2025"), f"the cat's chart should give its birth date: {texts[0][:80]!r}")
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "monster.png"))
        await pg.click(".chp >> text=You")
        check(await pg.locator(".chdate").count() == 1, "with no birthday yet, your page should ask for it")
        # a birthday in the future is refused (an iPhone's date wheel lets you scroll past today)
        await pg.evaluate("()=>{const d=document.querySelector('.chdate');d.value='2090-01-01';d.dispatchEvent(new Event('change'))}")
        await pg.click(".chsave")
        check(await pg.evaluate("()=>!!document.querySelector('.chdate')&&document.querySelector('.chwarn').textContent.includes('hasn’t happened yet')&&!(st.you&&st.you.date)"), "a birthday in the future should not be saved, and the form should say why")
        await pg.fill(".chdate", "1990-07-14")
        await pg.fill(".chtime", "08:30")
        await pg.type(".chcity", "Mani", delay=20)
        await pg.wait_for_function("()=>document.querySelectorAll('.chpick').length>0", timeout=10000)
        first = await pg.locator(".chpick").first.text_content()
        check(first.startswith("Manila"), f"typing Mani should find Manila first: {first}")
        await pg.locator(".chpick").first.click()
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "you_form.png"))
        await pg.click(".chsave")
        you = await pg.evaluate("()=>document.querySelector('.chcard').innerText")
        check("Cancer" in you and "Rising in" in you and "Manila" in you, f"your chart, with a rising sign: {you[:200]}")
        check(await pg.evaluate("()=>st.you.place.tz==='Asia/Manila'&&JSON.parse(localStorage.getItem(KEY)).you.date==='1990-07-14'"), "your birth details should be saved")
        texts.append(you)
        await pg.evaluate("()=>capClear()")
        await pg.screenshot(path=os.path.join(OUT, "you.png"))
        bad = [m.group(0) for t in texts for m in re.finditer(r"\b(he|she|his|her|him|hers)\b", t, re.I)]
        check(not bad, f"no he or she in the charts: {bad}")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS charts_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)

asyncio.run(main())
