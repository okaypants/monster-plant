#!/usr/bin/env python3
"""Cuts the holiday decorations out of Jackie's ten sheets (art_src/decor/sheetNN.png, Nov 25) into decor/<occasion>_<space>.png.
Each sheet has three occasions, one per row, and in each row four things from left to right, one for each space in the room:
  w  the window: a garland, made exactly as wide as the window's opening between the open curtains
  s  the shelf: a small upright thing, made to fit the bookcase cubby where the framed cat stands
  d  the desk: a low, wide thing, made to fit between the radio and the desk lamp and under the lamp's head
  f  the floor: a large thing, made about the size of the pumpkin
(Autumn and Christmas have no floor thing here: the pumpkin and the tree are theirs.)
Each thing is found by its own outline (parts that nearly touch count as one), cut whole and scaled with hard edges. Each garland
also gets a second picture with its little lights gone dim, for when they blink. The shape of the window's opening is saved too.
Run: python3 tools/decor_build.py"""
import os,sys,json
import numpy as np,scipy.ndimage as nd
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import room_build as rb
ROOT=rb.ROOT;SRC=os.path.join(ROOT,'art_src','decor');OUT=os.path.join(ROOT,'decor')
SHEETS=[['newyear','lny','valentine'],['hina','holi','nowruz'],['blossom','easter','songkran'],['eid','kodomo','vesak'],['juneteenth','midsummer','pride'],
 ['tanabata','obon','autumn'],['midautumn','chuseok','diwali'],['halloween','muertos','harvest'],['advent','hanukkah','solstice'],['christmas','kwanzaa','birthday']]
NO_FLOOR={'autumn','christmas'}
FIT_W=236 # every garland is exactly this wide
FIT={'s':(78,80),'d':(124,64),'f':(118,128)} # the most room a shelf, desk or floor thing may take (width, height)
BASE={'s':.4,'d':.36,'f':.5} # and its usual scale, used when that is smaller
WIN_BOX=(240,118,660,560) # the part of the room the window and its curtains are in
TOL=110 # only what is very near the sheet's magenta is background, so pinks in the art are kept
PINK_GLOW={('halloween','w')} # drawn with a pink glow behind it, which is too near the sheet's magenta to keep: cut more boldly
def tidy(im,fit=None):
    """Drops stray specks (any island of fewer than 14 pixels that is not joined to the thing itself), trims the picture to what is
    left, and if that is still bigger than its space allows, makes it fit."""
    a=np.asarray(im).copy();lab,n=nd.label(a[...,3]>0);sz=nd.sum(np.ones(lab.shape),lab,range(1,n+1))
    for i in range(1,n+1):
        if sz[i-1]<14:a[lab==i,3]=0
    ys,xs=np.where(a[...,3]>0);out=Image.fromarray(a[ys.min():ys.max()+1,xs.min():xs.max()+1],'RGBA')
    if fit and (out.width>fit[0] or out.height>fit[1]):
        k=min(fit[0]/out.width,fit[1]/out.height);out=out.resize((max(1,int(out.width*k)),max(1,int(out.height*k))),Image.NEAREST)
    return out
def lights(im,occ=''):
    """Which pixels of a garland are lights. Only real lights count: the small pale round bulbs strung on the cord, and on the
    Christmas garland its coloured bulbs. Flags, flowers, lanterns, paper banners and the rest are not lights, however pale.
    A bulb is a small, round, filled, pale blob that hangs within a few pixels of the gold cord. The garlands are drawn evenly
    left and right, so where a bulb is found its twin on the other side counts too, even if it touches something pale."""
    a=np.asarray(im).astype(int);rgb=a[...,:3];al=a[...,3]>0;H,W=al.shape;out=np.zeros((H,W),bool)
    if occ=='christmas':
        yy=np.arange(H)[:,None];gold=(rgb[...,0]>200)&(rgb[...,1]>150)&(rgb[...,2]<110);return al&(rgb.sum(2)>170)&~gold&(yy>H*.3)
    gold=al&(rgb[...,0]>200)&(rgb[...,1]>140)&(rgb[...,2]<120)&(rgb[...,0]-rgb[...,2]>110)
    top=np.array([np.argmax(gold[:,x]) if gold[:,x].any() else -1 for x in range(W)],float)
    pale=al&(rgb[...,0]>215)&(rgb[...,1]>185)&(rgb[...,2]>60)&~gold;lab,n=nd.label(pale);found=[]
    for i,sl in enumerate(nd.find_objects(lab),1):
        m=lab[sl]==i;h,w=m.shape;t=top[sl[1]];t=t[t>=0]
        if 9<=w<=16 and 9<=h<=16 and abs(w-h)<=3 and m.sum()>=.6*w*h and len(t) and sl[0].start-np.median(t)<=12:out[sl]|=m;found.append(sl)
    for sl in found:
        tw=(sl[0],slice(W-sl[1].stop,W-sl[1].start));m=pale[tw]
        if not out[tw].any() and m.sum()>=.6*m.size:out[tw]|=m
    return out
def dim(im,occ=''):
    """The garland with its lights gone dim (see lights). A garland with no lights comes back unchanged, so it never blinks."""
    a=np.asarray(im).astype(float);m=lights(im,occ);a[...,:3][m]=a[...,:3][m]*.45+np.array([24,18,30]);return Image.fromarray(a.astype(np.uint8),'RGBA')
WALL_BOX=(1040,34,1440,236) # the bare wall above the right-hand shelves, down to the top shelf
def wall_mask(room=None):
    """decor/wallmask.png: where that stretch of wall is bare wallpaper. The second garland is drawn only through it, so it hangs
    on the wall behind the shell, the sampler and the plant's leaves and never covers them."""
    if room is None:room=np.asarray(Image.open(os.path.join(ROOT,'room2.png')).convert('RGBA')).astype(int)
    x0,y0,x1,y1=WALL_BOX;s=room[y0:y1,x0:x1];r,g,b=s[...,0],s[...,1],s[...,2]
    paper=(r<95)&(g>35)&(g<150)&(b>55)&(b<175)&(b>r+12)&(g>r) # the wallpaper's blue-greens, dots included
    paper=nd.binary_opening(nd.binary_closing(paper,iterations=2),iterations=2)
    lab,cnt=nd.label(paper);m=lab==np.bincount(lab[paper]).argmax() # the one big stretch of wall, not blue-green bits inside things
    m=nd.binary_erosion(nd.binary_fill_holes(m)&paper|m,iterations=1)
    out=np.zeros(s.shape[:2]+(4,),np.uint8);out[m]=255;Image.fromarray(out,'RGBA').save(os.path.join(OUT,'wallmask.png'),optimize=True)
def build():
    os.makedirs(OUT,exist_ok=True);meta={}
    for n,occ in enumerate(SHEETS,1):
        a=np.asarray(Image.open(os.path.join(SRC,f'sheet{n:02d}.png')).convert('RGB')).astype(np.int32);fg=~rb.magenta(a,TOL)
        lab,cnt=nd.label(nd.binary_dilation(fg,iterations=3));boxes=[]
        for i in range(1,cnt+1):
            ys,xs=np.where((lab==i)&fg)
            if len(ys)>900:boxes.append([int(xs.min()),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)])
        want=[3 if o in NO_FLOOR else 4 for o in occ]
        # a thing drawn in two parts side by side (a cucumber horse beside an aubergine cow, a candle beside a flower) is one thing:
        # while there are too many, the two that stand closest side by side at the same height are joined
        while len(boxes)>sum(want):
            best=None
            for u in range(len(boxes)):
                for v in range(len(boxes)):
                    A,B=boxes[u],boxes[v]
                    if u==v or A[0]>B[0]:continue
                    ov=min(A[1]+A[3],B[1]+B[3])-max(A[1],B[1]);gap=B[0]-(A[0]+A[2])
                    if ov>.4*min(A[3],B[3]) and (best is None or gap<best[0]):best=(gap,u,v)
            _,u,v=best;A,B=boxes[u],boxes[v];x0,y0=min(A[0],B[0]),min(A[1],B[1]);M=[x0,y0,max(A[0]+A[2],B[0]+B[2])-x0,max(A[1]+A[3],B[1]+B[3])-y0]
            boxes=[b for k,b in enumerate(boxes) if k not in (u,v)]+[M]
        assert len(boxes)==sum(want),(n,len(boxes),sum(want),boxes)
        # rows by height on the sheet: the garlands, always the leftmost thing, mark the three rows
        left=sorted(sorted(boxes,key=lambda b:b[0])[:3],key=lambda b:b[1]);rows=[[],[],[]]
        for b in boxes:rows[int(np.argmin([abs((b[1]+b[3]/2)-(l[1]+l[3]/2)) for l in left]))].append(b)
        for o,r,k in zip(occ,rows,want):
            assert len(r)==k,(n,o,len(r),k)
            for kind,(bx,by,bw,bh) in zip('wsdf',sorted(r,key=lambda b:b[0])):
                sc=FIT_W/bw if kind=='w' else min(BASE[kind],FIT[kind][0]/bw,FIT[kind][1]/bh)
                im=tidy(rb.cut(a,bx,by,bw,bh,sc,holes=True,tol=220 if (o,kind) in PINK_GLOW else TOL),(FIT_W+4,400) if kind=='w' else FIT[kind]);im.save(os.path.join(OUT,f'{o}_{kind}.png'),optimize=True);meta[f'{o}_{kind}']=[im.width,im.height]
                if kind=='w':dim(im,o).save(os.path.join(OUT,f'{o}_w_dim.png'),optimize=True)
    room=np.asarray(Image.open(os.path.join(ROOT,'room2.png')).convert('RGBA')).astype(int);x0,y0,x1,y1=WIN_BOX;s=room[y0:y1,x0:x1];r,g,b=s[...,0],s[...,1],s[...,2]
    glass=(s[...,3]==0)|((r>200)&(b>200)&(g<80));frame=(r>190)&(g>80)&(g<175)&(b<95)&(r-g>55)
    lab,cnt=nd.label(nd.binary_closing(glass|frame,iterations=2));m=nd.binary_fill_holes(lab==np.bincount(lab[glass]).argmax())
    out=np.zeros(s.shape[:2]+(4,),np.uint8);out[m]=255;Image.fromarray(out,'RGBA').save(os.path.join(OUT,'winmask.png'),optimize=True)
    wall_mask(room)
    print(json.dumps(meta));return meta
if __name__=='__main__':build()
