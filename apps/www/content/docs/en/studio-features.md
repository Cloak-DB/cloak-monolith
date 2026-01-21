---
title: Studio Features
description: Deep dive into Cloak DB studio capabilities
order: 3
---

# Studio Features

Cloak DB isn't just another database GUI. It's built around workflows that developers actually use.

## Multi-Cell Editing

Select multiple cells and change them all at once.

**How it works:**
1. `Cmd+Click` cells to select them (they highlight yellow)
2. Type your new value
3. Press `Enter` — all selected cells update simultaneously
4. `Cmd+S` to save all changes

**Use cases:**
- Update 50 user statuses from "pending" to "active"
- Set all prices in a category to the same value
- Clear multiple fields at once

## Pending Changes System

Every edit is local until you explicitly save. No accidental data modifications.

**Visual indicators:**
- Yellow bar shows number of pending changes
- Yellow dot on tab indicates unsaved data
- Change counter shows affected rows

**Actions:**
- `Cmd+S` — Save all pending changes
- "Discard" button — Revert everything
- Individual row revert via context menu

**Why this matters:**
- Review changes before committing
- Batch multiple edits into one save
- No fear of accidental modifications

## Type-Aware Cell Editors

The right editor for every data type:

| Type | Editor |
|------|--------|
| **Boolean** | Toggle switch (no typing "true/false") |
| **JSON** | Expandable editor with syntax highlighting |
| **Text** | Inline editor with multiline detection |
| **Numbers** | Validation that catches typos |
| **Timestamps** | Formatted display |
| **NULL** | Clear indicator, easy null toggling |

**Expand button:** For long text or JSON, click the expand icon to open a full editor modal.

## Smart Command Palette

`Cmd+E` opens instant table search.

**Features:**
- Fuzzy search with Damerau-Levenshtein algorithm
- Handles typos gracefully
- Shows row counts for context
- Searches both schema and table names

**Example:** Typing "usrs" still finds "users" table.

## URL State Preservation

Your view state is saved in the URL:
- Current page number
- Sort column and direction
- Active filters
- Selected table

**Benefits:**
- Share exact views with teammates
- Browser back/forward works naturally
- Bookmark specific data views

## Advanced Filtering

Filter by any column with type-appropriate operators:

**Text columns:**
- `=` / `≠` — Exact match
- `contains` — Partial match
- `is empty` / `is set`

**Numeric columns:**
- `=` / `≠` / `>` / `≥` / `<` / `≤`
- `is empty` / `is set`

**Boolean columns:**
- `= true` / `= false`
- `is empty` / `is set`

Multiple filters combine with AND logic.

## Foreign Key Navigation

Foreign keys are clickable links.

**In the data browser:**
- FK columns show as clickable links
- Click to navigate to the referenced row
- Visual indicator shows relationship

**In the structure tab:**
- Full relationship visualization
- Shows referenced table and column
- Index information included

## Context Menus

Right-click anywhere for contextual actions:

**On cells:**
- Copy value
- Set as NULL
- Edit in modal

**On rows:**
- Edit row details
- Duplicate row
- Delete row

**On tables (sidebar):**
- View data
- View structure
- Copy table name

## Row Detail Modal

Double-click a row or use context menu to open full row editing.

**Features:**
- All columns visible at once
- Field-by-field editing
- Highlights the field you clicked from
- Only saves changed fields

## Tab System

Work with multiple tables simultaneously.

**Features:**
- Open unlimited tabs
- Visual indicator for unsaved changes
- `W` to close current tab
- Middle-click to close any tab
- Tabs persist during session
