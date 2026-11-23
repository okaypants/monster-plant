#!/usr/bin/env python3
"""Writes js/viewerdata.js, the viewfinder's reels, from tools/viewer_captions.py (each reel's name and, for each picture, its
title, who made it and when). The pictures themselves are viewer/<reel>NN.jpg, numbered in the same order.
Run: python3 tools/viewer_build.py"""
import json,os
from viewer_captions import REELS
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out=[]
for k,name,L in REELS:
    pics=[{'f':'%s%02d.jpg'%(k,n+1),'t':t,'by':by,'d':d} for n,(_,t,by,d) in enumerate(L) if os.path.exists(os.path.join(ROOT,'viewer','%s%02d.jpg'%(k,n+1)))]
    out.append({'k':k,'name':name,'pics':pics})
s="'use strict';\n// made by tools/viewer_build.py from tools/viewer_captions.py: do not edit by hand\nconst VIEW_REELS="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{"k"','},\n {"k"')+";\n"
open(os.path.join(ROOT,'js','viewerdata.js'),'w').write(s);print({r['k']:len(r['pics']) for r in out})
