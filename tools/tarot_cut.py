#!/usr/bin/env python3
"""Cuts the tarot deck out of Jackie's sheets (art_src/tarot/*.webp, drawn in ChatGPT, Nov 25) into tarot/<code>.png.
Each sheet is a few cards on white. The cards are found by the white gaps between them, fitted to 320 x 640 and
given the same rounded corners. SHEETS says which card is where, reading each sheet left to right, top to bottom
(None = a card on that sheet that was redrawn later and is not used).
Run: python3 tools/tarot_cut.py"""
import os
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'art_src','tarot');OUT=os.path.join(ROOT,'tarot');W,H=320,640
M=lambda a,b:['M%02d'%i for i in range(a,b+1)]
S=lambda s,a,b:['%s%02d'%(s,i) for i in range(a,b+1)]
SHEETS={'s01':M(1,6),'s02':M(7,12),'s03':['M13','M14','M15','M17','M18','M19'],'s04':['M20','M21','W01','W02',None,'W04'],'s05':[None,None,'W07','W08',None,None],
 's06':[None]+S('W',12,14)+['C01','C02'],'s07':['C03','C04','C05',None,'C07','C08'],'s08':S('C',9,14),'s09':S('S',1,3)+[None]+S('S',5,6),'s10':S('S',7,11)+[None],
 's11':[None,None]+S('P',1,4),'s12':S('P',5,10),'s13':[None,None]+S('P',11,14),'fixes':['S12','S13','S14',None,'W03'],'last3':['M00','M16','C06'],'fix2':['S04','W05','W06',None,'W10','W11'],'fix3':[None,None,'W09']}
def runs(v,minlen):
    out=[];on=None
    for i,x in enumerate(list(v)+[False]):
        if x and on is None:on=i
        elif not x and on is not None:
            if i-on>=minlen:out.append((on,i))
            on=None
    return out
def cards(a):
    ink=(a[...,2]<243)|(a.sum(2)<735);boxes=[]
    for y0,y1 in runs(ink.sum(1)>a.shape[1]*.04,200):
        for x0,x1 in runs(ink[y0:y1].sum(0)>(y1-y0)*.04,120):
            sub=ink[y0:y1,x0:x1];ys=np.where(sub.sum(1)>(x1-x0)*.5)[0];xs=np.where(sub.sum(0)>(y1-y0)*.5)[0]
            boxes.append((x0+xs.min(),y0+ys.min(),x0+xs.max()+1,y0+ys.max()+1))
    return boxes
from PIL import ImageDraw
MASK=Image.new('L',(W*4,H*4),0);ImageDraw.Draw(MASK).rounded_rectangle((0,0,W*4-1,H*4-1),radius=22*4,fill=255);MASK=MASK.resize((W,H),Image.LANCZOS).point(lambda v:255 if v>=128 else 0) # every card gets the same rounded corners
# The one change made to a drawing by hand (Jackie, Nov 25: "nine of wands has ten wands"): a part of a card painted over with the flat colour
# beside it. code: (left, right, bottom, the colour to paint out as a test, the colour to paint with)
ERASE={'W09':(140,180,158,lambda c:(c[...,0]>200)&(c[...,1]>170)&(c[...,2]<170),(250,2,137))} # the middle wand of the row behind the fox, so nine are left
def erase(card,x0,x1,y1,test,fill):
    c=np.asarray(card.convert('RGB')).astype(int).copy();m=np.zeros(c.shape[:2],bool);m[:y1,x0:x1]=test(c[:y1,x0:x1]);m=nd.binary_dilation(m,iterations=2);m[y1:]=False;m[:,:x0-3]=False;m[:,x1+3:]=False
    c[m]=fill;return Image.fromarray(c.astype(np.uint8),'RGB').convert('RGBA')
def main():
    os.makedirs(OUT,exist_ok=True);done=[]
    for name,codes in SHEETS.items():
        im=Image.open(os.path.join(SRC,name+'.webp')).convert('RGB');a=np.asarray(im).astype(int);bx=cards(a)
        assert len(bx)==len(codes),(name,len(bx),len(codes))
        for (x0,y0,x1,y1),code in zip(bx,codes):
            if not code:continue
            im2=im.crop((x0+2,y0+2,x1-2,y1-2));k=max(W/im2.width,H/im2.height);im2=im2.resize((max(W,round(im2.width*k)),max(H,round(im2.height*k))),Image.LANCZOS)
            if im2.width>W+12: # a card drawn wider than the rest: fitted by its width, and its flat sky carried up to fill the height (nothing is cut from its sides)
                sm=im.crop((x0+2,y0+2,x1-2,y1-2));sm=sm.resize((W,round(sm.height*W/sm.width)),Image.LANCZOS);im2=Image.new('RGB',(W,H));T=28;im2.paste(sm.crop((0,T,W,T+1)).resize((W,H-sm.height+T)),(0,0));im2.paste(sm.crop((0,T,W,sm.height)),(0,H-sm.height+T)) # from below its own rounded corners
            ox=(im2.width-W)//2;card=im2.crop((ox,im2.height-H,ox+W,im2.height)).convert('RGBA') # a card a little taller than the rest loses the extra from its top; the name band always stays
            if code in ERASE:card=erase(card,*ERASE[code])
            card.putalpha(MASK)
            card.quantize(colors=128,method=Image.FASTOCTREE).save(os.path.join(OUT,code+'.png'),optimize=True);done.append((code,round((x1-x0)/(y1-y0),3)))
    codes=sorted(c for c,_ in done);assert len(codes)==78==len(set(codes)),len(codes)
    print(len(codes),'cards; shapes',min(r for _,r in done),'to',max(r for _,r in done))
if __name__=='__main__':main()
