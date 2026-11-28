"""Tantrums (js/tantrum.js): a monster told "Not yet", and a cat pestered once too often.

Run from the repository root:  python tests/tantrum_test.py
A no to a monster that asks to go makes it furious: grumpy face, a tantrum of twenty seconds, and a few seconds in the
decorations are back in the cupboard and the lights and lamps are off. They stay that way when it ends, and a line says
so. A tidy monster in the room puts everything back a little later. With two adults in the room one asks to go without
the dice. A cat pestered to its limit sits with green glowing eyes, the room goes wild, and it walks out to the movie
room, where a pet brings it straight back. Exit code 1 if a check fails."""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, VIRTUAL_TIME, serve
from caption_test import SAVE
fails = []
def check(ok, msg):
    print(("ok   " if ok else "FAIL ") + msg)
    if not ok: fails.append(msg)
async def main():
    srv = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={"width": 1280, "height": 720}); await ctx.add_init_script(VIRTUAL_TIME); pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html"); await pg.evaluate(SAVE % (".3", "false")); await pg.reload(); await pg.click(".screen button")
        await pg.evaluate("()=>{__step(12);capClear();st.decor='beachball';st.lamp=true;st.lightsDark=false;}")
        r = await pg.evaluate("()=>{goAsk(1);document.querySelector('.bubble [data-k=n]').click();__step(1);const on=tantrumOn(),mad=tantrumMad(1),other=tantrumMad(2),cap=capText.textContent,gr=st.grump>0,early=st.decor;__step(3);return {on,mad,other,cap,gr,early,decor:st.decor,dark:st.lightsDark,lamp:st.lamp,out:lightsOut(30).length};}")
        check(r["on"] and r["mad"] and not r["other"] and r["gr"] and "furious" in r["cap"], f"a no makes that monster, and only that one, furious: {r}")
        check(r["early"] == "beachball" and r["decor"] is None and r["dark"] and r["lamp"] is False and r["out"] >= 10, f"a few seconds in, the decorations are in the cupboard, the lights and lamps are off, and half the bulbs are dark while it lasts: {r}")
        r = await pg.evaluate("()=>{__step(18);const over=!tantrumOn(),cap=capText.textContent,still=st.decor===null&&st.lightsDark,how=tantrumAfter&&tantrumAfter.how;__step(20);return {over,cap,still,how,decor:st.decor,dark:st.lightsDark,lamp:st.lamp,said:CAP.log.concat(CAP.cur||[]).some(l=>/has put everything back/.test(l.t))};}")
        check(r["over"] and r["still"] and "calmed down" in r["cap"] and "cupboard" in r["cap"], f"it ends by itself after twenty seconds with the mess still made, and says what needs putting back: {r}")
        check(r["how"] and r["decor"] == "beachball" and not r["dark"] and r["lamp"] and r["said"], f"the tidy monster in the room puts everything back a little later: {r}")
        r = await pg.evaluate("()=>{st.others[0].lc=-.6;st.lc=-.6;st.decor='picnic';tantrum={t0:performance.now()-19000,who:1,name:'T',next:0,messed:true,was:{decor:'picnic',dark:false,lamp:true,desk:true,wall:true},left:[]};st.decor=null;const R=Math.random;Math.random=()=>.9;__step(2);const none=tantrumAfter===null;tantrum={t0:performance.now()-19000,who:1,name:'T',next:0,messed:true,was:{decor:'picnic',dark:false,lamp:true,desk:true,wall:true},left:[]};Math.random=()=>.1;__step(2);const sorry=tantrumAfter&&tantrumAfter.how;Math.random=R;st.decor='leaves';__step(60);return {none,sorry,kept:st.decor};}")
        check(r["none"] and r["sorry"] and "feels bad" in r["sorry"] and r["kept"] == "leaves", f"with no tidy monster it is left to you, or the mad one feels bad and does it; what you already put right is not touched: {r}")
        r = await pg.evaluate("()=>{const R=Math.random;Math.random=()=>.99;eachPlant(()=>{st.stage=8;st.adultDay=0;st.goAgain=0;st.nap=0;st.grump=0;st.needs.thirst=0;st.needs.attention=0;st.lightState='ok';});st.day=9;st.goNext=0;st.goRolled=-1;st.night=false;capClear();closeBubble&&closeBubble();let asked=false;for(let i=0;i<60&&!asked;i++){__step(1);asked=!!bubble&&/May .* go\\?/.test(bubble.textContent);}Math.random=R;if(bubble)closeBubble();return asked;}")
        check(r, "with two adults in the room one asks to go even when the dice say no")
        r = await pg.evaluate("()=>{capClear();cat.hold=false;cat.pester=CAT_OUT_AT;cat.state='annoyed';cat.t=1;__step(.3);const s1=cat.state,f=catFrame().catName,on=tantrumOn();__step(TANTRUM_CAT_SIT+.6);const to=cat.to,sulk=cat.sulk,cap=CAP.log.concat(CAP.cur||[]).some(l=>/gone off to the movie room/.test(l.t));for(let i=0;i<900&&cat.state!=='away';i++)__step(.05);const away=cat.state;"
                              "document.getElementById('leaveBtn').click();document.querySelector('.rmcard[data-id=movie]').click();__step(1);mvCatTap();const found=!cat.sulk&&cat.awayT===0,note=document.querySelector('.mvnote').textContent;return {s1,f,on,to,sulk,cap,away,found,note};}")
        check(r["s1"] == "mad" and r["f"] == "glow" and r["on"], f"a cat pestered to its limit sits with green glowing eyes while the room goes wild: {r}")
        check(r["to"] == "out" and r["sulk"] and r["cap"] and r["away"] == "away", f"then it walks out to the movie room: {r}")
        check(r["found"] and "come back" in r["note"], f"a pet in the movie room brings it straight back: {r}")
        check(not errs, f"no page errors: {errs[:2]}")
        await b.close()
    srv.shutdown()
    print("PASS tantrum_test" if not fails else f"{len(fails)} failed"); sys.exit(1 if fails else 0)
if __name__ == "__main__": asyncio.run(main())
