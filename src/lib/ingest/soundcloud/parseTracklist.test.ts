import assert from "node:assert/strict";
import { parseDescriptionTracklist } from "./parseTracklist";

const timed = `
Set vibes
[0:00] Artist One - Track A
[6:12] Artist Two - Track B
[12:30] Artist Three - ID
Follow me on Instagram
`;
const timedPlays = parseDescriptionTracklist(timed, 3600);
assert.equal(timedPlays.length, 3);
assert.equal(timedPlays[0].timestamp, 0);
assert.equal(timedPlays[1].timestamp, 6 * 60 + 12);
assert.equal(timedPlays[2].idStatus, "unresolved_id");

const untimed = `
Artist One - Track A
Artist Two - Track B
https://soundcloud.com/foo
`;
const untimedPlays = parseDescriptionTracklist(untimed, 3600);
assert.equal(untimedPlays.length, 2);
assert.equal(untimedPlays[0].trackTitle, "Track A");

const empty = parseDescriptionTracklist("Just a vibe dump with no tracklist", 3600);
assert.equal(empty.length, 0);

const numbered = parseDescriptionTracklist(
  `01 | Intro - berlin city
02 | Thomas Tonfeld - Die Straßen
03 | Jonny Bee - Flowers And Flawors (Original Mix)`,
  3600,
  "hearthis",
);
assert.equal(numbered.length, 3);
assert.equal(numbered[1].artistName, "Thomas Tonfeld");
assert.equal(numbered[0].provenance, "hearthis");

const cercle = parseDescriptionTracklist(
  `Max Richter live
TRACKLIST
00:00:00 They Will Shade Us With Their Wings
00:09:41 Life Study 1
00:10:19 A Colour Field (Holocene)
JOIN THE CERCLE COMMUNITY
➤ Website: https://cercle.io`,
  3600,
  "youtube",
);
assert.equal(cercle.length, 3);
assert.equal(cercle[0].trackTitle, "They Will Shade Us With Their Wings");
assert.equal(cercle[0].timestamp, 0);
assert.equal(cercle[1].timestamp, 9 * 60 + 41);
assert.equal(cercle[0].provenance, "youtube");

const james = parseDescriptionTracklist(
  `Tracklist:
0:00 Technotronic - Pump Up The Jam
2:05 James Hype, Tita Lau - Mama Said
4:53 DJ Chus - That Feeling`,
  2700,
  "youtube",
);
assert.equal(james.length, 3);
assert.equal(james[0].artistName, "Technotronic");
assert.equal(james[1].timestamp, 2 * 60 + 5);

const heldeep = parseDescriptionTracklist(
  `Heldeep Radio Opener - 00:00
1. Aden Rémai, GAWP - Killer Sound (feat. I Jah) 00:39
2. Oliver Heldens, Kryder, The Young Punx - AEIOU 03:44
3. Oden & Fatzo - You Don't Want To Think About It 08:29`,
  3600,
  "youtube",
);
assert.equal(heldeep.length, 4);
assert.equal(heldeep[1].timestamp, 39);
assert.equal(heldeep[1].artistName, "Aden Rémai, GAWP");
assert.equal(heldeep[2].timestamp, 3 * 60 + 44);

// hearthis-style: dense untimed Track List with a few trailing cue annotations
// (previously collapsed to only the 3 stamped rows).
const plugUglies = parseDescriptionTracklist(
  `PLEASE enjoy this at very loud volume!
Track List:
Kalypsoul, Malü - Mana (House Ape Mix)
VieL - Beautiful Place (Massaged Hard by House Ape)
Armonica, Gioli & Assia - Around (Extended)
Lili Chan - Hold Back (Extended Mix)
Audiotones, Ranta - Riverside
Agoria, Yacine Dessouki, NDRK - Olympe
Soul Button, Deviu - Numinar
Way Out West  [Distinct'ive Records 2004] - Fear  00:33:27
AceNoise - Indian Vibes
Basaar, Anonimat - Ocean Full of Life
Alok, Gryffin, Julia Church - Never Letting Go (Extended Mix)
Stephan Bodzin, Jem Cooke, Massano - Healing (Extended Mix)
Content of Void - Daywalker
Jorkes - Hot (NIKKNAME Remix)
Martijn Ten Velden - Inhale
let me you, Parque, BERNT - in another life
Bullet Tooth - If I can't be Yours (Enamour Remix)
STRFKR  [Polyvinyl Record Company 2013] - Golden Light  01:16:08
Nikita Grib - It's Late For Me (Extended Mix)
Solomun, Vintage Culture - Strange Feelings (Solomun Remix - Extended)
Grafine - This Moment
Ede - Tolia
Teemon & Poomba - Dreams Driver
Takis - Coffee & Cigarettes (Extended Mix)
PROFF, Volen Sentir - The Rumble (Slobberknocked by House Ape)
Booka Shade, Gab Rhome - The Sun (Jan Blomqvist Extended Remix)
Eleonora, Fake Mood, Pepel, Kohaan - I Can Feel (House Ape Mix)
Courtney Storm, mölly (USA) - The Leap (Extended Ape Slap Mix)
Sebastien Leger  [Lost & Found 2019] – Lanarka  02:00:31
Leandro Murua - Pacha
Animalize (UK) - Yttria
Nicky Romero, Monocule - Lost In The Dust (Extended Mix)
Ayadou - Memories (Extended Mix)
Klangphonics, Anna Metko - Ghost (Find Me Again)
Budakid - Loganta
MYRNE - Ignis
Jakatta - American Dream (PROFF Extended Interpretation)
Lola Bozzano - Tango
Gorge - Touch The Sky (Extended Mix)
Naag - Liugin (El Mundo & Zazou Remix)
Nuage, Carbon Mass - Desert Moth (Extended)`,
  11162,
  "hearthis",
);
assert.equal(plugUglies.length, 41);
assert.equal(plugUglies[0]!.artistName, "Kalypsoul, Malü");
assert.equal(plugUglies[7]!.trackTitle, "Fear");
assert.equal(plugUglies[7]!.timestamp, 33 * 60 + 27);
assert.equal(plugUglies[17]!.trackTitle, "Golden Light");
assert.equal(plugUglies[17]!.timestamp, 1 * 3600 + 16 * 60 + 8);
assert.equal(plugUglies[28]!.trackTitle, "Lanarka");
assert.equal(plugUglies[28]!.timestamp, 2 * 3600 + 31);
assert.equal(plugUglies[40]!.artistName, "Nuage, Carbon Mass");
assert.equal(plugUglies[0]!.provenance, "hearthis");
// Sparse cues stay monotonic with interpolated neighbors
assert.ok(plugUglies[6]!.timestamp <= plugUglies[7]!.timestamp);
assert.ok(plugUglies[7]!.timestamp <= plugUglies[8]!.timestamp);

// Coachella-style description: "MM:SS: Artist - \"Title\"" (colon after
// timestamp + quoted title). Artist must survive; quotes must be stripped.
const coachella = parseDescriptionTracklist(
  `0:00: Aerosmith - "Eat The Rich"
13:00: Fred again.. x The Blessed Madonna - "Marea (We've Lost Dancing)"
45:33: Skrillex, ISOxo - "fuze"
50:45: Bruce Springsteen - "Born To Run"`,
  52 * 60 + 30,
  "youtube",
);
assert.equal(coachella.length, 4);
assert.equal(coachella[0]!.artistName, "Aerosmith");
assert.equal(coachella[0]!.trackTitle, "Eat The Rich");
assert.equal(coachella[0]!.timestamp, 0);
assert.equal(coachella[1]!.artistName, "Fred again.. x The Blessed Madonna");
assert.equal(coachella[1]!.trackTitle, "Marea (We've Lost Dancing)");
assert.equal(coachella[1]!.timestamp, 13 * 60);
assert.equal(coachella[2]!.artistName, "Skrillex, ISOxo");
assert.equal(coachella[2]!.trackTitle, "fuze");
assert.equal(coachella[3]!.trackTitle, "Born To Run");

const peggyCercle = parseDescriptionTracklist(
  `Peggy Gou for Cercle
00:00 Ebi - San
02:55 ID - ID
05:33 Commix - Satellite Song (Underground Resistance Remix)
08:20 Woody McBride - Darrin Houston
JOIN THE CERCLE COMMUNITY`,
  3600,
  "youtube",
);
assert.ok(peggyCercle.length >= 3);
assert.equal(peggyCercle[0]!.artistName, "Ebi");
assert.equal(peggyCercle[0]!.trackTitle, "San");
assert.equal(peggyCercle[0]!.timestamp, 0);
assert.equal(peggyCercle[1]!.idStatus, "unresolved_id");
assert.equal(peggyCercle[2]!.artistName, "Commix");

console.log("parseTracklist.test.ts ok");
