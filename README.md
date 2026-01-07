<p align="center">
  <img src="logo.png" alt="Cloak DB Logo" width="120">
</p>

<h1 align="center">Cloak DB</h1>

<h4 align="center">Production-grade test data. Open-source. Self-hosted.</h4>

<p align="center">
  <a href="https://github.com/Cloak-DB/cloak-monolith/actions/workflows/ci.yml">
    <img src="https://github.com/Cloak-DB/cloak-monolith/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://github.com/Cloak-DB/cloak-monolith/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://cloak-db.com">
    <img src="https://img.shields.io/badge/website-cloak--db.com-blue" alt="Website">
  </a>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Why Cloak DB?

Building with realistic test data is hard. Production databases contain sensitive information that can't be used directly in development. Existing solutions are either discontinued (Snaplet, Jan 2025) or unmaintained (RepliByte, 20+ months without updates).

**Cloak DB** is an open-source, local-first database studio that lets you:

- Extract production schemas with full relationship mapping
- Anonymize sensitive data with configurable TypeScript rules
- Create reproducible database snapshots for testing and demos

Your data never leaves your machine.

## Features

| Feature                        | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| **Schema Introspection**       | Extract schema + relationships. Filter by table, rows, columns. |
| **Configurable Anonymization** | TypeScript-based rules. Transform PII before export.            |
| **Snapshot Management**        | Version complex DB states. Restore deterministic test data.     |
| **Local-First**                | Self-hosted. Your data stays on your infrastructure.            |
| **CLI-First**                  | Scriptable workflows for CI/CD integration.                     |

## How It Works

```
┌─────────────────────┐         ┌─────────────────────┐
│   Production Data   │         │    Safe Dev Data    │
├─────────────────────┤         ├─────────────────────┤
│ john.doe@gmail.com  │ ──────► │ user_1@anon.local   │
│ 555-123-4567        │ Cloak   │ 555-XXX-XXXX        │
│ John Doe            │   DB    │ Anonymous User      │
└─────────────────────┘         └─────────────────────┘
```

1. **Connect** to your production database
2. **Configure** anonymization rules in TypeScript
3. **Export** safe, realistic test data
4. **Restore** snapshots with one command

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10

### Installation

```bash
# Clone the repository
git clone https://github.com/Cloak-DB/cloak-monolith.git
cd cloak-db

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The marketing site runs at http://localhost:3002

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

See [CLAUDE.md](./CLAUDE.md) for detailed configuration.

## Project Structure

```
cloak-db/
├── apps/
│   └── www/              # Next.js 16 marketing site
├── packages/
│   ├── analytics/        # PostHog analytics
│   ├── email/            # Resend email client
│   ├── email-templates/  # React Email templates
│   ├── eslint-config/    # Shared ESLint config
│   ├── tailwind-config/  # Shared Tailwind config
│   └── ui/               # Shared React components
└── infra/
    └── dev/              # Local dev infrastructure
```

## Documentation

- **Website**: [cloak-db.com](https://cloak-db.com)
- **Docs**: [cloak-db.com/docs](https://cloak-db.com/docs)
- **AI Assistant Guide**: [CLAUDE.md](./CLAUDE.md)

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS, Neobrutalism design
- **Analytics**: PostHog (server-side)
- **Email**: Resend + React Email
- **Monorepo**: pnpm workspaces + Turbo

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run checks (`pnpm typecheck && pnpm lint && pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build all packages
pnpm typecheck    # Type check
pnpm lint         # Lint
pnpm test         # Run tests
```

## Community

- **Website**: [cloak-db.com](https://cloak-db.com)
- **Email**: [info@cloak-db.com](mailto:info@cloak-db.com)
- **Issues**: [GitHub Issues](https://github.com/Cloak-DB/cloak-monolith/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with care for developers who need realistic test data.
</p>
