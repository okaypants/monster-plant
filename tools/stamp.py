#!/usr/bin/env python3
"""Stamps the game with a new version, so a phone never runs old code against a new page (Jackie, Nov 27: on her phone "none of the
new microactions work", because it was still running a saved copy of the scripts).
Run before every push: python3 tools/stamp.py
It writes the stamp to version.txt, to MP_VERSION at the top of index.html, and onto every local script and stylesheet address in
index.html as ?v=<stamp>, which makes each one a new address the phone has not saved. When the game starts it reads version.txt
fresh; if that differs from the page's own stamp, the page is old and it reloads itself at a new address."""
import os,re,time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));P=os.path.join(ROOT,'index.html')
def main():
    v=time.strftime('%Y%m%d%H%M%S');s=open(P).read()
    s=re.sub(r'(<script src="(?!https?:)[^"?]+)(\?v=\d+)?(")',r'\1?v='+v+r'\3',s)
    s=re.sub(r'(<link rel="stylesheet" href="(?!https?:)[^"?]+)(\?v=\d+)?(")',r'\1?v='+v+r'\3',s)
    s,n=re.subn(r"MP_VERSION='\d*'","MP_VERSION='"+v+"'",s);assert n==1,'MP_VERSION not found in index.html'
    open(P,'w').write(s);open(os.path.join(ROOT,'version.txt'),'w').write(v+'\n');print('stamped',v)
if __name__=='__main__':main()
