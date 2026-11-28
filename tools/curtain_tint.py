#!/usr/bin/env python3
"""movieroom/room_curtains.png: only the tied-back curtains that are painted into the movie room's picture, cut out so a chosen
curtain colour can be laid over them and nothing else (Jackie, Nov 27: "switching curtain colors also colors things around it":
the colour had been laid over the whole rectangle the curtains hang in, rail, screen frame and shelf edges included).
The curtains are the two big red shapes inside that rectangle; their dark fold lines are kept with them. Nothing is drawn.
Run: python3 tools/curtain_tint.py"""
import os
import numpy as np,scipy.ndimage as nd
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));BOX=(366,98,1306,602) # MV.curtain in js/movieroom.js
def main():
    a=np.asarray(Image.open(os.path.join(ROOT,'movieroom','room.png')).convert('RGBA'));r,g,b,al=[a[...,i].astype(int) for i in range(4)]
    red=(al>0)&(r>70)&(g<r*.42)&(b<r*.42);x0,y0,x1,y1=BOX;inbox=np.zeros(red.shape,bool);inbox[y0:y1,x0:x1]=True;red&=inbox
    lab,n=nd.label(nd.binary_closing(red,iterations=3));sz=nd.sum(red,lab,range(1,n+1));keep=np.isin(lab,[i+1 for i in np.argsort(sz)[::-1][:2]])
    m=nd.binary_fill_holes(keep)&(al>0)&inbox&(red|(r+g+b<150)) # the red cloth and its dark fold lines, nothing orange or gold
    out=a.copy();out[~m]=0
    Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'movieroom','room_curtains.png'),optimize=True);ys,xs=np.where(m);print('curtain pixels',int(m.sum()),'from',xs.min(),ys.min(),'to',xs.max(),ys.max(),'sizes',sorted(sz)[-3:])
if __name__=='__main__':main()
