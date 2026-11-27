#!/usr/bin/env python3
"""The string lights along the top of the wall (Jackie, Nov 26: "string lights all the way across the top very small"), from her sheet
art_src/decor/string_lights.png: six strands on magenta, each drawn lit and, under it, dark.
Writes decor/lights_<name>_on.png and decor/lights_<name>_off.png, the dark strand moved to lie exactly under the lit one (they
were drawn a pixel or two apart), decor/lights.json with where each strand's bulbs are (so single bulbs can be swapped to their
dark picture for a twinkle), and decor/topmask.png: the bare wallpaper along the top of the room, which the strand is drawn
through so it passes behind the hanging plants. Background removal and placing only. Run: python3 tools/lights_build.py"""
import os,json
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'decor')
NAMES=['warm','multi','lantern','star','pastel','ember'];TOP_BOX=(0,30,1670,112) # the strip of wall the lights hang in
def strands():
    a=np.asarray(Image.open(os.path.join(ROOT,'art_src','decor','string_lights.png')).convert('RGB')).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
    fg=~((r>205)&(b>205)&(g<100)&(np.abs(r-b)<45));fg=nd.binary_opening(fg,iterations=1)|(fg&(a.sum(2)<200));rows=np.where(fg.sum(1)>40)[0]
    bands=[];s=rows[0];p=rows[0]
    for y in rows[1:]:
        if y-p>6:bands.append((s,p+1));s=y
        p=y
    bands.append((s,p+1));cnt=fg.sum(1);full=[]
    for y0,y1 in bands: # a lit strand and its dark one drawn touching: parted at the emptiest row between them
        if y1-y0>100:
            lo,hi=y0+int((y1-y0)*.3),y0+int((y1-y0)*.7);m=lo+int(np.argmin(cnt[lo:hi]));full+=[(y0,m),(m,y1)]
        else:full.append((y0,y1))
    bands=full;assert len(bands)==12,bands
    out=[]
    for y0,y1 in bands:
        m=fg[y0:y1];lab,k=nd.label(m);m=nd.binary_fill_holes(lab==(1+int(np.argmax(nd.sum(m,lab,range(1,k+1))))));xs=np.where(m.any(0))[0];x0,x1=xs.min(),xs.max()+1;c=a[y0:y1,x0:x1].copy();k=m[:,x0:x1]
        near=nd.binary_dilation(~k,iterations=3)&k;pink=near&(c[...,0]-c[...,1]>45)&(c[...,2]-c[...,1]>45)&(c[...,2]>70)
        idx=nd.distance_transform_edt(~k|pink,return_distances=False,return_indices=True);c[pink]=c[idx[0][pink],idx[1][pink]]
        out.append(np.dstack([c,np.where(k,255,0)]).astype(np.uint8))
    return out
def top_mask():
    room=np.asarray(Image.open(os.path.join(ROOT,'room2.png')).convert('RGBA')).astype(int);x0,y0,x1,y1=TOP_BOX;s=room[y0:y1,x0:x1];r,g,b=s[...,0],s[...,1],s[...,2]
    paper=(r<95)&(g>35)&(g<150)&(b>55)&(b<175)&(b>r+12)&(g>r);paper=nd.binary_opening(nd.binary_closing(paper,iterations=2),iterations=2)
    lab,k=nd.label(paper);m=lab==(1+int(np.argmax(nd.sum(paper,lab,range(1,k+1)))));m=nd.binary_erosion(nd.binary_fill_holes(m)&paper|m,iterations=1)
    o=np.zeros(s.shape[:2]+(4,),np.uint8);o[m]=255;Image.fromarray(o,'RGBA').save(os.path.join(OUT,'topmask.png'),optimize=True)
def main():
    S=strands();meta={}
    for i,n in enumerate(NAMES):
        on,off=S[2*i],S[2*i+1];H=max(on.shape[0],off.shape[0]);W=max(on.shape[1],off.shape[1])
        pad=lambda q:np.pad(q,((0,H-q.shape[0]),(0,W-q.shape[1]),(0,0)))
        on,off=pad(on),pad(off);A,B=on[...,3]>0,off[...,3]>0;best=(-1,0,0)
        for dy in range(-6,7):
            for dx in range(-6,7):
                sc=(A&np.roll(np.roll(B,dy,0),dx,1)).sum()
                if sc>best[0]:best=(sc,dx,dy)
        _,dx,dy=best;off=np.roll(np.roll(off,dy,0),dx,1)
        # the bulbs: what hangs below the cord. The cord is the thin dark line; a column's bulb is where the strand is tall.
        tall=A.sum(0);cols=tall>np.percentile(tall,45)+4;lab,k=nd.label(cols);bulbs=[]
        for j in range(1,k+1):
            xs=np.where(lab==j)[0]
            if 8<=len(xs)<=60:
                ys=np.where(A[:,xs.min():xs.max()+1].any(1))[0];bulbs.append([int(xs.min())-2,int(ys.min()),int(xs.max()-xs.min())+5,int(ys.max()-ys.min())+1])
        Image.fromarray(on,'RGBA').save(os.path.join(OUT,'lights_%s_on.png'%n),optimize=True);Image.fromarray(off,'RGBA').save(os.path.join(OUT,'lights_%s_off.png'%n),optimize=True)
        meta[n]={'w':W,'h':H,'bulbs':bulbs};print(n,W,H,'shift',dx,dy,len(bulbs),'bulbs')
    json.dump(meta,open(os.path.join(OUT,'lights.json'),'w'),separators=(',',':'));top_mask()
if __name__=='__main__':main()
