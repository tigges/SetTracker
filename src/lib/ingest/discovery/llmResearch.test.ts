import assert from "node:assert/strict";
import {
  claudeApiKey,
  detectLlmProvider,
  evaluateProposedUrl,
  geminiApiKey,
  parseLlmJson,
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

console.log("llmResearch.test.ts ok");
