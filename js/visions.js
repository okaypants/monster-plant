'use strict';
/* THE CRYSTAL BALL'S VISIONS (Jackie, Nov 25: the ball should "offer famous predictions yet to come on specific dates with attributions
   almost like it's possessed with visions from the other side"; asked whether they should replace its yes and no answers: "Replace
   them"). Every one is a REAL PREDICTION: something a named person, or a named tradition, foretold, wagered or dreamed for a stated
   year that is still to come. A first version also had things astronomers have calculated (eclipses, comets) and things people have
   scheduled (time capsules, long pieces of music); Jackie: "For the crystal ball I want REAL predictions though", so those are out.
   The ball delivers them all with the same solemn "I predict!", in the manner of the television psychics of the 1950s.
   Sources are in research_notes/visions/prophets.md (and set_in_motion.md for the public bets). Left out on purpose: anything
   credited to Baba Vanga, Mother Shipton or Saint Malachy (forged or never said), and predictions of particular disasters.
   A vision whose date has passed should be taken out: the earliest here is in 2029. */
const BALL_VISIONS=[
 "I predict! On May 1, 2029, a bet will be settled over a case of port. Lewis Wolpert wagered that by then a living thing could be worked out entirely from its genes. Rupert Sheldrake wagered that it could not.",
 "I predict! In 2029 a machine will talk so well that judges take it for a person. Ray Kurzweil has bet twenty thousand dollars on it. Mitch Kapor has bet twenty thousand that it will not.",
 "I predict! By 2030 three hours of work a day will be plenty, and the hard part will be filling the afternoon. The economist John Maynard Keynes foretold it in 1930.",
 "I predict! By 2030 there will be minds greater than human ones. The mathematician Vernor Vinge wrote in 1993 that it would be a surprise if it took any longer.",
 "I predict! By the last day of 2030 nobody will have proved that aliens have visited the Earth. Michael Shermer has bet on it. The astronomer Avi Loeb has bet the other way.",
 "I predict! By 2035 coffee, tea and tobacco will be out of fashion. Nikola Tesla foretold it in 1935. The ball is not so sure about the coffee.",
 "I predict! By 2040 a machine with the mind of a person will walk about freely. The roboticist Hans Moravec foretold it.",
 "I predict! In 2040 a machine will be perfected that makes anything at all at home, and farms, factories and jobs will fade away while the arts bloom. Arthur C. Clarke foretold it.",
 "I predict! By 2043 diggers will have found buildings older and grander than the oldest temple known. Samo Burja has bet on it. Scott Alexander has bet against.",
 "I predict! In 2045 people and their thinking machines will merge, and change faster than anyone can follow. Ray Kurzweil named the year.",
 "I predict! By 2048 science will know how the brain makes a mind. Christof Koch has bet a case of wine on it, for the second time. The first time, the philosopher David Chalmers won.",
 "I predict! By 2050 most new science will be discovered by machines. The roboticist Hans Moravec foretold it and called them our children.",
 "I predict! By 2057 children will design their own plants and pets as a game. The physicist Freeman Dyson foretold it.",
 "I predict! On October 4, 2057, the hundredth birthday of the first satellite will be celebrated on the Moon, on Mars and on the moons of Jupiter. Arthur C. Clarke foretold it.",
 "I predict! The world will not end before the year 2060. Isaac Newton worked it out from the Book of Daniel and wrote that there was no reason for it ending sooner.",
 "I predict! In 2061 Halley’s Comet will return, people will land on it, and they will find something alive there, asleep. Arthur C. Clarke foretold it.",
 "I predict! In 2095 a new kind of engine will make rockets old-fashioned, and the first explorers will leave for the stars. Arthur C. Clarke foretold it.",
 "I predict! In the year 2100, history begins. That is all Arthur C. Clarke wrote for that year.",
 "I predict! In the year 2100 Edgar Cayce will be born again, in Nebraska. Cayce dreamed it in 1936.",
 "I predict! In the year 2106 the world will be peaceful and everybody as clever as the great geniuses. H. G. Wells dreamed it and wrote it down.",
 "I predict! By 2117 people will have settled on another planet. Stephen Hawking said in 2017 that there were a hundred years to do it.",
 "I predict! In the year 2240 the world will have lasted six thousand years, and a thousand years of rest will begin. Rav Katina taught this in Babylonia in the third century.",
 "I predict! In the year 2424 the last king of the hidden land of Shambhala will ride out, and a golden age will follow all over the world. A Buddhist book of the eleventh century foretells it.",
 "I predict! In the year 2440 Paris will have good hospitals, sensible clothes and no pastry chefs. Louis-Sébastien Mercier dreamed it in 1771.",
 "I predict! By the year 2780 heavy things will be made weightless for easy carrying. Benjamin Franklin wondered about it in 1780 and wished to have been born later.",
 "I predict! In the year 2889 dinner will arrive at home through a tube, and advertisements will be projected on the clouds. A story under the name of Jules Verne foretells it.",
 "I predict! The prophecies of Nostradamus run until the year 3797. Nostradamus said so in a letter. After that the ball is on its own.",
 "I predict! About the year 4099 the world will climb into a higher and brighter age. The Bengali yogi Sri Yukteswar reckoned it in 1894.",
 "I predict! On October 21, 4772, the crowning of King Pakal of Palenque will still be remembered. The king’s scribes carved that promise in stone thirteen hundred years ago.",
 "I predict! In the year 428,899 the present age will end and a golden one begin. The Hindu astronomers counted the years."];
