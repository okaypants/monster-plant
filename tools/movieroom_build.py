#!/usr/bin/env python3
"""The movie room's pictures (Jackie, Nov 26), from her three ChatGPT pictures in art_src/movieroom/:
  open.png            the room with the curtains open, the wall lamps off and the screen flat magenta (the refined picture of Nov 27)
  sconce_l_lit.png, sconce_r_lit.png  the two wall lamps lit, cut from the earlier picture (at 2,118 and 1572,118)
  curtain_closed.png  the stretch between the two shelf units (at 366,98) with the curtains closed
  curtain_half.png    the same stretch with the curtains halfway, magenta showing between them
Writes movieroom/room.png, movieroom/curtain_closed.png and movieroom/curtain_half.png with the magenta made see-through, so the
film playing behind the picture shows through the screen. Nothing else is changed. Run: python3 tools/movieroom_build.py"""
import os
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'art_src','movieroom');OUT=os.path.join(ROOT,'movieroom')
def hole(name):
    a=np.asarray(Image.open(os.path.join(SRC,name)).convert('RGB')).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
    m=(r>150)&(b>150)&(g<110);lab,k=nd.label(m)
    if k:m=lab==(1+int(np.argmax(nd.sum(m,lab,range(1,k+1))))) # the screen itself, not a stray pink pixel
    m=nd.binary_dilation(m,iterations=1) # a pixel into the edge, so no magenta rim is left
    out=np.dstack([a,np.where(m,0,255)]).astype(np.uint8);ys,xs=np.where(m)
    if len(xs):print(name,'screen',xs.min(),ys.min(),xs.max(),ys.max())
    return Image.fromarray(out,'RGBA')
def main():
    os.makedirs(OUT,exist_ok=True)
    hole('open.png').save(os.path.join(OUT,'room.png'),optimize=True);hole('curtain_half.png').save(os.path.join(OUT,'curtain_half.png'),optimize=True)
    Image.open(os.path.join(SRC,'curtain_closed.png')).convert('RGBA').save(os.path.join(OUT,'curtain_closed.png'),optimize=True)
    for n in ('l','r'):Image.open(os.path.join(SRC,'sconce_%s_lit.png'%n)).convert('RGBA').save(os.path.join(OUT,'sconce_%s_lit.png'%n),optimize=True) # the wall lamps lit, laid over the base (where they are off) while the room's lights are up
if __name__=='__main__':main()
