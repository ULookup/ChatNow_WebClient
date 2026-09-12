# Core browser integration

The backend is developed and tested on Linux. The browser may run on any supported desktop OS.

## Local setup

Use Node.js 24 and an isolated ChatNow 3.0-dev backend with the Compose integration from backend PR #89. Copy `.env.example` to `.env.local`, set the backend targets, then run:

```sh
npm ci
npm run dev
```

Browser requests use the current origin. Vite proxies `/service` to Gateway and `/ws` to Push. A deployed static site needs equivalent HTTPS/WSS reverse proxy routes; Vite's development server is not a production server. Explicit `VITE_API_BASE_URL` and `VITE_WS_URL` override browser endpoints.

## Session and delivery behavior

Password login persists a browser device ID. Push authentication and ACK use the device claim issued by Identity, including the backend's registration device. JWT claims read by the browser are coordination hints; only the backend authenticates them.

On reload, the client obtains its authoritative profile before opening the protected UI and reconnecting. Concurrent HTTP 401 responses share one refresh request. Logout clears local authentication and account caches even if the server is unreachable. Delayed authenticated responses from a previous session are rejected before they reach a store. Intentional disconnect cancels reconnect timers. Reconnect refreshes conversations and catches up cached message streams through every available page, rejecting non-progressing pagination.

Push bindings include `NotifyMsgPushAck.seq_id` from backend `3.0-dev`. To regenerate against an explicit checkout:

```sh
CHATNOW_PROTO_DIR=/path/to/ChatNow/proto bash scripts/gen-proto.sh
```

Review the generated diff before committing it; all backend and browser artifacts must use the intended version pair.

## Verification

```sh
npm run lint
npm run test -- --run
npm run build
npx playwright install chromium
npx playwright test
```

The browser integration test requires the Vite server and real backend to be running. It creates two synthetic accounts and a synthetic conversation in the disposable stack, exercises login, two-way messaging, page reload, and connection recovery. Run it separately from backend suites that reset shared data. It does not use production credentials or mocked network responses. The disposable stack owns fixture cleanup. `PLAYWRIGHT_CHANNEL=chrome` or `PLAYWRIGHT_EXECUTABLE_PATH` can select an installed browser; `CHATNOW_WEB_URL` overrides the frontend origin.

Browser plugin not available in this task; regular Playwright is the recorded fallback. Screenshots and reports are ignored local artifacts. The initial real browser run passed on 2026-09-13 against Linux backend `613336862f87f5fa88378a3539eeeb87c38f2984`, including a forced socket closure and a verified new connection. The pull request records the final tested version pair and remaining backend gates; this is not a production rollout check.
