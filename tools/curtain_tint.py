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
def closed():
    """movieroom/curtain_cloth.png: the cloth of the closed curtains alone, without the orange frame at their edges, so the chosen
    colour is laid over the cloth and not the frame (Jackie, Nov 27: "The bleeding colors in the curtain are srill a problem with
    they are closed"). Everything inside the outline of the red cloth is kept; nothing is drawn."""
    a=np.asarray(Image.open(os.path.join(ROOT,'movieroom','curtain_closed.png')).convert('RGBA'));r,g,b,al=[a[...,i].astype(int) for i in range(4)]
    red=(al>0)&(r>70)&(g<r*.42)&(b<r*.42);lab,n=nd.label(nd.binary_closing(red,iterations=3));sz=nd.sum(red,lab,range(1,n+1));keep=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>5000])
    m=nd.binary_fill_holes(keep)&(al>0);orange=(g-b>r*.2)&(r>90);m&=~orange;m=nd.binary_opening(m,iterations=2) # the frame's orange (more green in it than the cloth's red has) never counts as cloth, and specks left at the edge go too # the frame's orange never counts as cloth, even where the cloth's outline closes round a bit of it
    out=a.copy();out[~m]=0;Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'movieroom','curtain_cloth.png'),optimize=True);print('closed cloth pixels',int(m.sum()),'of',m.size,'left out',int((~m).sum()))
if __name__=='__main__':main();closed()
