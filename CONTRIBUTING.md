# Contributing to StellarStream

Thank you for your interest in contributing to StellarStream! This guide will help you get started with our development process.

Check out the [FAQ.md](FAQ.md) for common contributor questions and troubleshooting tips.

## Code of Conduct

Participation in this project is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you are expected to uphold this standard.

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) and report it privately via the GitHub Security Advisory form. Do not open public issues for security concerns.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Seed demo data: `node scripts/seed-streams.js --reset`
4. Run the development environment: `npm run dev`

### Seeding Demo Data

To populate your local database with deterministic demo streams:

```bash
# Seed 10 default streams
node scripts/seed-streams.js

# Seed custom number of streams
node scripts/seed-streams.js --count 20

# Reset database and seed
node scripts/seed-streams.js --reset

# Combine options
node scripts/seed-streams.js --reset --count 15
```

The seed script creates streams across all statuses (scheduled, active, paused, completed, canceled) with deterministic data, ensuring consistent results on every run when the database is empty.

## Testing

### Backend Tests

All backend tests use [Vitest](https://vitest.dev/) and live alongside source files as `*.test.ts`.

**Run all tests once** (CI mode):

```bash
cd backend
npm test -- --run
```

**Watch mode** (re-runs affected tests on every save — recommended during development):

```bash
cd backend
npm test
```

**Run a single file in watch mode:**

```bash
cd backend
npm test -- src/services/streamStore.test.ts
```

**Coverage report** (requires `@vitest/coverage-v8`, already in devDependencies):

```bash
cd backend
npm test -- --run --coverage
```

Coverage output is written to `backend/coverage/`. Open `coverage/index.html` in a browser for the full line-by-line report.

**Coverage for a specific file:**

```bash
cd backend
npm test -- --run --coverage --coverage.include='src/services/streamStore.ts'
```

### Frontend Tests

Frontend tests also use Vitest with `happy-dom` and React Testing Library.

**Run all tests once:**

```bash
cd frontend
npm test -- --run
```

**Watch mode:**

```bash
cd frontend
npm test
```

**Coverage report:**

```bash
cd frontend
npm test -- --run --coverage
```

### Contract Tests

Run `cargo test` in the `contracts/` directory.

#### Snapshot Testing

We use `insta` for snapshot testing of contract events.  
Snapshot files are located in `contracts/test_snapshots/`.

**To update snapshots:**
If you change event structures and need to update the snapshots, run:

```bash
cargo insta review
```
