---
title: Getting Started
description: Get up and running with Cloak DB in minutes
order: 1
---

# Getting Started

Cloak DB is a PostgreSQL studio built for developers. Browse your data, run queries, and edit rows - all from a keyboard-friendly interface.

## Installation

Cloak DB runs as a Docker container. Make sure you have [Docker](https://docker.com) installed and running.

```bash
npx @cloak-app/app
```

This will:
1. Pull the latest Cloak DB image
2. Start the studio on port 3000
3. Open your browser automatically

**Options:**
- `--port 3001` - Use a different port
- `--tag 0.2.4` - Use a specific version

## Connect to Your Database

1. Click **Add Connection** on the home screen
2. Enter your PostgreSQL connection string:
   ```
   postgresql://user:password@localhost:5432/mydb
   ```
3. Give it a name (e.g., "Local Dev")
4. Click **Test Connection** to verify
5. Click **Save**

Your connections are stored locally in `~/.config/cloak-db/config.json`.

## Navigate the Studio

Once connected, you'll see:

- **Left sidebar** - Your schemas and tables
- **Main area** - Data browser or query editor
- **Tabs** - Open multiple tables at once

### Quick Actions

| Action | Shortcut |
|--------|----------|
| Search tables | `Cmd+E` |
| New query tab | `Cmd+J` |
| Close tab | `W` |
| Save changes | `Cmd+S` |
| Show all shortcuts | `?` |

## Browse Data

Click any table to view its data. You can:

- **Sort** - Click column headers
- **Filter** - Use the filter bar with operators like `=`, `>`, `contains`
- **Search** - Fuzzy search within the current page
- **Paginate** - Navigate through large tables (25-1000 rows per page)

## Edit Data

Cloak DB tracks your changes before saving:

1. **Click a cell** to edit inline
2. **Yellow indicator** shows pending changes
3. **Cmd+S** to save all changes
4. **Discard** to revert

You can also:
- **Add rows** with `Cmd+N`
- **Delete rows** by selecting and pressing `Delete`
- **Multi-select cells** with `Cmd+Click`

## Run Queries

Open a query tab with `Cmd+J` and write SQL:

```sql
SELECT * FROM users WHERE created_at > '2024-01-01';
```

Press `Cmd+Enter` to execute. Results are limited to 500 rows.

**Safety:** Dangerous operations like `DROP DATABASE` are blocked.

## What's Next

- [Keyboard Shortcuts](/docs/keyboard-shortcuts) - Full shortcut reference
- [Studio Features](/docs/studio-features) - Data browser details
- [SSL Connections](/docs/ssl-connections) - Secure database connections

## Roadmap

We're actively working on:
- **Time Machine** - Save and restore database states
- **Resource Inspector** - Visualize relationships
- **Anonymization** - Mask PII for safe testing

Follow progress on [GitHub](https://github.com/Cloak-DB/cloak-monolith).
