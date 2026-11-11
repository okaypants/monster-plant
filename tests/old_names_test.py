"""The paper-airplane character is Sloth, PhD everywhere (Jackie, Nov 10). Before that: Doctor Bug, then Slowmallow.

Run from the repository root:  python3 tests/old_names_test.py
Checks:
  - no old name (Doctor Bug, Slowmallow, a professor) anywhere in the game's files, except the save-migration line marked
    OLD NAMES OK in js/saving.js; and no "Sloth, PhD's" (the possessive is "Sloth's");
  - an old save (bugNote / bugJournal / bugSend, a keepsake "Staying with Slowmallow") loads with the note still on the sill,
    the note still in the journal, and the keepsake reading "Staying with Sloth, PhD";
  - every place the character speaks or is named in play shows "Sloth, PhD" and never an old name: the note on the sill, the
    journal's note and its card, the letter (signature and labels), the seed choice, the captions (seedling on its way, the
    seedling arriving, a seed sent off), the Files note and a keepsake that went to stay.
Exit code 1 if a check fails.
"""
import asyncio, glob, os, re, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = re.compile(r"slowmallow|marmamallow|doctor\s*bug|dr\.?\s*bug|professor", re.I)
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:5,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catTrust:.4,name:'Zib Wigglebottom',"
        "free:{x:1250,y:918},nextId:3,goNext:99,breedDay:99,goRolled:99,letterRolled:99,others:[Object.assign(" + OTHER + ",{id:2,stage:8,species:7,name:'Mortie Gloomsnack',free:{x:300,y:918}})]});"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
# everything a player could read right now: visible text, labels, and every caption shown or waiting
READ = "()=>[document.body.innerText,...[...document.querySelectorAll('[aria-label],[alt],[title]')].map(e=>(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('alt')||'')+' '+(e.getAttribute('title')||'')),...CAP.log.map(l=>l.t),...CAP.q.map(i=>i.t),CAP.cur?CAP.cur.t:''].join('\\n')"


async def main():
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)

    # 1. the files
    for f in sorted(glob.glob(os.path.join(ROOT, "js", "*.js")) + glob.glob(os.path.join(ROOT, "css", "*.css")) + [os.path.join(ROOT, "index.html"), os.path.join(ROOT, "manifest.webmanifest")]):
        for n, line in enumerate(open(f, encoding="utf-8"), 1):
            if OLD.search(line) and "OLD NAMES OK" not in line:
                fails.append(f"old name in {os.path.relpath(f, ROOT)}:{n}: {OLD.search(line).group(0)}")
            if "Sloth, PhD's" in line or "Sloth, PhD’s" in line:
                fails.append(f"possessive should be Sloth's: {os.path.relpath(f, ROOT)}:{n}")
    check(not glob.glob(os.path.join(ROOT, "*doctorbug*")) and not glob.glob(os.path.join(ROOT, "*slowmallow*")), "an art file still uses an old name")

    # 2. an old save, and 3. everything said in play
    serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1440, "height": 812})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
        await pg.evaluate(SAVE)
        await pg.reload(wait_until="load")
        await pg.click(".screen button")
        # make it an old save: Mortie went to stay with Slowmallow; the note is on the sill and in the journal, saved under the old keys
        await pg.evaluate("""()=>{__step(2);moveOut(2,'Staying with Slowmallow');const s=JSON.parse(JSON.stringify(st));s.archive[0].snap.goDest='Staying with Slowmallow';
          s.bugNote='sill';s.bugJournal=1;delete s.slothNote;delete s.slothJournal;delete s.slothSend;s.giftSeed=0;localStorage.setItem(KEY,JSON.stringify(s));}""")
        await pg.reload(wait_until="load")
        r = await pg.evaluate("()=>({note:st.slothNote,journal:st.slothJournal,old:['bugNote','bugJournal','bugSend'].filter(k=>k in st),dest:st.archive[0].dest,snap:st.archive[0].snap.goDest})")
        check(r["note"] == "sill" and r["journal"] == 1 and not r["old"], f"old save: the note should still be waiting: {r}")
        check(r["dest"] == "Staying with Sloth, PhD" and r["snap"] == "Staying with Sloth, PhD", f"old save: the keepsake should read the new name: {r}")
        await pg.click(".screen button")
        await pg.evaluate("()=>{__step(3);capClear();CAP.log.length=0;}")
        seen = []

        async def read(what):
            t = await pg.evaluate(READ)
            seen.append(t)
            m = OLD.search(t)
            check(not m, f"{what}: an old name shows: {m.group(0) if m else ''}")
            return t

        await pg.evaluate("()=>{slothAsk();__step(.3);}")
        t = await read("the note on the sill")
        check("From Sloth, PhD" in t, "the note on the sill should be from Sloth, PhD")
        await pg.evaluate("()=>{closeBubble();openJournal('p1');__step(.3);}")
        check(await pg.evaluate("()=>(document.querySelector('.jslothnote')||{}).getAttribute?.('aria-label')") == "A note from Sloth, PhD", "the journal's note label")
        await pg.evaluate("()=>{slothCard();__step(.3);}")
        await read("the journal's note card")
        await pg.evaluate("()=>{closeJournal();st.letterNote='sill';st.letterFor=1;openLetter();__step(.3);}")
        t = await read("the letter")
        check(await pg.evaluate("()=>document.querySelector('.jlsign').textContent") == "— Sloth, PhD", "the letter should be signed — Sloth, PhD")
        await pg.evaluate("()=>{closeLetter();letterClear();openJournal('p1');__step(.3);}")
        await read("the journal with the letter")
        await pg.evaluate("()=>{closeJournal();const two=freshPlant();st.seedOffer={ids:[1,1],seed:two};offerAt=0;bubble=null;openBubble(300,300,'x'+tsChoices(CHOICES.seed),{});__step(.2);}")
        t = await read("the seed choice")
        check("Send it to Sloth, PhD" in t, "the seed choice should say Send it to Sloth, PhD")
        await pg.evaluate("()=>{closeBubble();st.sillItem=null;st.pawWait=null;paw=null;st.curtain='open';st.night=false;seedSend();for(let i=0;i<60&&(paw||st.pawWait);i++)__step(.5,50);slothYes();st.slothSend=st.day;st.slothNote=null;st.slothJournal=0;slothArrive();for(let i=0;i<60&&(paw||st.pawWait);i++)__step(.5,50);__step(.5);}")
        t = await read("the captions")
        for want in ("Off it goes to Sloth, PhD.", "Sloth, PhD will send the seedling over in the morning.", "A seed packet from Sloth, PhD is on the windowsill."):
            check(want in t, f"caption missing: {want!r}")
        await pg.evaluate("()=>{openArchive();__step(.5);document.querySelector('.jarchbook').click();__step(.5);for(let i=0;i<9&&document.querySelector('.jarrow.jnext');i++){document.querySelector('.jarrow.jnext').click();__step(.5);}}")
        t = await read("the keepsake's last page")
        check("Staying with Sloth, PhD" in t, "the keepsake should say where Mortie went: Staying with Sloth, PhD")
        await pg.evaluate("()=>{closeJournal();st.archive=[];openArchive();__step(.5);}")
        t = await read("the empty Files note")
        check("Sometimes Sloth, PhD sends a letter" in t, "the Files note should name Sloth, PhD")
        await pg.evaluate("()=>{closeJournal();__step(.2);}")
        check(any("Sloth, PhD" in t for t in seen), "Sloth, PhD never showed")
        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS old_names_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
