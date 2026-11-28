"""A sampler song laid into a film score in Scorimba (kalimba.html, js/scores.js).

Run from the repository root:  python tests/scorimba_song_test.py
A made-up finished song is put in the sampler's store. In Scorimba, with a film chosen, the soundtrack sheet offers it;
choosing it shows only a crop (start and end) and a loop switch; adding it makes a part that begins where the film is
paused, carries the song's name, and holds one pass of the cropped sound, small. A looped part keeps its loop and name
through saving, through the share file and back. Exit code 1 if a check fails."""
import asyncio, sys
from playwright.async_api import async_playwright
from smoke_test import PORT, serve
fails = []
def check(ok, msg):
    print(("ok   " if ok else "FAIL ") + msg)
    if not ok: fails.append(msg)
async def main():
    srv = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 844, "height": 390}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(f"http://localhost:{PORT}/kalimba.html?v=t", wait_until="load")
        await pg.evaluate("""async()=>{const sr=22050,pcm=new Int16Array(sr*3);for(let i=0;i<pcm.length;i++)pcm[i]=Math.round(9000*Math.sin(i/12));
          await cratesTx(['songs','songpcm'],'readwrite',tx=>{const q=tx.objectStore('songs').add({n:1,name:'Porch Stomp',made:Date.now(),bpm:90,bars:2,secs:3,radio:false});q.onsuccess=()=>tx.objectStore('songpcm').put({id:q.result,sr,pcm});});
          KF.film={t:'A Test Film',by:'nobody',id:'TestFilm',f:'t.mp4'};KF.parts=[];}""")
        r = await pg.evaluate("""async()=>{kfKeep();const sheet=document.getElementById('kkeep').classList.contains('on'),btn=!!document.getElementById('kkSong');document.getElementById('kkSong').click();await new Promise(r=>setTimeout(r,300));
          const L=[...document.querySelectorAll('#ksList button')].map(b=>b.textContent),hidden=document.getElementById('ksEdit').hidden,dis=document.getElementById('ksYes').disabled;return {sheet,btn,L,hidden,dis};}""")
        check(r["sheet"] and r["btn"] and r["L"] == ["Porch Stomp · 0:03"] and r["hidden"] and r["dis"], f"the soundtrack sheet offers the sampler's finished songs: {r}")
        r = await pg.evaluate("""async()=>{document.querySelector('#ksList button').click();await new Promise(r=>setTimeout(r,300));const E=document.getElementById('ksEdit'),ctl=[...E.querySelectorAll('input')].map(i=>i.id);
          const A=document.getElementById('ksA'),B=document.getElementById('ksB');A.value=.5;B.value=2;document.getElementById('ksLoop').checked=true;ksDraw();const say=document.getElementById('ksSay').textContent;
          document.getElementById('ksYes').click();const P=KF.parts[0],shut=!document.getElementById('ksong').classList.contains('on'),line=document.getElementById('kkParts').textContent;
          return {shown:!E.hidden,ctl,say,shut,line,n:KF.parts.length,t:P.t,dur:P.dur,loop:P.loop,name:P.name,mime:P.mime,size:P.blob.size,dirty:KF.dirty};}""")
        check(r["shown"] and r["ctl"] == ["ksA", "ksB", "ksLoop"] and "1.5 s" in r["say"] and "loops" in r["say"], f"choosing a song gives a crop and a loop and nothing else: {r}")
        check(r["n"] == 1 and r["loop"] == 1 and r["name"] == "Porch Stomp" and r["mime"] == "audio/wav" and 16000 < r["size"] < 17200 and r["dirty"] and r["shut"] and "Porch Stomp" in r["line"] and "looped" in r["line"], f"adding it makes one small looped part with the song's name, listed in the sheet: {r}")
        r = await pg.evaluate("""async()=>{const f=KF.film;await scorePut(f,{parts:KF.parts,by:'me',card:1});const k=scoreKey(f),rec=await scoreGetKey(k),p=scoreParts(rec)[0],pl=scorePlayer(rec);pl.free();
          const file=await scoreFile(k),back=await scoreFromFile(file),q=back.parts[0];await scoreDropKey(k);return {saved:[p.loop,p.name],file:[q.loop,q.name,q.mime,q.blob.size],n:pl.n};}""")
        check(r["saved"] == [1, "Porch Stomp"] and r["file"][:3] == [1, "Porch Stomp", "audio/wav"] and r["file"][3] > 16000 and r["n"] == 1, f"the loop and the name survive saving and the share file: {r}")
        r = await pg.evaluate("""()=>{const a={paused:true,currentTime:0,duration:4,loop:true,play(){this.paused=false;return Promise.resolve()},pause(){this.paused=true}};const A=window.Audio;window.Audio=function(){return a};
          const pl=scorePlayer({parts:[{t:10,dur:100,blob:new Blob(['x']),mime:'audio/wav',loop:1}]});window.Audio=A;pl.sync(16,true);const at=a.currentTime,on=!a.paused;pl.sync(200,true);const off=a.paused;return {at:+at.toFixed(2),on,off};}""")
        check(r["on"] and abs(r["at"] - 2) < .05 and r["off"], f"a looped part plays round and round for its whole stretch and stops after it: {r}")
        check(not errs, f"no page errors: {errs[:2]}")
        await b.close()
    srv.shutdown()
    print("PASS scorimba_song_test" if not fails else f"{len(fails)} failed"); sys.exit(1 if fails else 0)
if __name__ == "__main__": asyncio.run(main())
