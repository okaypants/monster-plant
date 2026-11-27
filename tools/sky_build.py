#!/usr/bin/env python3
"""The night sky behind the game (Jackie, Nov 27: "i would like the blinking background for the empty space around the game to be
constellations and smaller and all small pixels so that small amounts of the image aren't just empty and black").
Draws a small sky that repeats, so even a thin strip beside the room has stars in it: real constellations as dots joined by faint
lines, with a scatter of fainter stars between them. Everything is single squares of one size on a grid; nothing is blurred.
Writes sky_a.png (the sky), and sky_b.png and sky_c.png (some of its stars again, a little brighter, which blink on and off over
it at two different paces). Run: python3 tools/sky_build.py"""
import os,random,math
from PIL import Image,ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));T=192;random.seed(11) # the tile, in its own pixels; shown at two screen pixels to one
# each constellation: its stars on a rough 0..10 grid (x right, y down) and which are joined
CON={
 'Big Dipper':([(0,2),(2,1.6),(3.6,2.2),(5,3),(5.4,4.8),(7.6,5),(8,3.2)],[(0,1),(1,2),(2,3),(3,4),(4,5),(5,6),(6,3)]),
 'Orion':([(1,0),(5,0.6),(2.4,3.6),(3.2,3.9),(4,4.2),(1.4,7.4),(5.4,7),(3,1.6)],[(0,2),(1,4),(2,3),(3,4),(2,5),(4,6),(0,7),(7,1)]),
 'Cassiopeia':([(0,1),(2,3),(4,1.4),(6,3.2),(8,1)],[(0,1),(1,2),(2,3),(3,4)]),
 'Cygnus':([(4,0),(4,2.4),(4,5),(4,8),(0.6,3.4),(7.4,3)],[(0,1),(1,2),(2,3),(4,1),(1,5)]),
 'Lyra':([(2,0),(1,2),(3,2.4),(1.4,5),(3.4,5.4)],[(0,1),(0,2),(1,2),(1,3),(2,4),(3,4)]),
 'Scorpius':([(7,0),(6,1.4),(5,3),(4.4,4.8),(4,6.4),(2.8,7.6),(1.2,7.4),(0.4,6),(1,4.8)],[(0,1),(1,2),(2,3),(3,4),(4,5),(5,6),(6,7),(7,8)]),
 'Leo':([(0,3),(2,1),(4,0.6),(5,2.2),(4,3.6),(8,3),(9.4,5),(6.4,5.4)],[(0,1),(1,2),(2,3),(3,4),(4,0),(4,5),(5,6),(6,7),(7,4)]),
 'Crux':([(2,0),(2,5),(0,2.4),(4,2)],[(0,1),(2,3)]),
 'Corona':([(0,0.6),(1,2.2),(2.6,3),(4.4,2.8),(5.8,1.8),(6.4,0.2)],[(0,1),(1,2),(2,3),(3,4),(4,5)])}
STAR=(253,235,201,255);FAINT=(185,174,224,255);DIM=(108,97,164,255);LINE=(108,97,164,90);BG=(0,0,0,0)
def main():
    a=Image.new('RGBA',(T,T),BG);d=ImageDraw.Draw(a);bright=[];taken=[]
    for name,(pts,joins) in CON.items():
        for _ in range(400):
            k=random.uniform(3.6,5.2);rot=random.uniform(0,6.283);w=10*k;cx,cy=random.uniform(0,T),random.uniform(0,T)
            if all(math.hypot((cx-x+T/2)%T-T/2,(cy-y+T/2)%T-T/2)>r+w*.62 for x,y,r in taken):break
        taken.append((cx,cy,w*.62));P=[]
        for x,y in pts:
            dx,dy=(x-5)*k,(y-4)*k;P.append((cx+dx*math.cos(rot)-dy*math.sin(rot),cy+dx*math.sin(rot)+dy*math.cos(rot)))
        for i,j in joins: # a faint line, drawn at each wrap so it joins across the tile's edges
            for ox in (-T,0,T):
                for oy in (-T,0,T):d.line([(P[i][0]+ox,P[i][1]+oy),(P[j][0]+ox,P[j][1]+oy)],fill=LINE,width=1)
        for x,y in P:a.putpixel((int(round(x))%T,int(round(y))%T),STAR);bright.append((int(round(x))%T,int(round(y))%T))
    for _ in range(150): # the scatter between them
        x,y=random.randrange(T),random.randrange(T)
        if a.getpixel((x,y))[3]<120:a.putpixel((x,y),FAINT if random.random()<.4 else DIM)
    a.save(os.path.join(ROOT,'sky_a.png'),optimize=True);random.shuffle(bright)
    for n,part in (('b',bright[::2]),('c',bright[1::2])):
        im=Image.new('RGBA',(T,T),BG)
        for x,y in part:
            im.putpixel((x,y),(255,255,255,255))
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):im.putpixel(((x+dx)%T,(y+dy)%T),(253,235,201,150)) # a brighter star is a small plus
        im.save(os.path.join(ROOT,'sky_%s.png'%n),optimize=True)
    print(len(bright),'constellation stars')
if __name__=='__main__':main()
