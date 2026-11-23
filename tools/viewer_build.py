#!/usr/bin/env python3
"""Writes js/viewerdata.js, the viewfinder's stereo cards, from tools/viewer_captions.py (each card's title, who published it and
when). The cards themselves are viewer/cardNN.jpg, numbered in the same order.
Run: python3 tools/viewer_build.py"""
import json,os
from viewer_captions import CARDS
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out=[{'f':'card%02d.jpg'%(n+1),'t':t,'by':by,'d':d} for n,(t,by,d) in enumerate(CARDS)]
miss=[c['f'] for c in out if not os.path.exists(os.path.join(ROOT,'viewer',c['f']))];assert not miss,miss
s="'use strict';\n// made by tools/viewer_build.py from tools/viewer_captions.py: do not edit by hand\nconst VIEW_CARDS="+json.dumps(out,ensure_ascii=False,separators=(',',':')).replace('},{','},\n {')+";\n"
open(os.path.join(ROOT,'js','viewerdata.js'),'w').write(s);print(len(out),'cards')
