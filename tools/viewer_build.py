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
    for dy in range(-10,11,2):
        for dx in range(-int(hw*.09),int(hw*.09)+1,2):
            xa,ya=hw+x0+dx,y0+dy
            if xa<hw or xa+(x1-x0)>W or ya<0 or ya+(y1-y0)>H:continue
            R=a[ya:ya+(y1-y0),xa:xa+(x1-x0)];R=R-R.mean();c=float((L*R).sum()/((L*L).sum()**.5*(R*R).sum()**.5+1e-9))
            if c>best[0]:best=(c,dx,dy)
    c,dx,dy=best
    for ddy in (-1,0,1): # then to the single pixel
        for ddx in (-1,0,1):
            xa,ya=hw+x0+dx+ddx,y0+dy+ddy
            if xa<hw or xa+(x1-x0)>W or ya<0 or ya+(y1-y0)>H:continue
            R=a[ya:ya+(y1-y0),xa:xa+(x1-x0)];R=R-R.mean();cc=float((L*R).sum()/((L*L).sum()**.5*(R*R).sum()**.5+1e-9))
            if cc>c:c,bx,by=cc,dx+ddx,dy+ddy
            else:bx,by=locals().get('bx',dx),locals().get('by',dy)
    return [x0,y0,hw+x0+bx,y0+by,x1-x0,y1-y0],round(c,3)
out=[]
for n,(t,by,d) in enumerate(CARDS):
    f='card%02d.jpg'%(n+1);o={'f':f,'t':t,'by':by,'d':d};pth=os.path.join(ROOT,'viewer',f)
    if os.path.exists(pth):o['s'],fit=stereo(pth);print(f,o['s'],fit)
    out.append(o)
miss=[c['f'] for c in out if not os.path.exists(os.path.join(ROOT,'viewer',c['f']))];assert not miss,miss
s="'use strict';\n// made by tools/viewer_build.py from tools/viewer_captions.py: do not edit by hand\nconst VIEW_CARDS="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{','},\n {')+";\n"
open(os.path.join(ROOT,'js','viewerdata.js'),'w').write(s);print(len(out),'cards')
