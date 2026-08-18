import assert from "node:assert/strict";
import { isWeakOfficialUrl } from "./officialUrls";
import {
  CLAUDE_ENTITY_COMPLETE_PROMPT,
  entitiesToClaudeJsonl,
  entitiesToCsv,
  entityNeedKeys,
  entityToClaudeJsonl,
  needsEntityComplete,
  rowFromDj,
  rowFromEvent,
  sortNeedComplete,
} from "./exportEntities";

assert.equal(isWeakOfficialUrl(null), false);
assert.equal(isWeakOfficialUrl("https://www.amnesia.es/en/"), false);
assert.equal(isWeakOfficialUrl("https://djmag.com/top-100-clubs/amnesia"), true);
assert.equal(isWeakOfficialUrl("https://en.wikipedia.org/wiki/Amnesia_(nightclub)"), true);

const completeDj = rowFromDj({
  slug: "fisher",
  name: "FISHER",
  homeCity: "Australia",
  setCount: 4,
  imageUrl: "https://img/fisher.jpg",
  website: "https://fisher.com",
  instagram: "https://instagram.com/fisher",
  youtube: "@fisher",
  soundcloud: "fish-tales",
  twitter: null,
});

const noArtClub = rowFromEvent({
  slug: "amnesia-ibiza",
  name: "Amnesia",
  kind: "club",
  location: "Ibiza",
  setCount: 8,
  imageUrl: null,
  website: "https://djmag.com/top-100-clubs",
  instagram: null,
  soundcloud: null,
  twitter: null,
});

assert.ok(noArtClub);
assert.equal(needsEntityComplete(completeDj), false);
assert.equal(needsEntityComplete(noArtClub!), true);
assert.ok(entityNeedKeys(noArtClub!).includes("imageUrl"));
assert.ok(entityNeedKeys(noArtClub!).includes("website"));
assert.equal(entityNeedKeys(completeDj).includes("twitter"), true);
assert.equal(rowFromEvent({ ...noArtClub!, kind: "radio", setCount: 1 }), null);

const sorted = sortNeedComplete([completeDj, noArtClub!]);
assert.deepEqual(sorted.map((r) => r.slug), ["amnesia-ibiza"]);

const csv = entitiesToCsv(sorted);
assert.match(csv, /^kind,slug,name/);
assert.match(csv, /club,amnesia-ibiza,Amnesia/);

const line = JSON.parse(entityToClaudeJsonl(noArtClub!));
assert.equal(line.slug, "amnesia-ibiza");
assert.equal(line.kind, "club");
assert.ok(line.needs.includes("imageUrl"));
assert.equal(line.have.website, "https://djmag.com/top-100-clubs");

const jsonl = entitiesToClaudeJsonl([completeDj, noArtClub!]);
assert.equal(jsonl.trim().split("\n").length, 1);

assert.match(CLAUDE_ENTITY_COMPLETE_PROMPT, /Never invent an @slug/);
assert.match(CLAUDE_ENTITY_COMPLETE_PROMPT, /DJ Mag/);

console.log("exportEntities.test.ts ok");
