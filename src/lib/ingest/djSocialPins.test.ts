import assert from "node:assert/strict";
import { hintForName } from "./discovery/knownHandles";
import { DJ_SOCIAL_PINS } from "./djSocialPins";
import { slugify } from "./types";

const bySlug = Object.fromEntries(DJ_SOCIAL_PINS.map((p) => [p.slug, p]));

for (const slug of [
  "biscits",
  "david-guetta",
  "fisher",
  "artbat",
  "ac-slater",
  "solomun",
  "odd-mob",
  "westend",
  "sara-landry",
  "lilly-palmer",
  "tape-b",
  "hntr",
  "marten-horger",
  "gentlemens-groove",
  "charlotte-de-witte",
  "black-coffee",
  "chapter-verse",
  "walker-royce",
  "vintage-culture",
  "bleu-clair",
  "hot-since-82",
  "adam-beyer",
  "dijon",
  "dom-dolla",
  "chris-lorenzo",
  "hannah-wants",
  "dimitri-vegas-like-mike",
  "msendy",
]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.website, /^https?:\/\//);
  if (bySlug[slug]!.soundcloud) {
    assert.match(bySlug[slug]!.soundcloud!, /^https:\/\/soundcloud\.com\//);
  }
  if (bySlug[slug]!.instagram) {
    assert.match(bySlug[slug]!.instagram!, /instagram\.com\//);
  }
}

assert.match(bySlug.biscits!.instagram!, /itsbiscits/);
assert.match(bySlug.fisher!.instagram!, /followthefishtv/);
assert.match(bySlug["david-guetta"]!.twitter!, /davidguetta/);
assert.match(bySlug.artbat!.soundcloud!, /artbatmusic/);
assert.match(bySlug["ac-slater"]!.website, /djacslater\.com/);
assert.match(bySlug["ac-slater"]!.instagram!, /djacslater/);
assert.match(bySlug.solomun!.website, /solomun\.org/);
assert.match(bySlug.westend!.soundcloud!, /itsthewestend/);
assert.match(bySlug.hntr!.soundcloud!, /hntrnet/);
assert.match(bySlug["tape-b"]!.soundcloud!, /tape-b-official/);
assert.match(bySlug["sara-landry"]!.soundcloud!, /sara-landry-dj/);
assert.match(bySlug["sara-landry"]!.instagram!, /saralandrydj/);
assert.match(bySlug["lilly-palmer"]!.instagram!, /lilly_palmerdj/);
assert.equal(bySlug.westend!.instagram, null);
assert.equal(bySlug["tape-b"]!.instagram, null);
assert.match(bySlug["marten-horger"]!.soundcloud!, /marten-horger/);
assert.match(bySlug["marten-horger"]!.instagram!, /marten_horger/);
assert.match(bySlug["marten-horger"]!.website, /martenhorger\.com/);
assert.match(
  bySlug["gentlemens-groove"]!.soundcloud!,
  /gentlemens-groove-records/,
);
assert.match(
  bySlug["gentlemens-groove"]!.website,
  /facebook\.com\/Gentlemensgroove/i,
);
assert.match(bySlug["charlotte-de-witte"]!.soundcloud!, /charlottedewittemusic/);
assert.match(bySlug["charlotte-de-witte"]!.instagram!, /charlottedewittemusic/);
assert.match(bySlug["charlotte-de-witte"]!.twitter!, /charlottedwitte/);
assert.match(bySlug["charlotte-de-witte"]!.website, /charlottedewittemusic\.com/);

assert.match(bySlug["black-coffee"]!.instagram!, /realblackcoffee/);
assert.match(bySlug["black-coffee"]!.twitter!, /RealBlackCoffee/);
assert.match(bySlug["black-coffee"]!.website, /music\.apple\.com/);
assert.equal(bySlug["chapter-verse"]!.instagram, null);
assert.match(bySlug["chapter-verse"]!.soundcloud!, /chapterandverseofficial/);
assert.match(bySlug["walker-royce"]!.instagram!, /walkerandroyce/);
assert.match(bySlug["walker-royce"]!.twitter!, /WalkerAndRoyce/);
assert.match(bySlug["vintage-culture"]!.website, /vintageculture\.com/);
assert.match(bySlug["vintage-culture"]!.instagram!, /vintageculture/);
assert.match(bySlug["bleu-clair"]!.instagram!, /bleuclairmusic/);
assert.match(bySlug["bleu-clair"]!.soundcloud!, /bleuclair/);
assert.match(bySlug["bleu-clair"]!.twitter!, /bleuclair/);
assert.match(bySlug["hot-since-82"]!.soundcloud!, /hotsince-82/);
assert.match(bySlug["adam-beyer"]!.instagram!, /realadambeyer/);
assert.equal(bySlug["adam-beyer"]!.soundcloud, null);
assert.equal(
  bySlug["adam-beyer"]!.beatport,
  "https://www.beatport.com/artist/adam-beyer/6824",
);
assert.ok(bySlug["bart-skils"]);
assert.match(bySlug["bart-skils"]!.website, /linktr\.ee\/bartskils/);
assert.match(bySlug["bart-skils"]!.soundcloud!, /soundcloud\.com\/bart-skils/);
assert.equal(
  bySlug["bart-skils"]!.beatport,
  "https://www.beatport.com/artist/bart-skils/16211",
);
assert.ok(bySlug["maceo-plex"]);
assert.equal(
  bySlug["maceo-plex"]!.beatport,
  "https://www.beatport.com/artist/maceo-plex/119538",
);
assert.match(bySlug["maceo-plex"]!.instagram!, /instagram\.com\/maceoplex/);
assert.match(bySlug["maceo-plex"]!.twitter!, /x\.com\/maceoplex/);
assert.match(bySlug["maceo-plex"]!.youtube!, /youtube\.com\/@maceoplex/);
assert.match(bySlug.dijon!.website, /dijondijon\.com/);
assert.equal(bySlug.dijon!.soundcloud, null);
assert.match(bySlug["dom-dolla"]!.website, /domdolla\.com\.au/);
assert.match(bySlug["chris-lorenzo"]!.soundcloud!, /chris-lorenzo-1/);
assert.match(bySlug.biscits!.youtube!, /youtube\.com\/@Biscits/i);
assert.match(
  bySlug["dimitri-vegas-like-mike"]!.soundcloud!,
  /dimitrivegasandlikemike/,
);
assert.match(bySlug.msendy!.website, /mixcloud\.com\/Msendy/i);

for (const slug of [
  "fred-again",
  "swedish-house-mafia",
  "joel-corry",
  "dj-snake",
  "atb",
  "nico-moreno",
  "gordo",
  "le-twins",
  "mariana-bo",
  "fantasm",
]) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud!, /^https:\/\/soundcloud\.com\//);
  assert.match(bySlug[slug]!.youtube!, /youtube\.com\//);
}
assert.match(bySlug["fred-again"]!.youtube!, /@Fredagainagain/i);
assert.match(bySlug["fred-again"]!.soundcloud!, /fredagain/);
assert.match(bySlug["swedish-house-mafia"]!.soundcloud!, /officialswedishhousemafia/);
assert.match(bySlug["joel-corry"]!.soundcloud!, /joelcorry/);
assert.match(bySlug["dj-snake"]!.soundcloud!, /soundcloud\.com\/djsnake/);
assert.match(bySlug.atb!.soundcloud!, /atb-music/);
assert.match(bySlug.atb!.youtube!, /@atb/i);
assert.match(bySlug["nico-moreno"]!.soundcloud!, /nicomorenomusic/);
assert.match(bySlug["nico-moreno"]!.youtube!, /@nicomoreno_music/i);
assert.match(bySlug.gordo!.youtube!, /@gordoszn/i);
assert.match(bySlug.gordo!.soundcloud!, /gordoszn/);
assert.match(bySlug["le-twins"]!.youtube!, /@letwinsdjs/i);
assert.match(bySlug["mariana-bo"]!.soundcloud!, /borrego-s/);
assert.match(bySlug.fantasm!.soundcloud!, /kenzo-meservey/);

assert.ok(bySlug.maddix);
assert.match(bySlug.maddix!.soundcloud!, /maddixmusic/);
assert.match(bySlug.maddix!.youtube!, /@maddixmusic/i);
assert.ok(bySlug["lost-frequencies"]);
assert.match(bySlug["lost-frequencies"]!.soundcloud!, /lo-freq-1/);
assert.match(bySlug["lost-frequencies"]!.youtube!, /@LostFrequencies/i);

const offRoster13 = [
  ["martin-garrix", /martingarrix/, /@MartinGarrix/i],
  ["don-diablo", /dondiablo/, /@DonDiablo/i],
  ["steve-aoki", /steveaoki/, /@SteveAoki/i],
  ["hardwell", /hardwell/, /@hardwell/i],
  ["carl-cox", /carl-cox/, /@CarlCoxofficialTV/i],
  ["eric-prydz", /eric-prydz/, /@ericprydz/i],
  ["amelie-lens", /amelielens/, /@AmelieLens/i],
  ["paul-van-dyk", /paulvandykofficial/, /@PaulvanDyk/i],
  ["korolova", /korolovadj/, /@KOROLOVADJ/i],
  ["kolsch", /kolsch/, /@KolschOfficial/i],
  ["miss-monique", /alesia-arkusha/, /@djmissmonique/i],
  ["ferry-corsten", /ferry-corsten/, /@FerryCorsten/i],
  ["topic", /topicmusic/, /@topicmusictv/i],
] as const;
for (const [slug, sc, yt] of offRoster13) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.soundcloud!, sc);
  assert.match(bySlug[slug]!.youtube!, yt);
}

// Top 100 IG harvest — official-site / YouTube About only (section 1).
const igHarvest = [
  ["martin-garrix", /instagram\.com\/martingarrix/],
  ["timmy-trumpet", /instagram\.com\/timmytrumpet/],
  ["peggy-gou", /instagram\.com\/peggygou_/],
  ["don-diablo", /instagram\.com\/dondiablo/],
  ["hardwell", /instagram\.com\/hardwell/],
  ["calvin-harris", /instagram\.com\/calvinharris/],
  ["w-w", /instagram\.com\/wandwmusic/],
  ["tiesto", /instagram\.com\/tiesto/],
  ["reinier-zonneveld", /instagram\.com\/reinierzonneveld/],
  ["kshmr", /instagram\.com\/kshmr/],
  ["alan-walker", /instagram\.com\/alanwalkermusic/],
  ["jamie-jones", /instagram\.com\/jamiejonesmusic/],
  ["r3hab", /instagram\.com\/r3hab/],
  ["nicky-romero", /instagram\.com\/nickyromero/],
  ["claptone", /instagram\.com\/claptone\.official/],
  ["vini-vici", /instagram\.com\/vinivicimusic/],
  ["eric-prydz", /instagram\.com\/ericprydz/],
  ["paul-van-dyk", /instagram\.com\/paulvandyk/],
  ["marshmello", /instagram\.com\/marshmello/],
  ["the-martinez-brothers", /instagram\.com\/themartinezbros/],
  ["zedd", /instagram\.com\/zedd/],
  ["bassjackers", /instagram\.com\/bassjackers/],
  ["john-summit", /instagram\.com\/johnsummit/],
  ["michael-bibi", /instagram\.com\/michael_bibi_/],
  ["boris-brejcha", /instagram\.com\/borisbrejcha/],
  ["korolova", /instagram\.com\/korolova\.dj/],
  ["alesso", /instagram\.com\/alesso/],
  ["hugel", /instagram\.com\/hugelthug/],
  ["mochakk", /instagram\.com\/mochakk/],
  ["nora-en-pure", /instagram\.com\/noraenpure/],
  ["kolsch", /instagram\.com\/kolschofficial/],
  ["lucas-steve", /instagram\.com\/lucasandsteve/],
  ["the-chainsmokers", /instagram\.com\/thechainsmokers/],
  ["mike-williams", /instagram\.com\/mikewilliams/],
  ["kaaze", /instagram\.com\/iamkaaze/],
  ["burak-yeter", /instagram\.com\/burakyeter/],
  ["chris-stussy", /instagram\.com\/chrisstussydj/],
  ["deadmau5", /instagram\.com\/deadmau5/],
  ["wukong", /instagram\.com\/wukongmusic/],
  ["fedde-le-grand", /instagram\.com\/feddelegrand/],
  ["ferry-corsten", /instagram\.com\/ferrycorsten/],
  ["plastik-funk", /instagram\.com\/plastikfunk/],
  ["b-jones", /instagram\.com\/bjonesdj/],
  ["giuseppe-ottaviani", /instagram\.com\/giuseppeottaviani/],
  ["cuebrick", /instagram\.com\/cuebrick_dj/],
  ["fantasm", /instagram\.com\/fantasm_techno/],
  ["faustix", /instagram\.com\/faustix/],
  ["honey-dijon", /instagram\.com\/honeydijon/],
  ["quintino", /instagram\.com\/quintino/],
  ["nervo", /instagram\.com\/nervomusic/],
  ["sub-zero-project", /instagram\.com\/subzeroproject/],
  ["dubvision", /instagram\.com\/dubvisionmusic/],
  ["mariana-bo", /instagram\.com\/djmarianabo/],
  ["vinai", /instagram\.com\/vinaiofficial/],
  ["topic", /instagram\.com\/topic/],
  ["marlon-hoffstadt", /instagram\.com\/marlonhoffstadt/],
] as const;
for (const [slug, ig] of igHarvest) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.instagram!, ig);
}
assert.match(bySlug["john-summit"]!.website, /johnsummitmusic\.com/);
assert.match(bySlug["john-summit"]!.twitter!, /johnsummit/);
assert.match(bySlug["alan-walker"]!.website, /alanwalker\.com/);
assert.match(bySlug.kshmr!.website, /welcometokshmr\.com/);
assert.match(bySlug.claptone!.website, /claptone\.com/);
assert.match(bySlug.alesso!.website, /alessoworld\.com/);
assert.match(bySlug["michael-bibi"]!.website, /michaelbibi\.com/);
assert.match(bySlug["boris-brejcha"]!.website, /borisbrejcha\.de/);
assert.equal(bySlug["steve-aoki"]!.instagram, null);

assert.ok(bySlug.negitiv);
assert.equal(bySlug.negitiv!.name, "NEGITIV");
assert.match(bySlug.negitiv!.soundcloud!, /negitivofficial/);
assert.match(bySlug.negitiv!.youtube!, /@negitivofficial/);
assert.match(bySlug.negitiv!.instagram!, /instagram\.com\/negitiv/);
assert.match(bySlug.negitiv!.website, /negitiv\.com/);
assert.equal(hintForName("NEGITIV")?.youtubeHandle, "@negitivofficial");
assert.equal(hintForName("Negativ")?.soundcloudPermalink, "negitivofficial");

assert.ok(bySlug.mandy);
assert.equal(bySlug.mandy!.name, "MANDY");
assert.equal(bySlug.mandy!.soundcloud, null);
assert.match(bySlug.mandy!.youtube!, /@mandyofficialbe/);
assert.match(bySlug.mandy!.instagram!, /instagram\.com\/mandyofficial_be/);
assert.match(bySlug.mandy!.twitter!, /(?:twitter|x)\.com\/djmandyofficial/);
assert.match(bySlug.mandy!.website, /youtube\.com\/@mandyofficialbe/);
assert.equal(slugify("MANDY"), "mandy");
assert.equal(hintForName("MANDY")?.youtubeHandle, "@mandyofficialbe");
assert.equal(hintForName("MANDY")?.soundcloudPermalink, undefined);

assert.ok(bySlug["steve-angello"]);
assert.equal(bySlug["steve-angello"]!.name, "Steve Angello");
assert.match(bySlug["steve-angello"]!.soundcloud!, /soundcloud\.com\/steveangello/);
assert.match(bySlug["steve-angello"]!.youtube!, /youtube\.com\/steveangello/);
assert.match(bySlug["steve-angello"]!.instagram!, /instagram\.com\/steveangello/);
assert.match(bySlug["steve-angello"]!.twitter!, /(?:twitter|x)\.com\/SteveAngello/);
assert.match(bySlug["steve-angello"]!.website, /steveangello\.com/);
assert.equal(slugify("Steve Angello"), "steve-angello");
assert.equal(hintForName("Steve Angello")?.youtubeHandle, "@steveangello");
assert.equal(hintForName("Steve Angello")?.soundcloudPermalink, "steveangello");

assert.ok(bySlug.liu);
assert.equal(bySlug.liu!.name, "Liu");
assert.match(bySlug.liu!.soundcloud!, /soundcloud\.com\/liulive/);
assert.match(bySlug.liu!.youtube!, /youtube\.com\/@Liumusic/);
assert.doesNotMatch(bySlug.liu!.youtube!, /@liulive/i);
assert.match(bySlug.liu!.instagram!, /instagram\.com\/liulive/);
assert.match(bySlug.liu!.twitter!, /(?:twitter|x)\.com\/liulive/);
assert.equal(hintForName("Liu")?.youtubeHandle, "@Liumusic");
assert.equal(hintForName("Liu")?.soundcloudPermalink, "liulive");
assert.equal(hintForName("Axwell")?.youtubeHandle, "@axwell");
assert.equal(hintForName("Axwell")?.soundcloudPermalink, "axwell");
assert.equal(hintForName("Kaskade")?.youtubeHandle, "@Kaskade");
assert.equal(hintForName("Kaskade")?.soundcloudPermalink, "kaskade");
assert.equal(hintForName("Porter Robinson")?.youtubeHandle, "@porterrobinson");
assert.equal(hintForName("Sub Focus")?.soundcloudPermalink, "subfocus");

assert.ok(bySlug["1788-l"], "missing pin 1788-l");
assert.equal(bySlug["1788-l"]!.name, "1788-L");
assert.equal(bySlug["1788-l"]!.soundcloud, null);
assert.match(bySlug["1788-l"]!.youtube!, /youtube\.com\/@1788L/);
assert.match(bySlug["1788-l"]!.instagram!, /instagram\.com\/1788_l/);
assert.match(bySlug["1788-l"]!.twitter!, /(?:twitter|x)\.com\/l_1788/);
assert.match(bySlug["1788-l"]!.website, /1788-l\.com/);
assert.equal(slugify("1788-L"), "1788-l");
assert.equal(hintForName("1788-L")?.youtubeHandle, "@1788L");
assert.equal(hintForName("1788-l")?.youtubeHandle, "@1788L");
assert.equal(hintForName("ILLENIUM")?.youtubeHandle, "@illenium");
assert.equal(hintForName("MEDUZA")?.soundcloudPermalink, "meduzamusic");
assert.equal(hintForName("INNELLEA")?.youtubeHandle, "@Innellea");
assert.equal(hintForName("INNELLEA")?.instagram, undefined);
assert.equal(hintForName("Cole Terrazas")?.soundcloudPermalink, "coleterrazas");
assert.equal(hintForName("Mila Alias")?.youtubeHandle, "@Mila_Alias");
assert.equal(hintForName("Mila Alias")?.soundcloudPermalink, "djmilaalias");
assert.match(bySlug["korolova"]!.website, /solo\.to\/korolova\.dj/);
assert.match(bySlug["korolova"]!.beatport!, /beatport\.com\/artist\/korolova\/956858/);
assert.equal(hintForName("Korolova")?.website, "https://solo.to/korolova.dj");

// DJ Mag rank pages replaced with verified official sites / link hubs.
const djmagHubPins: Array<[string, RegExp, string]> = [
  ["skrillex", /skrillex\.com/, "https://skrillex.com/"],
  ["above-beyond", /aboveandbeyond\.nu/, "https://www.aboveandbeyond.nu/"],
  ["chris-stussy", /chrisstussy\.com/, "https://www.chrisstussy.com/"],
  ["mike-williams", /mikewilliams\.nl/, "https://www.mikewilliams.nl/"],
  ["plastik-funk", /plastik-funk\.de/, "https://plastik-funk.de/"],
  ["reinier-zonneveld", /linktr\.ee\/reinierzonneveld/, "https://linktr.ee/reinierzonneveld"],
  ["quintino", /linktr\.ee\/quintino/, "https://linktr.ee/quintino"],
  ["nervo", /linktr\.ee\/nervomusic/, "https://linktr.ee/nervomusic"],
  ["sub-zero-project", /subzeroproject\.com/, "https://www.subzeroproject.com/"],
  ["liu", /linktr\.ee\/liulive/, "https://linktr.ee/liulive"],
  ["le-twins", /linktr\.ee\/officialletwins/, "https://linktr.ee/officialletwins"],
  ["wukong", /linktr\.ee\/wukongmusic/, "https://linktr.ee/wukongmusic"],
  ["dubvision", /linktr\.ee\/dubvision/, "https://linktr.ee/dubvision"],
  ["mariana-bo", /linktr\.ee\/djmarianabo/, "https://linktr.ee/djmarianabo"],
  ["vinai", /linktr\.ee\/vinaiofficial/, "https://linktr.ee/vinaiofficial"],
  ["honey-dijon", /linktr\.ee\/honeydijon/, "https://linktr.ee/honeydijon"],
  ["nils-van-zandt", /linktr\.ee\/nilsvanzandt/, "https://linktr.ee/nilsvanzandt"],
  ["cuebrick", /facebook\.com\/cuebrick/, "https://www.facebook.com/cuebrick"],
];
for (const [slug, site, hint] of djmagHubPins) {
  assert.ok(bySlug[slug], `missing pin ${slug}`);
  assert.match(bySlug[slug]!.website, site);
  assert.doesNotMatch(bySlug[slug]!.website, /djmag\.com/);
  assert.equal(hintForName(bySlug[slug]!.name)?.website, hint);
}
assert.equal(hintForName("Liu")?.website, "https://linktr.ee/liulive");
assert.equal(hintForName("Above & Beyond")?.website, "https://www.aboveandbeyond.nu/");
assert.match(bySlug.quintino!.twitter!, /(?:twitter|x)\.com\/quintinoo/);
assert.match(bySlug.nervo!.twitter!, /(?:twitter|x)\.com\/nervomusic/);
assert.match(bySlug["sub-zero-project"]!.twitter!, /(?:twitter|x)\.com\/sub_zeroproject/);
assert.match(bySlug.dubvision!.twitter!, /(?:twitter|x)\.com\/dubvisionmusic/);
assert.match(bySlug.dubvision!.bio, /HALŌ/);
assert.match(bySlug.dubvision!.bio, /halo__ofc/);
assert.equal(hintForName("HALŌ")?.youtubeHandle, "@DubVision");
assert.equal(hintForName("Halo")?.instagram, "https://www.instagram.com/halo__ofc/");
assert.equal(hintForName("Halo")?.twitter, "https://x.com/Halo__ofc");
assert.equal(hintForName("HALŌ")?.website, "https://haloofc.com/");
assert.match(bySlug.dubvision!.bio, /haloofc\.com/);
assert.match(bySlug.dubvision!.youtube!, /@DubVision/);
assert.match(bySlug.quintino!.youtube!, /@Quintino/);
assert.match(bySlug.quintino!.instagram!, /instagram\.com\/quintino/);
assert.doesNotMatch(bySlug.quintino!.website, /ra\.co/);
assert.match(bySlug["mariana-bo"]!.twitter!, /(?:twitter|x)\.com\/djmarianabo/);
assert.equal(bySlug.vinai!.twitter, undefined);
assert.match(bySlug.cuebrick!.beatport!, /beatport\.com\/artist\/cuebrick\/243731/);
assert.match(bySlug.cuebrick!.twitter!, /(?:twitter|x)\.com\/cuebrick_dj/);
assert.match(bySlug.cuebrick!.youtube!, /@cuebrick/i);
assert.equal(hintForName("Cuebrick")?.soundcloudPermalink, "cuebrick");
assert.equal(hintForName("Cuebrick")?.youtubeHandle, "@Cuebrick");
assert.match(bySlug["lucas-steve"]!.bio, /Lucas de Wert/);
assert.match(bySlug["lucas-steve"]!.bio, /Steven Jansen/);
assert.match(bySlug["lucas-steve"]!.website!, /lucasandsteve\.com/);

assert.match(bySlug["i-hate-models"]!.website!, /ihatemodelsmusic\.com/);
assert.match(bySlug.marnik!.website!, /marnikofficial\.com/);
assert.equal(bySlug["vini-vici"]!.website, null);
assert.equal(bySlug.kaaze!.website, null);
assert.equal(bySlug.fantasm!.website, null);
assert.equal(bySlug.faustix!.website, null);
assert.match(bySlug["vini-vici"]!.beatport!, /beatport\.com\/artist\/vini-vici\/370281/);
assert.match(bySlug.kaaze!.beatport!, /beatport\.com\/artist\/kaaze\/384598/);
assert.equal(bySlug["bullet-tooth"]!.website, null);
assert.equal(bySlug["bullet-tooth"]!.soundcloud, null);
assert.equal(bySlug["bullet-tooth"]!.youtube, null);
assert.equal(bySlug["bullet-tooth"]!.instagram, null);
assert.match(
  bySlug["bullet-tooth"]!.beatport!,
  /beatport\.com\/artist\/bullet-tooth\/1146765/,
);
assert.match(bySlug["bullet-tooth"]!.bio, /UK Garage/);
assert.match(bySlug.kaaze!.soundcloud!, /soundcloud\.com\/iamkaaze/);
assert.match(bySlug.faustix!.bio, /Diplo/);
assert.match(bySlug["vini-vici"]!.bio, /Aviram Saharai/);
for (const pin of DJ_SOCIAL_PINS) {
  assert.equal(
    Boolean(pin.website && /djmag\.com/i.test(pin.website)),
    false,
    `${pin.slug} must not use a DJ Mag rank page as website`,
  );
}

console.log("djSocialPins.test.ts ok");
