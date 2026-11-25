#!/usr/bin/env python3
"""Builds the room art from the source pictures in art_src/room2/.

  filled.png  the room with every object painted in, lamps off (window panes and both frames flat magenta)
  sheet1.png  loose objects on magenta: only the trunk's open lid is used from it
  sheet2.png  loose objects on magenta: the crystal ball's mist, the moon dial's faces, the paper cup, the coin
  bigpic.png  the picture in the big frame
  smallpic.png the picture in the small frame
  curtains.png the curtains drawn closed, on magenta
  views.png   the view from the window in spring, summer, autumn and winter, side by side
  sheet3.png  the jar of mash and the spoon, on magenta (its side-on bassinet is not used)
  sheet5.png  Tofu's cupboard with its door open, and the cat toys, on magenta
  sheet4.png  the bassinet seen from the front, empty and with its blanket up, on magenta

Writes into the repo root:
  room2.png        the room, window panes see-through, the wind-up cat's cubby empty
  obj_*.png        the few things that are their own pictures (the wind-up cat's frames, the cup, the changing faces)
  carry_cup_*.png  the cup as it is carried
  curtains2.png    the closed curtains
  sash2.png        the bars of the window's bottom row, for when it slides up
  obj_nocrate.png  the bit of wall and floor behind the milk crate, for when the bassinet stands there instead
  obj_bass.png, obj_bass_bed.png  the bassinet, and the bassinet with its blanket up
  treat_mash.png   the jar of mash with its spoon
  obj_cup_open.png Tofu's cupboard standing open; cub_*.png the cat toys kept in it
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
"""JACKIE'S COLOUR CHANGES (Nov 19): nine named colours, each with the colour it is now and the colour it should be. The art itself
is not redrawn: every pixel of that colour's family, in that thing's part of the picture, is moved by the same step, so its
shading and its dark outlines stay as drawn."""
def hx(h):return np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
def hsv(a):return np.asarray(Image.fromarray(a.clip(0,255).astype(np.uint8),'RGB').convert('HSV')).astype(float)
def unhsv(h):return np.asarray(Image.fromarray(h.clip(0,255).astype(np.uint8),'HSV').convert('RGB')).astype(np.int32)
def box(shape,x0,y0,x1,y1):m=np.zeros(shape[:2],bool);m[y0:y1,x0:x1]=True;return m
def shift(a,where,src,dst,tol):
    """Every pixel within tol of src (in that part of the picture) moves by the same step as src does, less the further it is from src."""
    src,dst=hx(src),hx(dst);d=np.sqrt(((a-src)**2).sum(2));w=np.clip(1-d/tol,0,1)*where;return (a+(dst-src)*w[...,None]).clip(0,255)
def scale(a,where,src,dst,tol):
    """The same, but each pixel is made darker or lighter in proportion (for wood: its grain and board lines keep their contrast)."""
    src,dst=hx(src),hx(dst);n=a/np.maximum(a.sum(2,keepdims=True),1);ns=src/src.sum();d=np.abs(n-ns).sum(2);w=np.clip(1-d/tol,0,1)*where*(a.sum(2)>90)
    return (a*(1+(dst/src-1)*w[...,None])).clip(0,255)
def greens(a,where):
    """Leaves: any green pixel (more green than red, well more than blue) turns from the yellow-green it was to a deeper, cooler green."""
    s0,d0=hsv(hx('#BCD017')[None,None])[0,0],hsv(hx('#4F7A3A')[None,None])[0,0];h=hsv(a)
    leaf=where&(a[...,1]>a[...,0]+6)&(a[...,1]>a[...,2]+30)&(a.sum(2)>110)
    h2=h.copy();h2[...,0]=h[...,0]+(d0[0]-s0[0]);h2[...,1]=h[...,1]*d0[1]/s0[1];h2[...,2]=h[...,2]*d0[2]/s0[2];out=a.copy();out[leaf]=unhsv(h2)[leaf];return out
def wall_dots(a):
    """The wallpaper's cream dots turn a blue close to the wall's own, so the wall sits back. A dot is a small island on the wall:
    everything that is not wall colour is grouped into islands, and only the little ones (a dot with its dark centre) are dots.
    Furniture, lamps and pictures are big islands, so their own cream parts are left alone."""
    bg,cream,dst=hx('#024359'),hx('#FCE6B7'),hx('#2A6A80');out=a.copy();top,bot=36,548
    island,n=nd.label(np.sqrt(((a-bg)**2).sum(2))>=60);size=nd.sum(np.ones(a.shape[:2]),island,range(1,n+1))
    for i,sl in enumerate(nd.find_objects(island),1):
        if size[i-1]>520 or sl[0].start<top or sl[0].stop>bot:continue
        y0,y1,x0,x1=max(0,sl[0].start-3),sl[0].stop+3,max(0,sl[1].start-3),sl[1].stop+3;r=a[y0:y1,x0:x1]
        if (np.sqrt(((r-cream)**2).sum(2))<70).sum()<8:continue # an island with no cream in it is not a dot
        t=((r-bg)*(cream-bg)).sum(2)/((cream-bg)**2).sum();off=np.sqrt(((r-(bg+t[...,None]*(cream-bg)))**2).sum(2)) # how far along from wall to cream each pixel is
        m=(off<60)&(t>.08)&nd.binary_dilation(island[y0:y1,x0:x1]==i,iterations=2);out[y0:y1,x0:x1][m]=(bg+np.clip(t,0,1)[...,None]*(dst-bg))[m]
    return out
def recolour(a):
    a=a.astype(float);sh=a.shape
    a=greens(a,box(sh,0,20,300,345)|box(sh,1405,30,1670,480)|box(sh,1160,262,1302,495)) # the two pothos and the shelf plant
    a=wall_dots(a)
    rug=box(sh,150,760,1500,935)
    a=shift(a,rug,'#AE1B1D','#8A2E26',110);a=shift(a,rug,'#F4CA79','#D8B47E',90)
    floor=box(sh,0,742,1670,942)
    a=scale(a,floor,'#C66E42','#94502F',.09)
    a=scale(a,box(sh,1208,540,1372,782),'#F2A557','#F7C48C',.12) # the desk chair
    a=shift(a,box(sh,756,548,910,770),'#2C2B29','#24323F',46) # the mini fridge
    return a.clip(0,255).astype(np.int32)
def nudge(a,x0,y0,x1,y1,dx):
    """Moves one painted thing sideways on the wall (Jackie, Nov 19: the shell sat too far left of the drum machine). Its pixels are
    whatever in the box is not wall; the gap it leaves is plain wall."""
    bg=hx('#024359');reg=a[y0:y1,x0:x1].astype(float);far=np.sqrt(((reg-bg)**2).sum(2));m=nd.binary_fill_holes(nd.binary_closing(far>=62,iterations=2))
    lab,n=nd.label(m);m=lab==(1+int(np.argmax(nd.sum(m,lab,range(1,n+1))))) # the thing itself, not a stray wallpaper dot
    wall=np.median(reg[far<30],0);piece=reg[m].copy();a[y0:y1,x0:x1][nd.binary_dilation(m,iterations=5)]=wall;a[y0:y1,x0+dx:x1+dx][m]=piece;return a # the gap takes the wall's own colour just there, a little past the thing's edge
TOY=(54,352,140,438) # the wind-up cat's place in its cubby (left, top, right, bottom)
def build_room():
    a=recolour(fit(load('filled.png')));a=nudge(a,1054,140,1176,227,34);m=magenta(a);m=nd.binary_opening(m,iterations=1)
    lab,n=nd.label(m);keep=np.zeros_like(m);frames=[]
    for i,s in enumerate(nd.find_objects(lab),1):
        if (lab[s]==i).sum()<400:continue
        keep|=lab==i
        if s[1].start>640:frames.append(s)
    a=defringe(a,keep);alpha=np.where(keep,0,255).astype(np.uint8)
    # the frames: Jackie's pictures, each sized to cover its opening (bigpic.png the tree, smallpic.png Tofu asleep)
    for s in frames:
        hole=keep[s];h,w=hole.shape;t=Image.open(os.path.join(SRC,'smallpic.png' if w<180 else 'bigpic.png')).convert('RGB')
        k=max(w/t.width,h/t.height);t=t.resize((round(t.width*k),round(t.height*k)),Image.BOX);ox,oy=(t.width-w)//2,(t.height-h)//2
        a[s][hole]=np.asarray(t.crop((ox,oy,ox+w,oy+h))).astype(np.int32)[hole];alpha[s][hole]=255
    # the wind-up cat comes out of the picture: its cubby's back is one flat colour, so the gap is that colour
    x0,y0,x1,y1=TOY;reg=a[y0:y1,x0:x1];bg=np.median(reg[2:10,2:8].reshape(-1,3),0)
    isbg=np.abs(reg-bg).sum(2)<30;lab,n=nd.label(isbg);edge=set(lab[0])|set(lab[:,0]);edge.discard(0)
    back=np.isin(lab,list(edge))
    toy=np.dstack([reg,np.where(back,0,255)]).astype(np.uint8)
    ys,xs=np.where(toy[...,3]>0);toy=toy[ys.min():ys.max()+1,xs.min():xs.max()+1]
    meta={'toy':[int(x0+xs.min()),int(y0+ys.min()),int(toy.shape[1]),int(toy.shape[0])]}
    a[y0:y1,x0:x1]=bg
    out=np.dstack([a.astype(np.uint8),alpha]);Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'room2.png'),optimize=True)
    win=keep.copy();win[:,640:]=False;ys,xs=np.where(win);meta['panes']=[int(xs.min()),int(ys.min()),int(xs.max()-xs.min()+1),int(ys.max()-ys.min()+1)]
    meta['frames']=[[int(s[1].start),int(s[0].start),int(s[1].stop-s[1].start),int(s[0].stop-s[0].start)] for s in frames]
    return out,meta
# name: (sheet, x, y, w, h, scale). Scales are set so each lines up with the same object as it is painted in the room.
CUTS={'trunk_open':(1,465,286,254,207,.42),
 'ball2':(2,273,62,149,177,.475),'ball3':(2,486,62,150,177,.475),'ball4':(2,697,62,150,177,.475),'ball5':(2,908,62,150,177,.475),
 'moon1':(2,58,298,177,169,.56),'moon2':(2,285,298,178,169,.56),'moon3':(2,505,298,178,169,.56),'moon4':(2,727,298,178,168,.56),'moon5':(2,948,298,178,169,.56),
 'toy_h1':(2,41,516,170,153,.56),'toy_h2':(2,253,514,169,155,.56), # in its cubby: as big as the cubby allows
 'toy_r1':(2,41,516,170,153,.82),'toy_r2':(2,253,514,169,155,.82),'toy_l1':(2,448,516,169,153,.82),'toy_l2':(2,648,514,169,155,.82),'toy_d1':(2,880,514,105,160,.82),'toy_d2':(2,1070,516,106,158,.82), # out of it: bigger (Jackie, Nov 18)
 'cup':(2,1221,305,135,151,.19),'coin':(2,681,735,147,150,.14)}
def cut(sheet,x,y,w,h,sc,pad=6,holes=False): # holes: magenta shut in by the thing (the gap under the bassinet) is background too
    a=sheet[max(0,y-pad):y+h+pad,max(0,x-pad):x+w+pad];bg=magenta(a,200)
    lab,n=nd.label(bg);edge=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0)
    out=np.isin(lab,list(edge)) # only the magenta that reaches the edge of the cut is background (a pink crystal ball stays)
    pure=(a[...,0]>225)&(a[...,2]>225)&(a[...,1]<60);out|=nd.binary_opening(pure,iterations=1)
    if holes:out|=nd.binary_opening(bg,iterations=1)
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
    """The closed curtains (curtains.png: Jackie's, on magenta, drawn with their rod). Only the cloth is used, since the rod is already
    in the room; it is sized to hang from under the rod to just below the sill, across both open curtains. One whole-room layer;
    the floor lamp, the vine and the armchair stay in front of it."""
    a=room[...,:3].astype(np.int32);c=load('curtains.png');bg=magenta(c,200)
    lab,n=nd.label(bg);edge=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]);edge.discard(0);bg=nd.binary_dilation(np.isin(lab,list(edge)),iterations=1)
    c=defringe(c,bg,2);fg=~bg;wide=fg.sum(1);rodrows=np.where(wide>=wide.max()*.96)[0] # the rod is the widest thing in the picture
    top=int(rodrows.max())+1;top+=int(np.argmax(wide[top:]>wide[top:].max()*.9)) # the cloth starts under the rod, where it reaches its full width
    bot=int(np.where(wide>0)[0].max())+1;xs=np.where(fg[top+20:bot-20].any(0))[0];l,r=int(xs.min()),int(xs.max())+1
    cloth=np.dstack([c[top:bot,l:r],np.where(bg[top:bot,l:r],0,255)]).astype(np.uint8)
    x0,x1,y0,y1=244,648,128,556
    pm=cloth.astype(float);pm[...,:3]*=pm[...,3:]/255;sm=np.asarray(Image.fromarray(pm.astype(np.uint8),'RGBA').resize((x1-x0,y1-y0),Image.LANCZOS)).astype(float)
    A=sm[...,3:];rgb=np.where(A>0,sm[...,:3]*255/np.maximum(A,1),0).clip(0,255);A=np.where(A>=128,255,0)
    out=np.zeros((H,W,4),np.uint8);out[y0:y1,x0:x1]=np.dstack([rgb,A]).astype(np.uint8)
    yy,xx=np.mgrid[0:H,0:W]
    # WHAT STAYS IN FRONT OF THE CLOTH (Jackie, Nov 25: with the curtains drawn "some of the imagery is offset"). The floor lamp and the armchair
    # were kept in front by an oval and a slanted line, which did not match them: beside the lamp's shade and at the armchair's corner the
    # open curtains showed through, like a second, shifted picture. Each is now its own true shape, read from the room: everything reached
    # from a point inside it without crossing its dark outline, plus that outline.
    opaque=room[...,3]>0;lit=(a.sum(2)>300)&opaque
    def shape(seed,box):
        x0,y0,x1,y1=box;sub=lit[y0:y1,x0:x1];lab,n=nd.label(sub);l=lab[seed[1]-y0,seed[0]-x0];m=np.zeros((H,W),bool)
        if l and (lab==l).sum()<sub.size*.85:m[y0:y1,x0:x1]=nd.binary_dilation(lab==l,iterations=4)
        return m
    front=shape((230,360),(130,244,332,476))|shape((232,242),(200,218,264,264))|shape((231,500),(204,452,262,566)) # the floor lamp: shade, top, pole
    front|=shape((600,540),(436,466,770,566))|shape((470,560),(424,520,520,566)) # the armchair's back, and the throw over its arm
    assert front.sum()>20000,front.sum()
    r_,g_,b_=a[...,0],a[...,1],a[...,2];leaf=((g_>r_+8)&(g_>b_+40))&(xx<300)&(yy<340);front|=nd.binary_dilation(leaf,iterations=4) # the vine
    out[front&(room[...,3]>0),3]=0 # never a gap of bare window: where the glass is, the cloth always hangs
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
def build_views(panes):
    """The view from the window, one picture per season (views.png: four panels side by side, each inside a dark border).
    Each is cut out of its border and sized to cover the window's panes. Daylight only: the game tints them for golden hour and night."""
    a=load('views.png');dark=a.sum(2)<120;cols=np.where(dark.sum(0)>a.shape[0]*.5)[0];rows=np.where(dark.sum(1)>a.shape[1]*.2)[0]
    runs=[];
    for c in cols:
        if runs and c-runs[-1][1]<=3:runs[-1][1]=c
        else:runs.append([c,c])
    assert len(runs)==8,runs;y0,y1=rows.min(),rows.max();pw,ph=panes[2],panes[3]
    for n,(l,r) in zip(['spring','summer','autumn','winter'],zip(runs[0::2],runs[1::2])):
        im=Image.fromarray(a[y0+8:y1-7,l[1]+4:r[0]-3].astype(np.uint8));k=max(pw/im.width,ph/im.height)
        im=im.resize((round(im.width*k),round(im.height*k)),Image.BOX);ox=(im.width-pw)//2;oy=(im.height-ph)//2
        im=im.crop((ox,oy,ox+pw,oy+ph));v0=np.asarray(im).astype(float);im=Image.fromarray(greens(v0,np.ones(v0.shape[:2],bool)).astype(np.uint8)) # the tree's leaves take the same deeper green as the plants indoors
        im.save(os.path.join(ROOT,'view_'+n+'.png'),optimize=True)
        # the same view with its sky taken out (the tree and any clouds only), so the game can put a sunset or a night sky behind it
        v=np.asarray(im).astype(np.int32);q=(v//8).reshape(-1,3);keys,cnt=np.unique(q,axis=0,return_counts=True);sky=keys[cnt.argmax()]*8+4
        m=np.abs(v-sky).sum(2)<70 # every bit of sky, the small gaps between leaves too
        # and the rim: where sky meets a leaf, the picture has in-between pixels that are still bluish. By day they are invisible; against a
        # night sky they showed as a faint pale outline round everything in the window (Jackie, Nov 25). Bluish pixels touching the sky go too.
        blue=(v[...,2]>v[...,0]+28)&(v[...,1]>v[...,0]+8)&(np.abs(v-sky).sum(2)<260)
        for _ in range(3):m|=nd.binary_dilation(m,iterations=1)&blue
        m|=blue&(np.abs(v-sky).sum(2)<170) # and small patches of sky shut in between leaves
        Image.fromarray(np.dstack([v,np.where(m,0,255)]).astype(np.uint8),'RGBA').save(os.path.join(ROOT,'viewfg_'+n+'.png'),optimize=True)
CRATE=[(238,633),(381,622),(437,651),(435,770),(288,785),(238,754)] # the milk crate's outline in the room, a little generous
def build_bassinet(room):
    """The bassinet stands where the milk crate does while a monster is young (Jackie, Nov 23). The crate is painted into the room, so
    a patch of what is behind it is made: the panelled wall carries on down from just above the crate (each column keeps its own
    colour, so the panel lines run on), and the skirting and the floor carry on from just right of it (each row keeps its colour)."""
    from PIL import ImageDraw
    a=room[...,:3].astype(np.int32);mk=Image.new('L',(W,H),0);ImageDraw.Draw(mk).polygon(CRATE,fill=255);m=np.asarray(mk)>0
    ys,xs=np.where(m);x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1;x1+=(x1-x0)%2
    ref=a[:,437:441].reshape(H,-1,3);row=np.median(ref,1) # just right of the crate, under the throw's tassels: wall, skirting, floor
    wallc=np.median(a[600:616,x0:x1],0) # the wall above the crate, column by column
    wall_end=int(np.argmax(np.abs(row[700:]-row[700]).sum(1)>40))+700 # the row where the wall gives way to the skirting
    out=np.zeros((y1-y0,x1-x0,4),np.uint8)
    for y in range(y0,y1):
        out[y-y0,:,:3]=wallc if y<wall_end else row[y]
    out[...,3]=np.where(m[y0:y1,x0:x1],255,0)
    Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'obj_nocrate.png'),optimize=True)
    sh4=load('sheet4.png');sc=.47 # the bassinet seen from the front, its hood at the back (Jackie, Nov 23: the side view "looks kind of dumb sideways")
    cut(sh4,371,82,424,489,sc,holes=True).save(os.path.join(ROOT,'obj_bass.png'),optimize=True)
    cut(sh4,1204,82,424,489,sc,holes=True).save(os.path.join(ROOT,'obj_bass_bed.png'),optimize=True)
    sh=load('sheet3.png')
    cut(sh,99,652,172,276,.8,holes=True).save(os.path.join(ROOT,'treat_mash.png'),optimize=True) # the open jar with its spoon, about the size of the treats
    return {'nocrate':[int((x0+x1)//2),int(y1)],'wall_end':wall_end}
def build_cupboard():
    """Tofu's cupboard, open (sheet5.png), and the toys kept in it, each cut out whole.
    Jackie, Nov 25: "it looks strange when the cat food door opens. and empty". The drawing's door is seen at an angle the room is not, so
    it is left out: open, the star door is simply out of the way and the inside shows. The inside is the drawing's lower shelf and what is
    under it, sized to cover the star door, with a couple of the toys in it (the ball of yarn and the felt mouse), so it is not an empty box."""
    sh=load('sheet5.png');inside=Image.fromarray(sh[316:474,210:364].astype(np.uint8),'RGB').resize((158,156),Image.LANCZOS).convert('RGBA') # between the bookcase's own posts
    toys={'yarn':(757,275,259,185),'mouse':(1088,292,301,140),'wand':(122,646,219,271),'bell':(1170,710,133,155),'tin':(446,714,200,168),'tin_open':(747,718,307,164),'yarn_ball':(484,275,170,172)}
    for n,(x,y,w,h) in toys.items():cut(sh,x,y,w,h,.8,holes=True).save(os.path.join(ROOT,'cub_'+n+'.png'),optimize=True)
    floor=156-14 # the cupboard's floor in the picture: the toys stand on it. name: (left, size)
    for n,(left,sc) in {'yarn_ball':(30,.26),'mouse':(84,.19)}.items(): # just a couple (Jackie, Nov 25); all five are still on the tray
        x,y,w,h=toys[n];t=cut(sh,x,y,w,h,sc,holes=True);inside.alpha_composite(t,(left,floor-t.height))
    inside.save(os.path.join(ROOT,'obj_cup_open.png'),optimize=True)
    return {'cup_open':[inside.width,inside.height]}
if __name__=='__main__':
    room,meta=build_room();sh=build_objs();build_carry(sh[2]);build_curtains(room);meta.update(build_sash(room,meta['panes']));build_views(meta['panes']);meta.update(build_bassinet(room));meta.update(build_cupboard())
    print(json.dumps(meta))
