#!/usr/bin/env python3
"""Writes js/viewerdata.js, the viewfinder's stereo cards, from tools/viewer_captions.py (each card's title, who published it and
when), and works out where the two pictures on each card line up, for looking through the viewer. The cards themselves are viewer/cardNN.jpg, numbered in the same order.
Run: python3 tools/viewer_build.py"""
import json,os
from viewer_captions import CARDS
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from scipy import ndimage as nd
from PIL import Image
def stereo(path):
    """Where the same view sits in each half of a stereo card: [left x, left y, right x, right y, width, height] in the card's pixels.
    The card is cut down the middle, and the right half is slid over the left until the two pictures agree best (the brightness
    patterns are matched at every small shift). The window is the middle of each half, clear of the mount and any printed captions.
    Looking through the viewer swaps between the two windows, so whatever is at the matched distance holds still and nearer and
    farther things shift, which is what gives the picture its depth."""
    im=Image.open(path).convert('L');W,H=im.size;hw=W//2;a=np.asarray(im,float)
    x0,x1,y0,y1=int(hw*.20),int(hw*.83),int(H*.15),int(H*.82);L=a[y0:y1,x0:x1];L=L-L.mean();best=(-9,0,0)
    for dy in range(-16,17,2):
        for dx in range(-int(hw*.3),int(hw*.16)+1,2): # a wide search: on many cards the right picture sits well to the left of where a cut down the middle puts it
            xa,ya=hw+x0+dx,y0+dy
            if xa<x1 or xa+(x1-x0)>W or ya<0 or ya+(y1-y0)>H:continue
            R=a[ya:ya+(y1-y0),xa:xa+(x1-x0)];R=R-R.mean();c=float((L*R).sum()/((L*L).sum()**.5*(R*R).sum()**.5+1e-9))
            if c>best[0]:best=(c,dx,dy)
    c,dx,dy=best
    for ddy in (-1,0,1): # then to the single pixel
        for ddx in (-1,0,1):
            xa,ya=hw+x0+dx+ddx,y0+dy+ddy
            if xa<x1 or xa+(x1-x0)>W or ya<0 or ya+(y1-y0)>H:continue
            R=a[ya:ya+(y1-y0),xa:xa+(x1-x0)];R=R-R.mean();cc=float((L*R).sum()/((L*L).sum()**.5*(R*R).sum()**.5+1e-9))
            if cc>c:c,bx,by=cc,dx+ddx,dy+ddy
            else:bx,by=locals().get('bx',dx),locals().get('by',dy)
    return [x0,y0,hw+x0+bx,y0+by,x1-x0,y1-y0],round(c,3)
def whole(path,s):
    """Widens the matched window to the whole photograph (Jackie, Nov 26: "the image in the viewfinder ... is still zoomed in weird";
    the window was the middle of each half, which cut the picture's edges off). Two photographs side by side can each be no wider
    than the distance between them, so the window is opened to that width about its own middle and to the card's full height,
    and then rows and columns that are nothing but mount are taken off its edges. The mount's colour is read from the card's top
    and bottom edges and from the strip between the photographs. The two windows keep the matched offset, so what lined up
    before still does."""
    lx,ly,rx,ry,w,h=s;dx,dy=rx-lx,ry-ly;a=np.asarray(Image.open(path).convert('RGB')).astype(int);H,W=a.shape[:2]
    cx=lx+w/2;L=int(round(cx-dx/2))+2;R=int(round(cx+dx/2))-2;L=max(L,2,2-dx);R=min(R,W-2-dx,W-2);t=max(2,2-dy);b=min(H-2,H-2-dy)
    xm=int(round(cx+dx/2));M=np.median(a[ly:ly+h,max(0,xm-1):xm+2].reshape(-1,3),0)
    E=np.concatenate([a[int(H*.02):int(H*.05)].reshape(-1,3),a[int(H*.95):int(H*.98)].reshape(-1,3)]);M2=np.median(E,0)
    mount=(np.abs(a-M).sum(2)<60)|(np.abs(a-M2).sum(2)<60)
    both=lambda y0,y1,x0,x1:min(mount[y0:y1,x0:x1].mean(),mount[y0+dy:y1+dy,x0+dx:x1+dx].mean())>.8 # mount in both photographs' windows
    while t<ly and both(t,t+1,L,R):t+=1
    while b>ly+h and both(b-1,b,L,R):b-=1
    while L<lx and both(t,b,L,L+1):L+=1
    while R>lx+w and both(t,b,R-1,R):R-=1
    # Better, where the card allows it: the photograph found directly (Jackie, Nov 26, with screenshots: the window sat off the
    # photograph and showed mount and captions). A pixel counts as picture if it is not the mount's colour or has detail in it,
    # and only where the matching pixel of the other photograph counts too, which drops lettering printed on the mount beside or
    # under one photograph. The photograph is the unbroken run of columns, then rows, that are mostly picture.
    G=a.sum(2).astype(float);gr=np.zeros_like(G);gr[:,1:]+=np.abs(np.diff(G,axis=1));gr[1:,:]+=np.abs(np.diff(G,axis=0))
    C=((np.abs(a-M2).sum(2)>60)&(np.abs(a-M).sum(2)>45))|(nd.uniform_filter(gr,5)>26)
    P=np.zeros_like(C);ya,yb=max(0,-dy),min(H,H-dy);P[ya:yb,:W-dx]=C[ya:yb,:W-dx]&C[ya+dy:yb+dy,dx:]
    def run(prof,lo,hi,seed,thr=.38,gap=.035):
        """the run of positions around seed where prof>thr, stepping over gaps shorter than gap of the span"""
        g=max(2,int((hi-lo)*gap));ok=prof>thr
        if not ok[lo:hi].any():return None
        if not ok[seed]:
            near=np.where(ok[lo:hi])[0]+lo;seed=int(near[np.argmin(np.abs(near-seed))])
        x0=x1=seed
        while True:
            n=[x for x in range(max(lo,x0-g),x0) if ok[x]]
            if not n:break
            x0=n[0]
        while True:
            n=[x for x in range(x1+1,min(hi,x1+1+g)) if ok[x]]
            if not n:break
            x1=n[-1]
        return x0,x1+1
    cxm=int(cx);rr=run(P[int(H*.2):int(H*.8)].mean(0),max(0,cxm-dx),min(W-dx,cxm+dx),cxm)
    if rr and dx*.5<rr[1]-rr[0]:
        x0,x1=rr
        if x1-x0>dx-2: # two photographs that touch: no wider than the distance between them, about the run's middle
            m=(x0+x1)//2;x0,x1=m-(dx-2)//2,m+(dx-2)//2
        cc=run(P[:,x0:x1].mean(1),0,H,int(ly+h/2))
        if cc and cc[1]-cc[0]>H*.4:L,R,t,b=x0+2,x1-2,cc[0]+2,cc[1]-2
    return [int(L),int(t),int(L+dx),int(t+dy),int(R-L),int(b-t)]
# Cards where the photograph is not found well by the rules above: its place set by eye, as parts of the card's width and height
# (left, top, right, bottom of the left-hand photograph). The right-hand window is the same one moved by the matched offset.
BY_EYE={2:(.085,.07,.49,.87),7:(.065,.15,.46,.9),9:(.08,.09,.48,.89),10:(.09,.11,.455,.85),16:(.06,.06,.485,.92),23:(.06,.31,.40,.84),
 29:(.075,.07,.485,.87),30:(.085,.06,.48,.88),31:(.055,.05,.495,.82),51:(.065,.05,.49,.93),54:(.07,.05,.48,.92)}
def by_eye(path,s,f):
    W,H=Image.open(path).size;dx,dy=s[2]-s[0],s[3]-s[1];L,t,R,b=round(f[0]*W),round(f[1]*H),round(f[2]*W),round(f[3]*H)
    R=min(R,L+dx-2,W-2-dx);t=max(t,2,2-dy);b=min(b,H-2,H-2-dy);return [L,t,L+dx,t+dy,R-L,b-t]
out=[]
for n,(t,by,d) in enumerate(CARDS):
    f='card%02d.jpg'%(n+1);o={'f':f,'t':t,'by':by,'d':d};pth=os.path.join(ROOT,'viewer',f)
    if os.path.exists(pth):o['s'],fit=stereo(pth);o['s']=by_eye(pth,o['s'],BY_EYE[n+1]) if n+1 in BY_EYE else whole(pth,o['s']);print(f,o['s'],fit)
    out.append(o)
miss=[c['f'] for c in out if not os.path.exists(os.path.join(ROOT,'viewer',c['f']))];assert not miss,miss
s="'use strict';\n// made by tools/viewer_build.py from tools/viewer_captions.py: do not edit by hand\nconst VIEW_CARDS="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{','},\n {')+";\n"
open(os.path.join(ROOT,'js','viewerdata.js'),'w').write(s);print(len(out),'cards')
