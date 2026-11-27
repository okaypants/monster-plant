#!/usr/bin/env python3
"""Writes js/viewerdata.js, the viewfinder's stereo cards, from tools/viewer_captions.py (each card's title, who published it and
when), and works out where the two pictures on each card line up, for looking through the viewer. The cards themselves are viewer/cardNN.jpg, numbered in the same order.
Run: python3 tools/viewer_build.py"""
import json,os
from viewer_captions import CARDS
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import numpy as np
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
    return [L,t,L+dx,t+dy,R-L,b-t]
out=[]
for n,(t,by,d) in enumerate(CARDS):
    f='card%02d.jpg'%(n+1);o={'f':f,'t':t,'by':by,'d':d};pth=os.path.join(ROOT,'viewer',f)
    if os.path.exists(pth):o['s'],fit=stereo(pth);o['s']=whole(pth,o['s']);print(f,o['s'],fit)
    out.append(o)
miss=[c['f'] for c in out if not os.path.exists(os.path.join(ROOT,'viewer',c['f']))];assert not miss,miss
s="'use strict';\n// made by tools/viewer_build.py from tools/viewer_captions.py: do not edit by hand\nconst VIEW_CARDS="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{','},\n {')+";\n"
open(os.path.join(ROOT,'js','viewerdata.js'),'w').write(s);print(len(out),'cards')
