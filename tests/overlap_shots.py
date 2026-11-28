"""Nothing you can press or read sits on top of anything else you can press or read.

Run from the repository root:  python tests/overlap_shots.py
On two phones held sideways, a tablet and a laptop, in the study and the movie room, with a long line of speech up, the
remote out, a note showing, the film library open and a drawer open: every button and every piece of overlaid text that is
on screen is measured, and any two that overlap (and are not one inside the other) are reported. The invisible tap areas
over things in the room are left out. Pictures go to tests/screenshots/overlap/. Exit code 1 if anything overlaps."""
import asyncio, os, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, SHOTS, VIRTUAL_TIME, serve
from caption_test import SAVE, LONG
OUT = os.path.join(SHOTS, "overlap")
SIZES = {"phone_small": (667, 375), "phone": (844, 390), "tablet": (1024, 768), "laptop": (1280, 720)}
FIND = """()=>{const skip='.mvhot,.mvthing,.mvtap,.mvstage>video,.rmcard',out=[];
 const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);if(r.width<4||r.height<4||c.visibility==='hidden'||c.display==='none'||+c.opacity<.05||e.hidden)return null;
  for(let p=e;p;p=p.parentElement){if(p.hidden)return null;const q=getComputedStyle(p);if(q.display==='none'||q.visibility==='hidden')return null;}
  if(r.right<=0||r.bottom<=0||r.left>=innerWidth||r.top>=innerHeight)return null;return r;};
 const E=[...document.querySelectorAll('button,#cap,.mvnote,.mvchb,.mvtix .mvstub,.mvremd,.mvlibhead h1,.mvplist h2,.nametag,.ptag,#who')].filter(e=>!e.matches(skip)&&getComputedStyle(e).pointerEvents!=='none'||e.matches('#cap,.mvnote,.mvchb,.mvstub'));
 const L=E.map(e=>[e,vis(e)]).filter(x=>x[1]);const name=e=>(e.id?'#'+e.id:'.'+[...e.classList].join('.'))+(e.textContent?' "'+e.textContent.trim().slice(0,18)+'"':'');
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const[a,ra]=L[i],[b,rb]=L[j];if(a.contains(b)||b.contains(a))continue;
  const top=document.querySelector('.mvpick,.rooms,.helpsheet');if(top&&(top.contains(a)!==top.contains(b)))continue; // a panel that is open covers the room on purpose
  const rem=document.querySelector('.mvrem');if(rem&&(rem.contains(a)!==rem.contains(b))&&!(a.matches('.mvnote,.mvchb,#leaveBtn,.mvback,#fsBtn')||b.matches('.mvnote,.mvchb,#leaveBtn,.mvback,#fsBtn')))continue;
  const w=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left),h=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);if(w>3&&h>3)out.push(name(a)+'  x  '+name(b)+'  ('+Math.round(w)+'x'+Math.round(h)+')');}
 const off=L.filter(([e,r])=>e.matches('button')&&(r.left<2||r.top<2||r.right>innerWidth-2||r.bottom>innerHeight-2)&&!e.closest('.mvpick')).map(([e])=>name(e)+' touches the edge of the screen');
 return out.concat(off);}"""
STATES = [
 ("study_long_speech", "()=>{capClear();CAP.seen.clear();tell(%r,{who:1,kind:'info',now:true});__step(.6);}" % LONG),
 ("study_help", "()=>{capClear();if(typeof closeBubble==='function')closeBubble();helpPlace();helpOpen();__step(.3);}"),
 ("study_help_closed", "()=>{helpClose();tell(%r,{who:1,kind:'info',now:true});__step(.6);helpPlace();}" % LONG),
 ("study_cupboard", "()=>{capClear();cubOpen();__step(.3);}"),
 ("movie_closed_note", "()=>{cubClose&&cubClose();capClear();document.getElementById('leaveBtn').click();document.querySelector('.rmcard[data-id=movie]').click();__step(1);mvNote('A channel can’t be wound back or on.',true);__step(.3);}"),
 ("movie_remote_note_banner", "async()=>{const j=await (await fetch('movieroom/channels.json')).json();mvChannelsSet(j);document.querySelector('.mvremote').click();mvTune(MV_CH[1]);__step(3);mvInfo();mvNote('Fast forward. Press it again, or play, to watch from here.',true);__step(.3);}"),
 ("movie_help", "()=>{mvPickClose();mvTrayClose();mvRemClose();helpPlace();helpOpen();__step(.3);}"),
 ("movie_help_closed", "()=>{helpClose();helpPlace();}"),
 ("movie_film_ticket", "()=>{mvRemClose();mvNote('');mvChan=null;mvFilm=MV_SHELVES[0].films[0];mvSet('closed');mvTixFor=null;mvPlay();__step(3);}"),
 ("movie_guide", "()=>{mvNote('');mvGuide();__step(.3);}"),
 ("movie_library", "()=>{mvGuideClose();mvRemClose();mvPick();__step(.3);}"),
 ("movie_drawer", "()=>{mvPickClose();mvDrawer('decor');__step(.3);}"),
]
async def main():
    os.makedirs(OUT, exist_ok=True); srv = serve(); fails = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for sz, (w, h) in SIZES.items():
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2, has_touch=True); await ctx.add_init_script(VIRTUAL_TIME); pg = await ctx.new_page()
            await pg.goto(f"http://localhost:{PORT}/index.html", wait_until="load"); await pg.evaluate(SAVE % (".3", "false")); await pg.reload(wait_until="load"); await pg.click(".screen button"); await pg.evaluate("()=>{__step(12);capClear();}")
            for name, js in STATES:
                await pg.evaluate(js); await pg.screenshot(path=os.path.join(OUT, f"{sz}_{name}.png"))
                for line in await pg.evaluate(FIND): fails.append(f"{sz} {name}: {line}")
            await ctx.close()
        await b.close()
    srv.shutdown()
    print("\n".join(fails) if fails else "PASS overlap_shots"); print(f"{len(fails)} overlaps" if fails else ""); sys.exit(1 if fails else 0)
if __name__ == "__main__": asyncio.run(main())
