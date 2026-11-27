#!/usr/bin/env python3
"""The movie room's television channels (Jackie, Nov 27: "research and pull a lot more random videos to turn into playlists for
channels as well as actual channels that we can do an up down button to randomly tune into and maybe an onscreen tv guide").
Asks the Internet Archive for films in a few collections that are marked public domain there, keeps the well-watched ones of a
sensible length that have a small video file, drops titles with words that suggest something unsuitable, and writes
movieroom/channels.json: for each channel its number, name and a playlist of {id, f (the file), t (title), y (year), d (seconds)}.
The game turns each playlist into a round-the-clock schedule (js/movieroom.js). Nobody has watched all of these: the list is by
title and by what the Archive says about each film, so anything odd can be cut by adding its identifier to SKIP and running again.
Run: python3 tools/channels_build.py   (needs the internet; sends nothing but the search questions)"""
import json,os,re,subprocess,sys,time,urllib.parse
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));UA={'User-Agent':'Mozilla/5.0'}
BAD=re.compile(r"\b(war|atom|atomic|bomb|nuclear|army|navy|soldier|marine|combat|communis|soviet|nazi|hitler|japan|jap|negro|colored|indian|savage|cannibal|minstrel|blackface|drug|marijuana|narcotic|heroin|venereal|syphilis|sex|vd|cigarette|tobacco|smok|beer|whiskey|liquor|drunk|alcohol|gun|rifle|murder|kill|death|dead|crime|prison|riot|accident|safety|dating|dating do|petting|puberty|menstru|birth|abortion|hygiene|propaganda|election|campaign|republican|democrat|missile|civil defense|duck and cover|polio|cancer|disease|surgery|slaughter|hunting|circumcis|execution)\w*",re.I)
SKIP_T=re.compile(r"disrobing|martyred|baden verboten|jugendspiele|may irwin kiss|shock troops|^#bfl|mr\. roach|lost in space|shasta|frankenstein|fish from hell|earthquake|ask me, don.t tell me|17 days|metrecal|jetsons|kellogg|car commericals|\(dv25 version\)|classic television commercials$",re.I) # titles cut by hand after reading the list: hunting, a disaster, youth gangs, a wartime strike, a diet drink, things still owned, and doubles
# CARTOONS: the Archive's classic cartoons collection is its own gathering of cartoons believed to be in the public domain, but old
# cartoons are full of ugly caricature, so only named series known to be free of it are taken, and known bad episodes are left out.
TOON_OK=re.compile(r"superman|felix|gertie|betty boop|koko|inkwell|flip the frog|little nemo|krazy kat|casper|little lulu|gabby|color classic",re.I)
TOON_NO=re.compile(r"rise to fame|big boss|be human|betty boop cartoons$|japoteur|eleventh hour|jungle|secret agent|bund|destruction|terror on the midway|mummy|scrub|minnie the moocher|snow.?white|old man of the mountain|making stars|swing|harem|chinatown|uncle tom|voodoo|i.ll be glad|hula|bamboo|zula|igloo|eskimo",re.I)
SKIP=set() # identifiers cut by hand after looking
CHANNELS=[
 (2,'Cartoons','Old cartoons',['collection:(classic_cartoons) AND mediatype:movies'],(240,900),14),
 (3,'Yesterday’s Tomorrow','Films about the future, the home and how things are made',['collection:(prelinger) AND mediatype:movies AND (subject:(future OR design OR kitchen OR automobile OR telephone OR railroad OR "world\'s fair" OR manufacturing OR appliances))'],(300,1800),14),
 (4,'The Late Show','Old television: drama, comedy and quiz',['collection:(classic_tv_1950s) AND mediatype:movies'],(1200,1900),12),
 (5,'Nature Hour','Animals, plants, weather and the sea',['collection:(prelinger) AND mediatype:movies AND (subject:(animals OR birds OR insects OR nature OR ocean OR weather OR plants OR farm OR garden OR zoo))'],(300,1500),14),
 (6,'Space','Rockets, the moon and the planets',['collection:(nasa) AND mediatype:movies','collection:(prelinger) AND mediatype:movies AND subject:(space OR rocket OR astronomy OR moon)'],(180,1800),14),
 (0,'Commercials','Old advertisements, shown between the films',['collection:(prelinger) AND mediatype:movies AND subject:(advertising OR commercials OR commercial)','collection:(classic_tv_commercials) AND mediatype:movies'],(20,150),24),
 (11,'One-Minute Films','The very first films, a minute or less each',['mediatype:movies AND (creator:(Lumiere OR Lumière OR Melies OR Méliès OR Edison OR "Thomas A. Edison" OR "American Mutoscope") OR subject:("early films" OR actuality OR kinetoscope OR "Lumiere"))','collection:(silent_films) AND mediatype:movies'],(15,130),20),
 (7,'Travelogue','Old films of cities, trains and far places',['collection:(prelinger) AND mediatype:movies AND (subject:(travel OR travelogue OR cities OR "San Francisco" OR "New York" OR trains OR streetcars OR tourism))'],(240,1500),14)]
def get(url):
    """one answer from the Archive, fetched with curl (this machine's Python does not trust the Archive's certificate chain)"""
    for k in range(3):
        try:
            r=subprocess.run(['curl','-s','-L','-m','40','-A','Mozilla/5.0',url],capture_output=True,timeout=60)
            if r.returncode==0 and r.stdout:return json.loads(r.stdout)
        except Exception as e:pass
        time.sleep(2+k*2)
    return None
def search(q,rows=70):
    rows=260 if 'classic_cartoons' in q else rows
    u='https://archive.org/advancedsearch.php?'+urllib.parse.urlencode([('q',q),('fl[]','identifier'),('fl[]','title'),('fl[]','year'),('fl[]','downloads'),('fl[]','licenseurl'),('sort[]','downloads desc'),('rows',rows),('output','json')])
    j=get(u);return (j or {}).get('response',{}).get('docs',[])
def pick(ident,lo,hi,trust=False):
    m=get('https://archive.org/metadata/'+urllib.parse.quote(ident))
    if not m:return None
    md=m.get('metadata',{});lic=str(md.get('licenseurl',''));col=md.get('collection',[]);col=[col] if isinstance(col,str) else col
    if not (trust or 'publicdomain' in lic or 'prelinger' in col or 'nasa' in col):return None # marked public domain there, or from the Prelinger Archives or NASA, which are
    best=None
    for f in m.get('files',[]):
        n=f.get('name','');
        if not n.lower().endswith('.mp4'):continue
        try:d=float(f.get('length',0));size=int(f.get('size',0))
        except:continue
        if not(lo<=d<=hi) or size>260e6 or size<1e6:continue
        if best is None or size<best[2]:best=(n,d,size)
    if not best:return None
    desc=re.sub(r'<[^>]+>',' ',str(md.get('description','')))[:600]
    if BAD.search(str(md.get('title',''))) or BAD.search(desc) or BAD.search(' '.join(md.get('subject',[]) if isinstance(md.get('subject'),list) else [str(md.get('subject',''))])):return None
    return {'id':ident,'f':best[0],'t':re.sub(r'\s+',' ',str(md.get('title',ident))).strip()[:70],'y':str(md.get('year') or md.get('date') or '')[:4],'d':round(best[1])}
def main():
    only=[int(x) for x in sys.argv[1:]];old={c['n']:c for c in json.load(open(os.path.join(ROOT,'movieroom','channels.json')))['channels']} if only else {} # with numbers given, only those channels are gathered again
    out=[];seen=set(x['id'] for c in old.values() for x in c['list'])
    for num,name,about,queries,(lo,hi),want in CHANNELS:
        if only and num not in only:
            if num in old:out.append(old[num])
            continue
        items=[]
        for q in queries:
            for doc in search(q):
                i=doc['identifier']
                T=str(doc.get('title',''))
                if i in seen or i in SKIP or BAD.search(T) or SKIP_T.search(T):continue
                toon=num==2 or (num==11 and re.match(r'1[89]\d\d',str(doc.get('year','')) ) and int(str(doc.get('year'))[:4])<1929) # the first films are old enough to be free whatever the page says
                if num==2 and (not TOON_OK.search(T) or TOON_NO.search(T)):continue
                if num==11 and not toon:continue
                it=pick(i,lo,hi,trust=toon)
                if it:items.append(it);seen.add(i);print(num,name,'+',it['t'],it['y'],it['d'],flush=True)
                if len(items)>=want:break
            if len(items)>=want:break
        out.append({'n':num,'name':name,'about':about,'list':items})
    json.dump({'made':time.strftime('%Y-%m-%d'),'channels':out},open(os.path.join(ROOT,'movieroom','channels.json'),'w'),ensure_ascii=False,indent=1)
    print(sum(len(c['list']) for c in out),'films on',len(out),'channels')
if __name__=='__main__':main()
