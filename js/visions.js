'use strict';
/* THE CRYSTAL BALL'S VISIONS (Jackie, Nov 25: the ball should "offer famous predictions yet to come on specific dates with attributions
   almost like it's possessed with visions from the other side"; asked whether they should replace its yes and no answers: "Replace
   them"). Every one is a REAL PREDICTION: something a named person, or a named tradition, foretold, wagered or dreamed for a stated
   year that is still to come. A first version also had things astronomers have calculated and things people have scheduled;
   Jackie: "For the crystal ball I want REAL predictions though", so those are out.
   Each is given the way a quotation is: t is the prediction, said plainly in the game's own words, and by is who foretold it, where
   and when (Jackie, Nov 25: "In the predictions, I prefer a more classic approach to attribution"). The ball shows the prediction
   and then a dash and the attribution. A first version had every one begin "I predict!" with the name worked into the sentence.
   Sources are in research_notes/visions/ (prophets.md, set_in_motion.md for the bets, and more_predictions.md for the 35 added when
   Jackie asked for "a lot more predictions"). Some are dates named in a story, like the Verne and Mercier ones. Left out on purpose: anything credited to Baba Vanga, Mother Shipton or Saint Malachy
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
 {t:"In the year 428,899 the present age will end and a golden one begin.",by:"The Hindu astronomers, in the Surya Siddhanta and the Puranas"},
 {t:"By 2030 airline passengers will fly in planes with no pilot.",by:"Craig Mundie, a wager against Eric Schmidt, 2002"},
 {t:"By 2030 the know-how will be ready to build a city under the sea, in a great glass ball that holds five thousand people.",by:"Shimizu Corporation, Tokyo, 2014"},
 {t:"By 2033 science will have explained why the universe is made of matter and not antimatter.",by:"Japan’s Science and Technology Foresight survey, 2019"},
 {t:"By 2035 people will have settled on Mars for good.",by:"Buzz Aldrin, “Mission to Mars”, 2013"},
 {t:"By 2036 a signal from intelligent aliens will be found. A cup of coffee for everybody rides on it.",by:"Seth Shostak, astronomer, 2020"},
 {t:"Nobody will be able to walk into a shop and buy a flying car before 2036.",by:"Rodney Brooks, “My Dated Predictions”, 2018"},
 {t:"By 2040 people will enjoy life free of health worries until they are 100 years old.",by:"The Government of Japan, Moonshot Goal 7"},
 {t:"On October 3, 2040, two friends in Tokyo will sit marvelling at how prosperous and peaceful Japan has become.",by:"Suehiro Tetchō, “Plum Blossoms in the Snow”, 1886"},
 {t:"In February 2044 a new grand cycle of 180 years begins. Its first twenty years are said to bring wisdom, scholars and good health.",by:"The flying star school of Chinese feng shui"},
 {t:"A robot as attentive and as faithful as a dog will not arrive before 2048.",by:"Rodney Brooks, “My Dated Predictions”, 2018"},
 {t:"By 2050 a team of robots will beat the world champions at football.",by:"The RoboCup Federation, founded in Japan, 1997"},
 {t:"By 2050 people will tame the wind and the rain by changing the weather.",by:"The Government of Japan, Moonshot Goal 8"},
 {t:"By 2050 there will be a lift into space, climbing a cable 96,000 kilometres long.",by:"Obayashi Corporation, Tokyo, 2012"},
 {t:"There will be fewer people on Earth in 2060 than on the day of this wager.",by:"Kevin Kelly, a wager, 2017"},
 {t:"By 2061 a great computer will have worked out how to run the whole Earth on sunlight.",by:"Isaac Asimov, “The Last Question”, 1956"},
 {t:"In 2062 the working week will be one hour a day, two days a week.",by:"William Hanna and Joseph Barbera, “The Jetsons”, 1962"},
 {t:"The Age of Aquarius begins in 2062.",by:"Dane Rudhyar, “Astrological Timing”, 1969"},
 {t:"In 2080 the statues in Buenos Aires will be of the people who rid the world of diseases, not of generals.",by:"Achille Sioen, “Buenos Aires en el año 2080”, 1879"},
 {t:"In 2081 a town in Pennsylvania will sit under a roof and keep tropical weather all year.",by:"Gerard K. O’Neill, “2081: A Hopeful View of the Human Future”, 1981"},
 {t:"By about 2100 people will command all the energy that falls on the Earth.",by:"Carl Sagan"},
 {t:"On September 3, 2112, a robot cat named Doraemon will be made at the Matsushiba Robot Factory. Mice will later nibble off its ears.",by:"Fujiko F. Fujio, “Doraemon”, begun 1969"},
 {t:"In 2126 the surgeons and the lawyers will be steam-driven automatons, and everyone will travel by balloon.",by:"Jane Webb Loudon, “The Mummy!”, 1827"},
 {t:"In 2150 at least one person who was alive in the year 2000 will still be alive.",by:"Peter Schwartz, a wager, 2002"},
 {t:"In the 22nd century people will look back on the old quarrels between religions with embarrassment.",by:"Rahul Sankrityayan, “The Twenty-Second Century”, 1923"},
 {t:"In the 22nd century science will wake the ancient hero Rostam, who will find the modern world very puzzling.",by:"Abdolhossein Sanatizadeh Kermani, “Rostam in the Twenty-Second Century”, 1934"},
 {t:"In 2176 people almost everywhere will be numerous, rich and in control of the forces of nature.",by:"Herman Kahn, “The Next 200 Years”, 1976"},
 {t:"In the year 2660 people will learn their lessons from a machine while they sleep.",by:"Hugo Gernsback, “Ralph 124C 41+”, 1911"},
 {t:"In 2824 there will be farms and houses under the sea, and machines that write poetry.",by:"Faddei Bulgarin, “Plausible Fantasies”, 1824"},
 {t:"On April 1, 2848, a pleasure balloon will be crossing the ocean at a hundred miles an hour, and a passenger will complain that it is painfully slow.",by:"Edgar Allan Poe, “Mellonta Tauta”, 1849"},
 {t:"In the year 3000 there will be one money for all of Europe, and a way of paying without coins.",by:"Paolo Mantegazza, “The Year 3000: A Dream”, 1897"},
 {t:"In 3573 the present age will give way to one in which people live as brothers and sisters.",by:"Rudolf Steiner, lectures, 1906 to 1924"},
 {t:"In the year 4338 every household will send round a newspaper of its own news in place of letters.",by:"Vladimir Odoevsky, “The Year 4338”, 1835"},
 {t:"About the year 5164 people will be using the whole output of the Sun.",by:"Nikolai Kardashev, 1964"},
 {t:"The human race will last until at least the year 7100.",by:"J. Richard Gott, in the journal Nature, 1993"},
 {t:"In the year 802,701 people will be small, gentle and childlike, and will live on fruit in great crumbling palaces.",by:"H. G. Wells, “The Time Machine”, 1895"}];
const ballSay=v=>v.t+' \u2014 '+v.by+'.'; // the prediction, a dash, and who foretold it
