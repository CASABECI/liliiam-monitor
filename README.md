# liliiam-monitor

Production-ready terminal-first governance monitoring CLI for Polkadot OpenGov workflows.

## Install

```bash
npm install
npm run build
```

Run locally:

```bash
npm run dev -- --help
# or
npm run start -- --help
```

## Environment setup

Copy and fill values in `.env`:

```env
SUBSCAN_API_KEY=...
SUBSCAN_BASE_URL=https://polkadot.api.subscan.io
DOTLAKE_API_KEY=...
DOTLAKE_BASE_URL=https://api.dotlake.io
WHALE_VOTE_THRESHOLD=500000
DEFAULT_CHAIN=polkadot
REQUEST_TIMEOUT_MS=12000
MAX_RETRIES=3
```

## Commands

### Live monitoring

```bash
liliiam monitor live --chain polkadot --limit 10
liliiam monitor live --json
```

### Alerts polling

```bash
liliiam monitor alerts --interval 60 --threshold 500000
liliiam monitor alerts --once --json
```

Alerts include:
- whale vote threshold breaches
- referendum status changes

### Monthly analytics

```bash
liliiam analytics monthly --months 12
liliiam analytics monthly --network kusama --json
```

### Daily snapshots/export

```bash
liliiam snapshots daily --chain polkadot --out snapshots
```

Writes:
- `snapshots/YYYY-MM-DD/subscan_referenda.json`
- `snapshots/YYYY-MM-DD/dotlake_daily_results.json`

### Health diagnostics

```bash
liliiam doctor --chain polkadot
```

Checks API keys and endpoint reachability for Subscan and DotLake.

## Sample output

`monitor live`:

```text
┌────────────┬───────────┬──────────────────┬───────────┬──────────────────────┬──────────────────────┐
│ Referendum │ Status    │ Title            │ Track     │ Created              │ Updated              │
├────────────┼───────────┼──────────────────┼───────────┼──────────────────────┼──────────────────────┤
│ 1234       │ Deciding  │ Treasury spend   │ Treasurer │ 2026-09-01T00:00:00Z │ 2026-09-10T00:00:00Z │
└────────────┴───────────┴──────────────────┴───────────┴──────────────────────┴──────────────────────┘
```

## Troubleshooting

- Run `liliiam doctor` to verify env and connectivity.
- If APIs return transient errors, retries with exponential backoff are automatic.
- Missing optional fields from third-party APIs emit warnings and continue gracefully.

## Scripts

- `npm run build`
- `npm run dev`
- `npm run test`
- `npm run lint`
- `npm run start`
