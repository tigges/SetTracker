# setradar.ai data files

## `resolutions.json`

Community ID resolutions applied after every `npm run ingest`.

Each entry:

```json
{
  "setSlug": "sc-waxmotif-edc2026",
  "position": 3,
  "trackTitle": "Ratchet",
  "artistName": "Wax Motif",
  "suggestedBy": "@handle"
}
```

The set detail UI **Suggest ID** button opens a GitHub issue with this JSON
prefilled. Paste approved suggestions here and redeploy — the play flips to
`community_resolved`.

## `soundcloud-poll-state.json`

Written by the SoundCloud adapter each ingest. Tracks recent upload cadence per
curated show so hot accounts are polled deeper / first on the next run. Safe to
commit after local or CI ingest so the 6-hour Pages cron stays adaptive.
