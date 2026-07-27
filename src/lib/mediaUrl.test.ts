import assert from "node:assert/strict";
import { mediaUrl } from "./mediaUrl";

assert.equal(mediaUrl(null), undefined);
assert.equal(mediaUrl(undefined), undefined);
assert.equal(
  mediaUrl("https://cdn.example/a.jpg"),
  "https://cdn.example/a.jpg",
);

const prev = process.env.NEXT_PUBLIC_BASE_PATH;
delete process.env.NEXT_PUBLIC_BASE_PATH;
assert.equal(mediaUrl("/artists/x.png"), "/artists/x.png");

process.env.NEXT_PUBLIC_BASE_PATH = "/SetTracker";
assert.equal(mediaUrl("/artists/x.png"), "/SetTracker/artists/x.png");
assert.equal(
  mediaUrl("/SetTracker/artists/x.png"),
  "/SetTracker/artists/x.png",
);
assert.equal(mediaUrl("https://x.test/a.png"), "https://x.test/a.png");

if (prev === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
else process.env.NEXT_PUBLIC_BASE_PATH = prev;

console.log("mediaUrl.test.ts ok");
