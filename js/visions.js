'use strict';
/* THE CRYSTAL BALL'S VISIONS (Jackie, Nov 25: the ball should "offer famous predictions yet to come on specific dates with attributions
   almost like it's possessed with visions from the other side"; asked whether they should replace its yes and no answers: "Replace
   them"). Every one is a REAL PREDICTION: something a named person, or a named tradition, foretold, wagered or dreamed for a stated
   year that is still to come. A first version also had things astronomers have calculated and things people have scheduled;
   Jackie: "For the crystal ball I want REAL predictions though", so those are out.
   Each is given the way a quotation is: t is the prediction, said plainly in the game's own words, and by is who foretold it, where
   and when (Jackie, Nov 25: "In the predictions, I prefer a more classic approach to attribution"). The ball shows the prediction
   and then a dash and the attribution. A first version had every one begin "I predict!" with the name worked into the sentence.
   Sources are in research_notes/visions/. Left out on purpose: anything credited to Baba Vanga, Mother Shipton or Saint Malachy
   (forged or never said), and predictions of particular disasters.
   A vision whose date has passed should be taken out: the earliest here is in 2029. */
const BALL_VISIONS=[
 {t:"On May 1, 2029, it will be settled whether a living thing can be worked out entirely from its genes. A case of port rides on it.",by:"Lewis Wolpert and Rupert Sheldrake, a wager, 2009"},
 {t:"In 2029 a machine will talk so well that judges take it for a person.",by:"Ray Kurzweil, wagering twenty thousand dollars against Mitch Kapor, 2002"},
 {t:"By 2030 three hours of work a day will be plenty, and the hard part will be filling the afternoon.",by:"John Maynard Keynes, “Economic Possibilities for our Grandchildren”, 1930"},
 {t:"By 2030 there will be minds greater than human ones. It would be a surprise if it took longer.",by:"Vernor Vinge, “The Coming Technological Singularity”, 1993"},
 {t:"By the last day of 2030 nobody will have proved that aliens have visited the Earth.",by:"Michael Shermer, a wager against Avi Loeb, 2025"},
 {t:"By 2035 coffee, tea and tobacco will be out of fashion.",by:"Nikola Tesla, “A Machine to End War”, 1935"},
 {t:"By 2040 a machine with the mind of a person will walk about freely.",by:"Hans Moravec, roboticist"},
 {t:"In 2040 a machine will be perfected that makes anything at all at home. Farms, factories and jobs will fade away and the arts will bloom.",by:"Arthur C. Clarke"},
 {t:"By 2043 diggers will have found buildings older and grander than the oldest temple known.",by:"Samo Burja, a wager against Scott Alexander, 2023"},
 {t:"In 2045 people and their thinking machines will merge, and change faster than anyone can follow.",by:"Ray Kurzweil, “The Singularity Is Near”, 2005"},
 {t:"By 2048 science will know how the brain makes a mind. A case of wine rides on it.",by:"Christof Koch, a second wager against David Chalmers, 2023"},
 {t:"By 2050 most new science will be discovered by machines, who are our children.",by:"Hans Moravec, roboticist"},
 {t:"By 2057 children will design their own plants and pets as a game.",by:"Freeman Dyson, “Our Biotech Future”, 2007"},
 {t:"On October 4, 2057, the hundredth birthday of the first satellite will be celebrated on the Moon, on Mars and on the moons of Jupiter.",by:"Arthur C. Clarke"},
 {t:"The world will not end before the year 2060. There is no reason for it ending sooner.",by:"Isaac Newton, a private manuscript on the Book of Daniel, about 1704"},
 {t:"In 2061 Halley’s Comet will return, people will land on it, and they will find something alive there, asleep.",by:"Arthur C. Clarke"},
 {t:"In 2095 a new kind of engine will make rockets old-fashioned, and the first explorers will leave for the stars.",by:"Arthur C. Clarke"},
 {t:"In the year 2100, history begins.",by:"Arthur C. Clarke, the whole entry for that year"},
 {t:"In the year 2100 Edgar Cayce will be born again, in Nebraska.",by:"Edgar Cayce, a dream, 1936"},
 {t:"In the year 2106 the world will be peaceful, and everybody as clever as the great geniuses.",by:"H. G. Wells, “The Shape of Things to Come”, 1933"},
 {t:"By 2117 people will have settled on another planet.",by:"Stephen Hawking, 2017"},
 {t:"In the year 2240 the world will have lasted six thousand years, and a thousand years of rest will begin.",by:"Rav Katina, in the Babylonian Talmud, third century"},
 {t:"In the year 2424 the last king of the hidden land of Shambhala will ride out, and a golden age will follow all over the world.",by:"The Kalachakra Tantra, eleventh century"},
 {t:"In the year 2440 Paris will have good hospitals, sensible clothes and no pastry chefs.",by:"Louis-Sébastien Mercier, “The Year 2440”, 1771"},
 {t:"By the year 2780 heavy things will be made weightless for easy carrying.",by:"Benjamin Franklin, a letter to Joseph Priestley, 1780"},
 {t:"In the year 2889 dinner will arrive at home through a tube, and advertisements will be projected on the clouds.",by:"Jules and Michel Verne, “In the Year 2889”, 1889"},
 {t:"These prophecies run until the year 3797.",by:"Nostradamus, a letter to César, 1555"},
 {t:"About the year 4099 the world will climb into a higher and brighter age.",by:"Sri Yukteswar Giri, “The Holy Science”, 1894"},
 {t:"On October 21, 4772, the crowning of King Pakal will still be remembered.",by:"The scribes of Palenque, carved in stone, seventh century"},
 {t:"In the year 428,899 the present age will end and a golden one begin.",by:"The Hindu astronomers, in the Surya Siddhanta and the Puranas"}];
const ballSay=v=>v.t+' \u2014 '+v.by+'.'; // the prediction, a dash, and who foretold it
