#!/usr/bin/env python3
"""Cuts the white long-haired cat (art_src/house_cat.png: Jackie's sheet of 26 poses on magenta, in the same order as the old
cat's poses, seven to a row) into house_cat/cat_<pose>.png, at the old cat's own size (the sitting pose is 218 px tall).
Background removal and sizing only. Run: python3 tools/house_cat_cut.py"""
import os
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'house_cat')
NAMES=['sit1','sit2','pet1','pet2','yawn','groom1','groom2','loaf1','loaf2','curl1','curl2','side1','side2','belly',
 'walk1','walk2','stand_side','stalk','pounce','playbow','leap_r','leap_l','annoyed','back','eat','glow']
COLS,ROWS=7,4
def main():
    os.makedirs(OUT,exist_ok=True)
    a=np.asarray(Image.open(os.path.join(ROOT,'art_src','house_cat.png')).convert('RGB')).astype(np.int32);H,W=a.shape[:2]
    bg=(a[...,0]-a[...,1]>90)&(a[...,2]-a[...,1]>90)&(np.abs(a[...,0]-a[...,2])<70) # the magenta
    lab,k=nd.label(bg);big=1+int(np.argmax(nd.sum(bg,lab,range(1,k+1))));bg=nd.binary_dilation(lab==big,iterations=1) # the one field of magenta, a pixel into each outline
    fl,k=nd.label(~bg);sizes=nd.sum(~bg,fl,range(1,k+1));cms=nd.center_of_mass(~bg,fl,range(1,k+1));best={}
    for i in range(k):
        cell=int(cms[i][0]*ROWS/H)*COLS+int(cms[i][1]*COLS/W)
        if sizes[i]>best.get(cell,(0,0))[0]:best[cell]=(sizes[i],i+1) # the cat itself, without loose specks
    cut={}
    for cell,n in enumerate(NAMES):
        keep=fl==best[cell][1];near=nd.binary_dilation(~keep,iterations=3)&keep
        pink=near&(a[...,0]-a[...,1]>70)&(a[...,2]-a[...,1]>70)&(a[...,0]>120) # magenta left on the edge takes its neighbour's colour
        idx=nd.distance_transform_edt(~keep|pink,return_distances=False,return_indices=True);c=a.copy();c[pink]=c[idx[0][pink],idx[1][pink]]
        ys,xs=np.where(keep);cut[n]=np.dstack([c,np.where(keep,255,0)]).astype(np.uint8)[ys.min():ys.max()+1,xs.min():xs.max()+1]
    scale=218/cut['sit1'].shape[0]
    for n,px in cut.items():
        pm=px.astype(float);pm[...,:3]*=pm[...,3:]/255;h,w=px.shape[:2]
        sm=np.asarray(Image.fromarray(pm.astype(np.uint8),'RGBA').resize((round(w*scale),round(h*scale)),Image.LANCZOS)).astype(float)
        A=sm[...,3:];rgb=np.where(A>0,sm[...,:3]*255/np.maximum(A,1),0).clip(0,255)
        out=Image.fromarray(np.dstack([rgb,np.where(A>=128,255,0)]).astype(np.uint8),'RGBA');out.save(os.path.join(OUT,'cat_'+n+'.png'),optimize=True);print(n,out.size)
if __name__=='__main__':main()
