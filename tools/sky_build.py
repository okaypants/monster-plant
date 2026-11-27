#!/usr/bin/env python3
"""The night sky behind the game (Jackie, Nov 27: "i would like the blinking background for the empty space around the game to be
constellations and smaller and all small pixels so that small amounts of the image aren't just empty and black"; then "can we make
the constellations dimmer"; then "i want the actual wallpaper more varied because things repeat horizontally and vertically a lot").
Draws one wide sky, shown at two screen pixels to one, so it covers a 1920 by 1200 screen before it repeats: thirty real
constellations, each drawn once, as dots joined by faint lines, with a scatter of fainter stars between them. Everything is single
squares of one size on a grid; nothing is blurred.
Writes sky_a.png (the sky), and sky_b.png and sky_c.png (some of its stars again, a little brighter, which blink on and off over
it at two different paces). The size here must match the background-size in css/textstyle.css (#sky). Run: python3 tools/sky_build.py"""
import os,random,math
from PIL import Image,ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));W,H=960,600;random.seed(11)
# each constellation: its stars on a rough 0..10 grid (x right, y down) and which are joined
def chain(n):return [(i,i+1) for i in range(n-1)]
CON={
 'Big Dipper':([(0,2),(2,1.6),(3.6,2.2),(5,3),(5.4,4.8),(7.6,5),(8,3.2)],chain(7)+[(6,3)]),
 'Little Dipper':([(0,0),(1.6,1),(3.2,1.6),(4.8,2.6),(5,4.2),(6.8,4.6),(6.8,3)],chain(7)+[(6,3)]),
 'Orion':([(1,0),(5,0.6),(2.4,3.6),(3.2,3.9),(4,4.2),(1.4,7.4),(5.4,7),(3,1.6)],[(0,2),(1,4),(2,3),(3,4),(2,5),(4,6),(0,7),(7,1)]),
 'Cassiopeia':([(0,1),(2,3),(4,1.4),(6,3.2),(8,1)],chain(5)),
 'Cygnus':([(4,0),(4,2.4),(4,5),(4,8),(0.6,3.4),(7.4,3)],[(0,1),(1,2),(2,3),(4,1),(1,5)]),
 'Lyra':([(2,0),(1,2),(3,2.4),(1.4,5),(3.4,5.4)],[(0,1),(0,2),(1,2),(1,3),(2,4),(3,4)]),
 'Scorpius':([(7,0),(6,1.4),(5,3),(4.4,4.8),(4,6.4),(2.8,7.6),(1.2,7.4),(0.4,6),(1,4.8)],chain(9)),
 'Leo':([(0,3),(2,1),(4,0.6),(5,2.2),(4,3.6),(8,3),(9.4,5),(6.4,5.4)],[(0,1),(1,2),(2,3),(3,4),(4,0),(4,5),(5,6),(6,7),(7,4)]),
 'Crux':([(2,0),(2,5),(0,2.4),(4,2)],[(0,1),(2,3)]),
 'Corona':([(0,0.6),(1,2.2),(2.6,3),(4.4,2.8),(5.8,1.8),(6.4,0.2)],chain(6)),
 'Taurus':([(0,0),(3,2.6),(4.4,3.6),(5.4,3),(6,4.6),(4.6,4.4),(8,6),(1,3.4)],[(0,1),(1,2),(2,3),(2,5),(5,4),(4,6),(7,3)]),
 'Gemini':([(1,0),(3.4,0.4),(0.6,2.6),(3.6,3),(0.2,5.4),(3.4,6),(1.4,7.4),(4.6,7.6)],[(0,1),(0,2),(2,4),(4,6),(1,3),(3,5),(5,7)]),
 'Pegasus':([(2,2),(6,1.6),(6.4,5.6),(2.4,6),(0,0.6),(8.4,0.4),(9.6,3)],[(0,1),(1,2),(2,3),(3,0),(0,4),(1,5),(5,6)]),
 'Andromeda':([(0,4),(2.4,3.2),(5,2.4),(8,1),(4.6,0.6)],[(0,1),(1,2),(2,3),(2,4)]),
 'Aquila':([(4,0),(4,1.4),(4,2.8),(1,4),(7,4.4),(4,7)],[(0,1),(1,2),(1,3),(1,4),(2,5),(3,5),(4,5)]),
 'Draco':([(0,0),(1.4,0.6),(1.6,2),(0.4,1.6),(3,3.6),(5,3),(6.6,4.4),(6,6.4),(8,7.6),(9.6,6.6)],[(0,1),(1,2),(2,3),(3,0),(2,4),(4,5),(5,6),(6,7),(7,8),(8,9)]),
 'Canis Major':([(3,0),(4,2),(2,2.6),(5,4.6),(3.4,6.6),(5.6,7),(1,7.4)],[(0,1),(1,2),(1,3),(3,4),(3,5),(4,6)]),
 'Perseus':([(4,0),(4.4,2),(3.6,4),(2,6),(1,8),(6,3.6),(7.6,5.4)],[(0,1),(1,2),(2,3),(3,4),(1,5),(5,6)]),
 'Bootes':([(3,8),(1.6,5),(1,2.4),(3,0),(5,2),(5,4.6)],[(0,1),(1,2),(2,3),(3,4),(4,5),(5,0)]),
 'Sagittarius':([(2,2),(4,1),(6,2.4),(6.6,4.6),(3.4,5),(1.6,4),(4.4,3),(8,3.4)],[(0,1),(1,2),(2,3),(3,4),(4,5),(5,0),(0,6),(6,2),(2,7)]),
 'Delphinus':([(1,1),(2.6,0),(4,1),(2.6,2.2),(1.6,5)],[(0,1),(1,2),(2,3),(3,0),(3,4)]),
 'Triangulum':([(0,0),(5,1.6),(4,3.6)],[(0,1),(1,2),(2,0)]),
 'Aries':([(0,2),(3.6,0.6),(5.6,1.2),(6.4,2.2)],chain(4)),
 'Libra':([(3,0),(0.6,2.6),(5.6,3),(1,6),(5,6.6)],[(0,1),(0,2),(1,2),(1,3),(2,4)]),
 'Capricornus':([(0,0),(1,1.4),(4,5.6),(6,5),(8.6,3),(7,2.6),(3.6,1.6)],chain(7)+[(6,0)]),
 'Auriga':([(3,0),(0.6,2),(1,5),(4,7),(6.4,4.6),(6,1.6)],chain(6)+[(5,0)]),
 'Cepheus':([(3,0),(1,3),(1.6,6.4),(5,6.6),(5.6,3)],chain(5)+[(4,0)]),
 'Hercules':([(3,3),(6,2.6),(6.4,5.6),(3.4,6),(1,0.6),(8,0),(8.6,8),(1.4,8.4)],[(0,1),(1,2),(2,3),(3,0),(0,4),(1,5),(2,6),(3,7)]),
 'Corvus':([(0,2),(2,0.6),(5.6,1),(6,4.6),(1.6,4.4)],[(0,1),(1,2),(2,3),(3,4),(4,1)]),
 'Southern Fish':([(0,3),(2,1.6),(4.6,1),(7,2),(8,3.4),(5,4.6),(2.4,4.4)],chain(7)+[(6,0)])}
STAR=(176,163,150,255);FAINT=(128,119,160,255);DIM=(82,73,124,255);LINE=(108,97,164,52);BG=(0,0,0,0)
def near(ax,ay,bx,by):return math.hypot((ax-bx+W/2)%W-W/2,(ay-by+H/2)%H-H/2) # distance, going round the edges
def main():
    a=Image.new('RGBA',(W,H),BG);d=ImageDraw.Draw(a);bright=[];taken=[]
    for name,(pts,joins) in CON.items():
        for _ in range(3000):
            k=random.uniform(3.6,5.6);rot=random.uniform(0,6.283);w=10*k;cx,cy=random.uniform(0,W),random.uniform(0,H)
            if all(near(cx,cy,x,y)>r+w*.62 for x,y,r in taken):break
        taken.append((cx,cy,w*.62));P=[]
        for x,y in pts:
            dx,dy=(x-5)*k,(y-4)*k;P.append((cx+dx*math.cos(rot)-dy*math.sin(rot),cy+dx*math.sin(rot)+dy*math.cos(rot)))
        for i,j in joins: # a faint line, drawn at each wrap so it joins across the sky's edges
            for ox in (-W,0,W):
                for oy in (-H,0,H):d.line([(P[i][0]+ox,P[i][1]+oy),(P[j][0]+ox,P[j][1]+oy)],fill=LINE,width=1)
        for x,y in P:q=(int(round(x))%W,int(round(y))%H);a.putpixel(q,STAR);bright.append(q)
    for _ in range(2300): # the scatter between them
        x,y=random.randrange(W),random.randrange(H)
        if a.getpixel((x,y))[3]<120:a.putpixel((x,y),FAINT if random.random()<.4 else DIM)
    a.save(os.path.join(ROOT,'sky_a.png'),optimize=True);random.shuffle(bright)
    for n,part in (('b',bright[::2]),('c',bright[1::2])):
        im=Image.new('RGBA',(W,H),BG)
        for x,y in part:
            im.putpixel((x,y),(232,216,190,255))
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):im.putpixel(((x+dx)%W,(y+dy)%H),(253,235,201,70)) # a brighter star is a small plus
        im.save(os.path.join(ROOT,'sky_%s.png'%n),optimize=True)
    print(len(CON),'constellations,',len(bright),'stars')
if __name__=='__main__':main()
