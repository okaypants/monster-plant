#!/usr/bin/env python3
"""The white cat's two pictures (Jackie, Nov 26: "a portrait painting and one of him just in the room somewhere, maybe a screenshot
for both").
  The bookcase frame (obj_frame*.png): a close portrait, the white cat's sitting pose from the chest up (eyes open, shut for the
  blink, glowing for the glow). The frame and its navy card are kept from the picture as it was (art_src/frame_tabby/); the tipped
  frame is the same picture turned a little.
  The small frame on the wall (in room2.png): a snapshot of the cat on the armchair, cut from a screenshot of the game
  (art_src/house_snapshot.png) and sized to cover the frame's opening.
Run: python3 tools/house_pictures.py"""
import os
from PIL import Image
import numpy as np
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SRC=os.path.join(ROOT,'art_src','frame_tabby')
BOX=(10,11,65,68);NAVY=(33,33,76,255);BUST=(24,0,210,193) # the part of the 235 x 218 sitting pose the portrait shows
WALL=(756,369,875,444) # the wall frame's opening in room2.png
def bust(n):
    im=Image.open(os.path.join(ROOT,'house_cat','cat_%s.png'%n)).convert('RGBA');im=im.crop((BUST[0],im.height-218+BUST[1],BUST[2],im.height-218+BUST[3]))
    w=BOX[2]-BOX[0]+1;k=w/im.width;pm=np.asarray(im).astype(float);pm[...,:3]*=pm[...,3:]/255
    sm=np.asarray(Image.fromarray(pm.astype(np.uint8),'RGBA').resize((w,round(im.height*k)),Image.LANCZOS)).astype(float)
    A=sm[...,3:];rgb=np.where(A>0,sm[...,:3]*255/np.maximum(A,1),0).clip(0,255)
    return Image.fromarray(np.dstack([rgb,np.where(A>=128,255,0)]).astype(np.uint8),'RGBA')
def frame(pose):
    f=Image.open(os.path.join(SRC,'obj_frame.png')).convert('RGBA');x0,y0,x1,y1=BOX;f.paste(NAVY,(x0,y0,x1+1,y1+1))
    c=bust(pose);h=y1-y0+1;c=c.crop((0,0,c.width,min(c.height,h+c.height-h))) ;top=y1+1-c.height
    if top<y0:c=c.crop((0,y0-top,c.width,c.height));top=y0
    f.alpha_composite(c,(x0,top));return f
def frames():
    a=frame('sit1');a.save(os.path.join(ROOT,'obj_frame.png'),optimize=True)
    frame('sit2').save(os.path.join(ROOT,'obj_frame_blink.png'),optimize=True);frame('glow').save(os.path.join(ROOT,'obj_frame_glow.png'),optimize=True)
    old=Image.open(os.path.join(SRC,'obj_frame_tilt.png'));t=a.rotate(5,Image.NEAREST,expand=True);t=t.crop(t.getbbox())
    out=Image.new('RGBA',(max(old.width,t.width),max(old.height,t.height)),(0,0,0,0));out.alpha_composite(t,((out.width-t.width)//2,out.height-t.height))
    out.save(os.path.join(ROOT,'obj_frame_tilt.png'),optimize=True)
def wall():
    room=Image.open(os.path.join(ROOT,'room2.png'));x0,y0,x1,y1=WALL
    w,h=x1-x0+1,y1-y0+1;t=Image.open(os.path.join(ROOT,'art_src','house_snapshot.png')).convert('RGB')
    k=max(w/t.width,h/t.height);t=t.resize((round(t.width*k),round(t.height*k)),Image.LANCZOS);ox,oy=(t.width-w)//2,(t.height-h)//2
    room.paste(t.crop((ox,oy,ox+w,oy+h)),(x0,y0));room.save(os.path.join(ROOT,'room2.png'));print('wall opening',x0,y0,w,h)
if __name__=='__main__':frames();wall()
