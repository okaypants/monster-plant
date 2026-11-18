"""Builds data/iching.json (the moon box's I Ching, js/iching.js) from three files beside this script's working folder:
  zh.json     the Chinese text of the 64 hexagrams, parsed from Chinese Wikisource (周易/乾 and so on)
  en_a.json   James Legge's English (1882) for hexagrams 1 to 32, parsed from English Wikisource
  en_b.json   the same for 33 to 64, from two Internet Archive scans of the 1882 book, compared and tidied by hand
The names, how they are said and the plain meanings are written here. Kept as the record of how the file was made;
the three input files are not in the repository.  Usage: python3 tools/iching_build.py data/iching.json
"""
import json,re,sys,os
D=os.path.dirname(os.path.abspath(__file__))
zh=json.load(open(D+'/zh.json'));A=json.load(open(D+'/en_a.json'));B=json.load(open(D+'/en_b.json'))
NAMES="""Qián|Heaven|Great strength and a strong start. Keep going and stay true.
Kūn|Earth|Follow rather than lead, and be as patient as the earth. You may lose the way at first and then find it.
Zhūn|Sprouting|A hard beginning, like a sprout pushing through soil. Do not rush ahead. Get help in place first.
Méng|The Beginner|You are new at this. Ask once and listen. Asking the same thing again and again gets no answer.
Xū|Waiting|Wait, and trust that it will come. After that, a big step will go well.
Sòng|Dispute|Stopping a dispute halfway goes well, and pushing it to the end goes badly. Get advice from someone wise.
Shī|The Army|A big effort needs a steady, experienced leader. With one, it goes well.
Bǐ|Holding Together|Join with others, and do it soon. Those who come too late lose out.
Xiǎo Chù|Small Taming|Small things hold you back for now. Clouds are gathering, but the rain has not come yet.
Lǚ|Treading|You are stepping on a tiger's tail, and the tiger does not bite. Go carefully and it works out.
Tài|Peace|The small goes and the great comes. This is a time of peace and good luck.
Pǐ|Standstill|Things are stuck, and people do not understand each other. The great goes and the small comes. Hold steady.
Tóng Rén|Fellowship|Friends meet out in the open. Working with others, you can take on something big.
Dà Yǒu|Great Possession|You have a great deal. Great success.
Qiān|Modesty|Being modest brings success. Finish what you start.
Yù|Delight|A happy, willing mood. It is a good time to gather helpers and get moving.
Suí|Following|Go along with things. Great success comes, as long as you stay honest.
Gǔ|Mending|Something has been spoiled and needs fixing. Think for three days before you start, and for three days after.
Lín|Approach|Something good is coming closer. Great success now, though it will not last all year.
Guān|Watching|Watch closely before you act, like someone who has washed their hands and has not yet made the offering.
Shì Kè|Biting Through|Something is in the way, like food stuck between the teeth. Bite through it. It is right to be firm.
Bì|Adornment|Beauty and good manners help in small matters.
Bō|Peeling Away|Things are peeling away. This is not a time to go anywhere.
Fù|Return|A turning point. What went away comes back in seven days. Friends arrive, and it is good to have somewhere to go.
Wú Wàng|Innocence|Be honest and expect nothing. Great success. Anyone who is not being straight will have trouble.
Dà Chù|Great Taming|Great strength has been stored up. Do not stay home with it. A big step will go well.
Yí|The Jaws|Watch what you feed yourself with, and what others feed on. Being careful about it brings good luck.
Dà Guò|Great Excess|The roof beam is sagging under too much weight. It helps to have somewhere to go.
Kǎn|The Pit|Danger on top of danger, like water in a ravine. Keep your heart steady and you will get through.
Lí|Clinging Fire|Fire holds on to what it burns. Hold on to what is right, and care for things gently, the way one keeps a cow.
Xián|Attraction|Things go well, and it is a good time to come together.
Héng|Lasting|Keep going the same steady way. Nothing goes wrong, and it helps to have a goal.
Dùn|Retreat|Step back. Success comes from retreating, and only small things can be pushed.
Dà Zhuàng|Great Strength|Use great strength only for what is right.
Jìn|Advance|Moving up. A leader is given many horses and is welcomed three times in one day.
Míng Yí|The Darkened Light|The light has gone under the ground. In a hard time, keep your light hidden and stay true.
Jiā Rén|The Family|Things go well when the one who keeps the home is steady.
Kuí|Opposition|People are pulling apart. Small things can still go well.
Jiǎn|Obstruction|The way is blocked. Take the easy ground and not the hard, and look for someone wise.
Xiè|Release|The knot comes loose. If nothing is left to do, go back to normal. If something is left, do it early.
Sǔn|Decrease|Giving something up sincerely brings great good luck. Two small bowls are enough for the offering.
Yì|Increase|It is a good time to act and to take a big step.
Guài|Breakthrough|Say what is wrong out loud and deal with it, but not by force.
Gòu|Meeting|Something bold arrives without warning. Do not tie yourself to it.
Cuì|Gathering|People gather. Meet someone wise, bring a generous offering and go ahead.
Shēng|Rising|Great success. Do not worry, and keep going.
Kùn|Hemmed In|Hemmed in and worn out. A strong person still comes through. Words will not be believed right now.
Jǐng|The Well|A town can be moved, but the well stays where it is, and its water never runs out. If the rope is too short or the bucket breaks, there is trouble.
Gé|Change|People believe in a big change only after it is done. Then there is great success, and regret disappears.
Dǐng|The Cauldron|Great good luck and success.
Zhèn|Thunder|Thunder scares everyone for a hundred miles. Laugh afterward, and do not drop the spoon.
Gèn|Mountain|Keep still, like a mountain. Quiet your back until you forget yourself. Nothing goes wrong.
Jiàn|Gradual Progress|Slow progress, one step at a time, like getting ready for a wedding. It is good to stay the course.
Guī Mèi|The Marrying Maiden|Acting now goes badly. Nothing is gained by it.
Fēng|Abundance|There is plenty. Do not be sad that it cannot last. Be like the sun at noon.
Lǚ|The Traveler|Small success. Staying true while far from home brings good luck.
Xùn|Wind|Gentle, like wind that gets in everywhere. Small success. It helps to have a goal and to see someone wise.
Duì|Lake|A happy time. Things go well when you stay true.
Huàn|Dispersing|What was stuck breaks up and scatters. It is a good time for a big step.
Jié|Limits|Things go well, but limits that are too harsh cannot last.
Zhōng Fú|Inner Truth|Sincerity that reaches even pigs and fish. Good luck, and a big step will go well.
Xiǎo Guò|Small Excess|Small things can be done, and big ones cannot. A flying bird leaves its song behind. It is better to come down than to go up.
Jì Jì|Already Across|Small things go well. It starts well, and disorder is possible at the end.
Wèi Jì|Not Yet Across|A young fox, almost over the river, gets its tail wet. Nothing is gained yet.""".split('\n')
assert len(NAMES)==64
FIX={34:("T& Afwang","Tâ Kwang"),35:("3 in","Ȝin"),36:("Ming t","Ming Î"),37:("Kik Z an","Kiâ Zăn"),39:("K ien","Kien"),40:("An eh","Kieh"),42:("Yi ","Yî "),43:("Kw&i","Kwâi"),44:("KAu","Kâu"),45:("3 hui","Ȝhui"),46:("Shang","Shăng"),47:("Khwan","Khwăn"),51:("A'an","Kăn"),55:("Fang","Făng"),56:("Lii","Lü"),58:("T u i","Tui"),59:("HwAn","Hwân"),60:("K ieh","Kieh"),61:("A'ung Fft","Kung Fû"),62:("HsiAo","Hsiâo"),63:("Ki 3 i","Kî Ȝî"),64:("Wei 3*","Wei Ȝî")}
out=[]
for k in range(1,65):
    z=zh[k-1];py,en,plain=NAMES[k-1].split('|')
    if k<=32:
        e=A[str(k)];j=e['j']
        if k==5:e['ls'][5]+=' '+e['other'][0];e['other']=[]
        if e.get('other'):
            # continuation of the judgment across a page break
            j=j+' '+' '.join(o for o in e['other'] if not o.startswith(('center|','being.','Line ')))
        ls=e['ls']
        m=re.search(r' (1\. (?:The|In the) first .*)$',j)
        if m and len(ls)==5:ls=[m.group(1)]+ls;j=j[:m.start()]
    else:
        e=B[str(k)];j=e['j'];ls=e['ls']
        if k in FIX:
            a,b=FIX[k];assert a in j,(k,j);j=j.replace(a,b)
    if k==51:assert 'a hundred 11' in j;j=j.replace('a hundred 11','a hundred lî')
    ls=[re.sub(r'^[1-7]\. ','',l) for l in ls]
    if k==36:ls=[re.sub(r'Ming [It!]\b|Ming !','Ming Î',l).replace('count of Ki ','count of Kî ') for l in ls]
    if k==62:assert 'c ivided' in ls[4];ls[4]=ls[4].replace('c ivided','divided')
    if k==63:assert 'Kao 3 ung' in ls[2];ls[2]=ls[2].replace('Kao 3 ung','Kâo Ȝung')
    if k==46:ls[3]=ls[3].replace('mount Khi.','mount Khî.')
    assert len(ls)>=6 and all(ls[:6]),k
    bits=''.join('1' if t[1]=='九' or t[0]=='九' else '0' for t in z['tags'])
    o={'k':k,'zh':z['n'],'py':py,'en':en,'b':bits,'m':plain,'jz':z['j'],'je':j.strip(),'lz':z['lines'],'le':ls[:6]}
    if z.get('extra'):o['xz']=re.sub(r'^[^：]*：','',z['extra'][0]);o['xe']=ls[6]
    out.append(o)
assert len(set(o['b'] for o in out))==64
bad=[(o['k'],i) for o in out for i,t in enumerate([o['je']]+o['le']) if re.search(r'\{\{|@@|<|\[\[| [b-hj-z] |\d',t)]
print('check',bad)
json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False,separators=(',',':'))
print(os.path.getsize(sys.argv[1]))
for k in (1,2,5,8,20,30,32,36):print(k,out[k-1]['b'],out[k-1]['jz'],'|',out[k-1]['je'][:400])
