#!/usr/bin/env python3
"""Cuts the moon out of each of Johannes Hevelius's 28 engravings of the moon through one month (Selenographia, Danzig, 1647; scans
from the Bibliothèque nationale de France by way of Wikimedia Commons, public domain; art_src/moon/NN.jpg in the book's order) and
works out which night of the lunar month each shows, for the moon page (js/moonpage.js).
Each plate is a circle with the lit part of the moon engraved inside it. The circle is found from where the ink is, the plate is cut
to a square just round it, and nothing in the engraving is changed. The plates are in the book's order through the month, and each one's night is taken from its place in that order (see age()).
Writes moon/hNN.jpg and prints the list of ages. Run: python3 tools/moon_plates.py"""
import os,glob,json,math
import numpy as np,scipy.ndimage as nd
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'art_src','moon');OUT=os.path.join(ROOT,'moon');MONTH=29.530588853;SIZE=360
def one(path):
    g=np.asarray(Image.open(path).convert('L')).astype(float);H,W=g.shape;ink=g<115
    reg=np.zeros_like(ink);reg[int(H*.24):int(H*.9),int(W*.1):int(W*.97)]=True;m=ink&reg
    cols=np.where(m.sum(0)>=2)[0];rows=np.where(m.sum(1)>=2)[0];l,r,t=cols.min(),cols.max(),rows.min();R=(r-l)/2;cx=(l+r)/2;cy=t+R
    pad=R*.06;box=[int(cx-R-pad),int(cy-R-pad),int(cx+R+pad),int(cy+R+pad)]
    return Image.open(path).convert('L').crop(box).resize((SIZE,SIZE),Image.LANCZOS)
def age(i,n=28):
    """The moon's age in days for plate i of the 28. The plates run in order through the month: the first is the empty circle of the
    new moon, the 14th and 15th are the two either side of full, and the last is the thin old crescent. Measuring the lit part of
    each engraving was tried and was not dependable (the engraver leaves the bright plains white), so the ages are spaced evenly
    along each half of the month. That is right to about a day, which is as close as one picture a night can be."""
    return round(i*14.2/13,2) if i<14 else round(15.3+(i-14)*(27.6-15.3)/13,2)
def build():
    os.makedirs(OUT,exist_ok=True);out=[]
    for n,p in enumerate(sorted(glob.glob(os.path.join(SRC,'*.jpg')))):
        f=f'h{n+1:02d}.jpg';one(p).save(os.path.join(OUT,f),quality=82,optimize=True);out.append([f,age(n)])
    print(json.dumps(out));return out
if __name__=='__main__':build()
