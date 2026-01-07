---
title: Getting Started
description: Get started with Cloak DB
order: 1
---

# Getting Started with Cloak DB

## What is Cloak DB?

Cloak DB is a **local-first, open-source tool** that lets you restore production database snapshots to your development environment—with anonymization, smart filtering, and reusable test scenarios.

Work with realistic data locally. No cloud dependency. No secrets exposed.

## The Problem We Solve

Testing and development with realistic data is hard:
- Manual data entry is tedious and unrealistic
- Production dumps contain sensitive information
- Setting up complex test scenarios takes too long
- QA teams struggle to reproduce specific edge cases
- Demos require specific data states that are hard to create

## How Cloak DB Helps

### 1. Restore Production Data Locally
Connect to your production database and dump data to your dev environment with smart filtering:
- Restore only what you need (e.g., "5 users + all related data")
- Automatic foreign key traversal ensures referential integrity
- Explicit table includes for fine-grained control
- Currently supports PostgreSQL (more databases coming)

### 2. Anonymize Sensitive Data
Transform sensitive fields before data touches your local machine:
- Define anonymization rules using TypeScript-based configuration
- Built on Faker for realistic fake data
- Config-based, auditable, and git-friendly
- Protects privacy while maintaining data realism

### 3. Reusable Test Scenarios
Save and restore specific test scenarios with one click:
- Example: "User with 3 pending items, one past due"
- Perfect for QA workflows, demos, and repeatable testing
- Team-shareable via version control
- No secrets stored in your repo

## Who Should Use Cloak DB?

- **QA Teams** — Set up complex test states without manual data entry
- **Developers** — Test against realistic data locally, catch edge cases early
- **Demo/Sales** — Show specific scenarios to stakeholders in seconds
- **E2E Testing** — Build reliable test suites with realistic data

## How It Works

1. **Local Server** — Runs on your machine with a web frontend and API
2. **Configure** — Set up database connections and anonymization rules (git-friendly, secrets injected at runtime)
3. **Restore** — Pull production-realistic data to your dev database
4. **Create Scenarios** — Save reusable test scenarios
5. **Click to Restore** — Restore any scenario instantly

## Architecture

Cloak DB runs entirely on your local machine:
- Web-based UI for managing connections and scenarios
- API server for orchestrating data operations
- Database introspection engine
- Anonymization pipeline
- Scenario management system

All your data stays local. Your production secrets never leave your control.

## Current Status

Cloak DB is in **active development** with a beta program available. Join the beta to get early access and help shape the product.

