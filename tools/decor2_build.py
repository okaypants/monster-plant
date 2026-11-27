#!/usr/bin/env python3
"""Cuts the second round of decorations (Jackie's sheets of Nov 27) out of their magenta sheets:
  art_src/decor/new_things1..4.png  four sheets of 16 single objects for the floor  -> decor/t_<id>.png
  art_src/decor/new_garlands.png    14 garlands, two to a row                        -> decor/g_<id>.png
  art_src/movieroom/blankets.png    6 throws for the movie room couch                -> movieroom/blanket_<id>.png
Each thing is found by the cell of the grid it stands in, cut whole and scaled with hard edges (tools/room_build.py's cut).
A throw is saved already laid over a patch of bare couch the size of the old cream throw, so it can be shown over the room's
picture and nothing of the old throw shows round it. The patch is the couch's own pixels: each row is carried across from a
bare column of the same cushion. Run: python3 tools/decor2_build.py"""
import os,sys,json
import numpy as np,scipy.ndimage as nd
from PIL import Image
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import room_build as rb
ROOT=rb.ROOT;SRC=os.path.join(ROOT,'art_src','decor');OUT=os.path.join(ROOT,'decor')
THINGS=[['boots','beachball','leaves','sledge','umbrellas','stormlamp','fan','pinwheels','moonlamp','telescope','seedlings','squash','sunflower','firewood','sandbucket','picnic'],
 ['present','newhome','trophy','sickday','catbox','backpack','movienight','fort','boardgame','teatray','ballgame','guitar','crafts','books','globe','mop'],
 ['newyear','kumquat','valentine','peach','holi','hyacinth','eggtree','waterjar','eidlantern','irises','lotus','hibiscus','midsummer','pride','tanabata','morningglory'],
 ['pampas','bojagi','rangoli','jackolantern','marigolds','dreidel','winterlantern','smalltree','kwanzaa','applepie','snowglobe','poinsettia','presents','paperlantern','mandarins','skates']]
GARLANDS=['blossom','citrus','leaves','snow','rain','moons','hearts','eggs','bats','evergreen','marigold','pennants','lanterns','bunting']
BLANKETS=['check','daisy','knit','patch','cloud','moon']
DROP={'telescope','guitar','globe'} # Jackie, Nov 27: "no telescope, guitar, globe"
FIT=(124,128);BASE=.5;G_W=236;TOL=110
def cells(a,cols,rows,least=1500):
    """The bounding box of everything standing in each cell of the sheet's grid, in reading order."""
    fg=~rb.magenta(a,TOL);lab,n=nd.label(nd.binary_dilation(fg,iterations=3));H,W=fg.shape;box={}
    for i,sl in enumerate(nd.find_objects(lab),1):
        m=(lab[sl]==i)&fg[sl]
        if m.sum()<least:continue
        ys,xs=np.where(m);ys+=sl[0].start;xs+=sl[1].start;c=(min(rows-1,int(ys.mean()*rows/H)),min(cols-1,int(xs.mean()*cols/W)))
        b=box.get(c);q=[xs.min(),ys.min(),xs.max()+1,ys.max()+1];box[c]=q if b is None else [min(b[0],q[0]),min(b[1],q[1]),max(b[2],q[2]),max(b[3],q[3])]
    assert len(box)==cols*rows,(len(box),sorted(box))
    return [box[(r,c)] for r in range(rows) for c in range(cols)]
def specks(im):
    a=np.asarray(im).copy();lab,n=nd.label(a[...,3]>0);sz=nd.sum(np.ones(lab.shape),lab,range(1,n+1))
    for i in range(1,n+1):
        if sz[i-1]<10:a[lab==i,3]=0
    ys,xs=np.where(a[...,3]>0);return Image.fromarray(a[ys.min():ys.max()+1,xs.min():xs.max()+1],'RGBA')
def main_part(im):
    """Only the thing itself: whatever is not joined to the biggest part (a sliver of the next garland on the sheet) is dropped."""
    a=np.asarray(im).copy();lab,n=nd.label(nd.binary_dilation(a[...,3]>0,iterations=3));big=1+int(np.argmax(nd.sum(a[...,3]>0,lab,range(1,n+1))));a[lab!=big,3]=0
    ys,xs=np.where(a[...,3]>0);return Image.fromarray(a[ys.min():ys.max()+1,xs.min():xs.max()+1],'RGBA')
def things():
    meta={}
    for n,names in enumerate(THINGS,1):
        a=np.asarray(Image.open(os.path.join(SRC,'new_things%d.png'%n)).convert('RGB')).astype(np.int32)
        for name,(x0,y0,x1,y1) in zip(names,cells(a,4,4)):
            if name in DROP:continue
            w,h=x1-x0,y1-y0;im=specks(rb.cut(a,x0,y0,w,h,min(BASE,FIT[0]/w,FIT[1]/h),holes=True,tol=TOL));im.save(os.path.join(OUT,'t_%s.png'%name),optimize=True);meta[name]=[im.width,im.height]
    return meta
def garlands():
    a=np.asarray(Image.open(os.path.join(SRC,'new_garlands.png')).convert('RGB')).astype(np.int32);meta={}
    for name,(x0,y0,x1,y1) in zip(GARLANDS,cells(a,2,7)):
        w,h=x1-x0,y1-y0;im=main_part(rb.cut(a,x0,y0,w,h,G_W/w,holes=True,tol=TOL));im.save(os.path.join(OUT,'g_%s.png'%name),optimize=True);meta[name]=[im.width,im.height]
    return meta
THROW=(430,676,640,880) # the part of the movie room's picture the old cream throw hangs in, with room to the right for a wider one
BARE_X=652              # a column of the same cushion with nothing hanging over it
B_LEFT,B_BOTTOM,B_K=435,873,.56 # where a new throw's left edge and the bottom of its tassels go, and its scale
def blankets():
    room=np.asarray(Image.open(os.path.join(ROOT,'movieroom','room.png')).convert('RGBA')).copy();x0,y0,x1,y1=THROW
    patch=np.repeat(room[y0:y1,BARE_X:BARE_X+1],x1-x0,axis=1) # bare couch, row by row
    a=np.asarray(Image.open(os.path.join(ROOT,'art_src','movieroom','blankets.png')).convert('RGB')).astype(np.int32);meta={'box':[x0,y0,x1-x0,y1-y0]}
    for name,(bx0,by0,bx1,by1) in zip(BLANKETS,cells(a,3,2)):
        im=specks(rb.cut(a,bx0,by0,bx1-bx0,by1-by0,B_K,holes=True,tol=TOL));base=Image.fromarray(patch.copy(),'RGBA')
        base.alpha_composite(im,(B_LEFT-x0,B_BOTTOM-y0-im.height));base.save(os.path.join(ROOT,'movieroom','blanket_%s.png'%name),optimize=True);meta[name]=[im.width,im.height]
        im.save(os.path.join(ROOT,'movieroom','blanket_%s_icon.png'%name),optimize=True)
    Image.fromarray(room[682:875,435:593],'RGBA').save(os.path.join(ROOT,'movieroom','blanket_cream_icon.png'),optimize=True) # the room's own throw, for the drawer's first tile
    return meta
if __name__=='__main__':
    which=sys.argv[1:] or ['things','garlands','blankets']
    for w in which:print(w,json.dumps(globals()[w]()))
