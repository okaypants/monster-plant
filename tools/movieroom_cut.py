#!/usr/bin/env python3
"""Cuts the movie room's accessories (art_src/movieroom/accessories.png: Jackie's sheet of 24 pieces on magenta, six to a row) into
movieroom/acc_<name>.png. Background removal only; each piece keeps the size it was drawn at. The glow drawn round the lit dimmer
is left out (light is added in the game). Run: python3 tools/movieroom_cut.py"""
import os
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=os.path.join(ROOT,'movieroom')
NAMES=['machine_pop','corn_butter','corn_caramel','corn_cheese','corn_seaweed','corn_charcoal',
 'soda_pour_red','soda_pour_blue','soda_pour_yellow','cup_red','cup_blue','cup_yellow',
 'reel','vhs','bluray','boxset','glasses','remote_on',
 'dimmer_low','dimmer_high','book_open','amp_on','door','door_open']
COLS,ROWS=6,4
def main():
    a=np.asarray(Image.open(os.path.join(ROOT,'art_src','movieroom','accessories.png')).convert('RGB')).astype(np.int32);H,W=a.shape[:2];r,g,b=a[...,0],a[...,1],a[...,2]
    bg=(r>150)&(b>150)&(g<110)
    lab,k=nd.label(bg);bg=nd.binary_dilation(lab==(1+int(np.argmax(nd.sum(bg,lab,range(1,k+1))))),iterations=1)
    fg=~bg;gy0,gx0=3*H//ROWS,1*W//COLS;cell20=np.zeros_like(fg);cell20[gy0:,gx0:gx0+W//COLS]=True
    fg&=~(cell20&(r>215)&(b>105)&(g>95)) # the glow round the lit dimmer
    fl,k=nd.label(fg);sizes=nd.sum(fg,fl,range(1,k+1));cms=nd.center_of_mass(fg,fl,range(1,k+1));parts={}
    for i in range(k): # a piece belongs to the cell its middle is in, so one that leans over a cell's edge stays whole
        if sizes[i]>=40:parts.setdefault(int(cms[i][0]*ROWS/H)*COLS+int(cms[i][1]*COLS/W),[]).append(i+1)
    for cell,n in enumerate(NAMES):
        keep=np.isin(fl,parts[cell])
        if n=='dimmer_high':keep=nd.binary_fill_holes(keep)
        c=a.copy();near=nd.binary_dilation(~keep,iterations=2)&keep;pink=near&(c[...,0]-c[...,1]>70)&(c[...,2]-c[...,1]>70)&(c[...,2]>120)
        idx=nd.distance_transform_edt(~keep|pink,return_distances=False,return_indices=True);c[pink]=c[idx[0][pink],idx[1][pink]]
        ys,xs=np.where(keep);im=Image.fromarray(np.dstack([c,np.where(keep,255,0)]).astype(np.uint8)[ys.min():ys.max()+1,xs.min():xs.max()+1],'RGBA')
        im.save(os.path.join(OUT,'acc_'+n+'.png'),optimize=True);print(n,im.size)
if __name__=='__main__':main()
