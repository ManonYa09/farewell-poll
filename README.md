# Farewell RSVP poll

Responsive farewell RSVP with Yes / Maybe / No responses, editable votes in the same browser, and shared totals. Event date and venue remain unconfirmed.

## Verify

Requires Node.js 22 or newer. No app dependencies.

```sh
npm run build
npm test
```

## Deploy from GitHub to Cloudflare Workers

1. Sign in to Cloudflare and create an R2 bucket named `farewell-poll-responses`.
2. Open Workers & Pages, create a Worker, and connect this GitHub repository.
3. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`.
4. Deploy. `wrangler.toml` binds the bucket as `BUCKET`.
5. Open the resulting workers.dev URL and verify an RSVP and shared totals.

GitHub stores the source; Cloudflare runs the API and stores responses. GitHub Pages alone cannot run this server or save shared votes. Hosting setup is not yet complete.

Names are stored in the private bucket; only aggregate totals are returned publicly. Random browser tokens allow updates, not verified one-person-one-vote enforcement. Clearing browser storage or switching devices can create duplicate responses. This is intended for a casual RSVP.
