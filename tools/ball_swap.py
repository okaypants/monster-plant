#!/usr/bin/env python3
"""The crystal ball and the framed cat trade places (Jackie, Nov 27: "i do want the crystal ball and framed cat to trade places").
The ball was painted into the room's picture on the right-hand bookcase's top shelf, with only its mist drawn over it. This lifts
it out as a picture of its own (obj_ball1.png, the same size and place as the mist pictures obj_ball2..5.png) and leaves the
shelf bare behind it: each row of the bare shelf is carried across from an empty column of the same shelf. Nothing is drawn.
It does nothing if the ball is already out. tools/room_build.py runs it after building the room. Run: python3 tools/ball_swap.py"""
import os
import numpy as np,scipy.ndimage as nd
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AT=(1561,299)     # the middle of the ball's foot in the room, as js/room.js had it
BOX=(1512,206,1610,300) # the part of the shelf the ball stands in
BARE_X=1500       # a column of the same shelf with nothing in it
def lift():
    p=os.path.join(ROOT,'room2.png');room=np.asarray(Image.open(p).convert('RGBA')).copy();x0,y0,x1,y1=BOX;s=room[y0:y1,x0:x1].astype(int)
    bare=np.repeat(room[y0:y1,BARE_X:BARE_X+1],x1-x0,axis=1).astype(int)
    diff=np.abs(s[...,:3]-bare[...,:3]).sum(2)>40;lab,n=nd.label(diff)
    if not n:print('the ball is already out of the room picture');return
    big=1+int(np.argmax(nd.sum(diff,lab,range(1,n+1))));m=nd.binary_fill_holes(nd.binary_dilation(lab==big,iterations=1))
    if m.sum()<2000:print('the ball is already out of the room picture');return
    mist=Image.open(os.path.join(ROOT,'obj_ball2.png'));w,h=mist.size;bx,by=AT[0]-w//2,AT[1]-h # where the mist pictures are drawn
    out=np.zeros((h,w,4),np.uint8);ys,xs=np.where(m)
    for y,x in zip(ys,xs):
        u,v=x+x0-bx,y+y0-by
        if 0<=u<w and 0<=v<h:out[v,u]=room[y+y0,x+x0]
    Image.fromarray(out,'RGBA').save(os.path.join(ROOT,'obj_ball1.png'),optimize=True)
    wipe=nd.binary_dilation(m,iterations=2);room[y0:y1,x0:x1][wipe]=bare[wipe].astype(np.uint8)
    Image.fromarray(room,'RGBA').save(p,optimize=True);print('ball lifted out:',int(m.sum()),'pixels;',int((out[...,3]>0).sum()),'kept in obj_ball1.png')
if __name__=='__main__':lift()
