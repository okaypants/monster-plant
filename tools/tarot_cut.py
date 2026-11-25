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
 's11':[None,None]+S('P',1,4),'s12':S('P',5,10),'s13':[None,None]+S('P',11,14),'fixes':['S12','S13','S14',None,'W03'],'last3':['M00','M16','C06'],'fix2':['S04','W05',None,None,None,'W11'],'fix3':[None,None,'W09'],'fix4':['W10'],'fix5':['W06']}
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
# The one change made to a drawing by hand (Jackie, Nov 25: "nine of wands has ten wands"): the middle wand of the row behind the fox is
# painted over with the card's own pink, so nine are left. Above the fox that is a plain block of pink the width of the wand; where the
# wand ran down between the fox's ears, only the yellow and its soft edge are painted, never the fox's orange.
ERASE={'W09':(144,176,156,172,(250,2,137))} # left, right, where the fox's ears begin, where the wand ends, the pink
def erase(card,x0,x1,y_fox,y_end,fill):
    c=np.asarray(card.convert('RGB')).astype(int).copy();c[:y_fox,x0:x1]=fill
    part=c[y_fox:y_end,x0:x1];part[(part[...,1]>150)&(part[...,2]<170)]=fill
    band=c[y_fox-2:y_end,x0-4:x1+4];notpink=np.abs(band-np.array(fill)).sum(2)>60;thin=notpink&~nd.binary_opening(notpink,structure=np.ones((1,4),bool));band[thin]=fill # hair-thin leftovers of the wand's edge
    return Image.fromarray(c.astype(np.uint8),'RGB').convert('RGBA')
BACK='navy' # which colour of the back the deck wears
def backs():
    """The back (Jackie, Nov 25: "I want the design based on the actual ryder waithe"): the roses and lilies of the 1909 deck's back, drawn by
    Jackie in the cards' style as a framed ornament of vines, in four colours (backs.webp: navy, pink, purple, cyan). It is a little wider
    than the cards, so each is fitted by its width and its own flat ground colour is added in equal parts above and below; nothing of the
    drawing is trimmed. All four are saved (tarot/back_<colour>.png); back.png is the one in use."""
    im=Image.open(os.path.join(SRC,'backs.webp')).convert('RGB');a=np.asarray(im).astype(int);bx=cards(a);assert len(bx)==4,len(bx)
    for (x0,y0,x1,y1),name in zip(bx,['navy','pink','purple','cyan']):
        sm=im.crop((x0+2,y0+2,x1-2,y1-2));sm=sm.resize((W,round(sm.height*W/sm.width)),Image.LANCZOS);c=np.asarray(sm).astype(int).copy()
        keys,cnt=np.unique((c//8).reshape(-1,3),axis=0,return_counts=True);bg=tuple(int(v) for v in keys[cnt.argmax()]*8+4) # its ground: the colour there is most of
        white=(c.min(2)>236);lab,n=nd.label(white);corners=[l for l in {int(lab[0,0]),int(lab[0,-1]),int(lab[-1,0]),int(lab[-1,-1])} if l]
        c[nd.binary_dilation(np.isin(lab,corners),iterations=3)]=bg # the white outside its own rounded corners takes the ground colour
        c[:6]=bg;c[-6:]=bg # and the soft top and bottom edge, so the added ground joins without a line
        card=Image.new('RGB',(W,H),bg);card.paste(Image.fromarray(c.astype(np.uint8),'RGB'),(0,(H-sm.height)//2));card=card.convert('RGBA');card.putalpha(MASK)
        q=card.quantize(colors=64,method=Image.FASTOCTREE);q.save(os.path.join(OUT,'back_'+name+'.png'),optimize=True)
        if name==BACK:q.save(os.path.join(OUT,'back.png'),optimize=True)
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
    backs()
    print(len(codes),'cards; shapes',min(r for _,r in done),'to',max(r for _,r in done))
if __name__=='__main__':main()
