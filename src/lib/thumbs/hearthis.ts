/**
 * Fill missing set/DJ artwork from hearthis.at when Deezer has no match.
 * Uses the public api-v2 and the set's stored hearthis sourceUrl.
 */

import {
  fetchTrackDetail,
  fetchUser,
  parseHearthisUrl,
  pickHearthisImage,
  sleep,
} from "../ingest/hearthis/client";

const userCache = new Map<string, string | null>();
const trackCache = new Map<string, string | null>();

export async function resolveHearthisUserImage(
  userPermalink: string,
): Promise<string | null> {
  const key = userPermalink.toLowerCase();
  if (userCache.has(key)) return userCache.get(key)!;
  try {
    const user = await fetchUser(userPermalink);
    const url = pickHearthisImage(
      user.avatar_url_retina,
      user.avatar_url,
      user.thumb_url,
    );
    userCache.set(key, url);
    return url;
  } catch {
    userCache.set(key, null);
    return null;
  }
}

export async function resolveHearthisTrackImage(
  sourceUrl: string,
): Promise<{ setImage: string | null; artistImage: string | null; user?: string }> {
  const parsed = parseHearthisUrl(sourceUrl);
  if (!parsed) return { setImage: null, artistImage: null };

  const artistImage = await resolveHearthisUserImage(parsed.user);
  await sleep(80);

  if (!parsed.track) {
    return { setImage: artistImage, artistImage, user: parsed.user };
  }

  const trackKey = `${parsed.user}/${parsed.track}`.toLowerCase();
  if (trackCache.has(trackKey)) {
    return {
      setImage: trackCache.get(trackKey)!,
      artistImage,
      user: parsed.user,
    };
  }

  try {
    const track = await fetchTrackDetail(parsed.user, parsed.track);
    const setImage = pickHearthisImage(
      track.artwork_url_retina,
      track.artwork_url,
      track.thumb,
      artistImage,
    );
    trackCache.set(trackKey, setImage);
    return { setImage, artistImage, user: parsed.user };
  } catch {
    trackCache.set(trackKey, artistImage);
    return { setImage: artistImage, artistImage, user: parsed.user };
  }
}
