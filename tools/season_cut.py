# Cut Jackie's season sheets (season_pumpkin.png, season_tree.png, season_leaves.png) into the game's pieces.
# Background removal only (RULES 6): binary alpha, tight crop + 1px margin, frame pairs on one shared canvas.
# Run from the repository root:  python3 tools/season_cut.py .
import sys,numpy as np
from PIL import Image
from scipy import ndimage
OUT=sys.argv[1]
def mask(a):
    R,G,B=a[...,0],a[...,1],a[...,2]
    bg=(np.minimum(R,B)-G)>90
    lab,n=ndimage.label(bg)
    edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
    outer=np.isin(lab,list(edge))
    pocket=bg&~outer&(B>=0.78*R)   # enclosed: only magenta-hued pockets go
    keep=~(outer|pocket)
    l2,n2=ndimage.label(keep,structure=np.ones((3,3)))
    sz=ndimage.sum(keep,l2,range(1,n2+1))
    for i,z in enumerate(sz):
        if z<=4: keep[l2==i+1]=False
    return keep
def piece(sheet,x0,x1,y0=0,y1=None):
    a=np.array(Image.open(sheet).convert('RGB')).astype(int)[y0:y1,x0:x1]
    k=mask(a)
    ys,xs=np.nonzero(k)
    return a,k,(x0+xs.min(),y0+ys.min(),x0+xs.max()+1,y0+ys.max()+1),(x0,y0)
def save_group(name_fmt,parts,align):
    # align: 'bottom' (bbox centres, bottoms level) | 'hook' (the hook at the top stays put)
    boxes=[]
    for a,k,bb,(ox,oy) in parts:
        ys,xs=np.nonzero(k)
        if align=='hook':
            top=ys.min();ax=xs[ys<=top+3].mean()+ox;ay=bb[1]
        else:
            ax=(bb[0]+bb[2])/2;ay=bb[3]
        boxes.append((bb,round(ax),round(ay)))
    L=min(bb[0]-ax for bb,ax,ay in boxes);T=min(bb[1]-ay for bb,ax,ay in boxes)
    Rr=max(bb[2]-ax for bb,ax,ay in boxes);Bb=max(bb[3]-ay for bb,ax,ay in boxes)
    w,h=Rr-L+2,Bb-T+2
    for i,((a,k,bb,(ox,oy)),(_,ax,ay)) in enumerate(zip(parts,boxes)):
        im=np.zeros((h,w,4),np.uint8)
        ys,xs=np.nonzero(k)
        X=xs+ox-ax-L+1;Y=ys+oy-ay-T+1
        im[Y,X,:3]=a[ys,xs];im[Y,X,3]=255
        Image.fromarray(im).save(OUT+'/'+name_fmt%(i+1));print(name_fmt%(i+1),w,h)
# pumpkin: idle, rock one way, rock the other, lit (season_pumpkin_1.png is the same file)
P='season_pumpkin.png'
pk=[piece(P,60,500),piece(P,600,1040),piece(P,1130,1580),piece(P,1690,2120)]
save_group('pumpkin%d.png',pk,'bottom')
T='season_tree.png'  # the two trees touch on the sheet: split at x 224, the narrowest column between them
save_group('tree%d.png',[piece(T,20,224),piece(T,224,430)],'bottom')
orn=[('ball',461,568,596,702),('star',748,866,878,992),('mushroom',1039,1151,1162,1275),('pot',1324,1426,1450,1557),('heart',1604,1714,1734,1843),('bell',1889,1998,2033,2140)]
for n,a0,a1,b0,b1 in orn:
    save_group('ornament_'+n+'%d.png',[piece(T,a0-6,a1+6),piece(T,b0-6,b1+6)],'hook')
L='season_leaves.png'
for n,x0,x1 in [('maple',1014,1178),('redmaple',1218,1382),('ginkgo',1419,1571),('oak',1610,1750),('twig',1801,1946),('round',1990,2118)]:
    save_group('leaf_'+n+'%.0s.png',[piece(L,x0-8,x1+8)],'bottom')
