"""Where each age can go: kids and teens on the floor too, adults only on the floor or in the armchair, teens and adults
sitting in the armchair awake.

Run from the repository root:  python tests/placement_test.py
Drags plants with the mouse like a player: a kid from the book stack to the rug, a teen from the rug onto the milk
crate, an adult onto the book stack (too big: it lands on the floor), an adult into the armchair (sits there awake),
a teen onto the armchair while a kid naps in it (can't: the floor), a teen onto the crate while a kid sits there
(one plant per piece of furniture), and a teen on the crate growing up (an adult is too big: down to the floor).
Screenshots of a kid on the rug, a teen on the crate and an adult awake in the armchair go to
tests/screenshots/placement/. Exit code 1 if a check fails.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "placement")
G = ["started", "day", "dayT", "mode", "curtain", "giftSeed", "catTrust", "nextId", "night"]


def save_js(plants):
    """plants: list of dicts merged into fresh(); the first is the active plant, the rest go in others"""
    return ("()=>{const base=fresh(),G=" + json.dumps(G) + ",ps=" + json.dumps(plants) + ";"
            "const s=Object.assign(fresh(),{started:true,day:3,dayT:.37,mode:'actions',curtain:'open',giftSeed:1,catTrust:.1,nextId:9,"
            "needs:{thirst:0,hunger:0,attention:0},pref:'shade'},ps[0]);"
            "s.others=ps.slice(1).map(p=>{const o=Object.assign(JSON.parse(JSON.stringify(base)),{needs:{thirst:0,hunger:0,attention:0},pref:'shade'},p);for(const k of G)delete o[k];return o;});"
            "localStorage.setItem(KEY,JSON.stringify(s));}")


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1670, "height": 942})
        await ctx.add_init_script(VIRTUAL_TIME)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")

        async def load(plants):
            await pg.evaluate(save_js(plants))
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            await pg.evaluate("()=>{__step(8);capClear();Object.assign(cat,{hold:true,x:1578,y:SURFACE.bed,spot:'bed',sc:CAT_SPOTS.bed.sc,state:'sleep',pose:'curl',nap:1e6});}")

        async def css(x, y):
            return await pg.evaluate(f"()=>{{const r=cv.getBoundingClientRect();return [r.left+{x}*S,r.top+{y}*S];}}")

        async def drag(pid, to):
            """drag plant pid by a painted pixel near its middle, so the pointer ends at `to` (game coordinates)"""
            at = await pg.evaluate("""id=>{let o=null;withPlant(id,()=>{const b=plantBox();for(let dy=.75;dy>.2&&!o;dy-=.05)for(let dx=.5;dx>.1&&!o;dx-=.1)for(const s of[1,-1]){const x=b.x+b.w*(.5+s*(dx-.5)),y=b.y+b.h*dy;if(onPlantPx(x,y)){o=[x,y];break;}}});return o;}""", pid)
            check(at is not None, f"plant {pid}: no painted pixel to grab")
            if not at:
                return
            a = await css(*at)
            await pg.mouse.move(*a)
            await pg.mouse.down()
            for i in range(1, 7):
                t = await css(at[0] + (to[0] - at[0]) * i / 6, at[1] + (to[1] - at[1]) * i / 6)
                await pg.mouse.move(*t)
                await pg.evaluate("()=>__step(.03)")
            await pg.mouse.up()
            await pg.evaluate("()=>__step(.3)")

        where = lambda pid: pg.evaluate("id=>{let o;withPlant(id,()=>{o={spot:spotKey(),perch:st.perch,inChair:inChair(),nap:st.nap,stage:st.stage,free:st.free,chairId};});return o;}", pid)

        async def no_overlap(label):  # Jackie: "I never want them sharing a space or on top of each other"
            r = await pg.evaluate("""()=>{const B=[];eachPlant(()=>{if(st.stage>=0)B.push({id:st.id,k:spotKey(),b:plantBoxRaw()});});const o=[];
              for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(B[i].k!=='free'&&B[i].k===B[j].k)o.push(B[i].id+'&'+B[j].id+' share '+B[i].k);else if(boxesOverlap(B[i].b,B[j].b))o.push(B[i].id+'&'+B[j].id+' overlap');}return o;}""")
            check(not r, f"{label}: {r}")

        async def shot(name):
            await pg.evaluate("()=>{capClear();__step(.1);}")
            await pg.wait_for_timeout(600)
            await pg.locator("#c").screenshot(path=os.path.join(OUT, name))

        # 1. a kid from the book stack down to the rug
        await load([{"id": 1, "stage": 4, "species": 6, "place": {"baby": "books"}}])
        w = await where(1)
        check(w["spot"] == "books", f"kid should start on the book stack: {w}")
        await drag(1, (1000, 880))
        w = await where(1)
        check(w["spot"] == "free" and w["perch"] is None, f"a kid dragged to the rug didn't stand on the floor: {w}")
        await pg.evaluate("()=>__step(2)")
        await shot("kid_on_the_rug.png")

        # 2. a teen from the rug onto the milk crate
        await load([{"id": 1, "stage": 6, "species": 2, "free": {"x": 1000, "y": 900}}])
        check((await where(1))["spot"] == "free", "a teen should start on the floor")
        await drag(1, (338, 639))
        w = await where(1)
        check(w["spot"] == "crate", f"a teen dragged onto the crate didn't sit there: {w}")
        await shot("teen_on_the_crate.png")
        # ...and growing up there: an adult is too big for the crate
        await pg.evaluate("()=>{st.stage=8;__step(.2);}")
        w = await where(1)
        check(w["spot"] == "free" and w["perch"] is None, f"an adult stayed on the crate: {w}")

        # 3. an adult onto the book stack: too big, it lands on the floor
        await load([{"id": 1, "stage": 8, "species": 0, "free": {"x": 1250, "y": 900}}])
        await drag(1, (978, 652))
        w = await where(1)
        check(w["spot"] == "free" and w["perch"] is None, f"an adult got onto the book stack: {w}")

        # 4. an adult into the armchair: sits there awake
        await drag(1, (628, 656))
        w = await where(1)
        check(w["spot"] == "chair" and w["inChair"] and w["nap"] <= 0 and w["chairId"] == 1, f"an adult dragged into the armchair isn't sitting there awake: {w}")
        await pg.evaluate("()=>__step(2)")
        await shot("adult_awake_in_the_armchair.png")
        # the cat won't take the armchair while it sits there
        check(not await pg.evaluate("()=>catSpotFree('chair')"), "the cat could take the armchair while an adult sits in it")
        # and back out to the floor
        await drag(1, (1100, 900))
        check((await where(1))["spot"] == "free", "dragging the adult out of the armchair didn't put it on the floor")

        # 5. a kid naps in the armchair: a teen can't take it
        await load([{"id": 1, "stage": 4, "species": 6, "place": {"baby": "crate"}, "nap": 999},
                    {"id": 2, "stage": 6, "species": 2, "free": {"x": 1200, "y": 900}}])
        w1 = await where(1)
        check(w1["inChair"], f"the napping kid isn't in the armchair: {w1}")
        await drag(2, (628, 656))
        w2, w1 = await where(2), await where(1)
        check(w2["spot"] == "free" and w1["inChair"], f"the teen displaced the napping kid: teen {w2}, kid {w1}")

        # 6. one plant per piece of furniture: a kid sits on the crate, a teen can't join it
        await load([{"id": 1, "stage": 4, "species": 6, "place": {"baby": "crate"}},
                    {"id": 2, "stage": 6, "species": 2, "free": {"x": 1200, "y": 900}}])
        check((await where(1))["spot"] == "crate", "the kid should be on the crate")
        await drag(2, (338, 639))
        w2 = await where(2)
        check(w2["spot"] != "crate", f"two plants on the crate: {w2}")
        # but the book stack is free
        await drag(2, (978, 652))
        check((await where(2))["spot"] == "books", "a teen dragged onto the free book stack didn't sit there")
        await no_overlap("after the crate / book stack drops")

        # 7. never sharing a space: drop onto an occupied book stack, armchair and bit of floor
        await load([{"id": 1, "stage": 4, "species": 6, "place": {"baby": "books"}},
                    {"id": 2, "stage": 8, "species": 0, "free": {"x": 300, "y": 900}},
                    {"id": 3, "stage": 6, "species": 2, "free": {"x": 1350, "y": 900}},
                    {"id": 4, "stage": 4, "species": 9, "place": {"baby": "crate"}, "nap": 999}])
        await no_overlap("the starting room")
        check((await where(4))["inChair"], "kid 4 should be napping in the armchair")
        await drag(3, (978, 652))  # the book stack: kid 1 is there
        w = await where(3)
        check(w["spot"] != "books", f"dropped onto the occupied book stack: {w}")
        await no_overlap("teen dropped on the occupied book stack")
        await drag(3, (628, 656))  # the armchair: kid 4 naps there
        w = await where(3)
        check(w["spot"] != "chair" and not w["inChair"], f"dropped into the armchair while a kid naps there: {w}")
        await no_overlap("teen dropped on the armchair with a napper")
        await drag(3, (300, 880))  # right on top of the adult on the floor
        w = await where(3)
        check(w["spot"] == "free", f"dropped on the adult's bit of floor, it should find clear floor: {w}")
        await no_overlap("teen dropped on top of the adult")
        # the floor full (simulated): it goes back where it was picked up
        before = await where(3)
        await pg.evaluate("()=>{window.__ncf=nearestClearFloor;nearestClearFloor=()=>null;}")
        await drag(3, (1000, 900))
        after = await where(3)
        await pg.evaluate("()=>{nearestClearFloor=window.__ncf;}")
        check(after["spot"] == before["spot"] and after["free"] == before["free"], f"with nowhere clear it didn't go back: {before} -> {after}")
        await no_overlap("floor full")

        fails += [f"page error: {e}" for e in errs]
        await b.close()
    for f in fails:
        print("FAIL", f)
    print("saved to tests/screenshots/placement/")
    if fails:
        sys.exit(1)
    print("PASS: kids and teens can stand on the floor; adults only fit the floor and the armchair; teens and adults sit in the armchair awake")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
