"""The cat's patience (Jackie, Nov 10): a real cat's short-term patience, hidden and separate from trust.

Run from the repository root:  python3 tests/cat_patience_test.py
Checks:
  - pet limits per trust level: shy none (asleep it walks off; awake it only sniffs), trusting 1, fond 3, adores 5 pets enjoyed,
    then one fed-up pet (sits, tail twitch, no heart), then it has had enough and walks off;
  - touching it while it walks, at every trust level, with full and with low patience: trusting or better and patient = it stops
    and leans in for one pet; shy = a tiny pause in stride and on it goes; low patience = it doesn't stop, walks a touch quicker,
    somewhere farther from you;
  - the walk-off: away from where you touched it, then the wind-down (sit "grooming", loaf, a curled-up nap); a touch while it winds
    down sends it farther; the "had enough" caption only once a play session;
  - patience is full again after a nap and each morning, and comes back slowly when left alone; a spooky face or a monster bouncing
    nearby lowers it;
  - trust never goes down, through all of it;
  - coming back once patient again: a cat that adores you comes to sit at the front ("<Cat> wanders back over."), a fond one naps
    by the monster you're tending;
  - the debug drawer shows patience as a word and has Annoy cat / Calm cat, on the test copy.
Pictures go to tests/screenshots/cat_patience/. Exit code 1 if a check fails.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "cat_patience")
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:8,species:3,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',catName:'Biscuit',"
        "catTrust:%s,name:'Zib Wigglebottom',free:{x:1250,y:918},nge:.4,nlc:.4,ge:.4,lc:.4,goNext:99,breedDay:99,goRolled:99,letterRolled:99,catNaps:{chair:4,sill:1}});"
        "localStorage.setItem(KEY,JSON.stringify(s));}")
# the cat asleep on its bed, patience full, nothing counted yet; nothing in the room interrupts the test
BED = ("()=>{capClear();CAP.seen.clear();const s=CAT_SPOTS.bed;Object.assign(cat,{spot:'bed',x:s.x,y:s.y,sc:s.sc,state:'sleep',pose:'curl',t:5,nap:900,path:null,huff:0,huffN:0,"
       "pat:1,pets:0,touchT:99,pauseT:0,stutter:0,fast:1,back:false,backSay:false,force:null,hold:false,shyT:0});quirkTick=()=>{};}")
TRUST = {"shy": .1, "trusting": .4, "fond": .7, "adores": .95}


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()

        async def fresh_page(trust, device=None):
            ctx = await b.new_context(**(device or {"viewport": {"width": 1440, "height": 812}}))
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE % trust)
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(3);}")
            await pg.evaluate("()=>{window.__tr=[];const f=catUpdate;catUpdate=dt=>{f(dt);__tr.push(catTrust());};}")  # trust, every frame
            return ctx, pg, errs

        async def trust_never_fell(pg, what):
            r = await pg.evaluate("()=>{let bad=0;for(let i=1;i<__tr.length;i++)if(__tr[i]<__tr[i-1]-1e-9)bad++;return bad;}")
            check(r == 0, f"{what}: trust went down {r} times")

        # 1. pet limits per trust level
        for name, tr in TRUST.items():
            ctx, pg, errs = await fresh_page(tr)
            await pg.evaluate(BED)
            r = await pg.evaluate("""()=>{const out=[];for(let i=0;i<8;i++){const h=parts.filter(q=>q.k==='heart').length;petCat(cat.x+40);
                out.push(cat.state+(parts.filter(q=>q.k==='heart').length>h?'+heart':''));if(cat.state==='annoyed'||cat.state==='walk')break;__step(2.6);
                if(cat.state!=='sleep'&&cat.state!=='sniff')break;}return {seq:out,pat:patWord(),log:CAP.log.map(l=>l.t).concat(CAP.q.map(i=>i.t))};}""")
            want = {"shy": 0, "trusting": 1, "fond": 3, "adores": 5}[name]
            seq = r["seq"]
            if name == "shy":
                check(seq[0] == "annoyed", f"shy, asleep: it should get up and walk off: {seq}")
            else:
                check(seq[:want] == ["pet+heart"] * want, f"{name}: should enjoy {want} pets: {seq}")
                check(len(seq) == want + 2 and seq[want] == "fedup" and seq[want + 1] == "annoyed", f"{name}: then one fed-up pet (no heart), then had enough: {seq}")
                check(any(t == "Biscuit has had enough pets for now." for t in r["log"]), f"{name}: the had-enough caption: {r['log']}")
            if name == "shy":  # awake: it only sniffs your hand
                await pg.evaluate(BED)
                s = await pg.evaluate("()=>{cat.state='wake';cat.t=2;petCat(cat.x);return cat.state;}")
                check(s == "sniff", f"shy, awake: it should sniff your hand ({s})")
            if name == "fond":
                await pg.evaluate(BED)
                await pg.evaluate("()=>{for(let i=0;i<3;i++){petCat(cat.x);__step(2.6);}petCat(cat.x);__step(.3);}")  # three enjoyed, the fourth fed up
                clip = await pg.evaluate("()=>{const c=cv.getBoundingClientRect(),q=catBox();return {x:c.left+(q.x-20)*S,y:c.top+(q.y-20)*S,width:(q.w+40)*S,height:(q.h+30)*S};}")
                check(await pg.evaluate("()=>cat.state==='fedup'&&!catTwitch()"), "the fourth pet should be the fed-up one")
                await pg.screenshot(path=os.path.join(OUT, "2a_fed_up_still.png"), clip=clip)
                await pg.evaluate("()=>__step(.25)")
                check(await pg.evaluate("()=>catTwitch()"), "the fed-up tail twitch should be on")
                await pg.screenshot(path=os.path.join(OUT, "2b_fed_up_tail_twitch.png"), clip=clip)
            await trust_never_fell(pg, f"pets, {name}")
            fails += [f"{name}: page error: {e}" for e in errs]
            await ctx.close()

        # 2. touch while walking: every trust level, full and low patience
        for name, tr in TRUST.items():
            for low in (False, True):
                ctx, pg, errs = await fresh_page(tr)
                await pg.evaluate(BED)
                r = await pg.evaluate("""(low)=>{CAT_SPOTS.rug.x=300;catGo('rug');__step(1);if(low){cat.pat=.2;}const x0=cat.x,to0=cat.to,h=parts.filter(q=>q.k==='heart').length;
                  petCat(cat.x);const r={pause:cat.pauseT>0,lean:!!cat.walkPet,stutter:(cat.stutter||0)>0,fast:cat.fast||1,huff:!!cat.huff,heart:parts.filter(q=>q.k==='heart').length>h};
                  __step(.6);r.moved=Math.abs(cat.x-x0);r.to=cat.to;r.dest=CAT_SPOTS[cat.to]?Math.abs(CAT_SPOTS[cat.to].x-x0):0;r.state=cat.state;return r;}""", low)
                tag = f"walking, {name}, {'low' if low else 'full'} patience"
                if low:
                    check(not r["pause"] and r["huff"] and r["fast"] > 1 and r["moved"] > 30 and r["dest"] >= 300, f"{tag}: shouldn't stop; quicker, farther from you: {r}")
                elif name == "shy":
                    check(not r["pause"] and r["stutter"] and not r["heart"] and r["moved"] > 10, f"{tag}: a tiny pause in stride, then on: {r}")
                else:
                    check(r["pause"] and r["lean"] and r["heart"] and r["moved"] < 2, f"{tag}: should stop and lean in for one pet: {r}")
                    if name == "fond":
                        await pg.evaluate("()=>{CAT_SPOTS.rug.x=300;catGo('rug');__step(1);petCat(cat.x);__step(.3);}")
                        await pg.screenshot(path=os.path.join(OUT, "1_walking_stops_for_a_pet.png"), clip=await pg.evaluate("()=>{const c=cv.getBoundingClientRect(),q=catBox();return {x:c.left+(q.x-60)*S,y:c.top+(q.y-60)*S,width:(q.w+120)*S,height:(q.h+80)*S};}"))
                        await pg.evaluate("()=>__step(2)")
                        check(await pg.evaluate("()=>cat.state==='walk'&&!(cat.pauseT>0)"), "after the pet it should carry on walking")
                await trust_never_fell(pg, tag)
                fails += [f"{tag}: page error: {e}" for e in errs]
                await ctx.close()

        # 3. the walk-off and the wind-down; a touch while winding down; the caption once; patience after a nap and in the morning
        ctx, pg, errs = await fresh_page(TRUST["adores"])
        await pg.evaluate(BED)
        r = await pg.evaluate("""()=>{cat.pat=.2;petCat(cat.x-30);const from=cat.x-30;let seen=[],t=0;while(t<60&&cat.state!=='settle'){__step(.5,50);t+=.5;if(!seen.includes(cat.state))seen.push(cat.state);}
          return {seen,dist:Math.abs(cat.x-from),spot:cat.spot,log:CAP.log.map(l=>l.t).concat(CAP.q.map(i=>i.t))};}""")
        check(r["seen"][:2] == ["annoyed", "walk"] and "settle" in r["seen"], f"had enough: up and away to wind down: {r}")
        check(r["dist"] >= 300 or r["spot"] == "rug", f"it should settle away from where you touched it: {r}")
        check(r["log"].count("Biscuit has had enough pets for now.") == 1, f"caption once: {r['log']}")
        await pg.evaluate("()=>{__step(.2);}")
        bob = await pg.evaluate("()=>{cat.t=.2;return catBob();}")
        check(bob, "winding down: the slow head bob should be on at the start")
        await pg.screenshot(path=os.path.join(OUT, "3_winding_down_grooming.png"), clip=await pg.evaluate("()=>{const c=cv.getBoundingClientRect(),q=catBox();return {x:c.left+(q.x-60)*S,y:c.top+(q.y-60)*S,width:(q.w+120)*S,height:(q.h+80)*S};}"))
        r = await pg.evaluate("()=>{const x0=cat.x,n=cat.huffN;petCat(cat.x);return {state:cat.state,more:cat.huffN>n,to:cat.to,dest:Math.abs(CAT_SPOTS[cat.to].x-x0)};}")
        check(r["state"] == "walk" and r["more"], f"touched while winding down, it should move farther: {r}")
        await pg.evaluate("()=>{let t=0;while(t<120&&cat.state!=='settle'){__step(.5,50);t+=.5;}}")
        r = await pg.evaluate("""()=>{BED_LOG=CAP.log.length;let seen=[],t=0;while(t<900&&!(cat.state==='sleep'&&cat.pose==='curl')){__step(1,100);t+=1;if(!seen.includes(cat.state))seen.push(cat.state);}
          return {seen,pose:cat.pose,state:cat.state};}""")
        check(r["seen"][-2:] == ["loafwake", "sleep"] and r["pose"] == "curl", f"wind-down: sit, then loaf, then a curled-up nap: {r}")
        await pg.evaluate("()=>{cat.pat=.2;cat.pets=4;cat.nap=.5;__step(1,50);}")
        r = await pg.evaluate("()=>({pat:cat.pat,pets:cat.pets,word:patWord()})")
        check(r["pat"] == 1 and r["pets"] == 0 and r["word"] == "full", f"after a nap patience should be full again: {r}")
        # the cat that adores you comes back to the front for a pet
        r = await pg.evaluate("""()=>{let t=0;while(t<60&&cat.state!=='present'){__step(.5,50);t+=.5;}return {state:cat.state,spot:cat.spot,log:CAP.log.slice(BED_LOG).map(l=>l.t).concat(CAP.q.map(i=>i.t))};}""")
        check(r["state"] == "present" and r["spot"] == "front" and "Biscuit wanders back over." in r["log"], f"adores: it should come back to the front: {r}")
        check(r["log"].count("Biscuit has had enough pets for now.") == 0, "the had-enough caption came back in the same session")
        await pg.screenshot(path=os.path.join(OUT, "4_came_back_for_a_pet.png"))
        # morning, left alone, spooks and bounces
        r = await pg.evaluate("()=>{cat.pat=.1;cat.pets=3;wakeRoom();return [cat.pat,cat.pets];}")
        check(r == [1, 0], f"each morning patience is full: {r}")
        r = await pg.evaluate("()=>{cat.pat=.1;cat.touchT=99;cat.state='wake';cat.t=-999;__step(30,100);const a=cat.pat;return [a];}")
        check(.1 < r[0] < 1, f"left alone, patience comes back slowly: {r}")
        r = await pg.evaluate("()=>{cat.pat=1;patHit(.4);const a=cat.pat;cat.pat=1;cat.touchT=0;st.float={h:50,vh:0,vx:0};st.free={x:cat.x,y:918};__step(2,100);const b2=cat.pat;st.float=null;return [a,b2];}")
        check(r[0] < 1 and r[1] < 1, f"a spook and a bounce nearby lower patience: {r}")
        await trust_never_fell(pg, "walk-off and wind-down")
        fails += [f"walk-off: page error: {e}" for e in errs]
        await ctx.close()

        # 4. a fond cat comes back to nap by the monster you're tending
        ctx, pg, errs = await fresh_page(TRUST["fond"])
        await pg.evaluate(BED)
        r = await pg.evaluate("""()=>{cat.back=true;cat.state='sleep';cat.nap=.2;let t=0;while(t<60&&!(cat.state==='sleep'&&cat.spot==='byplant')){__step(.5,50);t+=.5;}
          return {spot:cat.spot,log:CAP.log.map(l=>l.t).concat(CAP.q.map(i=>i.t))};}""")
        check(r["spot"] == "byplant" and "Biscuit wanders back over." in r["log"], f"fond: it should come back to nap by the monster: {r}")
        await trust_never_fell(pg, "fond comes back")
        fails += [f"fond: page error: {e}" for e in errs]
        await ctx.close()

        # 5. debug: patience as a word, Annoy cat / Calm cat, on the test copy
        ctx, pg, errs = await fresh_page(TRUST["fond"])
        await pg.click("#dbgBtn")
        await pg.evaluate("()=>{[...document.querySelectorAll('#dbg summary')].forEach(s=>{if(!s.parentElement.open)s.click();});}")
        r = await pg.evaluate("""()=>{const B=t=>[...document.querySelectorAll('#dbg button')].find(b=>b.textContent===t);if(!B('Annoy cat')||!B('Calm cat'))return 'missing buttons';
          B('Annoy cat').click();dbgSync();const a=document.querySelector('#dStatus').textContent.includes('patience low');B('Calm cat').click();dbgSync();
          const c=document.querySelector('#dStatus').textContent.includes('patience full');return {a,c,testing:TESTING};}""")
        check(r != "missing buttons" and r["a"] and r["c"] and r["testing"], f"debug patience: {r}")
        await pg.screenshot(path=os.path.join(OUT, "5_debug_drawer.png"))
        fails += [f"debug: page error: {e}" for e in errs]
        await ctx.close()
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("PASS cat_patience_test" if not fails else f"{len(fails)} failed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    asyncio.run(main())
