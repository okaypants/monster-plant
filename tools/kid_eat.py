#!/usr/bin/env python3
"""Makes baby_NN_eat.png from baby_NN.png: the same kid with its mouth open, for when it is fed (Jackie, Nov 25: "make the kid's mouth
open when it eats"). Every kid is drawn with two dot eyes and a small w-shaped mouth between and just below them. The mouth is found
(the small dark mark between the eyes), painted over in the green beside it, and an open mouth is drawn in its place: a dark round
shape with a pink tongue in its lower half, in the same dark outline colour. Nothing else in the drawing changes.
Run: python3 tools/kid_eat.py"""
import os,sys
import numpy as np,scipy.ndimage as nd
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def one(i):
    p=os.path.join(ROOT,f'baby_{i:02d}.png');a=np.asarray(Image.open(p).convert('RGBA')).copy();rgb=a[...,:3].astype(int);H,W=a.shape[:2]
    dark=(a[...,3]>0)&(rgb.sum(2)<170);lab,n=nd.label(dark);parts=[]
    for k in range(1,n+1):
        ys,xs=np.where(lab==k)
        if 12<=len(ys)<=900 and ys.max()<H*.72:parts.append((len(ys),xs.mean(),ys.mean(),xs.min(),xs.max(),ys.min(),ys.max(),k))
    # the eyes: the biggest pair of round dark marks of about the same size at the same height
    rnd=[q for q in parts if .65<(q[4]-q[3]+1)/(q[6]-q[5]+1)<1.5 and q[0]>=60];best=None
    for u in rnd:
        for v in rnd:
            if u[1]<v[1]-10 and abs(u[2]-v[2])<5 and max(u[0],v[0])/min(u[0],v[0])<1.35 and (best is None or u[0]+v[0]>best[0][0]+best[1][0]):best=(u,v)
    assert best,(i,'no eyes',parts);eyes=best;lx,rx,ey=eyes[0][1],eyes[1][1],(eyes[0][2]+eyes[1][2])/2;eh=eyes[0][6]-eyes[0][5]+1
    mouth=[q for q in parts if q not in eyes and lx<q[1]<rx and ey-3<=q[2]<=ey+eh*1.6 and q[0]<eyes[0][0]*1.2];assert mouth,(i,'no mouth',parts)
    x0=min(q[3] for q in mouth);x1=max(q[4] for q in mouth);y0=min(q[5] for q in mouth);y1=max(q[6] for q in mouth);cx=(x0+x1)//2
    fur=np.median(rgb[y0-4:y0-1,x0:x1+1].reshape(-1,3),0) # the green just above the mouth
    for q in mouth:a[lab==q[7],:3]=fur
    a[max(0,y0-1):y1+2,max(0,x0-1):x1+2,:3]=np.where((a[max(0,y0-1):y1+2,max(0,x0-1):x1+2,:3].astype(int).sum(2,keepdims=True)<420),fur,a[max(0,y0-1):y1+2,max(0,x0-1):x1+2,:3]) # and the mouth's soft edge
    w=max(11,int((x1-x0+1)*.8));h=int(w*1.05);top=y0-1;yy,xx=np.mgrid[0:H,0:W];e=((xx-cx)/(w/2))**2+((yy-(top+h/2))/(h/2))**2
    out=e<=1;rim=out&(e>.55);a[out,:3]=(58,20,34);a[rim,:3]=tuple(int(v) for v in rgb[dark].mean(0)) # dark inside, the drawing's own outline colour round it
    tongue=out&~rim&(yy>top+h*.55);a[tongue,:3]=(236,112,132)
    Image.fromarray(a,'RGBA').save(os.path.join(ROOT,f'baby_{i:02d}_eat.png'),optimize=True);return (x0,y0,x1,y1,w,h)
if __name__=='__main__':
    for i in range(1,17):print(i,one(i))
