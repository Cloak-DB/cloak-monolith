# Cloak DB - AI Assistant Guide

This document helps AI assistants understand the project structure, conventions, and commands.

## Project Overview

**Cloak DB** is an open-source, local-first database studio tool.

## Business Positioning

### Target Audience
- **Primary**: Solo developers and indie hackers working on side projects or small startups
- **Secondary**: Small teams (2-5 devs) who need to share database states
- **Aspirational**: Developers who become internal champions at larger companies

### Core Philosophy
"Your database knows more than you think. You're just not using it that way yet."

Cloak DB is a **Postgres studio built for development** - not just for querying, but for making your database work as a development tool. The goal is to help developers ship faster with confidence.

### Key Differentiators (Features)

| Feature | What it does | Value proposition |
|---------|--------------|-------------------|
| **Time Machine** | Save/restore database states with one click | "Cmd+Z for your database" - iterate without fear |
| **Resource Inspector** | Type a user ID, see all related resources with relevance scoring | Debug in seconds, not hours of writing JOINs |
| **Capture & Anonymize** | Pull production data, automatically anonymize PII | Test with real data without GDPR headaches |

### Tone & Messaging
- **Bold but responsible** - empowering, not reckless
- **Pragmatic** - "Built for devs who ship. Not fancy. Just useful."
- Avoid: "stop being careful" (sounds irresponsible)
- Prefer: "develop with confidence", "iterate without fear"

### Competitive Landscape
- RepliByte: 4k GitHub stars, last commit 20+ months ago (unmaintained)
- Snaplet: Venture-backed, discontinued Jan 2025
- Cloak DB positions as the **active, maintained, open-source alternative**

### Future Roadmap
- AI chat integration: Connect API key to chat with an AI model about your data
- CLI that triggers API commands (GUI-first, CLI as complement)

- **Website**: https://cloak-db.com
- **Contact**: info@cloak-db.com
- **Package Manager**: pnpm (workspace-based monorepo)
- **Build Tool**: Turbo
- **Language**: TypeScript
- **Node Version**: >=22 <25
- **Analytics**: PostHog (server-side for marketing site)

## Monorepo Structure

```
cloak-db/
├── apps/
│   └── www/               # Next.js 16 marketing site (landing page, docs)
├── packages/
│   ├── analytics/         # PostHog analytics (server-side)
│   ├── email/             # Email client wrapper (Resend)
│   ├── email-templates/   # React Email templates
│   ├── eslint-config/     # Shared ESLint configuration
│   ├── tailwind-config/   # Shared Tailwind configuration
│   └── ui/                # Shared UI components (React)
└── infra/
    └── dev/               # Local dev infrastructure (Docker)
```

## Package Naming Convention

**All internal packages use the `@cloak/*` namespace:**

- `@cloak/analytics`
- `@cloak/email`
- `@cloak/email-templates`
- `@cloak/eslint-config`
- `@cloak/tailwind-config`
- `@cloak/ui`

**Workspace dependencies should use:** `workspace:*`

## Development Commands

### Installation
```bash
pnpm install
```

### Development
```bash
# Start the marketing site (www - port 3002)
pnpm dev
```

### Build
```bash
# Build all packages
pnpm build
```

### Type Checking
```bash
# Type check all packages
pnpm typecheck
```

### Linting
```bash
# Lint all packages (if lint script exists)
pnpm lint
```

### Testing
```bash
# Run all unit tests
pnpm test

# Run integration tests
pnpm test:integration
```

## Database Commands (for future development)

### Local Development Database
```bash
# Start PostgreSQL containers
pnpm db:start

# Stop containers
pnpm db:stop

# Reset database (drops volumes)
pnpm db:reset
```

## TypeScript Configuration

### Module Resolution
- **Root tsconfig**: Uses `moduleResolution: "bundler"` with `module: "commonjs"`
- **Packages**: Override with `module: "esnext"` to support bundler resolution
- **Apps**: Same pattern - inherit root, override module to esnext

### Package Exports
Packages export source TypeScript directly:
```json
"main": "./src/index.ts",
"exports": { ".": "./src/index.ts" }
```

This simplifies development (no build step for packages) and works with TypeScript bundler moduleResolution.

## Environment Variables

### Required for Local Development

Copy `.env.example` to `.env` and configure:

- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog instance URL (default: https://us.i.posthog.com)
- `RESEND_API_KEY` - Resend API key for emails
- `RESEND_FROM_EMAIL` - From email address (e.g., "Cloak DB <noreply@cloak-db.com>")
- `EARLY_ACCESS_EMAIL` - Email to receive early access requests

### Required for CI

GitHub Actions requires:
- `NODE_ENV=test` - Set in workflow env vars
- `DISCORD_WEBHOOK_URL` - GitHub secret for failure notifications

## CI/CD

**GitHub Actions Workflows** (`.github/workflows/ci.yml`):

1. **Build** - Builds `www` package
2. **Typecheck** - Runs `pnpm -r --if-present typecheck`
3. **Lint** - Runs `pnpm -r --if-present lint`
4. **Test** - Runs `pnpm -r --if-present test`
5. **Integration** - Runs integration tests after other jobs pass

## Code Conventions

### TypeScript
- **Strict mode enabled** - all type errors must be fixed
- **ESM imports** - use `import/export` syntax
- **No implicit any** - all types must be explicit or inferred

### Import Aliases
- Use package names: `@cloak/ui`, `@cloak/analytics`
- No relative imports across package boundaries

## Common Issues & Solutions

### "ESLint config error - Cannot use import outside module"
- Add `"type": "module"` to package.json
- Or rename config to `.mjs`

### Workspace dependency not resolving
- Ensure dependency uses `workspace:*` protocol
- Run `pnpm install` to re-link workspaces

### Build fails with TS5095 (bundler moduleResolution)
- Add `"module": "esnext"` to package's tsconfig compilerOptions

## Tips for AI Assistants

1. **Before running build/typecheck/lint**: Check `.env` exists or tests may fail
2. **Linting**: Only `ui` and `www` have lint scripts
3. **Testing**: Check for `test` script in package.json before running
4. **Package changes**: Run `pnpm install` after modifying package.json dependencies
5. **Turbo cache**: Build outputs are cached - use `--force` to rebuild if needed

## Architecture Notes

### Frontend Layer
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Neobrutalism design system
- **Components**: Shared in `@cloak/ui`
- **App**: `www` - Marketing site (https://cloak-db.com, dev port 3002)

### Analytics Layer
- **Package**: `@cloak/analytics`
- **Provider**: PostHog
- **Strategy**: Server-side tracking via Route Handlers (bypasses ad blockers)

### Email Layer
- **Package**: `@cloak/email` + `@cloak/email-templates`
- **Provider**: Resend
- **Templates**: React Email components

## Support & Documentation

- **Website**: https://cloak-db.com
- **Email**: info@cloak-db.com
- **Issues**: GitHub Issues
- **Changesets**: Use `@changesets/cli` for versioning
- **Pre-commit**: Husky runs linting on staged files
