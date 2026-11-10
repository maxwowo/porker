# Porker

An anonymous scrum planning poker table for small teams. No accounts, no ads, no analytics, no noise.

Built with React, Vite, Cloudflare Pages Functions, and Durable Objects. Every room lives in one SQLite-backed Durable Object with WebSocket hibernation, and rooms delete themselves 24 hours after the last activity.

## How it works

```text
Browser
  │  HTTPS + WSS on <project>.pages.dev
  ▼
Cloudflare Pages
  ├── React SPA (static assets)
  └── /api/* Pages Functions
        │  Durable Object binding (script_name = "porker-rooms")
        ▼
      Room Durable Object
        ├── WebSocket hibernation
        ├── one room record in SQLite storage
        └── 24-hour expiry alarm
```

The Durable Object class lives in a separate internal Worker because Pages Functions can bind to Durable Objects but cannot deploy their classes. That Worker has no public `workers.dev` URL.

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4
- Cloudflare Pages Functions
- Cloudflare Durable Objects with WebSocket hibernation
- Self-hosted Fontsource variable fonts
- Vitest for the shared room model and the Workers Vitest integration for Durable Object/WebSocket tests

## Local development

Requirements: Node 22+ and a Cloudflare account only for deployment. Local development does not need one.

```sh
npm install
npm run dev
```

This runs three processes:

1. Vite at `http://localhost:5173` for the React app.
2. `wrangler dev` at `http://localhost:8787` for the `Room` Durable Object worker.
3. `wrangler pages dev` at `http://localhost:8788` for Pages Functions and static assets.

Open `http://localhost:5173`. Vite proxies `/api` (including WebSockets) to the Pages dev server.

Use a private window to join as a second participant. Two tabs in the same browser intentionally share one participant identity.

### Useful commands

```sh
npm run typecheck
npm test
npm run build
npm run format
```

## Deploying

The Pages project is connected to GitHub, so pushes to `main` automatically build and deploy `https://porkr.pages.dev`. Pushes to other branches create preview deployments.

The `porker-rooms` worker is separate and is deployed by `.github/workflows/deploy-worker.yml` when `worker/` or `shared/` changes, or on demand from the Actions tab. The workflow requires a repository secret named `CLOUDFLARE_API_TOKEN` with **Account → Workers Scripts → Edit** permission for this account.

To deploy manually instead:

```sh
npx wrangler login
npm run deploy
```

`npm run deploy` builds the app, deploys `porker-rooms` first, then deploys Pages. Use `npm run deploy:rooms` when only the worker changed. The production site is available at `https://porkr.pages.dev`.

To recreate the Pages project, connect it to this repository in the Cloudflare dashboard with build command `npm run build` and output directory `dist`.

The app relies on Cloudflare Pages' native SPA fallback: do **not** add a `public/404.html`, because its presence disables the automatic rewrite of deep links such as `/r/ABC123` to `index.html`.

If the project name is unavailable, update it in:

- `wrangler.toml` (`name`)
- `worker/wrangler.toml` (`name`)
- `wrangler.toml` Durable Object binding (`script_name`)
- `package.json` (`deploy:web --project-name`, and `dev:pages` if the worker name changes)

Preview deployments also use `*.pages.dev` hostnames.

For V1, preview deployments share the production `porker-rooms` worker. Rooms are ephemeral, so this is fine. If the WebSocket protocol changes, deploy a separate preview worker before testing preview builds.

## Anonymous identity

There are no accounts, cookies, JWTs, or auth services.

- A random participant ID is generated once per browser and room with `crypto.randomUUID()`.
- It is stored in `localStorage` as `porker:identity:<ROOM_CODE>`.
- Joining is an idempotent upsert keyed by that ID, so a refresh reconnects the same participant and restores their vote.
- Closing a tab does not send `leave`; the participant stays visible as away until they return or the room expires.
- Multiple tabs in one browser share one identity. Use a private window to simulate another person.
- If storage is blocked, the app falls back to `sessionStorage`, then memory.

## What is intentionally missing

V1 has no host role (anyone can reveal or reset), no story titles, no queue, no history, no in-room deck switching, no chat, and no integrations. The shared room model is small enough to extend without changing the transport or storage layers.

## Privacy

- Votes are hidden server-side. While a round is voting, the Durable Object never serializes another participant's card into their snapshot.
- All fonts and assets are bundled or self-hosted. There are no third-party requests.
- Pages sends a strict CSP, `noindex`, and clickjacking protection.
- The room worker is not publicly routable.
- Rooms are deleted 24 hours after the last join, vote, reveal, reset, rename, or leave.
