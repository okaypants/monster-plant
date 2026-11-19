#!/usr/bin/env python3
"""Builds the room art from the source pictures in art_src/room2/.

  filled.png  the room with every object painted in, lamps off (window panes and both frames flat magenta)
  sheet1.png  loose objects on magenta: only the trunk's open lid is used from it
  sheet2.png  loose objects on magenta: the crystal ball's mist, the moon dial's faces, the paper cup, the coin
  proto.png   an earlier picture, used only for the small frame's stand-in cat

Writes into the repo root:
  room2.png        the room, window panes see-through, the wind-up cat's cubby empty
  obj_*.png        the few things that are their own pictures (the wind-up cat cut from the room, the cup, the changing faces)
  carry_cup_*.png  the cup as it is carried
  curtains2.png    the closed curtains (a stand-in until they are drawn)
  sash2.png        the bars of the window's bottom row, for when it slides up
Run: python3 tools/room_build.py
"""
import os,json
from PIL import Image
import numpy as np
from scipy import ndimage as nd
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'art_src','room2')
W,H=1670,942
def load(n):return np.asarray(Image.open(os.path.join(SRC,n)).convert('RGB')).astype(np.int32)
def fit(a): # sources are 1671 or 1672 wide and 941 tall: trimmed to 1670, the last row repeated
    a=a[:,:W] if a.shape[1]==1671 else a[:,1:1671];return np.concatenate([a,a[-1:]],0)
def magenta(a,tol=150):return (np.abs(a-np.array([250,0,250])).sum(2)<tol)
def defringe(rgb,hole,ring=3):
    """Pixels beside a cut-out that still carry pink are given the colour of the nearest clean pixel."""
    near=nd.binary_dilation(hole,iterations=ring)&~hole
    pink=near&((rgb[...,0]-rgb[...,1]>70)&(rgb[...,2]-rgb[...,1]>70))
    bad=hole|pink
    idx=nd.distance_transform_edt(bad,return_distances=False,return_indices=True)
    out=rgb.copy();out[pink]=rgb[idx[0][pink],idx[1][pink]];return out
TOY=(54,352,140,438) # the wind-up cat's place in its cubby (left, top, right, bottom)
def build_room():
    a=fit(load('filled.png'));m=magenta(a);m=nd.binary_opening(m,iterations=1)
    lab,n=nd.label(m);keep=np.zeros_like(m);frames=[]
    for i,s in enumerate(nd.find_objects(lab),1):
        if (lab[s]==i).sum()<400:continue
        keep|=lab==i
        if s[1].start>640:frames.append(s)
    a=defringe(a,keep);alpha=np.where(keep,0,255).astype(np.uint8)
    # the frames: stand-in pictures until the real ones are drawn (the small one is the cat from an earlier prototype)
    p=load('proto.png')[348:462,739:893]
    for s in frames:
        hole=keep[s];h,w=hole.shape
        if w<180:
            cat=np.asarray(Image.fromarray(p.astype(np.uint8)).resize((w,h),Image.LANCZOS)).astype(np.int32);a[s][hole]=cat[hole]
        else:a[s][hole]=np.array([36,34,74])
        alpha[s][hole]=255
    # the wind-up cat comes out of the picture: its cubby's back is one flat colour, so the gap is that colour
    x0,y0,x1,y1=TOY;reg=a[y0:y1,x0:x1];bg=np.median(reg[2:10,2:8].reshape(-1,3),0)
    isbg=np.abs(reg-bg).sum(2)<30;lab,n=nd.label(isbg);edge=set(lab[0])|set(lab[:,0]);edge.discard(0)
    back=np.isin(lab,list(edge))
    toy=np.dstack([reg,np.where(back,0,255)]).astype(np.uint8)
    ys,xs=np.where(toy[...,3]>0);toy=toy[ys.min():ys.max()+1,xs.min():xs.max()+1]
    Image.fromarray(toy,'RGBA').save(os.path.join(ROOT,'obj_toy.png'),optimize=True)
    meta={'toy':[int(x0+xs.min()),int(y0+ys.min()),int(toy.shape[1]),int(toy.shape[0])]}
    a[y0:y1,x0:x1]=bg
    out=np.dstack([a.astype(np.uint8),alpha]);Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'room2.png'),optimize=True)
    win=keep.copy();win[:,640:]=False;ys,xs=np.where(win);meta['panes']=[int(xs.min()),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)]
    meta['frames']=[[int(s[1].start),int(s[0].start),int(s[1].stop-s[1].start),int(s[0].stop-s[0].start)] for s in frames]
    return out,meta
# name: (sheet, x, y, w, h, scale). Scales are set so each lines up with the same object as it is painted in the room.
CUTS={'trunk_open':(1,465,286,254,207,.42),
 'ball2':(2,273,62,149,177,.46),'ball3':(2,486,62,150,177,.46),'ball4':(2,697,62,150,177,.46),'ball5':(2,908,62,150,177,.46),
 'moon1':(2,58,298,177,169,.56),'moon2':(2,285,298,178,169,.56),'moon3':(2,505,298,178,169,.56),'moon4':(2,727,298,178,168,.56),'moon5':(2,948,298,178,169,.56),
 'toy_r1':(2,41,516,170,153,.5),'toy_r2':(2,253,514,169,155,.5),'toy_l1':(2,448,516,169,153,.5),'toy_l2':(2,648,514,169,155,.5),'toy_d1':(2,880,514,105,160,.5),'toy_d2':(2,1070,516,106,158,.5),
 'cup':(2,1221,305,135,151,.3),'coin':(2,681,735,147,150,.14)}
def cut(sheet,x,y,w,h,sc,pad=6):
    a=sheet[max(0,y-pad):y+h+pad,max(0,x-pad):x+w+pad];bg=magenta(a,200)
    lab,n=nd.label(bg);edge=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0)
    out=np.isin(lab,list(edge)) # only the magenta that reaches the edge of the cut is background (a pink crystal ball stays)
    pure=(a[...,0]>225)&(a[...,2]>225)&(a[...,1]<60);out|=nd.binary_opening(pure,iterations=1)
    out=nd.binary_dilation(out,iterations=1)
    rgb=defringe(a,out,2);al=np.where(out,0,255)
    ys,xs=np.where(al>0);rgb=rgb[ys.min():ys.max()+1,xs.min():xs.max()+1];al=al[ys.min():ys.max()+1,xs.min():xs.max()+1]
    im=Image.fromarray(np.dstack([rgb,al]).astype(np.uint8),'RGBA')
    nw,nh=max(1,round(im.width*sc)),max(1,round(im.height*sc))
    pm=np.asarray(im).astype(float);pm[...,:3]*=pm[...,3:]/255
    sm=np.asarray(Image.fromarray(pm.astype(np.uint8),'RGBA').resize((nw,nh),Image.LANCZOS)).astype(float)
    A=sm[...,3:];rgb=np.where(A>0,sm[...,:3]*255/np.maximum(A,1),0).clip(0,255);A=np.where(A>=128,255,0) # hard edges, as everywhere in the game
    return Image.fromarray(np.dstack([rgb,A]).astype(np.uint8),'RGBA')
def build_objs():
    sh={1:load('sheet1.png'),2:load('sheet2.png')}
    for n,(s,x,y,w,h,sc) in CUTS.items():cut(sh[s],x,y,w,h,sc).save(os.path.join(ROOT,'obj_'+n+'.png'),optimize=True)
    return sh
def build_carry(sh2):
    """The cup as it is carried: upright, tipped, and pouring (a pre-made tipped frame and a plain stream of water; the game only swaps frames).
    Laid out like the old carafe frames (365 x 303, the stream ending at 336,230) so the pouring code is unchanged."""
    cup=cut(sh2,1442,305,134,151,1.0)
    def frame(angle,cx,cy,stream):
        c=Image.new('RGBA',(365,303),(0,0,0,0));r=cup.rotate(-angle,resample=Image.NEAREST,expand=True)
        if stream:
            px=c.load()
            for y in range(150,231):
                for x in range(326,344):
                    edge=x<329 or x>340
                    px[x,y]=(26,20,48,255) if edge else ((214,240,250,255) if x<333 else (126,196,232,255))
        c.alpha_composite(r,(cx-r.width//2,cy-r.height//2));return c
    frame(0,182,151,False).save(os.path.join(ROOT,'carry_cup_up.png'),optimize=True)
    frame(35,236,130,False).save(os.path.join(ROOT,'carry_cup_tilt.png'),optimize=True)
    frame(105,262,112,True).save(os.path.join(ROOT,'carry_cup_pour.png'),optimize=True)
def build_curtains(room):
    """STAND-IN until the closed curtains are drawn (reports/Monster Plant art prompts.md, A1): plain cloth in the open curtains' own
    colours, hung straight across the window. One whole-room layer; the lamp, the vine and the armchair stay in front of it."""
    a=room[...,:3].astype(np.int32);out=np.zeros((H,W,4),np.uint8)
    x0,x1,top,bot=250,640,132,552;ink=(26,20,48);cloth=(252,232,196);stripe=(240,160,104);band=(44,84,170)
    out[top:bot,x0:x1,:3]=cloth;out[top:bot,x0:x1,3]=255
    for x in range(x0+20,x1,30):out[top:bot,x:x+4,:3]=stripe
    for y0 in (152,164,500,514):out[y0:y0+6,x0:x1,:3]=band
    out[bot-5:bot,x0:x1,:3]=ink;out[top:bot,x0:x0+5,:3]=ink;out[top:bot,x1-5:x1,:3]=ink;out[top:bot,443:447,:3]=ink
    yy,xx=np.mgrid[0:H,0:W]
    front=(((xx-230)/96.0)**2+((yy-368)/90.0)**2<=1)|((xx>=208)&(xx<=250)&(yy>=250)) # the floor lamp
    front|=(xx>=444)&(yy>=474+np.clip((490-xx)*1.3,0,70)) # the armchair's back
    r,g,b2=a[...,0],a[...,1],a[...,2];leaf=((g>r+8)&(g>b2+40))&(xx<300)&(yy<340);front|=nd.binary_dilation(leaf,iterations=4) # the vine
    out[front,3]=0
    Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'curtains2.png'),optimize=True)
def build_sash(room,panes):
    """The lower sash (the bottom row of panes): only its bars and rails, so it can slide up for Sloth's paw. Its pixels are the room's
    own that lie between the panes of that row; the curtains and the armchair in front of it are left out."""
    al=room[...,3]==0;px,py,pw,ph=panes;x0,x1=px,px+pw
    col=al[py:py+ph,px+pw//2-30];rows=[];on=False
    for i,v in enumerate(col): # the rows of panes, down the middle column
        if v and not on:rows.append([py+i,py+i]);on=True
        elif v:rows[-1][1]=py+i
        else:on=False
    rows=[r for r in rows if r[1]-r[0]>20];y0=rows[-2][1]+1;y1=py+ph+2;m=np.zeros((H,W),bool)
    for y in range(y0,y1):
        xs=np.where(al[y,x0:x1])[0]
        if len(xs):m[y,x0+xs.min():x0+xs.max()+1]=True
    for x in range(x0,x1):
        ys=np.where(al[rows[-2][0]:y1,x])[0]
        if len(ys):m[max(y0,rows[-2][0]+ys.min()):rows[-2][0]+ys.max()+1,x]=True
    m&=~al;out=room.copy();out[...,3]=np.where(m,255,0)
    Image.fromarray(out[y0:y1,x0:x1],'RGBA').save(os.path.join(ROOT,'sash2.png'),optimize=True)
    return {'sash':[int(x0),int(y0),int(x1-x0),int(y1-y0)],'rise':int(rows[-1][0]-rows[-2][0]),'rows':rows}
if __name__=='__main__':
    room,meta=build_room();sh=build_objs();build_carry(sh[2]);build_curtains(room);meta.update(build_sash(room,meta['panes']))
    print(json.dumps(meta))
