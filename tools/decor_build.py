#!/usr/bin/env python3
"""Cuts the holiday decorations out of Jackie's sheets (art_src/decor/sheetN.webp: nine objects each on magenta, three rows of three)
into decor/<name>.png. Each object is found by its own outline, cut whole and scaled with hard
edges. HANG things (garlands) are scaled to hang under the curtain rod; SIT and WALL things to sit among the room's small objects.
Run: python3 tools/decor_build.py"""
import os,sys,json
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import room_build as rb
import scipy.ndimage as nd
ROOT=rb.ROOT;SRC=os.path.join(ROOT,'art_src','decor');OUT=os.path.join(ROOT,'decor')
SCALE={'H':.62,'S':.27,'W':.27}
TOL=110 # the paper banners have hot pink and purple panels, so only what is very near the sheet's magenta is background
SHEETS={1:[('lny_lanterns','H'),('lny_oranges','S'),('valentine_hearts','H'),('holi_powder','S'),('nowruz_sprouts','S'),('hina_dolls','S'),('easter_eggs','S'),('koinobori','W'),('eid_lantern','S')],
 2:[('vesak_lotus','H'),('tanabata_bamboo','S'),('midsummer_wreath','W'),('obon_lantern','S'),('midautumn_cakes','S'),('rabbit_lantern','S'),('diwali_lamps','H'),('rangoli','W'),('halloween_bats','H')],
 3:[('papel_picado','H'),('marigolds','S'),('harvest_corn','W'),('menorah','S'),('xmas_wreath','W'),('xmas_lights','H'),('parol','W'),('kinara','S'),('solstice_garland','H')],
 4:[('ny_stars','H'),('kagami_mochi','S'),('birthday_bunting','H'),('birthday_cake','S'),('songkran_bowl','S'),('pride_flag','S'),('juneteenth_bunting','H'),('advent_candles','S'),('blossom_jar','S')]}
def build():
    os.makedirs(OUT,exist_ok=True);meta={}
    for n,items in SHEETS.items():
        p=os.path.join(SRC,f'sheet{n}.webp')
        if not os.path.exists(p):continue
        a=np.asarray(Image.open(p).convert('RGB')).astype(np.int32);H,W=a.shape[:2];fg=~rb.magenta(a,TOL)
        # the nine objects: what is not magenta, with close parts joined (a bowl beside its sprouts), then read left to right in three rows
        lab,cnt=nd.label(nd.binary_dilation(fg,iterations=14));boxes=[]
        for i in range(1,cnt+1):
            ys,xs=np.where((lab==i)&fg)
            if len(ys)>1500:boxes.append([int(xs.min()),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)])
        assert len(boxes)==9,(n,len(boxes),boxes)
        boxes.sort(key=lambda b:b[1]+b[3]/2);rows=[sorted(boxes[i:i+3],key=lambda b:b[0]) for i in (0,3,6)];boxes=[b for r in rows for b in r]
        for (name,kind),(bx,by,bw,bh) in zip(items,boxes):
            im=rb.cut(a,bx,by,bw,bh,SCALE[kind],holes=True,tol=TOL);im.save(os.path.join(OUT,name+'.png'),optimize=True);meta[name]=[kind,im.width,im.height]
    print(json.dumps(meta));return meta
if __name__=='__main__':build()
