'use strict';
/* The tarot deck (js/tarot.js): the 78 cards of the Rider-Waite-Smith deck, pictures by Pamela Colman Smith, published 1909,
   both public domain. id: the picture in tarot/; n: its name; u, r: what it means upright and reversed, in plain words written
   for the game from Waite's meanings (plain phrases, no clipped colon-and-semicolon style: Jackie, Nov 16; and nothing that accuses anyone of lying, betrayal or cruelty: Jackie, Nov 17, so the harshest of Waite's meanings are given as mixed messages, harshness, plans that fall through); wu, wr: Waite's own words, from The Pictorial Key to the Tarot (1910, public domain),
   kept as the record of where each meaning comes from, not shown in the game (wr is null where Waite gives no reversed meaning). Waite's Major Arcana numbers: Strength 8, Justice 11. */
const TAROT=[
{
"id": "M00",
"n": "The Fool",
"u": "A fresh start and a leap into the unknown, with some foolishness.",
"r": "Carelessness and not paying attention.",
"wu": "Folly, mania, extravagance, intoxication, delirium, frenzy, bewrayment.",
"wr": "Negligence, absence, distribution, carelessness, apathy, nullity, vanity."
},
{
"id": "M01",
"n": "The Magician",
"u": "Skill and willpower. You have the tools you need, so use them.",
"r": "Doubt, unease and skill that is used poorly.",
"wu": "Skill, diplomacy, address, subtlety; sickness, pain, loss, disaster, snares of enemies; self-confidence, will; the Querent, if male.",
"wr": "Physician, Magus, mental disease, disgrace, disquiet."
},
{
"id": "M02",
"n": "The High Priestess",
"u": "Secrets and quiet wisdom. The future is not shown yet.",
"r": "Strong feelings and knowing only the surface of things.",
"wu": "Secrets, mystery, the future as yet unrevealed; the woman who interests the Querent, if male; the Querent herself, if female; silence, tenacity; mystery, wisdom, science.",
"wr": "Passion, moral or physical ardour, conceit, surface knowledge."
},
{
"id": "M03",
"n": "The Empress",
"u": "Plenty, growing things and getting something started.",
"r": "A tangled matter becomes clear.",
"wu": "Fruitfulness, action, initiative, length of days; the unknown, clandestine; also difficulty, doubt, ignorance.",
"wr": "Light, truth, the unravelling of involved matters, public rejoicings; according to another reading, vacillation."
},
{
"id": "M04",
"n": "The Emperor",
"u": "Steadiness, protection and good sense.",
"r": "Kindness and understanding, with some confusion.",
"wu": "Stability, power, protection, realization; a great person; aid, reason, conviction; also authority and will.",
"wr": "Benevolence, compassion, credit; also confusion to enemies, obstruction, immaturity."
},
{
"id": "M05",
"n": "The Hierophant",
"u": "Promises, alliances, tradition and asking someone wise for help.",
"r": "Friendship and getting along, perhaps too easily.",
"wu": "Marriage, alliance, captivity, servitude; by another account, mercy and goodness; inspiration; the man to whom the Querent has recourse.",
"wr": "Society, good understanding, concord, over-kindness, weakness."
},
{
"id": "M06",
"n": "The Lovers",
"u": "Attraction, love and difficulties overcome.",
"r": "A plan that needs rethinking and choices that are muddled.",
"wu": "Attraction, love, beauty, trials overcome.",
"wr": "Failure, foolish designs. Another account speaks of marriage frustrated and contrarieties of all kinds."
},
{
"id": "M07",
"n": "The Chariot",
"u": "Help arrives, and pushing forward leads to a win.",
"r": "Quarrels and a setback.",
"wu": "Succour, providence; also war, triumph, presumption, vengeance, trouble.",
"wr": "Riot, quarrel, dispute, litigation, defeat."
},
{
"id": "M08",
"n": "Strength",
"u": "Courage, gentle power and generosity.",
"r": "Bossiness, weakness and strength that is used badly.",
"wu": "Power, energy, action, courage, magnanimity; also complete success and honours.",
"wr": "Despotism, abuse of power, weakness, discord, sometimes even disgrace."
},
{
"id": "M09",
"n": "The Hermit",
"u": "Caution and careful thought. Take your time.",
"r": "Hiding away and being too cautious.",
"wu": "Prudence, circumspection; also and especially treason, dissimulation, roguery, corruption.",
"wr": "Concealment, disguise, policy, fear, unreasoned caution."
},
{
"id": "M10",
"n": "Wheel of Fortune",
"u": "Good luck, with things getting better.",
"r": "Plenty, possibly more than you need.",
"wu": "Destiny, fortune, success, elevation, luck, felicity.",
"wr": "Increase, abundance, superfluity."
},
{
"id": "M11",
"n": "Justice",
"u": "Fairness, and things being set right.",
"r": "Rules, red tape and too much strictness.",
"wu": "Equity, rightness, probity, executive; triumph of the deserving side in law.",
"wr": "Law in all its departments, legal complications, bigotry, bias, excessive severity."
},
{
"id": "M12",
"n": "The Hanged Man",
"u": "Wisdom that comes from waiting and seeing things a new way.",
"r": "Selfishness and following the crowd.",
"wu": "Wisdom, circumspection, discernment, trials, sacrifice, intuition, divination, prophecy.",
"wr": "Selfishness, the crowd, body politic."
},
{
"id": "M13",
"n": "Death",
"u": "An ending that makes room for something new.",
"r": "Things are stuck and nothing is moving.",
"wu": "End, mortality, destruction, corruption; also, for a man, the loss of a benefactor; for a woman, many contrarieties; for a maid, failure of marriage projects.",
"wr": "Inertia, sleep, lethargy, petrifaction, somnambulism; hope destroyed."
},
{
"id": "M14",
"n": "Temperance",
"u": "Balance, patience and careful managing.",
"r": "Matters of belief and old institutions.",
"wu": "Economy, moderation, frugality, management, accommodation.",
"wr": "Things connected with churches, religions, sects, the priesthood, sometimes even the priest who will marry the Querent; also disunion, unfortunate combinations, competing interests."
},
{
"id": "M15",
"n": "The Devil",
"u": "Great force and effort, and something that has to happen.",
"r": "Something petty is holding you back.",
"wu": "Ravage, violence, vehemence, extraordinary efforts, force, fatality; that which is predestined but is not for this reason evil.",
"wr": "Evil fatality, weakness, pettiness, blindness."
},
{
"id": "M16",
"n": "The Tower",
"u": "A sudden upheaval that nobody expected.",
"r": "The same upheaval in a milder form, and feeling hemmed in.",
"wu": "Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin. It is a card in particular of unforeseen catastrophe.",
"wr": "According to one account, the same in a lesser degree; also oppression, imprisonment, tyranny."
},
{
"id": "M17",
"n": "The Star",
"u": "Hope and bright prospects, even after a loss.",
"r": "Pride and stubbornness.",
"wu": "Loss, theft, privation, abandonment; another reading says—hope and bright prospects",
"wr": "Arrogance, haughtiness, impotence."
},
{
"id": "M18",
"n": "The Moon",
"u": "Not everything can be seen yet, so go slowly.",
"r": "Changing moods and small mix-ups.",
"wu": "Hidden enemies, danger, calumny, darkness, terror, deception, occult forces, error.",
"wr": "Instability, inconstancy, silence, lesser degrees of deception and error."
},
{
"id": "M19",
"n": "The Sun",
"u": "Happiness and contentment.",
"r": "Happiness, in a smaller amount.",
"wu": "Material happiness, fortunate marriage, contentment.",
"wr": "The same in a lesser sense."
},
{
"id": "M20",
"n": "Judgement",
"u": "A change, a renewal and a result.",
"r": "Hesitating, or finally making a decision.",
"wu": "Change of position, renewal, outcome. Another account specifies total loss though lawsuit.",
"wr": "Weakness, pusillanimity, simplicity; also deliberation, decision, sentence."
},
{
"id": "M21",
"n": "The World",
"u": "Success and reward, and a journey or a move.",
"r": "Staying in place while things settle.",
"wu": "Assured success, recompense, voyage, route, emigration, flight, change of place.",
"wr": "Inertia, fixity, stagnation, permanence."
},
{
"id": "W01",
"n": "Ace of Wands",
"u": "A beginning, such as making or inventing something.",
"r": "A start that fades out, with some joy mixed in.",
"wu": "Creation, invention, enterprise, the powers which result in these; principle, beginning, source; birth, family, origin, and in a sense the virility which is behind them; the starting point of enterprises; according to another account, money, fortune, inheritance.",
"wr": "Fall, decadence, ruin, perdition, to perish; also a certain clouded joy."
},
{
"id": "W02",
"n": "Two of Wands",
"u": "Big plans and wealth, with some sadness.",
"r": "Surprise and wonder, with some worry.",
"wu": "Between the alternative readings there is no marriage possible; on the one hand, riches, fortune, magnificence; on the other, physical suffering, disease, chagrin, sadness, mortification. The design gives one suggestion; here is a lord overlooking his dominion and alternately contemplating a globe; it looks like the malady, the mortification, the sadness of Alexander amidst the grandeur of this world's wealth.",
"wr": "Surprise, wonder, enchantment, emotion, trouble, fear."
},
{
"id": "W03",
"n": "Three of Wands",
"u": "Strength and enterprise. Your efforts are about to pay off.",
"r": "Troubles end and hard work eases.",
"wu": "He symbolizes established strength, enterprise, effort, trade, commerce, discovery; those are his ships, bearing his merchandise, which are sailing over the sea. The card also signifies able co-operation in business, as if the successful merchant prince were looking from his side towards yours with a view to help you.",
"wr": "The end of troubles, suspension or cessation of adversity, toil and disappointment."
},
{
"id": "W04",
"n": "Four of Wands",
"u": "Peace, harmony and a happy home.",
"r": "The same good times, with things growing.",
"wu": "They are for once almost on the surface—country life, haven of refuge, a species of domestic harvest-home, repose, concord, harmony, prosperity, peace, and the perfected work of these.",
"wr": "The meaning remains unaltered; it is prosperity, increase, felicity, beauty, embellishment."
},
{
"id": "W05",
"n": "Five of Wands",
"u": "Play fights and tough competition.",
"r": "Arguments and mixed signals.",
"wu": "Imitation, as, for example, sham fight, but also the strenuous competition and struggle of the search after riches and fortune. In this sense it connects with the battle of life. Hence some attributions say that it is a card of gold, gain, opulence.",
"wr": "Litigation, disputes, trickery, contradiction."
},
{
"id": "W06",
"n": "Six of Wands",
"u": "Victory and great news.",
"r": "Worry about rivals and plans that are delayed.",
"wu": "The card has been so designed that it can cover several significations; on the surface, it is a victor triumphing, but it is also great news, such as might be carried in state by the King's courier; it is expectation crowned with its own desire, the crown of hope, and so forth.",
"wr": "Apprehension, fear, as of a victorious enemy at the gate; treachery, disloyalty, as of gates being opened to the enemy; also indefinite delay."
},
{
"id": "W07",
"n": "Seven of Wands",
"u": "Holding your ground against the odds.",
"r": "Feeling stuck and anxious. Try not to hesitate.",
"wu": "It is a card of valour, for, on the surface, six are attacking one, who has, however, the vantage position. On the intellectual plane, it signifies discussion, wordy strife; in business—negotiations, war of trade, barter, competition. It is further a card of success, for the combatant is on the top and his enemies may be unable to reach him.",
"wr": "Perplexity, embarrassments, anxiety. It is also a caution against indecision."
},
{
"id": "W08",
"n": "Eight of Wands",
"u": "Speed and hope, with things moving fast.",
"r": "Jealousy and small quarrels.",
"wu": "Activity in undertakings, the path of such activity, swiftness, as that of an express messenger; great haste, great hope, speed towards an end which promises assured felicity; generally, that which is on the move; also the arrows of love.",
"wr": "Arrows of jealousy, internal dispute, stingings of conscience, quarrels; and domestic disputes for persons who are married."
},
{
"id": "W09",
"n": "Nine of Wands",
"u": "Strength when challenged, and standing firm.",
"r": "Obstacles and a rough patch.",
"wu": "The card signifies strength in opposition. If attacked, the person will meet an onslaught boldly; and his build shews that he may prove a formidable antagonist. With this main significance there are all its possible adjuncts—delay, suspension, adjournment.",
"wr": "Obstacles, adversity, calamity."
},
{
"id": "W10",
"n": "Ten of Wands",
"u": "Carrying too much at once.",
"r": "Troubles and complications.",
"wu": "A card of many significances, and some of the readings cannot be harmonized. I set aside that which connects it with honour and good faith. The chief meaning is oppression simply, but it is also fortune, gain, any kind of success, and then it is the oppression of these things. It is also a card of false-seeming, disguise, perfidy. The place which the figure is approaching may suffer from the rods that he carries. Success is stultified if the Nine of Swords follows, and if it is a question of a lawsuit, there will be certain loss.",
"wr": "Contrarieties, difficulties, intrigues, and their analogies."
},
{
"id": "W11",
"n": "Page of Wands",
"u": "Good news from a faithful messenger.",
"r": "Rumors and unsteady plans.",
"wu": "Dark young man, faithful, a lover, an envoy, a postman. Beside a man, he will bear favourable testimony concerning him. A dangerous rival, if followed by the Page of Cups. Has the chief qualities of his suit. He may signify family intelligence.",
"wr": "Anecdotes, announcements, evil news. Also indecision and the instability which accompanies it."
},
{
"id": "W12",
"n": "Knight of Wands",
"u": "A departure, a trip or a move.",
"r": "A split, an interruption or a quarrel.",
"wu": "Departure, absence, flight, emigration. A dark young man, friendly. Change of residence.",
"wr": "Rupture, division, interruption, discord."
},
{
"id": "W13",
"n": "Queen of Wands",
"u": "Warmth, kindness and a head for business.",
"r": "Helpful and thrifty, with some jealousy.",
"wu": "A dark woman, countrywoman, friendly, chaste, loving, honourable. If the card beside her signifies a man, she is well disposed towards him; if a woman, she is interested in the Querent. Also, love of money, or a certain success in business.",
"wr": "Good, economical, obliging, serviceable. Signifies also—but in certain positions and in the neighbourhood of other cards tending in such directions—opposition, jealousy, even deceit and infidelity."
},
{
"id": "W14",
"n": "King of Wands",
"u": "Honesty and a friendly heart.",
"r": "Strict but fair.",
"wu": "Dark man, friendly, countryman, generally married, honest and conscientious. The card always signifies honesty, and may mean news concerning an unexpected heritage to fall in before very long.",
"wr": "Good, but severe; austere, yet tolerant."
},
{
"id": "C01",
"n": "Ace of Cups",
"u": "Joy, comfort and plenty.",
"r": "A change of heart, and things that keep shifting.",
"wu": "House of the true heart, joy, content, abode, nourishment, abundance, fertility; Holy Table, felicity hereof.",
"wr": "House of the false heart, mutation, instability, revolution."
},
{
"id": "C02",
"n": "Two of Cups",
"u": "Love, friendship and getting along.",
"r": "The same as upright, with love, friendship and getting along.",
"wu": "Love, passion, friendship, affinity, union, concord, sympathy, the interrelation of the sexes, and—as a suggestion apart from all offices of divination—that desire which is not in Nature, but by which Nature is sanctified.",
"wr": null
},
{
"id": "C03",
"n": "Three of Cups",
"u": "A celebration, a happy ending and healing.",
"r": "Things finish quickly, and there is too much of a good thing.",
"wu": "The conclusion of any matter in plenty, perfection and merriment; happy issue, victory, fulfilment, solace, healing.",
"wr": "Expedition, dispatch, achievement, end. It signifies also the side of excess in physical enjoyment, and the pleasures of the senses."
},
{
"id": "C04",
"n": "Four of Cups",
"u": "Boredom, and a gift that goes unnoticed.",
"r": "Something new is on the way.",
"wu": "Weariness, disgust, aversion, imaginary vexations, as if the wine of this world had caused satiety only; another wine, as if a fairy gift, is now offered the wastrel, but he sees no consolation therein. This is also a card of blended pleasure.",
"wr": "Novelty, presage, new instruction, new relations."
},
{
"id": "C05",
"n": "Five of Cups",
"u": "A loss, though something is left.",
"r": "News, family and old connections returning.",
"wu": "It is a card of loss, but something remains over; three have been taken, but two are left; it is a card of inheritance, patrimony, transmission, but not corresponding to expectations; with some interpreters it is a card of marriage, but not without bitterness or frustration.",
"wr": "News, alliances, affinity, consanguinity, ancestry, return, false projects."
},
{
"id": "C06",
"n": "Six of Cups",
"u": "Happy memories and looking back.",
"r": "The future, and what is about to happen.",
"wu": "A card of the past and of memories, looking back, as—for example—on childhood; happiness, enjoyment, but coming rather from the past; things that have vanished. Another reading reverses this, giving new relations, new knowledge, new environment, and then the children are disporting in an unfamiliar precinct.",
"wr": "The future, renewal, that which will come to pass presently."
},
{
"id": "C07",
"n": "Seven of Cups",
"u": "Daydreams and wishes that are not real yet.",
"r": "Wanting something and deciding to get it.",
"wu": "Fairy favours, images of reflection, sentiment, imagination, things seen in the glass of contemplation; some attainment in these degrees, but nothing permanent or substantial is suggested.",
"wr": "Desire, will, determination, project."
},
{
"id": "C08",
"n": "Eight of Cups",
"u": "Walking away from something that is finished.",
"r": "Great joy and feasting.",
"wu": "The card speaks for itself on the surface, but other readings are entirely antithetical—giving joy, mildness, timidity, honour, modesty. In practice, it is usually found that the card shews the decline of a matter, or that a matter which has been thought to be important is really of slight consequence—either for good or evil.",
"wr": "Great joy, happiness, feasting."
},
{
"id": "C09",
"n": "Nine of Cups",
"u": "Contentment and a wish that comes true.",
"r": "Truth and loyalty, with a few mistakes.",
"wu": "Concord, contentment, physical bien-être; also victory, success, advantage; satisfaction for the Querent or person for whom the consultation is made.",
"wr": "Truth, loyalty, liberty; but the readings vary and include mistakes, imperfections, etc."
},
{
"id": "C10",
"n": "Ten of Cups",
"u": "Lasting happiness with the people you love.",
"r": "An unsettled heart and a short temper.",
"wu": "Contentment, repose of the entire heart; the perfection of that state; also perfection of human love and friendship; if with several picture-cards, a person who is taking charge of the Querent's interests; also the town, village or country inhabited by the Querent.",
"wr": "Repose of the false heart, indignation, violence."
},
{
"id": "C11",
"n": "Page of Cups",
"u": "A thoughtful messenger, news and quiet study.",
"r": "A crush, or a bit of flattery.",
"wu": "Fair young man, one impelled to render service and with whom the Querent will be connected; a studious youth; news, message; application, reflection, meditation; also these things directed to business.",
"wr": "Taste, inclination, attachment, seduction, deception, artifice."
},
{
"id": "C12",
"n": "Knight of Cups",
"u": "An invitation or an offer arriving.",
"r": "Sweet talk that deserves a second look.",
"wu": "Arrival, approach—sometimes that of a messenger; advances, proposition, demeanour, invitation, incitement.",
"wr": "Trickery, artifice, subtlety, swindling, duplicity, fraud."
},
{
"id": "C13",
"n": "Queen of Cups",
"u": "Loving wisdom and good intuition.",
"r": "Mixed feelings, and a reason to look twice.",
"wu": "Good, fair woman; honest, devoted woman, who will do service to the Querent; loving intelligence, and hence the gift of vision; success, happiness, pleasure; also wisdom, virtue; a perfect spouse and a good mother.",
"wr": "The accounts vary; good woman; otherwise, distinguished woman but one not to be trusted; perverse woman; vice, dishonour, depravity."
},
{
"id": "C14",
"n": "King of Cups",
"u": "Fairness, responsibility, kindness, art and learning.",
"r": "Unfairness and a setback.",
"wu": "Fair man, man of business, law, or divinity; responsible, disposed to oblige the Querent; also equity, art and science, including those who profess science, law and art; creative intelligence.",
"wr": "Dishonest, double-dealing man; roguery, exaction, injustice, vice, scandal, pillage, considerable loss."
},
{
"id": "S01",
"n": "Ace of Swords",
"u": "Great force and triumph, in love or in anger.",
"r": "The same force, pushed too far.",
"wu": "Triumph, the excessive degree in everything, conquest, triumph of force. It is a card of great force, in love as well as in hatred. The crown may carry a much higher significance than comes usually within the sphere of fortune-telling.",
"wr": "The same, but the results are disastrous; another account says—conception, childbirth, augmentation, multiplicity."
},
{
"id": "S02",
"n": "Two of Swords",
"u": "A truce, with balance, courage and friendship.",
"r": "Mixed messages and a hard choice.",
"wu": "Conformity and the equipoise which it suggests, courage, friendship, concord in a state of arms; another reading gives tenderness, affection, intimacy. The suggestion of harmony and other favourable readings must be considered in a qualified manner, as Swords generally are not symbolical of beneficent forces in human affairs.",
"wr": "Imposture, falsehood, duplicity, disloyalty."
},
{
"id": "S03",
"n": "Three of Swords",
"u": "Heartbreak, separation or delay.",
"r": "Confusion, mistakes and loss.",
"wu": "Removal, absence, delay, division, rupture, dispersion, and all that the design signifies naturally, being too simple and obvious to call for specific enumeration.",
"wr": "Mental alienation, error, loss, distraction, disorder, confusion."
},
{
"id": "S04",
"n": "Four of Swords",
"u": "Rest, retreat and keeping watch.",
"r": "Being careful and sensible again.",
"wu": "Vigilance, retreat, solitude, hermit's repose, exile, tomb and coffin. It is these last that have suggested the design.",
"wr": "Wise administration, circumspection, economy, avarice, precaution, testament."
},
{
"id": "S05",
"n": "Five of Swords",
"u": "A loss, or losing face.",
"r": "The same loss, and saying goodbye.",
"wu": "Degradation, destruction, revocation, infamy, dishonour, loss, with the variants and analogues of these.",
"wr": "The same; burial and obsequies."
},
{
"id": "S06",
"n": "Six of Swords",
"u": "A journey over water, and moving on.",
"r": "A confession, or something said out loud.",
"wu": "Journey by water, route, way, envoy, commissionary, expedient.",
"wr": "Declaration, confession, publicity; one account says that it is a proposal of love."
},
{
"id": "S07",
"n": "Seven of Swords",
"u": "A plan or a hope that might fail.",
"r": "Good advice, and possibly some gossip.",
"wu": "Design, attempt, wish, hope, confidence; also quarrelling, a plan that may fail, annoyance. The design is uncertain in its import, because the significations are widely at variance with each other.",
"wr": "Good advice, counsel, instruction, slander, babbling."
},
{
"id": "S08",
"n": "Eight of Swords",
"u": "Feeling trapped or stuck.",
"r": "Trouble and surprises that nobody planned.",
"wu": "Bad news, violent chagrin, crisis, censure, power in trammels, conflict, calumny; also sickness.",
"wr": "Disquiet, difficulty, opposition, accident, treachery; what is unforeseen; fatality."
},
{
"id": "S09",
"n": "Nine of Swords",
"u": "Disappointment and worry.",
"r": "Doubt, suspicion and reasonable fears.",
"wu": "Death, failure, miscarriage, delay, deception, disappointment, despair.",
"wr": "Imprisonment, suspicion, doubt, reasonable fear, shame."
},
{
"id": "S10",
"n": "Ten of Swords",
"u": "Sadness at its lowest point, with better days after it.",
"r": "Some success that will not last.",
"wu": "Whatsoever is intimated by the design; also pain, affliction, tears, sadness, desolation. It is not especially a card of violent death.",
"wr": "Advantage, profit, success, favour, but none of these are permanent; also power and authority."
},
{
"id": "S11",
"n": "Page of Swords",
"u": "Watching closely and checking things out.",
"r": "Being caught unprepared.",
"wu": "Authority, overseeing, secret service, vigilance, spying, examination, and the qualities thereto belonging.",
"wr": "More evil side of these qualities; what is unforeseen, unprepared state; sickness is also intimated."
},
{
"id": "S12",
"n": "Knight of Swords",
"u": "Bravery and skill, and rushing in to fight.",
"r": "Rash and reckless behavior.",
"wu": "Skill, bravery, capacity, defence, address, enmity, wrath, war, destruction, opposition, resistance, ruin. There is therefore a sense in which the card signifies death, but it carries this meaning only in its proximity to other cards of fatality.",
"wr": "Imprudence, incapacity, extravagance."
},
{
"id": "S13",
"n": "Queen of Swords",
"u": "Sadness, absence and going without.",
"r": "Sharp words and a narrow view.",
"wu": "Widowhood, female sadness and embarrassment, absence, sterility, mourning, privation, separation.",
"wr": "Malice, bigotry, artifice, prudery, bale, deceit."
},
{
"id": "S14",
"n": "King of Swords",
"u": "Judgment, command and sharp thinking.",
"r": "Harshness and being too strict.",
"wu": "Whatsoever arises out of the idea of judgment and all its connexions—power, command, authority, militant intelligence, law, offices of the crown, and so forth.",
"wr": "Cruelty, perversity, barbarity, perfidy, evil intention."
},
{
"id": "P01",
"n": "Ace of Pentacles",
"u": "Complete contentment, and wealth.",
"r": "The bad side of money, though still wealth.",
"wu": "Perfect contentment, felicity, ecstasy; also speedy intelligence; gold.",
"wr": "The evil side of wealth, bad intelligence; also great riches. In any case it shews prosperity, comfortable material conditions, but whether these are of advantage to the possessor will depend on whether the card is reversed or not."
},
{
"id": "P02",
"n": "Two of Pentacles",
"u": "Juggling several things and having fun.",
"r": "Pretending to be happy, and letters or writing.",
"wu": "On the one hand it is represented as a card of gaiety, recreation and its connexions, which is the subject of the design; but it is read also as news and messages in writing, as obstacles, agitation, trouble, embroilment.",
"wr": "Enforced gaiety, simulated enjoyment, literal sense, handwriting, composition, letters of exchange."
},
{
"id": "P03",
"n": "Three of Pentacles",
"u": "Skilled work and recognition.",
"r": "Average work and pettiness.",
"wu": "Métier, trade, skilled labour; usually, how-ever, regarded as a card of nobility, aristocracy, renown, glory.",
"wr": "Mediocrity, in work and otherwise, puerility, pettiness, weakness."
},
{
"id": "P04",
"n": "Four of Pentacles",
"u": "Holding on tightly to what you have.",
"r": "Delay and opposition.",
"wu": "The surety of possessions, cleaving to that which one has, gift, legacy, inheritance.",
"wr": "Suspense, delay, opposition."
},
{
"id": "P05",
"n": "Five of Pentacles",
"u": "Hard times and money trouble.",
"r": "Disorder, and things that need putting back together.",
"wu": "The card foretells material trouble above all, whether in the form illustrated—that is, destitution—or otherwise. For some cartomancists, it is a card of love and lovers—wife, husband, friend, mistress; also concordance, affinities. These alternatives cannot be harmonized.",
"wr": "Disorder, chaos, ruin, discord, profligacy."
},
{
"id": "P06",
"n": "Six of Pentacles",
"u": "Gifts, generosity and good times now.",
"r": "Envy and wanting more.",
"wu": "Presents, gifts, gratification; another account says attention, vigilance; now is the accepted time, present prosperity, etc.",
"wr": "Desire, cupidity, envy, jealousy, illusion."
},
{
"id": "P07",
"n": "Seven of Pentacles",
"u": "Money and business, and waiting to see what grows.",
"r": "Worry about money you might lend.",
"wu": "These are exceedingly contradictory; in the main, it is a card of money, business, barter; but one reading gives altercation, quarrel—and another innocence, ingenuity, purgation.",
"wr": "Cause for anxiety regarding money which it may be proposed to lend."
},
{
"id": "P08",
"n": "Eight of Pentacles",
"u": "Work, skill and learning a trade.",
"r": "Ambition without a purpose.",
"wu": "Work, employment, commission, craftsmanship, skill in craft and business, perhaps in the preparatory stage.",
"wr": "Voided ambition, vanity, cupidity, exaction, usury. It may also signify the possession of skill, in the sense of the ingenious mind turned to cunning and intrigue."
},
{
"id": "P09",
"n": "Nine of Pentacles",
"u": "Safety, success and good judgment.",
"r": "Plans that fall through.",
"wu": "Prudence, safety, success, accomplishment, certitude, discernment.",
"wr": "Roguery, deception, voided project, bad faith."
},
{
"id": "P10",
"n": "Ten of Pentacles",
"u": "Family, home and wealth.",
"r": "Chance and loss, and sometimes a gift.",
"wu": "Gain, riches; family matters, archives, extraction, the abode of a family.",
"wr": "Chance, fatality, loss, robbery, games of hazard; sometimes gift, dowry, pension."
},
{
"id": "P11",
"n": "Page of Pentacles",
"u": "Study, careful thought and news.",
"r": "Wasteful spending and unwelcome news.",
"wu": "Application, study, scholarship, reflection; another reading says news, messages and the bringer thereof; also rule, management.",
"wr": "Prodigality, dissipation, liberality. luxury; unfavourable news."
},
{
"id": "P12",
"n": "Knight of Pentacles",
"u": "Being useful, reliable and responsible.",
"r": "Being stuck in a rut and careless.",
"wu": "Utility, serviceableness, interest, responsibility, rectitude—all on the normal and external plane.",
"wr": "inertia, idleness, repose of that kind, stagnation; also placidity, discouragement, carelessness."
},
{
"id": "P13",
"n": "Queen of Pentacles",
"u": "Generosity, comfort and security.",
"r": "Doubt and worry.",
"wu": "Opulence, generosity, magnificence, security, liberty.",
"wr": "Evil, suspicion, suspense, fear, mistrust."
},
{
"id": "P14",
"n": "King of Pentacles",
"u": "Business sense and steady success.",
"r": "Shaky footing and a need for care.",
"wu": "Valour, realizing intelligence, business and normal intellectual aptitude, sometimes mathematical gifts and attainments of this kind; success in these paths.",
"wr": "Vice, weakness, ugliness, perversity, corruption, peril."
}
];
