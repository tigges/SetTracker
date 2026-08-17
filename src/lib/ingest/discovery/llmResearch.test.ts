import assert from "node:assert/strict";
import {
  claudeApiKey,
  detectLlmProvider,
  evaluateProposedEventUrl,
  evaluateProposedUrl,
  geminiApiKey,
  isResearchWorthyName,
  parseLlmJson,
  researchPriority,
} from "./llmResearch";

assert.equal(parseLlmJson("not json"), null);
const parsed = parseLlmJson(`
Here you go
{"soundcloud":"https://soundcloud.com/adambeyer","youtube":null,"confidence":"high"}
`);
assert.equal(parsed?.soundcloud, "https://soundcloud.com/adambeyer");
assert.equal(parsed?.confidence, "high");

assert.equal(claudeApiKey({}), null);
assert.equal(claudeApiKey({ CLAUDE_AGENT_API: "sk-ant-repo" }), "sk-ant-repo");
assert.equal(claudeApiKey({ ANTHROPIC_API_KEY: "sk-ant-alias" }), "sk-ant-alias");
assert.equal(claudeApiKey({ CLAUDE_API_KEY: "sk-ant-env" }), "sk-ant-env");
assert.equal(detectLlmProvider({}), null);
assert.equal(
  detectLlmProvider({ ANTHROPIC_API_KEY: "sk-ant-x" }),
  "claude",
);
assert.equal(
  detectLlmProvider({ CLAUDE_AGENT_API: "sk-ant-repo" }),
  "claude",
);
assert.equal(geminiApiKey({}), null);
assert.equal(geminiApiKey({ GEMINI_API_KEY: "g-studio" }), "g-studio");
assert.equal(geminiApiKey({ GEMINI_AGENT_API: "g-agent" }), "g-agent");
assert.equal(geminiApiKey({ GEMINI: "g-short" }), "g-short");
assert.equal(
  detectLlmProvider({ GEMINI_API_KEY: "g", ANTHROPIC_API_KEY: "c" }),
  "gemini",
);
assert.equal(detectLlmProvider({ GEMINI: "g-short" }), "gemini");
assert.equal(detectLlmProvider({ CLAUDE_API_KEY: "sk-ant-env" }), "claude");
assert.equal(
  detectLlmProvider({
    ANTHROPIC_API_KEY: "c",
    GEMINI_API_KEY: "g",
    LLM_RESEARCH_PROVIDER: "claude",
  }),
  "claude",
);

const keys = new Set<string>();
assert.equal(
  evaluateProposedUrl(
    "Adam Beyer",
    "soundcloud",
    "https://soundcloud.com/adambeyer",
    keys,
  ).ok,
  true,
);
assert.equal(
  evaluateProposedUrl(
    "Adam Beyer",
    "soundcloud",
    "https://soundcloud.com/someone-else",
    keys,
  ).ok,
  false,
);
assert.equal(
  evaluateProposedUrl(
    "FISHER",
    "youtube",
    "https://www.youtube.com/@fisher",
    keys,
  ).ok,
  true,
);
assert.equal(
  evaluateProposedUrl(
    "FISHER",
    "youtube",
    "https://www.youtube.com/watch?v=Uq1WP8v3U4o",
    keys,
  ).ok,
  false,
);
assert.equal(
  evaluateProposedUrl(
    "Adam Beyer",
    "soundcloud",
    "https://soundcloud.com/adambeyer",
    new Set(["soundcloud:adambeyer"]),
  ).reason,
  "URL already owned by another DJ",
);
assert.equal(
  evaluateProposedUrl(
    "David Guetta",
    "website",
    "https://www.davidguetta.com/",
    keys,
  ).ok,
  true,
);
assert.equal(
  evaluateProposedUrl(
    "David Guetta",
    "website",
    "https://instagram.com/davidguetta",
    keys,
  ).ok,
  false,
);

assert.ok(
  researchPriority({ slug: "david-guetta", setCount: 1, festivalSets: 1 }) >
    researchPriority({ slug: "aizo-clutch", setCount: 1, festivalSets: 0 }),
  "Top 100 + festival outranks a one-set leftover",
);
assert.equal(isResearchWorthyName("Axwell"), true);
assert.equal(isResearchWorthyName("Behind Cercle Odyssey I Chapter Four"), false);
assert.equal(isResearchWorthyName("Bonobo Solo"), false);
assert.equal(isResearchWorthyName("MAU P SUNRISE"), false);

const eventKeys = new Set(["instagram:alesso"]);
assert.equal(
  evaluateProposedEventUrl(
    "Tomorrowland",
    "instagram",
    "https://www.instagram.com/tomorrowland/",
    eventKeys,
  ).ok,
  true,
);
assert.equal(
  evaluateProposedEventUrl(
    "Tomorrowland",
    "instagram",
    "https://www.instagram.com/alesso/",
    eventKeys,
  ).ok,
  false,
);
assert.equal(
  evaluateProposedEventUrl(
    "Tomorrowland",
    "website",
    "https://www.tomorrowland.com/",
    eventKeys,
  ).ok,
  true,
);

console.log("llmResearch.test.ts ok");
