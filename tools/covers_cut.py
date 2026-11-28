#!/usr/bin/env python3
"""Cuts Jackie's second sheet of book covers (books/covers_sheet2.png, Nov 27: the five new books and a cat for the Cats book) into
one picture per book, 42 x 60 pixels and 24 colours each, the same as the first twelve. Each cover is found as one of the six
shapes on the magenta sheet, in reading order. Any magenta left at a rounded corner takes the cover's own border colour.
Run: python3 tools/covers_cut.py"""
import os
import numpy as np,scipy.ndimage as nd
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));B=os.path.join(ROOT,'books')
NAMES=['moderns','detective','poems','odd','small','riddles']
def main():
    a=np.asarray(Image.open(os.path.join(B,'covers_sheet2.png')).convert('RGB')).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
    bg=(r>190)&(b>190)&(g<110);lab,n=nd.label(nd.binary_closing(~bg,iterations=2));sl=[s for i,s in enumerate(nd.find_objects(lab),1) if (lab[s]==i).sum()>40000]
    assert len(sl)==6,len(sl);sl.sort(key=lambda s:(round(s[0].start/300),s[1].start))
    for name,s in zip(NAMES,sl):
        if name in ('moderns','detective','odd'):continue # those three books were taken out of the game
        c=a[s].copy();m=bg[s];edge=c[c.shape[0]//2,3] # the border colour, from the middle of the left edge
        c[m]=edge;im=Image.fromarray(c.astype(np.uint8),'RGB').resize((42,60),Image.LANCZOS).quantize(24,method=Image.MEDIANCUT,dither=Image.NONE).convert('RGB')
        im.save(os.path.join(B,name+'.png'),optimize=True);print(name,s[1].stop-s[1].start,s[0].stop-s[0].start)
if __name__=='__main__':main()
