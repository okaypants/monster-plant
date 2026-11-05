"""Smoke test for Monster Plant.

Run from the repository root:
    pip install playwright && python -m playwright install chromium
    python tests/smoke_test.py

It serves the folder locally and plays each case below for a full minute of game time at speed 20:
  new game (quiz -> seed -> kid), old save (one adult from before multi-plant support: gets a nature and
  the gift seed), breeding, night and morning, a teen, a kid on the book stack, the cat in every nap spot,
  curtains closed with both lamps off (day and night), and the iPhone landscape view.
Any page error, error box, or missing image fails the run. A screenshot of each case goes to tests/screenshots/.

Game time runs on a virtual clock (the real game loop, stepped 50 ms at a time) with fixed randomness,
so a minute takes a few seconds and the screenshots come out the same every run.
Exit code 0 = all good, 1 = something broke.
"""
import asyncio, http.server, os, socketserver, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, "tests", "screenshots")
PORT = int(os.environ.get("MP_PORT", 8765))  # another checkout running its tests at the same time: MP_PORT=8791 python tests/...py
MINUTE = 60  # seconds of game time per case
STEP_MS = 50  # game-loop frame length (the game caps a frame at 100 ms)


def serve():
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    class Server(socketserver.ThreadingTCPServer):  # the game asks for ~240 images at once; one-at-a-time drops some
        daemon_threads = True
        request_queue_size = 256

    httpd = Server(("", PORT), Quiet)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


# runs before the game's code: fixed randomness, and a clock + timers + animation frames that only move on __step(seconds)
VIRTUAL_TIME = """(()=>{let s=12345;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 let vt=0;const BASE=Date.now();performance.now=()=>vt;Date.now=()=>BASE+vt;
 let q=[],id=1,raf=[];
 window.setTimeout=(f,d=0)=>{q.push({id,at:vt+(+d||0),f});return id++;};
 window.setInterval=(f,d=0)=>{const me=id++,r=()=>{f();q.push({id:me,at:vt+(+d||1),f:r});};q.push({id:me,at:vt+(+d||1),f:r});return me;};
 window.clearTimeout=window.clearInterval=i=>{q=q.filter(x=>x.id!==i);};
 window.requestAnimationFrame=f=>{raf.push(f);return 1;};
 window.__step=(sec,ms=%d)=>{for(let n=Math.round(sec*1000/ms);n>0;n--){vt+=ms;
  for(;;){q.sort((a,b)=>a.at-b.at||a.id-b.id);if(!q.length||q[0].at>vt)break;q.shift().f();}
  const r=raf;raf=[];r.forEach(f=>f(vt));}};})();""" % (STEP_MS,)  # __step(seconds, frame ms): longer frames for long runs

# saves, built in the page from fresh() so they always match the current save format
TEEN = "s.stage=6;s.species=4;s.free={x:1250,y:918};s.nge=s.nlc=s.ge=s.lc=0;s.giftSeed=1;"  # neutral: no quirks that wake the cat; gift seed already came (it has its own case)
CASES = [
    # name, save (None = brand-new game), js after the start screen, minutes, check (js returning true or a reason)
    ("new_game", None, "", 1,
     "st.started&&st.stage===4&&st.nge!=null||'seed did not grow into a kid with a nature (stage '+st.stage+')'"),
    ("old_save_gift_seed", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.place={grown:'rugC'};delete s.others;delete s.id;", "window.__yes=setInterval(()=>{const y=document.querySelector('.bubble [data-k=y]');if(y)y.click();},200);", 1,  # says yes when asked
     "st.nge!=null&&plantCount()>=2||'old save: nature '+st.nge+', plants '+plantCount()"),
    # new plants only with your OK: the gift seed asks first and nothing appears until you say yes
    ("gift_seed_asks_first", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.free={x:1250,y:918};", "", 1,
     "(plantCount()===1&&!!document.querySelector('.bubble [data-k=y]')&&/tapping at the window/.test(bubble.textContent))||'gift seed: plants '+plantCount()+', bubble '+(bubble&&bubble.textContent)"),
    ("gift_seed_not_now", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.free={x:1250,y:918};",
     "window.__no=setInterval(()=>{const n=document.querySelector('.bubble [data-k=n]');if(n)n.click();},200);", 1,
     "(plantCount()===1&&st.giftAskDay===st.day+3&&!st.giftSeed)||'not now: plants '+plantCount()+', ask again day '+st.giftAskDay+' (today '+st.day+')'"),
    # never more than two plants (Jackie, Nov 4): two happy adults don't offer a seed, and the window gift doesn't ask, when the room is full
    ("no_third_plant", "s.stage=8;s.species=3;s.free={x:300,y:918};s.breedDay=0;s.day=4;delete s.giftSeed;",
     "const q=freshPlant();q.species=6;q.stage=8;q.free={x:1250,y:918};addPlant(q);eachPlant(()=>{st.needs={thirst:0,hunger:0,attention:0};});"
     "setTimeout(()=>{const A=allRaw().filter(q=>q.stage>=8);crossPollinate(A[0],A[1]);},1000);", 1,
     "(plantCount()===2&&!bubble)||'room full: plants '+plantCount()+', bubble '+(bubble&&bubble.textContent)"),
    # two plants on the floor, one in the wrong light for a long while, so it walks toward better light (this once crashed: "bd is not defined")
    ("floor_light_seek", "s.stage=8;s.species=3;s.pref='night';s.free={x:400,y:918};s.giftSeed=1;",
     "const q=freshPlant();q.species=6;q.stage=8;q.free={x:1250,y:918};addPlant(q);swapIn(0);st.lightBad=500;st.lightState='hi';", 1,
     "!document.getElementById('errbox')||'error box: '+document.getElementById('errbox').textContent"),
    ("night_morning", "s.stage=4;s.species=2;s.day=3;", "tuckIn();", 1,
     "st.night||'tuckIn did not reach night'"),
    ("teen", TEEN, "", 1,
     "st.stage===6&&stageGroup()==='grown'&&!!st.free||'teen not on the rug'"),
    ("kid_on_book_stack", "s.stage=4;s.species=7;s.place={baby:'books'};", "", 1,
     "spotKey()==='books'||'kid is at '+spotKey()"),
    ("curtains_closed_lamps_off_day", TEEN + "s.curtain='closed';s.lamp=false;s.desk=false;s.dayT=.1;s.mode='actions';", "", 1,
     "st.curtain==='closed'&&st.lamp===false&&st.desk===false&&timeKey()==='day'||'room state changed'"),
    ("curtains_closed_lamps_off_night", TEEN + "s.curtain='closed';s.lamp=false;s.desk=false;s.dayT=.9;s.night=true;", "", 1,
     "st.curtain==='closed'&&st.lamp===false&&st.desk===false&&st.night||'room state changed'"),
]
CAT_NAP = ("const k='%s';if(k==='byplant')CAT_SPOTS.byplant=plantSideSpot();const c=CAT_SPOTS[k];"
           "Object.assign(cat,{spot:k,x:c.x,y:c.y,sc:c.sc,pose:c.poses[0],state:'sleep',nap:1e9,path:null,pets:0});")
for spot in ["bed", "rug", "chair", "sill", "crate", "books", "byplant"]:
    CASES.append(("cat_" + spot, TEEN, CAT_NAP % spot, 1,
                  f"cat.spot==='{spot}'&&cat.state==='sleep'||'cat ended up '+cat.state+' at '+cat.spot"))


async def play(b, name, save, after, minutes, check, device=None):
    """One case in its own browser context (its own save). Returns a list of problems."""
    ctx = await b.new_context(**(device or {"viewport": {"width": 1670, "height": 942}}))
    await ctx.add_init_script(VIRTUAL_TIME)
    pg = await ctx.new_page()
    probs = []
    pg.on("pageerror", lambda e: probs.append("page error: " + str(e)))
    local = f"http://localhost:{PORT}/"
    pg.on("requestfailed", lambda r: r.url.startswith(local) and probs.append("missing: " + r.url[len(local):] + " (" + str(r.failure) + ")"))
    pg.on("response", lambda r: r.url.startswith(local) and r.status >= 400 and probs.append(f"missing ({r.status}): " + r.url[len(local):]))
    url = local + "index.html"
    await pg.goto(url, wait_until="load")
    if save is not None:
        await pg.evaluate("()=>{const s=fresh();s.started=true;s.species=0;" + save + "localStorage.setItem(KEY,JSON.stringify(s));}")
        await pg.reload(wait_until="load")
    await pg.click(".screen button")  # Begin / Continue
    if save is None:
        for i in range(4):  # answer the 4 quiz questions
            await pg.click(".screen button >> nth=%d" % (i % 2))
    await pg.evaluate("()=>{st.speed=20;" + after + "}")
    await pg.evaluate("s=>__step(s)", MINUTE * minutes)
    if name == "night_morning":  # a minute of night, then morning, then a minute of the new day
        day = await pg.evaluate("()=>st.day")
        await pg.evaluate("()=>wake()")
        await pg.evaluate("s=>__step(s)", MINUTE)
        check = f"st.day==={day}+1&&!st.night||'morning did not come (day '+st.day+', night '+st.night+')'"
    if device:  # phone: the whole room must fit on screen
        check = "(()=>{const r=cv.getBoundingClientRect();return r.width<=innerWidth+1&&r.height<=innerHeight+1&&r.width>0})()||'room does not fit the phone screen'"
    res = await pg.evaluate("()=>" + check)
    if res is not True:
        probs.append(str(res))
    box = await pg.evaluate("()=>(document.getElementById('errbox')||{}).textContent||''")
    if box:
        probs.append("error box: " + box.replace("\n", " | "))
    await pg.screenshot(path=os.path.join(SHOTS, name + ".png"))
    await ctx.close()
    return probs


async def main():
    serve()
    os.makedirs(SHOTS, exist_ok=True)
    fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        runs = list(CASES) + [("iphone_landscape", TEEN, "", 1, "true", p.devices["iPhone 13 landscape"])]
        for name, save, after, minutes, check, *dev in runs:
            probs = await play(b, name, save, after, minutes, check, dev[0] if dev else None)
            print(("FAIL " if probs else "ok   ") + name)
            for pr in probs[:5]:
                print("     -", pr)
            fails += bool(probs)
        await b.close()
    if fails:
        print(f"FAIL: {fails} of {len(runs)} cases")
        sys.exit(1)
    print(f"PASS: all {len(runs)} cases, a minute each at speed 20. Screenshots in tests/screenshots/")


if __name__ == "__main__":  # light_map_shots.py borrows the server and virtual clock
    asyncio.run(main())
