#!/usr/bin/env python3
"""The film library's second helping (Jackie, Nov 27: "I want a much bigger film library", "including film and tv that have fallen
into public domain before their time and other ephemera as good as what you've already found", "a larger quantity of viewing
options"). Every title here was researched in research_notes/movieroom/strange_collections.md (films published in 1930 or
earlier, US government films, Prelinger) or lapsed_films.md (American films whose copyright was not renewed), and only titles
those notes call suitable are listed. For each one this asks the Internet Archive what files the item has, picks the named
file (or the smallest .mp4), reads its running time, and checks that the address answers with a video. What passes is written
to movieroom/library.json, which js/movieroom.js adds to the library's collections.
A title marked mute plays without the copy's sound: the notes say that copy carries a modern score or a record with its own term.
Run: python3 tools/library_build.py"""
import os,json,subprocess,urllib.parse,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));UA='Mozilla/5.0 (library check)'
def curl(*a):return subprocess.run(['curl','-sL','--max-time','40','-A',UA,*a],capture_output=True)
M=1 # mute
C=[
 ('light','Pure light','Shapes moving in time, with no story and no actors. These flicker and flash.',[
  ('Lichtspiel Opus II','Walter Ruttmann, Germany, 1922','silent-opus-ii','Opus II.mp4',M),
  ('Lichtspiel Opus III','Walter Ruttmann, Germany, 1924','silent-opus-iii','Opus III.mp4',M),
  ('Lichtspiel Opus IV','Walter Ruttmann, Germany, 1925','silent-opus-iv','Opus IV.mp4',M),
  ('Rhythmus 23','Hans Richter, Germany, 1923','silent-rhythmus-23','Rhythmus 23.mp4',M),
  ('Filmstudie','Hans Richter, Germany, 1926','Filmstudie1925','Filmstudie1925_512kb.mp4',M),
  ('Study No. 6','Oskar Fischinger, Germany, 1930','study-no.-6-studie-nr.-6-oskar-fischinger-1930-480p',None,M),
  ('Tusalava','Len Lye, Britain, 1929','tusalava_1929','tusalava_1929.ia.mp4',M),
  ('A Play of Light: Black, White, Grey','László Moholy-Nagy, Germany, 1930','1930LAZSLOMOHOLYNAGYEINLICHTSPIEL',None,M),
  ('Two-Penny Magic','Hans Richter, Germany, 1929','zweigroschenzauber-aka-two-pence-magic_1929',None,M)]),
 ('dreams','Dreams before breakfast','Hats that fly away and a funeral that turns into a chase. Dada at its most playful.',[
  ('Ghosts Before Breakfast','Hans Richter, Germany, 1928','ghosts_before_breakfast','Vormittagsspuk.mp4',M),
  ('Entr’acte','René Clair and Francis Picabia, France, 1924','silent-entracte',None,M),
  ('The Madness of Doctor Tube','Abel Gance, France, 1915','silent-la-folie-du-docteur-tube-aka-the-madness-of-doctor-tube',None,M),
  ('Inflation','Hans Richter, Germany, 1928','inflation_1928',None,M),
  ('The Life and Death of 9413, a Hollywood Extra','Robert Florey and Slavko Vorkapich, America, 1928','the-life-and-death-of-9413-a-hollywood-extra_1928',None,M)]),
 ('city','City poems','Towers, traffic and rain. Films that look at a place and never explain it.',[
  ('The Tower','René Clair, France, 1928','la-tour_1928',None,M),
  ('Studies in Movement','Joris Ivens, filmed in Paris, 1928','tudes-de-mouvements-aka-studies-in-movement_1928',None,M),
  ('Kino-Pravda No. 19','Dziga Vertov, Soviet Union, 1924','silent-kino-pravda-no-19--chernoe-more--ledovityi-okean--moskva',None,M),
  ('Tokyo March (what survives)','Kenji Mizoguchi, Japan, 1929','tokyo-march-1929-480p',None,M),
  ('Twenty-Four-Dollar Island','Robert Flaherty, America, 1927','twentyfourdollar-island_1928',None,M)]),
 ('shadows','Paper shadows','Puppets, cut paper and silhouettes from Moscow, Tokyo and Paris.',[
  ('Wash ’Em Clean','Maria Benderskaya, Soviet Union, 1927','Moydodir','Moydodir.ia.mp4',M),
  ('Tale of Crab Temple','Japan, about 1925','silent-tale-of-crab-temple','Tale of Crab Temple.mp4',M),
  ('Our Baseball Game','Yasuji Murata, Japan, 1930','oira-no-yakyu_1930','oira-no-yakyu_1930.ia.mp4',M),
  ('The Monkey Masamune','Yasuji Murata, Japan, 1930','sarumasamune-aka-the-monkey-masamune_1930',None,M),
  ('Village Festival','Noburō Ōfuji, Japan, 1930','jido-shoka-eiga-muramatsuri_1930',None,M),
  ('The Frogs Who Wanted a King','Ladislas Starevich, France, 1922','silent-the-frogs-who-wanted-a-king',None,M),
  ('Danse macabre','Dudley Murphy, America, 1922','silent-danse-macabre',None,M),
  ('The Ghost of Slumber Mountain','Willis O’Brien, America, 1918','silent-the-ghost-of-slumber-mountain',None,M)]),
 ('faraway','Far away, long ago','Short records of the world before 1930.',[
  ('Laborer’s Love','Zhang Shichuan, China, 1922','RomanceDoVendedorDeFrutasChina1922',None,M),
  ('Travels of Cornélio Pires','Cornélio Pires, Brazil, 1925','ViagensDeCornlioPires1925',None,M),
  ('An Outing to Playa Ancha','Maurice Massonnier, Chile, 1903','paseoaplayaanchachile1903',None,M),
  ('Jaffa Gate, Jerusalem','Lumière, 1897','JaffaGateJerusalem1897',None,M),
  ('Dancers of the Cambodian Court','Lumière, about 1900','silent-danseuses-cambodgiennes-du-roi-norodom',None,M),
  ('Nubia, Wadi Halfa and the Second Cataract','Charles Urban, Britain, 1911, in early colour','1911-kinemacolor-nubia-wadi-halfa-and-the-second-cataract',None,M),
  ('Trip to Brazil','Charles Urban, Britain, 1910','trip-to-brazil-charles-urban-ing-1910',None,M)]),
 ('machine','The machine hums','Factories, telephones and instruments, filmed with more beauty than their sponsors needed.',[
  ('Steel: A Symphony of Industry','American Iron and Steel Institute, 1936','SteelASy1936','SteelASy1936.mp4',0),
  ('Master Hands, part 1','Jam Handy for Chevrolet, America, 1936','MasterHa1936','MasterHa1936.mp4',0),
  ('Principles of Electro-Magnetism','America, 1927','74PrinciplesOfElectroMagnetismParts1and2',None,M),
  ('Sound Waves and Their Sources','ERPI Classroom Films, America, 1933','SoundWavesAn','SoundWavesAn.mp4',0),
  ('It Started with Muybridge','United States Navy, 1965','gov.dod.dimoc.25029','gov.dod.dimoc.25029_512kb.mp4',0),
  ('Skylab: Space Station I','NASA, 1974','Skylab-SpaceStationI','Jsc651Skylab_spaceStationI_512kb.mp4',0)]),
 ('odd','Odd little films','Short films made to sell or teach something, which turned out stranger than anyone meant.',[
  ('A Case of Spring Fever','Jam Handy for Chevrolet, America, 1940','CaseofSp1940','CaseofSp1940_512kb.mp4',0),
  ('Hired!','Jam Handy for Chevrolet, America, 1940','Hired1940','Hired1940_512kb.mp4',0),
  ('Out of This World','General Motors, America, 1954','OutofThi1954','OutofThi1954_512kb.mp4',0),
  ('The Home Economics Story','Iowa State College, America, 1951','HomeEcon1951','HomeEcon1951_512kb.mp4',0),
  ('Brazil Gets the News','Office of Inter-American Affairs, America, 1942','BrazilGe1942','BrazilGe1942_512kb.mp4',0),
  ('Gracias Amigos','Office of Inter-American Affairs, America, 1944','GraciasA1944','GraciasA1944_512kb.mp4',0),
  ('The Grain That Built a Hemisphere','Walt Disney for the United States government, 1943','TheGrainThatBuiltAHemisphere','TheGrainThatBuiltAHemisphere.mp4',0)]),
 ('toons','Saturday cartoons','Colour cartoons of the 1930s and 40s whose copyrights were never renewed.',[
  ('Somewhere in Dreamland','Fleischer Studios, America, 1936','SomewhereInDreamland_24',None,0),
  ('The Cobweb Hotel','Fleischer Studios, America, 1936','the_cobweb_hotel','the_cobweb_hotel_512kb.mp4',0),
  ('Dancing on the Moon','Fleischer Studios, America, 1935','Dancing_On_The_Moon_1935','Dancing_On_The_Moon_1935_512kb.mp4',0),
  ('Christmas Comes But Once a Year','Fleischer Studios, America, 1936','Christmas_Comes_But_Once_A_Year_1936','Christmas_Comes_But_Once_A_Year_1936_512kb.mp4',0),
  ('Balloon Land','Ub Iwerks, America, 1935','BalloonLand_450','BalloonLand.mp4',0),
  ('Jack Frost','Ub Iwerks, America, 1934','JackFrost_','JackFrost_512kb.mp4',0),
  ('The Sunshine Makers','Van Beuren Studios, America, 1935','The_Sunshine_Makers_1935','The_Sunshine_Makers_1935_512kb.mp4',0),
  ('To Spring','William Hanna for MGM, America, 1936','24.-to-spring-1936',None,0),
  ('The Dover Boys at Pimento University','Chuck Jones, America, 1942','the-dover-boys-at-pimento-university',None,0)]),
 ('matinee','Matinee classics','Feature films whose copyrights were not renewed. They carry the attitudes of their day.',[
  ('His Girl Friday','Howard Hawks, America, 1940','his_girl_friday','his_girl_friday_512kb.mp4',0),
  ('The Little Princess','Walter Lang, America, 1939','little_princess','little_princess_512kb.mp4',0),
  ('My Favorite Brunette','Elliott Nugent, America, 1947','my_favorite_brunette','my_favorite_brunette_512kb.mp4',0),
  ('Angel and the Badman','James Edward Grant, America, 1947','angel_and_the_badman','angel_and_the_badman_512kb.mp4',0),
  ('The Flying Deuces','Laurel and Hardy, America, 1939','TheFlyingDeuces','The_Flying_Deuces_512kb.mp4',0),
  ('Meet John Doe','Frank Capra, America, 1941','meet_john_doe_ipod','meet_john_doe_512kb.mp4',0)]),
 ('late','The late, late show','Cheap science fiction and rubber monsters from the 1950s. Not for the smallest viewers.',[
  ('Teenagers from Outer Space','Tom Graeff, America, 1959','teenagers_from_outerspace','Teenagers_from_Outer_Space_512kb.mp4',0),
  ('The Killer Shrews','Ray Kellogg, America, 1959','The_Killer_Shrews','The_Killer_Shrews_512kb.mp4',0),
  ('The Giant Gila Monster','Ray Kellogg, America, 1959','giant_gila_monster','giant_gila_monster_512kb.mp4',0),
  ('The Phantom Planet','William Marshall, America, 1961','Phantom_Planet','The_Phantom_Planet_512kb.mp4',0),
  ('Plan 9 from Outer Space','Edward D. Wood Jr., America, 1959','plan-9-from-outer-space','plan-9-from-outer-space.mp4',0),
  ('Killers from Space','W. Lee Wilder, America, 1954','Killers_from_space','Killers_from_space_512kb.mp4',0),
  ('Phantom from Space','W. Lee Wilder, America, 1953','Phantom_From_Space','Phantom_From_Space_512kb.mp4',0),
  ('The Little Shop of Horrors','Roger Corman, America, 1960','The_Little_Shop_of_Horrors.mpeg','The_Little_Shop_of_Horrors_512kb.mp4',0)]),
 ('long','Long silent evenings','Silent features for a long sitting.',[
  ('Days of Youth','Yasujirō Ozu, Japan, 1929','1929-days-of-youth','1929-Days_of_Youth.mp4',M),
  ('People on Sunday','Siodmak, Ulmer, Wilder and Zinnemann, Germany, 1930','peopleOnSundaymenschenAmSonntag1930','PeopleOnSunday1930.mp4',M)])]
MAX_MB=520
def secs(v):
    try:
        v=str(v)
        if ':' in v:
            p=[float(x) for x in v.split(':')];return int(sum(x*60**i for i,x in enumerate(reversed(p))))
        return int(float(v))
    except Exception:return 0
def clock(s):m=max(1,round(s/60));return '%d min'%m if m<60 else '%d hr %d min'%(m//60,m%60) if m%60 else '%d hr'%(m//60)
def check(job):
    cid,(t,by,iid,want,mute)=job
    try:meta=json.loads(curl('https://archive.org/metadata/'+urllib.parse.quote(iid)).stdout or b'{}')
    except Exception:meta={}
    F=[f for f in meta.get('files',[]) if f.get('name','').lower().endswith('.mp4')]
    f=next((x for x in F if x['name']==want),None) or (min(F,key=lambda x:int(x.get('size',1e12))) if F else None)
    if not f:return cid,None,(t,iid,'no mp4')
    mb=int(f.get('size',0))/1e6;d=secs(f.get('length') or next((x.get('length') for x in meta.get('files',[]) if x.get('length')),0))
    if mb>MAX_MB:return cid,None,(t,iid,'%d MB'%mb)
    url='https://archive.org/download/'+urllib.parse.quote(iid)+'/'+urllib.parse.quote(f['name'])
    h=subprocess.run(['curl','-sL','--max-time','40','-A',UA,'-r','0-1023','-o','/dev/null','-w','%{http_code} %{content_type}',url],capture_output=True).stdout.decode()
    if not h.startswith(('200','206')) or 'video' not in h:return cid,None,(t,iid,'no answer: '+h)
    e={'t':t,'by':by,'len':clock(d) if d else '','id':iid,'f':f['name'],'d':d}
    if mute:e['mute']=1
    print('ok  %-48s %5d s %4d MB'%(t[:48],d,mb),flush=True);return cid,e,None
def main():
    from concurrent.futures import ThreadPoolExecutor
    jobs=[(cid,f) for cid,_,_,films in C for f in films]
    with ThreadPoolExecutor(8) as ex:res=list(ex.map(check,jobs))
    out=[];bad=[b for _,e,b in res if b]
    for cid,name,about,films in C:
        L=[e for c,e,_ in res if c==cid and e]
        if L:out.append({'id':cid,'name':name,'about':about,'films':L})
    json.dump({'made':'tools/library_build.py','shelves':out},open(os.path.join(ROOT,'movieroom','library.json'),'w'),ensure_ascii=False,separators=(',',':'))
    print(sum(len(s['films']) for s in out),'films in',len(out),'collections');[print('LEFT OUT',b) for b in bad]
if __name__=='__main__':main()
