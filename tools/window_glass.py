# window_glass.png: where the window's glass is (the falling leaves show only there).
# Glass = what changes between the four day season windows; minus the bars, outlines, curtains and the armchair corner, which are the same in all four.
import numpy as np
from PIL import Image
from scipy import ndimage
S=['spring','summer','autumn','winter']
A=[np.array(Image.open('day_window_%s.png'%s).convert('RGBA')).astype(int) for s in S]
all4=lambda f:np.logical_and.reduce([f(a[...,0],a[...,1],a[...,2]) for a in A])
frame=all4(lambda R,G,B:(R<190)&(G<110)&(B<100)&(R>G))
dark=all4(lambda R,G,B:R+G+B<200)
cream=all4(lambda R,G,B:(R>200)&(G>170)&(B>120)&(R>B+40))
mx=np.max([np.abs(a[...,:3]-A[0][...,:3]).sum(2) for a in A],0)
same=ndimage.binary_opening(mx<45,iterations=2);lab,n=ndimage.label(same);sz=ndimage.sum(same,lab,range(1,n+1))
chair=np.isin(lab,[i+1 for i,z in enumerate(sz) if z>300])
d=mx>30
m=ndimage.binary_opening(ndimage.binary_fill_holes(ndimage.binary_closing(d,iterations=3)),iterations=2)
g=ndimage.binary_opening(m&~frame&~dark&~cream&~chair,iterations=1)
lab,n=ndimage.label(g);sz=ndimage.sum(g,lab,range(1,n+1));g=np.isin(lab,[i+1 for i,z in enumerate(sz) if z>500])
out=np.zeros(g.shape+(4,),np.uint8);out[g]=255
Image.fromarray(out).save('window_glass.png');print(g.sum())
