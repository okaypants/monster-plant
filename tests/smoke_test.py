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
     "(st.started&&st.stage===1&&st.nge!=null&&!!st.name&&__open[4]===st.name&&__open[0]===.3&&__open[1]===false&&__open[2]===false&&__open[3]==='open'&&__open[5].startsWith('Hello, '+st.name+'! Your little seed')&&CAP.log.some(l=>l.t==='A sprout!'))||'new game: stage '+st.stage+', name '+st.name+', opening '+JSON.stringify(__open)"),
    # Tamagotchi time (Jackie, Nov 8): a cared-for kid near the end of its day grows into a teen on the clock, no Good morning needed
    ("grows_on_the_clock", "s.stage=4;s.species=6;s.timer=GROW_FOR[4]-60;s.free={x:1250,y:918};s.giftSeed=1;s.needs={thirst:0,hunger:0,attention:0};", "", 0.2,
     "(st.stage===6&&!st.night&&CAP.log.some(l=>l.t===firstName()+' is a teen now, with big ideas and a bigger pot.'))||'clock growth: stage '+st.stage+', timer '+st.timer+', log '+CAP.log.map(l=>l.t).join(' | ')"),
    # the archive (Jackie, Nov 8): moving out saves a frozen journal in the desk; an old save opens an empty drawer with its note
    ("archive_moves_out", "s.stage=8;s.species=3;s.giftSeed=1;s.free={x:300,y:918};s.name='Tuffet Mossmuffin';delete s.archive;",
     "const p=freshPlant();p.species=7;p.stage=8;p.name='Mortie Gloomsnack';p.free={x:1250,y:918};addPlant(p);swapIn(0);window.__empty=(openArchive(),__step(.3),document.querySelectorAll('.jarchnote').length);closeJournal();moveOut(p.id,'Off to see the ocean');openArchive();", 0.2,
     "(__empty===ARCHIVE_NOTE.length&&plantCount()===1&&st.archive.length===1&&st.archive[0].name==='Mortie Gloomsnack'&&document.querySelectorAll('.jarchbook').length===1&&!document.querySelector('.jarchnote')&&!JSON.parse(localStorage.getItem(KEY)).others.length&&JSON.parse(localStorage.getItem(KEY)).archive.length===1&&CAP.log.some(l=>l.t===\"Mortie's journal is tucked safely in the desk.\"))||'archive: empty '+__empty+', plants '+plantCount()+', archive '+JSON.stringify((st.archive||[]).map(e=>e.name))"),
    # asking to go (Jackie, Nov 8): yes, and the next morning the monster has moved out to where it wanted to go
    ("go_ask_yes_then_gone", "s.stage=8;s.species=3;s.giftSeed=1;s.day=9;s.free={x:300,y:918};s.name='Tuffet Mossmuffin';s.ge=s.nge=0;s.lc=s.nlc=-.6;",
     "const p=freshPlant();p.species=7;p.stage=8;p.name='Mortie Gloomsnack';p.free={x:1250,y:918};addPlant(p);swapIn(0);capClear();goAsk(1);window.__ask=bubble.textContent;document.querySelector('.bubble [data-k=y]').click();window.__said=st.goDest;st.night=true;wake();", 0.2,
     "(/Tuffet .+\\. May Tuffet go\\?/.test(__ask)&&plantCount()===1&&st.archive.length===1&&st.archive[0].name==='Tuffet Mossmuffin'&&st.archive[0].dest===__said&&!!__said&&CAP.log.some(l=>l.t==='Tuffet will set off in the morning.'))||'go: ask '+__ask+', plants '+plantCount()+', archive '+JSON.stringify(st.archive)"),
    # Sloth's letter (Jackie, Nov 8): it lands on the sill, the letter names the monster, yes means staying with Sloth, PhD the next morning
    ("letter_yes_then_gone", "s.stage=8;s.species=3;s.giftSeed=1;s.day=9;s.free={x:300,y:918};s.name='Tuffet Mossmuffin';",
     "const p=freshPlant();p.species=7;p.stage=8;p.name='Mortie Gloomsnack';p.free={x:1250,y:918};addPlant(p);swapIn(0);letterLand(1);window.__sill=letterOnSill();openLetter();window.__l=document.querySelector('.jletter').textContent;document.querySelector('.jletter [data-k=y]').click();st.night=true;wake();", 0.2,
     "(__sill&&/Dear friend, .*Tuffet.*May Tuffet come\\?/.test(__l)&&plantCount()===1&&st.archive[0].name==='Tuffet Mossmuffin'&&st.archive[0].dest==='Staying with Sloth, PhD'&&!letterWaiting())||'letter: '+__l+', plants '+plantCount()+', archive '+JSON.stringify(st.archive)"),
    # the second plant is opt-in (Jackie, Nov 4): Sloth's note lands on the sill when the only plant is a late teen; tap it to be asked
    ("old_save_gift_seed", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.place={grown:'rugC'};delete s.others;delete s.id;",
     "window.__yes=setInterval(()=>{if(slothOnSill()&&!bubble)slothAsk();const y=document.querySelector('.bubble [data-k=y]');if(y)y.click();},200);", 1,  # taps the note, says yes
     "(st.nge!=null&&plantCount()===1&&st.slothSend===st.day+1&&!slothOnSill())||'old save: nature '+st.nge+', plants '+plantCount()+', send day '+st.slothSend"),
    ("sloth_seed_next_morning", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.free={x:1250,y:918};s.slothSend=5;",
     "st.night=true;wake();", 1,
     "(()=>{if(st.sillItem!=='seed'||st.pawWait)return 'morning seed: the paw should have left a seed packet on the sill ('+st.sillItem+', waiting '+st.pawWait+')';sillTap();"
     "return (plantCount()===2&&st.giftSeed===1&&!st.slothSend&&!st.sillItem&&CAP.log.concat(CAP.q).some(l=>/seed packet from Sloth, PhD/.test(l.t)))||'morning seed: plants '+plantCount()+', send '+st.slothSend;})()"),
    ("gift_seed_asks_first", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.free={x:1250,y:918};", "", 1,
     "(plantCount()===1&&slothOnSill()&&!bubble)||'note: plants '+plantCount()+', on sill '+slothOnSill()+', bubble '+(bubble&&bubble.textContent)"),
    ("gift_seed_not_now", "s.stage=8;s.species=3;s.day=4;s.dayT=.3;s.free={x:1250,y:918};",
     "window.__no=setInterval(()=>{if(slothOnSill()&&!bubble)slothAsk();const n=document.querySelector('.bubble [data-k=n]');if(n)n.click();},200);", 1,
     "(plantCount()===1&&st.slothJournal===1&&st.giftAskDay===st.day+3&&!st.slothNote&&!st.giftSeed)||'not yet: plants '+plantCount()+', journal '+st.slothJournal+', ask again day '+st.giftAskDay+' (today '+st.day+')'"),
    ("early_teen_no_note", "s.stage=6;s.species=4;s.credit=0;s.day=4;s.dayT=.3;s.free={x:1250,y:918};s.nge=s.nlc=s.ge=s.lc=0;", "", 1,
     "(!slothOnSill()&&!st.slothNote)||'a brand-new teen already got the note'"),
    ("late_teen_note", "s.stage=6;s.species=4;s.credit=.4;s.day=4;s.dayT=.3;s.free={x:1250,y:918};s.nge=s.nlc=s.ge=s.lc=0;", "", 1,
     "slothOnSill()||'no note for a late teen'"),
    # never more than two plants (Jackie, Nov 4): two adults making a seed never adds a third on the spot; a bubble asks where it goes (Nov 8), and the window gift doesn't ask when the room is full
    ("no_third_plant", "s.stage=8;s.species=3;s.free={x:300,y:918};s.breedDay=0;s.day=4;delete s.giftSeed;",
     "const q=freshPlant();q.species=6;q.stage=8;q.free={x:1250,y:918};addPlant(q);eachPlant(()=>{st.needs={thirst:0,hunger:0,attention:0};});"
     "setTimeout(()=>{const A=allRaw().filter(q=>q.stage>=8);crossPollinate(A[0],A[1]);},1000);", 1,
     "(plantCount()===2&&!!bubble&&/made a seed together!/.test(bubble.textContent)&&!slothOnSill())||'room full: plants '+plantCount()+', bubble '+(bubble&&bubble.textContent)"),
    # two plants on the floor, one in the wrong light for a long while, so it walks toward better light (this once crashed: "bd is not defined")
    ("floor_light_seek", "s.stage=8;s.species=3;s.pref='night';s.free={x:400,y:918};s.giftSeed=1;",
     "const q=freshPlant();q.species=6;q.stage=8;q.free={x:1250,y:918};addPlant(q);swapIn(0);st.lightBad=500;st.lightState='hi';", 1,
     "!document.getElementById('errbox')||'error box: '+document.getElementById('errbox').textContent"),
    # the journal is a keepsake book (Jackie, Nov 4): it opens, the ribbons switch pages, a charm can be worn and taken off
    ("journal_one_plant", "s.stage=8;s.species=3;s.giftSeed=1;s.free={x:1250,y:918};s.traits=['Pizza bow','Moss sprout'];s.titles=['evil'];s.quirks={bonk:'x',boo:'x'};s.fav='blood';s.catNaps={bed:3,sill:1};s.catSeen={purr:1};",
     "openJournal();", 0.2,
     "(()=>{const q=s=>document.querySelector(s),R=()=>[...document.querySelectorAll('.jrib')];if(!q('.jbook'))return 'no book';if(R().length!==2)return 'ribbons: '+R().length;"
     "R()[1].click();__step(.5);if(jPage!=='cat'||!q('.jpaws'))return 'the cat ribbon did not turn to his page ('+jPage+')';"
     "R()[0].click();__step(.5);if(jPage!=='p'+st.id)return 'the plant ribbon did not turn back ('+jPage+')';"
     "if(wornCharm()!=='Moss sprout')return 'wearing '+wornCharm();q('.jcharm[data-trait=\"Pizza bow\"]').click();if(wornCharm()!=='Pizza bow')return 'tapping a charm did not wear it';"
     "q('.jcharm[data-trait=\"Pizza bow\"]').click();if(wornCharm()!==null||st.wear!=='none')return 'tapping it again did not take it off';"
     "if(document.querySelectorAll('.jquirks .jstamp:not(.jfaint)').length!==2)return 'quirk stamps';if(q('.jbook').scrollHeight>q('.jbook').clientHeight+1)return 'the book scrolls';"
     "q('.jclose').click();return !q('.jbook')||'close corner did not close';})()"),
    ("journal_two_plants", "s.stage=8;s.species=3;s.giftSeed=1;s.free={x:300,y:918};s.ge=.6;s.lc=.6;",
     "const p=freshPlant();p.species=7;p.stage=8;p.ge=.6;p.lc=.6;p.free={x:1250,y:918};addPlant(p);openJournal();", 0.2,
     "(()=>{const R=[...document.querySelectorAll('.jrib')];if(R.length!==3)return 'ribbons: '+R.length;if(!document.querySelector('.jpal'))return 'no friend portrait';"
     "R[1].click();__step(.5);if(jPage===R[0].dataset.page)return 'second plant ribbon did not turn';const e=new MouseEvent('click',{bubbles:true});document.querySelector('.journal').dispatchEvent(e);return !document.querySelector('.jbook')||'tapping outside did not close';})()"),
    ("journal_old_save", "s.stage=6;s.species=4;s.place={grown:'rugC'};delete s.others;delete s.id;delete s.quirks;delete s.titles;delete s.traits;delete s.catNaps;delete s.catSeen;s.giftSeed=1;",
     "openJournal();", 0.2,
     "(()=>{const R=[...document.querySelectorAll('.jrib')];if(R.length!==2)return 'ribbons: '+R.length;R[1].click();__step(.5);return jPage==='cat'||'cat page';})()"),
    # names (Jackie, Nov 4): a name when its eyes open, with one hello; old saves get named; two plants never share a first name; rename in the journal
    ("names_eyes_open", "s.stage=1;s.species=2;s.timer=GROW_FOR[1]-1;s.nge=.5;s.nlc=0;s.giftSeed=1;", "", 0.2,
     "(st.stage===4&&!!st.name&&NAME_FIRST.good.includes(firstName())&&CAP.log.filter(l=>l.t==='Hello, '+st.name+'! Its eyes are open.').length===1)||'name '+st.name+', stage '+st.stage+', log '+CAP.log.map(l=>l.t).join(' | ')"),
    ("names_old_save", "s.stage=8;s.species=3;s.free={x:300,y:918};s.giftSeed=1;delete s.name;",
     "const p=freshPlant();p.species=6;p.stage=8;p.free={x:1250,y:918};addPlant(p);", 0.2,
     "(()=>{const A=allRaw();if(!A.every(q=>q.name))return 'unnamed: '+A.map(q=>q.name).join(',');const f=A.map(q=>firstName(q));return f[0]!==f[1]||'same first name '+f;})()"),
    ("names_rename", "s.stage=8;s.species=3;s.free={x:1250,y:918};s.giftSeed=1;s.name='Pip Wobblebean';",
     "openJournal();", 0.2,
     "(()=>{const q=s=>document.querySelector(s),enter=i=>i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));if(q('.jrename').textContent!=='Pip Wobblebean')return 'journal shows '+q('.jrename').textContent;"
     "q('.jrename').click();let i=q('.jnameinput');i.value='Sir Leafington the Third';enter(i);if(st.name!=='Sir Leafington t')return 'renamed to '+st.name;"
     "q('.jrename').click();i=q('.jnameinput');i.value='   ';enter(i);if(st.name!=='Sir Leafington t')return 'cleared name changed it to '+st.name;"
     "return CAP.q.concat(CAP.cur||[]).some(c=>c.t==='Back to Sir Leafington t.')||'no gentle back-to caption';})()"),
    # with the cat and two monsters around, a caption never starts with a bare "it": it names the monster (Jackie, Nov 4)
    ("names_in_captions_two", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.free={x:300,y:918};s.giftSeed=1;",
     "const p=freshPlant();p.species=6;p.stage=8;p.name='Mortie Gloomsnack';p.free={x:1250,y:918};addPlant(p);"
     "held.tool='book';held.item=BOOKS[0];useTool();st.full=.9;held.tool='snack';held.item=SNACKS[3];useTool();"
     "eachPlant(()=>{st.lastNight='well';});st.night=true;wakeRoom();", 1,
     "(()=>{const L=CAP.log.map(l=>l.t).concat(CAP.q.map(l=>l.t));if(!L.some(t=>/^Mortie listens to the fairy tale/.test(t)))return 'reading: '+L.join(' | ');"
     "if(!L.some(t=>t==='Mortie is full. Maybe later.'))return 'full: '+L.join(' | ');if(!L.some(t=>/Both slept well/.test(t)))return 'morning: '+L.join(' | ');"
     "const bare=L.filter(t=>/^(It|Its|It's) /.test(t));return !bare.length||'bare it: '+bare.join(' | ');})()"),
    # a seed can be renamed in the journal right away; when its eyes open it keeps that name (and says so)
    ("names_seed_named_early", "s.stage=1;s.species=2;s.timer=0;s.giftSeed=1;delete s.name;",
     "openJournal();const b=document.querySelector('.jrename');b.click();const i=document.querySelector('.jnameinput');i.value='Sprinkles';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));closeJournal();st.timer=GROW_FOR[1]-1;", 0.2,
     "(st.stage===4&&st.name==='Sprinkles'&&CAP.log.some(l=>l.t==='Sprinkles opens its eyes!'))||'seed name: '+st.name+', stage '+st.stage+', log '+CAP.log.map(l=>l.t).join(' | ')"),
    # the cat has a name too: on his journal page (tap to rename) and in his captions
    ("cat_name", "s.stage=8;s.species=3;s.free={x:1250,y:918};s.giftSeed=1;s.catTrust=.1;delete s.catName;",
     "openJournal('cat');", 0.2,
     "(()=>{const n=st.catName;if(!CAT_NAMES.includes(n))return 'no cat name: '+n;const q=s=>document.querySelector(s);if(q('.jrename').textContent!==n)return 'cat page shows '+q('.jrename').textContent;"
     "q('.jrename').click();const i=q('.jnameinput');i.value='Sir Whiskers';i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));if(st.catName!=='Sir Whiskers')return 'rename: '+st.catName;"
     "closeJournal();capClear();CAP.seen.clear();st.taught={};cat.state='wake';cat.shyT=0;petCat();return CAP.q.concat(CAP.cur||[]).some(c=>c.t==='Sir Whiskers sniffs your hand. A start.')||'caption: '+CAP.q.map(c=>c.t).join('|');})()"),
    # feeding (Jackie, Nov 4): drag a treat from the tray to an adult (open mouth, it eats) and to the floor (it goes back to the tray)
    ("feed_drag", "s.stage=8;s.species=3;s.free={x:1250,y:918};s.giftSeed=1;s.dayT=.3;s.nap=0;s.full=0;", "", 0.1,
     "(()=>{st.nap=0;st.full=0;st.night=false;openSnacks();const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});"
     "const b=plantBox(),fx=b.x+b.w/2-(rightHand()?-30:30)/S,fy=b.y+b.h/2+46/S;if(document.querySelectorAll('.ttray .ttreat').length!==7)return 'tray has '+document.querySelectorAll('.ttray .ttreat').length;"
     "document.querySelector('.ttreat[data-id=pizza]').dispatchEvent(new PointerEvent('pointerdown',cl(fx,fy-200)));dispatchEvent(new PointerEvent('pointermove',cl(fx,fy)));"
     "if(feed.over!==st.id)return 'treat over the adult does not count';if(mouthNow()!==2)return 'mouth not open: '+mouthNow();"
     "dispatchEvent(new PointerEvent('pointerup',cl(fx,fy)));__step(1);if(((st.treats||{}).pizza||0)!==1)return 'it did not eat the pizza';"
     "document.querySelector('.ttreat[data-id=solar]').dispatchEvent(new PointerEvent('pointerdown',cl(300,700)));dispatchEvent(new PointerEvent('pointermove',cl(300,880)));if(feed.over!=null)return 'the floor counted as a monster';"
     "dispatchEvent(new PointerEvent('pointerup',cl(300,880)));__step(.5);if(((st.treats||{}).solar||0)!==0)return 'a treat dropped on the floor got eaten';if(feed.item)return 'still holding';"
     "if(!document.querySelector('.ttray'))return 'tray closed too soon';__step(5);return !document.querySelector('.ttray')||'tray did not hide after a few seconds';})()"),
    # reading (Jackie, Nov 7): touch any book (bookcases, crate book, book stack) -> a tray of the four books; drag one to a monster -> it hops into the armchair, the story opens facing us, tap to turn, it goes back
    ("read_drag", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.free={x:1250,y:918};s.giftSeed=1;s.dayT=.3;s.nap=0;s.needs={thirst:0,hunger:0,attention:.8};", "", 0.1,
     "(()=>{const logs=()=>(st.log||[]);st.needs.attention=.8;st.nap=0;st.night=false;closeBookTray();const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});"
     "for(const [x,y] of [[100,190],[1560,360],[340,632],[975,700]]){closeBookTray();cv.dispatchEvent(new MouseEvent('click',cl(x,y)));if(document.querySelectorAll('.btray .tbook').length!==4)return 'tapping the book at '+x+','+y+' did not open the book tray';}"
     "for(const [x,y] of [[95,390],[1540,260],[1550,650],[220,500]]){closeBookTray();cv.dispatchEvent(new MouseEvent('click',cl(x,y)));if(document.querySelector('.btray'))return 'a non-book spot '+x+','+y+' opened the book tray';}"
     "cv.dispatchEvent(new MouseEvent('click',cl(100,190)));const b=plantBox(),fx=b.x+b.w/2-(rightHand()?-30:30)/S,fy=b.y+b.h/2+46/S;"
     "document.querySelector('.tbook[data-id=fairy]').dispatchEvent(new PointerEvent('pointerdown',cl(fx,fy-200)));dispatchEvent(new PointerEvent('pointermove',cl(fx,fy)));if(bookDrag.over!==st.id)return 'book over the monster does not count';"
     "dispatchEvent(new PointerEvent('pointerup',cl(fx,fy)));__step(.2);if(!READ.has(st.id))return 'not reading';if(st.needs.attention>.3)return 'reading did not keep it company: '+st.needs.attention+' log '+logs().join('|');"
     "if(!CAP.log.concat(CAP.q).concat(CAP.cur||[]).some(l=>l.t==='Pip listens to the fairy tale, very still.'))return 'no reading caption';"
     "if(spotKey()!=='chair')return 'did not hop into the armchair: '+spotKey();const sb=document.querySelector('.story');if(!sb||sb.querySelector('.sl').textContent!==STORIES.fairy[0])return 'no story book with page one';"
     "for(let i=0;i<3;i++){sb.click();__step(.3);}if(document.querySelector('.story'))return 'story still open after the last page';if(READ.has(st.id))return 'still reading';if(spotKey()!=='free'||Math.abs(st.free.x-1250)>1)return 'did not go back to its spot: '+spotKey()+' '+JSON.stringify(st.free);"
     "cv.dispatchEvent(new MouseEvent('click',cl(100,190)));document.querySelector('.tbook[data-id=almanac]').dispatchEvent(new PointerEvent('pointerdown',cl(300,700)));dispatchEvent(new PointerEvent('pointermove',cl(300,880)));"
     "dispatchEvent(new PointerEvent('pointerup',cl(300,880)));__step(.3);if(READ.size)return 'a book dropped on the floor got read';return !bookDrag.item||'still holding';})()"),
    # a kid offered big monster food says why it can't (Jackie, Nov 7)
    ("kid_food_caption", "s.stage=4;s.species=2;s.name='Pip Wobblebean';s.perch=null;s.free={x:1250,y:918};s.giftSeed=1;s.dayT=.3;", "", 0.1,
     "(()=>{capClear();CAP.seen.clear();openSnacks();const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});const b=plantBox(),fx=b.x+b.w/2-(rightHand()?-30:30)/S,fy=b.y+b.h/2+46/S;"
     "document.querySelector('.ttreat[data-id=pizza]').dispatchEvent(new PointerEvent('pointerdown',cl(fx,fy-200)));dispatchEvent(new PointerEvent('pointermove',cl(fx,fy)));dispatchEvent(new PointerEvent('pointerup',cl(fx,fy)));"
     "return CAP.q.concat(CAP.cur||[]).some(c=>c.t==='Pip is too little for big monster food.')||'caption: '+CAP.q.map(c=>c.t).join('|');})()"),
    # the cat answers a touch even while he's walking: he stops for a moment (Jackie, Nov 7)
    ("cat_touch_walking", "s.stage=8;s.species=3;s.free={x:1250,y:918};s.giftSeed=1;s.catTrust=.5;", "", 0.1,
     "(()=>{catGo(catPick());if(cat.state!=='walk')return 'cat not walking: '+cat.state;const x0=cat.x;petCat();if(!(cat.pauseT>0))return 'no pause';__step(.5);if(Math.abs(cat.x-x0)>1)return 'he kept walking';__step(1);return cat.state!=='walk'||Math.abs(cat.x-x0)>0||cat.path.length===0||'he never went on';})()"),
    # any monster can be dragged into the armchair, dropped anywhere over it (Jackie, Nov 7)
    ("chair_drop_kid", "s.stage=4;s.species=2;s.perch=null;s.free={x:1250,y:918};s.giftSeed=1;s.dayT=.3;", "", 0.1,
     "(()=>{cat.x=-999;const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});const b=plantBox(),c=[b.x+b.w/2,b.y+b.h*.6];"
     "cv.dispatchEvent(new PointerEvent('pointerdown',cl(...c)));cv.dispatchEvent(new PointerEvent('pointermove',cl(c[0]-200,c[1]-100)));cv.dispatchEvent(new PointerEvent('pointermove',cl(600,520)));dispatchEvent(new PointerEvent('pointerup',cl(600,520)));__step(.3);"
     "return spotKey()==='chair'||'kid not in the armchair: '+spotKey();})()"),
    # its nature on screen (Jackie, Nov 7): a very chaotic monster bounces in moon gravity until dragged back down; bonk hops; boo pulls a spooky face
    ("moon_bounce", "s.stage=8;s.species=3;s.name='Penny Flapdoodle';s.lc=-.8;s.nlc=-.6;s.ge=0;s.nge=0;s.free={x:700,y:918};s.giftSeed=1;s.dayT=.3;s.quirkT=999;", "", 0.1,
     "(()=>{cat.x=-999;st.quirkT=999;const x0=st.free.x;st.float={h:0,vh:300,vx:60};let top=0;for(let i=0;i<40;i++){__step(.25);top=Math.max(top,st.float?st.float.h:0);}"
     "if(!st.float)return 'stopped floating by itself';if(top<200)return 'never got high: '+top;if(Math.abs(st.free.x-x0)<50)return 'did not drift';if(plantBox().y>=plantBoxRaw().y)return 'not drawn in the air';"
     "const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});const b=plantBox(),c=[b.x+b.w/2,b.y+b.h*.5];"
     "cv.dispatchEvent(new PointerEvent('pointerdown',cl(...c)));cv.dispatchEvent(new PointerEvent('pointermove',cl(c[0],c[1]+60)));__step(.05);cv.dispatchEvent(new PointerEvent('pointermove',cl(800,900)));dispatchEvent(new PointerEvent('pointerup',cl(800,900)));__step(5);"
     "if(st.float)return 'still floating after being dragged down';"
     "st.bonkT=.5;st.bonkDir=1;const bx=plantBoxRaw().x;__step(.15);const hop=plantBox().x-bx;__step(.5);if(hop<=0)return 'bonk did not hop';st.spookT=1.8;return mouthNow()===11||'no spooky face';})()"),
    # tap a book in the tray: the story zooms open right away, read to the monster you're tending (Jackie, Nov 7)
    ("read_tap", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.free={x:1250,y:918};s.giftSeed=1;s.dayT=.3;", "", 0.1,
     "(()=>{st.nap=0;st.night=false;const r=cv.getBoundingClientRect(),cl=(x,y)=>({clientX:r.left+x*S,clientY:r.top+y*S,bubbles:true,pointerId:1,isPrimary:true});cv.dispatchEvent(new MouseEvent('click',cl(100,190)));"
     "const b=document.querySelector('.tbook[data-id=nonsense]'),br=b.getBoundingClientRect(),c={clientX:br.left+br.width/2,clientY:br.top+br.height/2,bubbles:true,pointerId:1,isPrimary:true};"
     "b.dispatchEvent(new PointerEvent('pointerdown',c));dispatchEvent(new PointerEvent('pointerup',c));const sb=document.querySelector('.story');if(!sb)return 'tapping a book did not open the story';"
     "if(!/scale/.test(sb.style.transform))return 'no zoom';__step(.3);if(sb.style.transform)return 'zoom did not finish';if(sb.querySelector('.sl').textContent!==STORIES.nonsense[0])return 'wrong story';"
     "return (spotKey()==='chair'&&READ.has(st.id))||'the tended monster is not listening in the armchair';})()"),
    # each relationship has its own spread in the journal, reached with the little arrows (Jackie, Nov 7)
    ("journal_relationships", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.free={x:300,y:918};s.giftSeed=1;s.catName='Tofu';",
     "const p=freshPlant();p.species=7;p.stage=8;p.name='Mortie Gloomsnack';p.free={x:1250,y:918};addPlant(p);swapIn(0);openJournal('p'+allRaw().find(q=>q.name==='Pip Wobblebean').id);", 0.2,
     "(()=>{const t=()=>document.querySelector('.jl .jname').textContent,want=['Pip & you','Pip & Mortie','Pip & Tofu'];for(const w of want){document.querySelector('.jarrow.jnext').click();__step(.3);if(t()!==w)return 'expected '+w+', got '+t();}"
     "if(document.querySelector('.jarrow.jnext'))return 'an arrow past the last spread';document.querySelector('.jarrow.jprev').click();__step(.3);if(t()!=='Pip & Mortie')return 'back arrow';"
     "document.querySelector('.jrib[data-page=cat]').click();__step(.3);if(t()!=='Tofu')return 'cat ribbon did not open the cat main page';document.querySelector('.jarrow.jnext').click();__step(.3);return t()==='Tofu & you'||'cat & you: '+t();})()"),
    # welcome back (Jackie, Nov 7): what it says happened while you were away is really there in the room
    ("welcome_friends", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.ge=.6;s.lc=.6;s.free={x:300,y:918};s.giftSeed=1;s.lastSeen=Date.now()-3*3600e3;"
     "s.others=[Object.assign((()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',ge:.6,lc:.6,free:{x:1350,y:918}})];s.id=1;s.nextId=3;", "", 0.05,
     "(()=>{const L=CAP.log.concat(CAP.q).concat(CAP.cur||[]).map(l=>l.t).join('|');if(!/Pip and Mortie scooted close together/.test(L))return 'caption: '+L;const [a,b]=allRaw();const d=Math.abs(a.free.x-b.free.x);return (d<650&&d>200)||'not side by side: '+a.free.x+' '+b.free.x;})()"),
    ("welcome_bicker", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.ge=.6;s.lc=.6;s.free={x:700,y:918};s.giftSeed=1;s.lastSeen=Date.now()-3*3600e3;"
     "s.others=[Object.assign((()=>{const f=fresh(),q={};for(const k in f)if(!GLOBAL.has(k))q[k]=f[k];return q;})(),{id:2,stage:8,species:7,name:'Mortie Gloomsnack',ge:-.6,lc:-.6,free:{x:950,y:918}})];s.id=1;s.nextId=3;", "", 0.03,
     "(()=>{const L=CAP.log.concat(CAP.q).concat(CAP.cur||[]).map(l=>l.t).join('|');if(!/sulking on opposite sides/.test(L))return 'caption: '+L;const [a,b]=allRaw();if(Math.abs(a.free.x-b.free.x)<800)return 'not apart: '+a.free.x+' '+b.free.x;return allRaw().every(q=>q.grump>0)||'no grumpy faces';})()"),
    ("welcome_moon", "s.stage=8;s.species=3;s.name='Penny Flapdoodle';s.lc=-.8;s.nlc=-.6;s.ge=0;s.nge=0;s.free={x:700,y:918};s.giftSeed=1;s.lastSeen=Date.now()-3*3600e3;", "", 0.03,
     "(()=>{const L=CAP.log.concat(CAP.q).concat(CAP.cur||[]).map(l=>l.t).join('|');if(!/Penny is bouncing around in moon gravity/.test(L))return 'caption: '+L;return !!st.float||'not floating';})()"),
    ("welcome_cat_far_from_spooky", "s.stage=8;s.species=3;s.name='Mortie Gloomsnack';s.ge=-.7;s.nge=-.5;s.lc=0;s.nlc=0;s.free={x:1300,y:918};s.giftSeed=1;s.catTrust=.2;s.lastSeen=Date.now()-3*3600e3;", "", 0.03,
     "(()=>{const L=CAP.log.concat(CAP.q).concat(CAP.cur||[]).map(l=>l.t).join('|');if(!/napping as far from Mortie as possible/.test(L))return 'caption: '+L;return Math.abs(cat.x-1300)>700||'cat not far: '+cat.x;})()"),
    # every chatter line comes with something you can see right then (Jackie, Nov 7)
    ("voice_lines_visible", "s.stage=8;s.species=3;s.name='Pip Wobblebean';s.free={x:900,y:918};s.giftSeed=1;", "", 0.05,
     "(()=>{cat.state='sleep';const bad=[];for(const [g,l] of [[.6,0],[-.6,0],[0,.6],[0,-.6],[0,0]]){st.ge=g;st.lc=l;for(const ev of ['pet','water','idle'])for(let i=0;i<6;i++){"
     "Object.assign(st,{bonkT:0,spookT:0,nodT:0,tidyT:0,listen:0});const p0=parts.length,b0=BOING.vy||0,b0x=BOING.vx||0;CAP.seen.clear();LINE_HIST[ev]=[];const t=line(ev);if(!t)continue;"
     "if(t.includes('|'))bad.push('raw: '+t);const seen=st.bonkT>0||st.spookT>0||st.nodT>0||st.tidyT>0||st.listen>0||parts.length>p0||(BOING.vy||0)!==b0||(BOING.vx||0)!==b0x;if(!seen)bad.push(t);}}"
     "return !bad.length||'no visible action for: '+[...new Set(bad)].join(' | ');})()"),
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
        await pg.evaluate("()=>{window.__open=[st.dayT,st.lamp,st.desk,st.curtain,st.name,CAP.q.concat(CAP.cur||[]).map(c=>c.t).join('|')];}")
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
