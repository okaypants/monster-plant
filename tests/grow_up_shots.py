"""Growing up is a moment (Jackie, Nov 10): sprout -> kid, kid -> teen, teen -> adult. No new art.

Run from the repository root:  python3 tests/grow_up_shots.py
Checks:
  - waiting while away: a kid whose time came while the game was closed is still a kid when you come back, welcome back doesn't
    say it grew, and it grows a few seconds after the room is calm; a background tab is the same;
  - waiting while you're busy: dragging, a story open, the journal open, at night, asleep; a tap grows it right away;
  - one at a time: two monsters ready together never grow in the same moment;
  - spot hops: a sprout hops from the windowsill to the milk crate and from the desk to the book stack before it opens its eyes,
    a teen on the crate hops down to the floor before it grows up, a kid on the book stack stays there, and a kid on the floor
    whose teen body would overlap its neighbor hops clear first;
  - the moment itself: crouch (whole pixels, the pot stays), a beat, back up; the new sprite in 3 whole-pixel size steps;
    one burst of sparkles and hearts, the signature move, the caption; nothing left moving afterward;
  - the cat: looks, then goes back to its nap; a fond cat walks over and sits near it;
  - the journal: the silhouette filled in, and the stamp in words with no numbers;
  - reduce motion: no steps, burst or move; the new size at once, with the caption and the stamp;
  - the debug drawer has "Grow up now".
Pictures of each stage go to tests/screenshots/grow_up/.
Exit code 1 if a check fails.
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve

OUT = os.path.join(SHOTS, "grow_up")
OTHER = "(()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})()"
# one monster, neutral nature (no quirks), cared for, in light that suits it wherever it is; the cat asleep in its bed, shy
SAVE = ("()=>{const s=fresh();Object.assign(s,{started:true,stage:4,species:6,id:1,day:3,dayT:.3,giftSeed:1,mode:'actions',curtain:'open',pref:'shade',"
        "catTrust:.1,timer:0,name:'Tuffet Mossmuffin',nge:0,nlc:0,ge:0,lc:0,nextId:3,goNext:99,breedDay:99,goRolled:99,letterRolled:99,"
        "needs:{thirst:0,hunger:0,attention:0}});%s;localStorage.setItem(KEY,JSON.stringify(s));}")
SECOND = "s.others=[Object.assign(" + OTHER + ",{id:2,species:2,stage:%d,name:'Pip Wobblebean',nge:0,nlc:0,ge:0,lc:0,pref:'shade',timer:0%s})]"
CALM = ("()=>{__step(12);capClear();CAP.log.length=0;const c=CAT_SPOTS.bed;Object.assign(cat,{spot:'bed',x:c.x,y:c.y,sc:c.sc,state:'sleep',pose:'curl',nap:9999,path:null,pat:1,huff:0});"
        "eachPlant(()=>{st.needs.thirst=0;st.needs.attention=0;});}")
READY = "()=>{eachPlant(()=>{if(GROW_FOR[st.stage]&&st.stage>=1)st.timer=GROW_FOR[st.stage];});}"
STAMP = re.compile(r"^Grew up on a (Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day (morning|afternoon|evening|night) in (spring|summer|autumn|winter)\.$")
# play the moment frame by frame: what the monster looks like at each frame
TRACE = """(id)=>{const out=[];let n=0;while(n++<400){__step(.05);if(!grow&&out.length)break;if(!grow)continue;
  withPlant(id,()=>{const b=plantBox(),r=plantBoxRaw();out.push({t:+grow.t.toFixed(2),stage:st.stage,did:grow.did,paid:grow.paid,off:growOff(),dip:growDip(),k:+growK().toFixed(4),
   x:b.x,y:b.y,w:Math.round(r.w),h:Math.round(r.h),spot:spotKey(),parts:parts.length,mv:!!st.mv});});}
  return out;}"""


async def main():
    serve()
    os.makedirs(OUT, exist_ok=True)
    fails = []
    def check(ok, msg):
        if not ok:
            fails.append(msg)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs = []

        async def page(**kw):
            ctx = await b.new_context(**({"viewport": {"width": 1670, "height": 942}} | kw))
            await ctx.add_init_script(VIRTUAL_TIME)
            pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            return pg

        pg = await page()

        async def load(extra="0", calm=True):
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load")
            await pg.evaluate(SAVE % extra)
            await pg.reload(wait_until="load")
            await pg.click(".screen button")
            if calm:
                await pg.evaluate(CALM)

        async def shot(name, clip=None):
            if clip:
                clip = await pg.evaluate("(c)=>{const r=cv.getBoundingClientRect();return {x:r.left+c.x*S,y:r.top+c.y*S,width:c.width*S,height:c.height*S};}", clip)
            await pg.screenshot(path=os.path.join(OUT, name + ".png"), clip=clip)

        ev = pg.evaluate
        state = "()=>({stage:st.stage,ready:growReady(),grow:!!grow,log:CAP.log.concat(CAP.q).concat(CAP.cur?[CAP.cur]:[]).map(l=>l.t)})"

        # ---- 1. waiting while away -------------------------------------------------------------------------------
        await load("s.timer=GROW_FOR[4]-100;s.lastSeen=Date.now()-3*3600e3", calm=False)
        r = await ev(state)
        check(r["stage"] == 4 and r["ready"], f"3 hours away: it should be a kid still, ready and waiting: {r}")
        await ev("()=>__step(1)")
        r = await ev(state)
        check(not any("grew" in t or "is a teen" in t for t in r["log"]), f"welcome back shouldn't say it grew: {r['log']}")
        await shot("0_back_after_away_still_a_kid")
        await ev("()=>__step(40)")  # the hello and what happened, then a few calm seconds, then the moment
        r = await ev(state)
        check(r["stage"] == 6 and "Tuffet is a teen now!" in r["log"], f"once you're back and the room is calm it should grow, with its caption: {r}")
        check(r["log"].index("Tuffet is a teen now!") > 0, f"it should grow after the welcome, not before: {r['log']}")
        # 5 days away: still only waiting (never two ages)
        await load("s.timer=0;s.lastSeen=Date.now()-5*86400e3", calm=False)
        r = await ev(state)
        check(r["stage"] == 4 and r["ready"], f"5 days away: a kid, ready: {r}")
        # a tab in the background for 2 hours: the same
        await load("s.stage=1;s.timer=GROW_FOR[1]-60;s.place={seed:'sill'}")
        await ev("()=>{lastWall=Date.now()-2*3600e3;__step(.1);}")
        r = await ev(state)
        check(r["stage"] == 1 and r["ready"] and not r["grow"], f"a background tab: the sprout should wait, ready: {r}")
        await ev("()=>__step(15)")
        r = await ev(state)
        check(r["stage"] == 4 and "Tuffet opens its eyes!" in r["log"], f"back in the tab and calm: it opens its eyes: {r}")

        # ---- 2. waiting while you're busy; a tap -----------------------------------------------------------------
        await load()
        await ev(READY)
        for what, on, off in [
            ("dragging", "drag.down=true;drag.id=st.id;", "drag.down=false;"),
            ("the journal open", "openJournal();", "closeJournal();"),
            ("a story open", "startReading(st.id,BOOKS[0]);", "closeStory(true);READ.clear();st.listen=0;"),
            ("carrying the carafe", "held.tool='can';", "held.tool=null;"),
            ("night", "st.night=true;", "st.night=false;"),
            ("a nap", "st.nap=1e6;", "st.nap=0;"),
        ]:
            await ev("()=>{" + on + "__step(12);}")
            r = await ev(state)
            check(r["stage"] == 4 and r["ready"] and not r["grow"], f"it should wait during {what}: {r}")
            await ev("()=>{" + off + "capClear();}")
        await ev("()=>__step(1.5)")
        r = await ev(state)
        check(r["stage"] == 4 and not r["grow"], f"it should wait a few seconds after the room goes calm, not grow at once: {r}")
        await ev("()=>__step(3)")
        check((await ev(state))["grow"], "a few seconds after the room is calm it should start growing by itself")
        # a tap: right away, even though the room only just went quiet
        await load()
        await ev(READY)
        xy = await ev("()=>{const b=plantBox(),c=cv.getBoundingClientRect();return [c.left+(b.x+b.w/2)*S,c.top+(b.y+b.h*.6)*S];}")
        await pg.mouse.click(*xy)
        r = await ev("()=>({grow:!!grow&&grow.id,pets:(st.cnt||{}).pets||0})")
        check(r["grow"] == 1 and r["pets"] == 0, f"a tap on a ready monster should start its moment (not a pet): {r}")
        # a tap on one that isn't ready is a pet, as ever
        await load()
        await pg.mouse.click(*xy)
        check(await ev("()=>!grow&&((st.cnt||{}).pets||0)===1"), "a tap on a monster that isn't ready should pet it")

        # ---- 3. the moment, stage by stage: kid -> teen on the book stack (no hop) -------------------------------
        await load("s.place={baby:'books'};s.perch='books'")
        await ev(READY)
        clip = {"x": 700, "y": 150, "width": 560, "height": 560}
        await shot("1_ready_and_waiting", clip)
        await ev("()=>{growStart(1);__step(.25);}")
        await shot("2_crouch", clip)
        await ev("()=>__step(.5)")
        await shot("3_holds_still", clip)
        await ev("()=>__step(.45)")
        await shot("4_back_up", clip)
        await ev("()=>__step(.15)")
        await shot("5_new_sprite_step_1", clip)
        await ev("()=>__step(.15)")
        await shot("6_step_2", clip)
        await ev("()=>__step(.2)")
        await shot("7_full_size_burst", clip)
        await ev("()=>__step(.5)")
        await shot("8_caption_and_move")
        await ev("()=>__step(8)")
        await shot("9_afterward_nothing_loops", clip)
        # and frame by frame
        await load("s.place={baby:'books'};s.perch='books'")
        await ev(READY)
        tr = await ev("(id)=>{growStart(id);return (%s)(id);}" % TRACE, 1)
        pre, post = [f for f in tr if not f["did"]], [f for f in tr if f["did"]]
        dips = [f["dip"] for f in pre]
        check(all(f["off"] == [0, 0] for f in tr), "a kid that can stay on the book stack shouldn't hop")
        check(max(dips) == 10 and all(float(d).is_integer() for d in dips), f"the crouch should be a few whole pixels: {sorted(set(dips))}")
        seq = [d for i, d in enumerate(dips) if i == 0 or d != dips[i - 1]]
        check(seq == [4, 8, 10, 8, 4, 0], f"crouch down, hold, rise back up: {seq}")
        check(dips.count(10) >= 12, f"it should hold still for a beat at the bottom: {dips.count(10)} frames")
        check(all(f["stage"] == 4 for f in pre) and all(f["stage"] == 6 for f in post), "the sprite should switch only after the build-up")
        ks = [k for i, k in enumerate([f["k"] for f in post]) if i == 0 or k != post[i - 1]["k"]]
        check(len(ks) == 3 and ks[-1] == 1 and ks[0] < ks[1] < 1, f"the new size should come in 3 steps: {ks}")
        hs = sorted(set(f["h"] for f in post))
        check(len(hs) == 3 and hs[0] > pre[0]["h"], f"3 sizes, each bigger than the kid ({pre[0]['h']}): {hs}")
        paid = [f for f in post if f["paid"]]
        check(paid and paid[0]["parts"] >= 7 and paid[0]["mv"], f"the payoff: one burst of sparkles and hearts and its signature move: {paid[:1]}")
        check(max(f["parts"] for f in post) <= 7, "only one burst")
        await ev("()=>__step(6)")
        r = await ev("()=>({parts:parts.length,mv:!!st.mv,grow:!!grow,listen:st.listen,spot:spotKey(),log:CAP.log.map(l=>l.t),grew:st.grew})")
        check(r["parts"] == 0 and not r["mv"] and not r["grow"] and r["listen"] == 0, f"nothing should loop afterward: {r}")
        check(r["spot"] == "books" and r["log"] == ["Tuffet is a teen now!"], f"still on the book stack, with the one caption: {r}")
        check(bool(STAMP.match(r["grew"].get("6", ""))) and not re.search(r"\d", r["grew"]["6"]), f"the journal stamp, in words: {r['grew']}")
        # nearest-neighbor only: mid-change, every pixel of the monster is a color its finished self has (nothing blended)
        await load("s.place={baby:'books'};s.perch='books'")
        await ev(READY)
        nn = await ev("""()=>{cat.x=-9999;growStart(1);while(!grow.did)__step(.05);const own=new Set();
          for(const im of [plantBoxRaw().img,EYE_O[st.eye%16],EYE_C[st.eye%16]].concat(MOUTH)){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);
           const d=x.getImageData(0,0,c.width,c.height).data;for(let i=0;i<d.length;i+=4)if(d[i+3]===255)own.add(d[i]<<16|d[i+1]<<8|d[i+2]);}
          draw();const b=plantBoxRaw(),x=Math.floor(b.x)-4,y=Math.floor(b.y)-4,w=Math.ceil(b.w)+8,h=Math.ceil(b.h)+8,A=g.getImageData(x,y,w,h).data;
          st.stage=-1;draw();const B=g.getImageData(x,y,w,h).data;st.stage=6;let n=0,mine=0;
          for(let i=0;i<A.length;i+=4)if(A[i]!==B[i]||A[i+1]!==B[i+1]||A[i+2]!==B[i+2]){n++;if(own.has(A[i]<<16|A[i+1]<<8|A[i+2]))mine++;}return {k:growK(),n,mine};}""")
        check(nn["k"] < 1 and nn["n"] > 2000 and nn["mine"] >= nn["n"] * .9, f"mid-change, the monster's pixels should be its own art's colors (nearest-neighbor, nothing blended): {nn}")

        # ---- 4. spot hops ----------------------------------------------------------------------------------------
        # a teen on the milk crate: an adult is too big for it, so it hops down to the floor first, then grows
        await load("s.stage=6;s.perch='crate'")
        await ev(READY)
        clip = {"x": 60, "y": 250, "width": 620, "height": 692}
        await shot("hop_1_teen_on_the_crate", clip)
        await ev("()=>{growStart(1);__step(.25);}")
        check(await ev("()=>st.stage===6&&growOff()[1]!==0"), "the teen should be mid-hop, still a teen")
        await shot("hop_2_mid_hop", clip)
        await ev("()=>__step(.45)")
        await shot("hop_3_landed_on_the_floor", clip)
        await ev("()=>__step(.55)")
        await shot("hop_4_crouch_on_the_floor", clip)
        await ev("()=>__step(1.4)")
        await shot("hop_5_adult", clip)
        await load("s.stage=6;s.perch='crate'")
        await ev(READY)
        tr = await ev("(id)=>{growStart(id);return (%s)(id);}" % TRACE, 1)
        pre, post = [f for f in tr if not f["did"]], [f for f in tr if f["did"]]
        offs = [f["off"] for f in pre]
        check(all(float(v).is_integer() for o in offs for v in o), "the hop should move in whole pixels")
        check(any(o[1] < 0 for o in offs[:4]) and offs[-1] == offs[len(offs) // 2] and offs[-1][1] > 200, f"it hops up and over, down to the floor: {offs[:12]}")
        hop_done = next(i for i, o in enumerate(offs) if o == offs[-1])
        check(all(f["dip"] == 0 for f in pre[:hop_done]) and any(f["dip"] > 0 for f in pre[hop_done:]), "it should hop first, then crouch")
        r = await ev("()=>({spot:spotKey(),perch:st.perch,free:st.free,stage:st.stage})")
        check(r["stage"] == 8 and r["spot"] == "free" and r["perch"] is None and abs(r["free"]["x"] - 338) <= 40 and r["free"]["y"] == 918, f"the adult should stand on the floor nearest the crate: {r}")
        land = pre[-1]
        check(abs((land["x"] + land["w"] / 2) - (post[-1]["x"] + post[-1]["w"] / 2)) <= 2, "it should grow where it landed, not jump again")
        # a sprout on the windowsill: a kid can't stay there; the milk crate is nearest
        await load("s.stage=1;s.place={seed:'sill'}")
        await ev(READY)
        clip = {"x": 180, "y": 330, "width": 420, "height": 340}
        await shot("sprout_1_ready_on_the_sill", clip)
        await ev("()=>{growStart(1);__step(.25);}")
        await shot("sprout_2_mid_hop", clip)
        await ev("()=>__step(.75)")
        await shot("sprout_3_crouch_on_the_crate", clip)
        await ev("()=>__step(1.1)")
        await shot("sprout_4_new_sprite_step_1", clip)
        await ev("()=>__step(.5)")
        await shot("sprout_5_eyes_open", clip)
        await ev("()=>__step(3)")
        r = await ev("()=>({spot:spotKey(),stage:st.stage,log:CAP.log.map(l=>l.t)})")
        check(r["stage"] == 4 and r["spot"] == "crate" and r["log"] == ["Tuffet opens its eyes!"], f"sill sprout -> kid on the milk crate, 'opens its eyes': {r}")
        # ...and from the desk, the book stack is nearest
        await load("s.stage=1;s.place={seed:'desk'}")
        await ev(READY)
        await ev("()=>{growStart(1);__step(6);}")
        r = await ev("()=>({spot:spotKey(),stage:st.stage})")
        check(r["stage"] == 4 and r["spot"] == "books", f"desk sprout -> kid on the book stack: {r}")
        # the crate taken by another kid: the sill sprout goes to the book stack instead
        await load("s.stage=1;s.place={seed:'sill'};" + SECOND % (4, ",perch:'crate'"))
        await ev("()=>{st.timer=GROW_FOR[1];growStart(1);__step(6);}")
        r = await ev("()=>({spot:spotKey(),stage:st.stage})")
        check(r["stage"] == 4 and r["spot"] == "books", f"crate taken: the new kid should take the book stack: {r}")
        # a kid on the floor right beside an adult: as a teen it would overlap, so it hops clear first
        await load("s.perch=null;s.free={x:700,y:918};" + SECOND % (8, ",free:{x:520,y:918}"))
        r0 = await ev("""()=>{st.timer=GROW_FOR[4];let at=null;for(let x=560;x<1300&&at==null;x+=10){const kid=freeClear(x,918);st.stage=6;const teen=freeClear(x,918);st.stage=4;if(kid&&!teen)at=x;}
          st.free={x:at,y:918};__step(.1);const o=allRaw().find(q=>q.id===2)._pos.box;return {at,clearNow:!boxesOverlap(plantBoxRaw(),o),spot:growSpot(6)};}""")
        check(r0["at"] and r0["clearNow"] and r0["spot"] is not None and r0["spot"]["perch"] is None, f"setup: the kid fits beside the adult, the teen wouldn't: {r0}")
        await ev("()=>{growStart(1);__step(6);}")
        r = await ev("()=>{const o=allRaw().find(q=>q.id===2)._pos.box,me=plantBoxRaw();return {stage:st.stage,spot:spotKey(),clear:!boxesOverlap(me,o)};}")
        check(r["stage"] == 6 and r["clear"] and r["spot"] == "free", f"the new teen should stand on the floor, clear of its neighbor: {r}")
        check(await ev("(x)=>st.free.x>x&&st.free.x-x<200&&st.free.y===918", r0["at"]), "it should hop only as far as it needs to")
        await shot("hop_6_teen_clear_of_its_neighbor")

        # ---- 5. one at a time ------------------------------------------------------------------------------------
        await load("s.stage=6;s.free={x:420,y:918};" + SECOND % (4, ",perch:'books'"))
        await ev(READY)
        r = await ev("""()=>{const seen=[],who=[];let t=0;const stages=()=>allRaw().map(q=>q.id+':'+q.stage).sort().join(' ');let last=stages(),lw=null;
          while(t<40){__step(.05);t+=.05;const s=stages();if(s!==last){seen.push({t:+t.toFixed(2),s,grow:grow&&grow.id});last=s;}
           const w=grow?grow.id:null;if(w!==lw){who.push({t:+t.toFixed(2),id:w});lw=w;}}
          return {seen,who,log:CAP.log.map(l=>l.t)};}""")
        check([w["id"] for w in r["who"]] == [1, None, 2, None], f"two ready monsters should grow one after the other, the first one first: {r['who']}")
        check(len(r["seen"]) == 2 and [s["grow"] for s in r["seen"]] == [1, 2], f"each changes in its own moment: {r['seen']}")
        if len(r["who"]) == 4:
            check(r["who"][2]["t"] - r["who"][1]["t"] >= 3, f"the second should wait its own few calm seconds: {r['who']}")
        check(r["log"][:2] == ["Tuffet is an adult now!", "Pip is a teen now!"], f"a caption each, in turn: {r['log']}")
        # while one is growing, a tap on the other is only a pet
        await load("s.stage=6;s.free={x:420,y:918};" + SECOND % (4, ",perch:'books'"))
        await ev(READY)
        xy = await ev("()=>{growStart(1);__step(.3);let p;withPlant(2,()=>{const b=plantBox(),c=cv.getBoundingClientRect();p=[c.left+(b.x+b.w/2)*S,c.top+(b.y+b.h*.6)*S];});return p;}")
        await pg.mouse.click(*xy)
        check(await ev("()=>grow&&grow.id===1&&allRaw().find(q=>q.id===2).stage===4"), "a tap on the other monster mid-moment shouldn't start a second moment")

        # ---- 6. the cat ------------------------------------------------------------------------------------------
        await load("s.stage=6;s.free={x:1000,y:918}")  # shy cat, asleep in its bed (right of the monster)
        await ev(READY)
        await ev("()=>{growStart(1);while(grow&&!grow.paid)__step(.05);__step(.5);}")
        r = await ev("()=>({state:cat.state,spot:cat.spot,face:cat.faceX,x:cat.x})")
        check(r["state"] == "look" and r["spot"] == "bed" and r["face"] < r["x"], f"the cat should sit up and turn toward the monster: {r}")
        await shot("cat_1_turns_toward_it")
        await ev("()=>__step(4)")
        check(await ev("()=>cat.state==='sleep'&&cat.spot==='bed'"), "a cat that isn't fond yet should go back to its nap where it was")
        await load("s.stage=6;s.free={x:1000,y:918};s.catTrust=.7")  # fond
        await ev(READY)
        await ev("()=>{growStart(1);while(grow&&!grow.paid)__step(.05);__step(.5);}")
        check(await ev("()=>cat.state==='walk'&&cat.to==='front'"), "a fond cat should get up and walk over")
        await ev("()=>__step(8)")
        r = await ev("()=>{const b=plantBoxRaw(),c=catBox();return {state:cat.state,gap:Math.round(Math.min(Math.abs(c.x-(b.x+b.w)),Math.abs(b.x-(c.x+c.w)))),over:c.x<b.x+b.w*.85&&c.x+c.w>b.x+b.w*.15,y:cat.y};}")
        check(r["state"] == "present" and r["gap"] < 120 and not r["over"], f"the fond cat should be sitting near the monster, not on it: {r}")
        await shot("cat_2_fond_cat_sits_near")
        await ev("()=>{capClear();CAP.log.length=0;__step(60);}")
        r = await ev("()=>({state:cat.state,spot:cat.spot})")
        check(r["state"] == "sleep" and r["spot"] == "front", f"the cat should doze there afterward: {r}")
        await load("s.stage=6;s.free={x:1000,y:918};s.catTrust=.95")  # adores, but has had enough of being touched
        await ev(READY)
        await ev("()=>{cat.pat=.1;growStart(1);while(grow&&!grow.paid)__step(.05);__step(.5);}")
        check(await ev("()=>cat.state==='sleep'&&cat.spot==='bed'"), "a cat that has had enough should be left alone")

        # ---- 7. the journal --------------------------------------------------------------------------------------
        await pg.close()
        pg = await page(**p.devices["iPhone 13 landscape"])
        ev = pg.evaluate
        await load("s.place={baby:'books'};s.perch='books'")
        r0 = await ev("()=>{openJournal('p1');const n=[...document.querySelectorAll('.jgrowth canvas')].length,s=!!document.querySelector('.jgrew');closeJournal();return {n,s,step:ageStep()};}")
        check(r0["n"] == 5 and not r0["s"] and r0["step"] == 2, f"before: five silhouettes, no stamp yet: {r0}")
        await ev(READY)
        await ev("()=>{growStart(1);__step(6);openJournal('p1');__step(1);}")
        r = await ev("""()=>{const g=document.querySelector('.jgrew'),pg=document.querySelector('.jpage.jl'),fill=[...document.querySelectorAll('.jgrowth canvas')].map(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
           for(let i=0;i<d.length;i+=4)if(d[i+3]>200)return d[i]<120;return null;});const b=g&&g.getBoundingClientRect(),P=pg.getBoundingClientRect();
          return {txt:g&&g.textContent,fill,fits:!!b&&b.left>=P.left&&b.right<=P.right&&b.bottom<=P.bottom&&pg.scrollHeight<=pg.clientHeight+1,px:g&&parseFloat(getComputedStyle(g).fontSize)*1};}""")
        check(r["fill"] == [True, True, True, True, False], f"the teen silhouette should be filled in fully (dark), the adult not yet: {r['fill']}")
        check(bool(r["txt"]) and bool(STAMP.match(r["txt"])) and not re.search(r"\d", r["txt"]), f"the stamp, in words, no numbers: {r['txt']}")
        check(r["fits"], f"the stamp should fit on the page: {r}")
        r2 = await ev("()=>{const P=document.querySelector('.jportrait canvas').getBoundingClientRect(),N=(document.querySelector('.jspecies')||document.querySelector('.jname')).getBoundingClientRect(),G=document.querySelector('.jgrowth').getBoundingClientRect();return {top:P.top-N.bottom,bottom:G.top-P.bottom};}")
        check(r2["top"] >= -1 and r2["bottom"] >= -1, f"the portrait should sit between the name and the growth row, covering neither: {r2}")
        await pg.screenshot(path=os.path.join(OUT, "journal_stamp.png"))
        check(await ev("()=>{closeJournal();save();const s=JSON.parse(localStorage.getItem(KEY));return !!(s.grew&&s.grew[6]);}"), "the stamp should be saved")

        # ---- 8. reduce motion ------------------------------------------------------------------------------------
        await pg.close()
        pg = await page(reduced_motion="reduce")
        ev = pg.evaluate
        await load("s.stage=6;s.perch='crate'")
        await ev(READY)
        r = await ev("()=>{parts.length=0;const n=parts.length;growStart(1);return {stage:st.stage,grow:!!grow,parts:parts.length-n,mv:!!st.mv,k:growK(),off:growOff(),dip:growDip(),spot:spotKey(),grew:st.grew,q:CAP.q.map(l=>l.t)};}")
        check(r["stage"] == 8 and not r["grow"] and r["parts"] == 0 and not r["mv"] and r["k"] == 1 and r["off"] == [0, 0] and r["dip"] == 0,
              f"reduce motion: straight to the new size, no steps, burst or move: {r}")
        check(r["spot"] == "free" and r["q"] == ["Tuffet is an adult now!"] and bool(STAMP.match(r["grew"].get("8", ""))), f"reduce motion keeps the new spot, the caption and the stamp: {r}")
        await ev("()=>__step(1)")
        await shot("reduce_motion_adult_at_once")
        # it still waits its few calm seconds by itself
        await load()
        await ev(READY)
        await ev("()=>__step(1.5)")
        check(await ev("()=>st.stage===4"), "reduce motion: it should still wait for a calm room")
        await ev("()=>__step(3)")
        check(await ev("()=>st.stage===6&&!grow"), "reduce motion: then it is simply a teen")

        # ---- 9. debug: Grow up now -------------------------------------------------------------------------------
        await pg.close()
        pg = await page()
        ev = pg.evaluate
        await load()
        await pg.click("#dbgBtn")
        await ev("()=>__step(.5)")
        real = await ev("()=>localStorage.getItem(KEY)")
        btn = pg.locator("#dbg button", has_text="Grow up now")
        check(await btn.count() == 1, "the debug drawer should have a Grow up now button")
        if await btn.count():
            await btn.first.click()
            check(await ev("()=>TESTING&&!!grow&&grow.id===1&&st.stage===4"), "Grow up now should start the moment right away, in test mode")
            await ev("()=>__step(.3)")
            await shot("debug_grow_up_now")
            await ev("()=>__step(5)")
            check(await ev("()=>st.stage===6"), "Grow up now: the kid should be a teen")
            check(await ev("()=>localStorage.getItem(KEY)") == real, "Grow up now changed the real save")
        check(await ev("()=>{TESTING=false;const s=st.stage;dbgGrowUp();return st.stage===s&&!grow;}"), "Grow up now must do nothing outside test mode")

        fails += [f"page error: {e}" for e in errs]
        await b.close()
    fails = [f for f in fails if f]
    for f in fails:
        print("FAIL", f)
    if fails:
        sys.exit(1)
    print("PASS: growing up waits for you, one monster at a time, hops to a spot that fits first; pictures in tests/screenshots/grow_up/")


if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    asyncio.run(main())
