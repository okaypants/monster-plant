#!/usr/bin/env python3
"""Cuts Tofu's extra poses (art_src/tofu_poses.png: Jackie's sheet in the old cat's style, twelve poses on magenta) into
old_cat/cat_<pose>.png, at the old cat's own size (his sitting pose is 218 px tall). Background removal and sizing only.
Small loose marks beside a pose (the flick lines by the annoyed tail) are left out: Tofu shows mood by posture, with no
expression marks. leap_l is leap_r mirrored. Run: python3 tools/tofu_cut.py"""
import os
from PIL import Image,ImageOps
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# pose: its box on the sheet (x, y, w, h). The second pose on the sheet (sitting, front view) is the sit he already has.
BOX={'stand_side':(38,100,298,224),'stalk':(709,165,324,150),'pounce':(1109,78,296,249),'playbow':(40,406,280,262),'leap_r':(383,420,337,207),
 'groom1':(790,405,221,262),'groom2':(1133,401,219,266),'annoyed':(61,781,242,231),'back':(433,751,211,263),'belly':(713,802,298,207),'eat':(1097,829,314,180)}
SCALE=218/248 # the sheet's sitting cat is 248 px tall
a=np.asarray(Image.open(os.path.join(ROOT,'art_src','tofu_poses.png')).convert('RGB')).astype(np.int32)
for n,(x,y,w,h) in BOX.items():
    p=8;c=a[y-p:y+h+p,x-p:x+w+p];bg=np.abs(c-np.array([250,0,250])).sum(2)<200
    lab,k=nd.label(bg);edge=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0);bg=nd.binary_dilation(np.isin(lab,list(edge)),iterations=1)
    fl,k=nd.label(~bg);sizes=nd.sum(~bg,fl,range(1,k+1));keep=fl==(1+int(np.argmax(sizes))) # the cat itself, without loose marks
    near=nd.binary_dilation(~keep,iterations=3)&keep;pink=near&((c[...,0]-c[...,1]>70)&(c[...,2]-c[...,1]>70))
    idx=nd.distance_transform_edt(~keep|pink,return_distances=False,return_indices=True);c=c.copy();c[pink]=c[idx[0][pink],idx[1][pink]]
    ys,xs=np.where(keep);im=Image.fromarray(np.dstack([c,np.where(keep,255,0)]).astype(np.uint8)[ys.min():ys.max()+1,xs.min():xs.max()+1],'RGBA')
    pm=np.asarray(im).astype(float);pm[...,:3]*=pm[...,3:]/255
    sm=np.asarray(Image.fromarray(pm.astype(np.uint8),'RGBA').resize((round(im.width*SCALE),round(im.height*SCALE)),Image.LANCZOS)).astype(float)
    A=sm[...,3:];rgb=np.where(A>0,sm[...,:3]*255/np.maximum(A,1),0).clip(0,255);out=Image.fromarray(np.dstack([rgb,np.where(A>=128,255,0)]).astype(np.uint8),'RGBA')
    out.save(os.path.join(ROOT,'old_cat','cat_'+n+'.png'),optimize=True);print(n,out.size)
    if n=='leap_r':ImageOps.mirror(out).save(os.path.join(ROOT,'old_cat','cat_leap_l.png'),optimize=True)
