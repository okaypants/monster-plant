#!/usr/bin/env python3
"""Cuts the holiday decorations out of Jackie's sheets (art_src/decor/sheetN.webp: nine objects each on magenta, three rows of three)
into decor/<name>.png. Each object is found by its own outline, cut whole and scaled with hard
edges. Garlands are all made the width of the window, where they hang; desk and wall things are kept to the size of the room's own small objects.
Run: python3 tools/decor_build.py"""
import os,sys,json
import numpy as np
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import room_build as rb
import scipy.ndimage as nd
ROOT=rb.ROOT;SRC=os.path.join(ROOT,'art_src','decor');OUT=os.path.join(ROOT,'decor')
SCALE={'S':.27,'W':.27} # the usual size of a desk or wall thing
FIT_H=236 # every garland is exactly this wide: the width of the window's opening between the open curtains
FIT={'S':(78,80),'W':(90,88)} # the most room a standing thing or a wall thing may take (width, height): a standing thing has to fit the bookcase cubby where the framed cat stands
WIN_BOX=(240,118,660,560) # the part of the room the window and its curtains are in
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
            sc=FIT_H/bw if kind=='H' else min(SCALE[kind],FIT[kind][0]/bw,FIT[kind][1]/bh) # sized to its place, so no one thing outweighs its neighbours
            im=rb.cut(a,bx,by,bw,bh,sc,holes=True,tol=TOL);im.save(os.path.join(OUT,name+'.png'),optimize=True);meta[name]=[kind,im.width,im.height]
    # the string lights with their bulbs gone dim, for when they blink: everything below the cord is darkened, the dark outline left alone
    p=os.path.join(OUT,'xmas_lights.png')
    if os.path.exists(p):
        im=np.asarray(Image.open(p).convert('RGBA')).astype(float);rgb=im[...,:3];sat=rgb.max(2)-rgb.min(2);gold=(rgb[...,0]>200)&(rgb[...,1]>150)&(rgb[...,2]<110)
        bulb=(im[...,3]>0)&(rgb.sum(2)>170)&~gold&(np.arange(im.shape[0])[:,None]>im.shape[0]*.3);rgb[bulb]=rgb[bulb]*.42+np.array([20,16,30])
        Image.fromarray(im.astype(np.uint8),'RGBA').save(os.path.join(OUT,'xmas_lights_dim.png'),optimize=True)
    # the window's opening between the open curtains: its glass and its wooden bars, and nothing of the curtains. A garland hung inside the
    # window is drawn only through this shape, so the curtains stay in front of it.
    room=np.asarray(Image.open(os.path.join(ROOT,'room2.png')).convert('RGBA')).astype(int);x0,y0,x1,y1=WIN_BOX;s=room[y0:y1,x0:x1];r,g,b=s[...,0],s[...,1],s[...,2]
    glass=(s[...,3]==0)|((r>200)&(b>200)&(g<80));frame=(r>190)&(g>80)&(g<175)&(b<95)&(r-g>55)
    lab,cnt=nd.label(nd.binary_closing(glass|frame,iterations=2));m=nd.binary_fill_holes(lab==np.bincount(lab[glass]).argmax())
    out=np.zeros(s.shape[:2]+(4,),np.uint8);out[m]=255;Image.fromarray(out,'RGBA').save(os.path.join(OUT,'winmask.png'),optimize=True);meta['winmask']=[x0,y0,int(m.sum())]
    print(json.dumps(meta));return meta
if __name__=='__main__':build()
