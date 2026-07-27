import { getSoundCloudClientId, scGet } from "../src/lib/ingest/soundcloud/client";

async function main() {
  const url = "https://soundcloud.com/realblackcoffee/dj-mix-3";
  const track = await scGet<any>(`/resolve?url=${encodeURIComponent(url)}`);
  console.log("title", track.title, "duration", track.duration, "policy", track.policy);
  const clientId = await getSoundCloudClientId();
  for (const t of track.media?.transcodings ?? []) {
    console.log("---", t.format, t.preset, t.quality, t.url?.slice(0, 80));
    try {
      const u = new URL(t.url);
      u.searchParams.set("client_id", clientId);
      const look = await fetch(u, {
        headers: { "User-Agent": "SetRadar/0.1", Accept: "application/json" },
      });
      const body = (await look.json()) as { url?: string };
      console.log("  ->", look.status, body.url?.slice(0, 120));
    } catch (e) {
      console.log("  err", e);
    }
  }

  // Also try a Vintage Culture set that might be streamable
  const url2 =
    "https://soundcloud.com/vintageculturemusic/vintage-culture-promised-land-remixes-full-mix";
  const track2 = await scGet<any>(`/resolve?url=${encodeURIComponent(url2)}`);
  console.log("\nVC title", track2.title, "duration", track2.duration, "policy", track2.policy);
  for (const t of track2.media?.transcodings ?? []) {
    console.log("---", t.format, t.preset, t.quality);
    const u = new URL(t.url);
    u.searchParams.set("client_id", clientId);
    const look = await fetch(u, {
      headers: { "User-Agent": "SetRadar/0.1", Accept: "application/json" },
    });
    const body = (await look.json()) as { url?: string };
    console.log("  ->", look.status, body.url?.includes("preview") ? "PREVIEW" : "FULL", body.url?.slice(0, 100));
  }
}
main();
