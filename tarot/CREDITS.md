# Tarot cards

The 78 card pictures are Jackie's deck (Nov 25, 2026), drawn with ChatGPT from her direction: a reinterpretation of the
Rider–Waite–Smith tarot (Pamela Colman Smith, 1909, public domain) in flat bright shapes with no outlines, with animals in
place of every person. Wands are foxes, Cups are otters, Swords are crows and Pentacles are badgers; each Major Arcana card
has its own animal. Nobody is hurt, falling or dead on any card. Each card has its name on a cream band and no border.

The sheets they were drawn on are in art_src/tarot/, and tools/tarot_cut.py cuts them into these files (320 x 640, the same
rounded corners on every card). File names: M00–M21 the Major Arcana (Waite's numbering: Strength 8, Justice 11); W, C, S, P
for Wands, Cups, Swords and Pentacles, 01 the Ace to 10, then 11 Page, 12 Knight, 13 Queen, 14 King.

back.png is the roses and lilies of the 1909 deck's back, drawn by Jackie in the same style as an ornament of vines (Jackie: "I want the design based on the
actual ryder waithe"). It was drawn in four colours (back_navy, back_pink, back_purple, back_cyan); back.png is the navy one.

The meanings in js/tarotdata.js are from A. E. Waite, *The Pictorial Key to the Tarot* (1910, public domain), via Wikisource.
