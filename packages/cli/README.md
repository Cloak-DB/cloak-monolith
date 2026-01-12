<p align="center">
  <img src="https://raw.githubusercontent.com/cloak-db/cloak-db/main/logo.png" alt="Cloak DB Logo" width="120">
</p>

<h1 align="center">@cloak-db/app</h1>

<h4 align="center">Run Cloak DB locally with Docker</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@cloak-db/app">
    <img src="https://img.shields.io/npm/v/@cloak-db/app.svg" alt="npm version">
  </a>
  <a href="https://github.com/cloak-db/cloak-db/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://cloak-db.com">
    <img src="https://img.shields.io/badge/website-cloak--db.com-blue" alt="Website">
  </a>
</p>

---

[Cloak DB](https://cloak-db.com) is an open-source, local-first database studio built for development. It helps you iterate faster with features like database snapshots, resource inspection, and data anonymization.

## Requirements

- [Docker](https://docker.com) installed and running

## Usage

```bash
npx @cloak-db/app
```

This pulls and runs the Cloak DB Docker image, making it available at [http://localhost:3000](http://localhost:3000).

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --port <port>` | Port to run on | `3000` |
| `-v, --version <tag>` | Docker image version | `latest` |
| `-h, --help` | Show help | |

### Examples

```bash
# Run on default port 3000
npx @cloak-db/app

# Run on custom port
npx @cloak-db/app --port 8080

# Run specific version
npx @cloak-db/app --version 0.1.2
```

## Links

- [Website](https://cloak-db.com)
- [Documentation](https://cloak-db.com/docs)
- [GitHub](https://github.com/cloak-db/cloak-db)
- [Report Issues](https://github.com/cloak-db/cloak-db/issues)

## License

MIT
