#!/bin/bash

# Bump version across all packages
# Usage: ./scripts/bump-version.sh 0.2.3
# Simulation: SIMULATE=true ./scripts/bump-version.sh 0.2.3

set -e

# Check if running in simulation mode
SIMULATE=${SIMULATE:-false}

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.3"
  echo "Simulation: SIMULATE=true $0 0.2.3"
  exit 1
fi

VERSION="$1"

# Validate version format (semver-ish)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  echo "❌ Invalid version format: $VERSION"
  echo "Expected format: X.Y.Z or X.Y.Z-tag (e.g., 0.2.3 or 0.2.3-beta)"
  exit 1
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Files to update
APP_PACKAGE="$PROJECT_ROOT/apps/app/package.json"
CLI_PACKAGE="$PROJECT_ROOT/packages/cli/package.json"
CLI_TS="$PROJECT_ROOT/packages/cli/src/cli.ts"

if [ "$SIMULATE" = "true" ]; then
  echo "🔬 SIMULATION MODE - No changes will be made"
  echo ""
fi

echo "🔄 Bumping version to $VERSION..."

# Update apps/app/package.json
echo "  📦 apps/app/package.json"
if [ "$SIMULATE" = "true" ]; then
  echo "  simulation of updating version to $VERSION"
else
  sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$APP_PACKAGE"
fi

# Update packages/cli/package.json
echo "  📦 packages/cli/package.json"
if [ "$SIMULATE" = "true" ]; then
  echo "  simulation of updating version to $VERSION"
else
  sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$CLI_PACKAGE"
fi

# Update CLI_VERSION constant in cli.ts
echo "  📝 packages/cli/src/cli.ts"
if [ "$SIMULATE" = "true" ]; then
  echo "  simulation of updating CLI_VERSION to $VERSION"
else
  sed -i '' "s/const CLI_VERSION = '[^']*'/const CLI_VERSION = '$VERSION'/" "$CLI_TS"
fi

echo ""
echo "✅ Version bumped to $VERSION"
echo ""

if [ "$SIMULATE" != "true" ]; then
  echo "Updated files:"
  grep -H '"version"' "$APP_PACKAGE" "$CLI_PACKAGE" | sed 's/^/  /'
  grep -H "CLI_VERSION" "$CLI_TS" | head -1 | sed 's/^/  /'
  echo ""
fi

# Prompt for commit message with default
DEFAULT_MSG="chore: bump version to $VERSION"
echo "Commit message (press Enter for: $DEFAULT_MSG)"
read -p "> " COMMIT_MSG
COMMIT_MSG="${COMMIT_MSG:-$DEFAULT_MSG}"
echo ""

# Step 1: git add
echo "Step 1: git add -A"
read -p "Press Enter to run..."
if [ "$SIMULATE" = "true" ]; then
  echo "simulation of git add -A"
else
  git add -A
fi
echo ""

# Step 2: git commit
echo "Step 2: git commit -m \"$COMMIT_MSG\""
read -p "Press Enter to run..."
if [ "$SIMULATE" = "true" ]; then
  echo "simulation of git commit -m \"$COMMIT_MSG\""
else
  git commit -m "$COMMIT_MSG"
fi
echo ""

# Step 3: git tag
echo "Step 3: git tag v$VERSION"
read -p "Press Enter to run..."
if [ "$SIMULATE" = "true" ]; then
  echo "simulation of git tag v$VERSION"
else
  git tag "v$VERSION"
fi
echo ""

# Step 4: git push
echo "Step 4: git push"
read -p "Press Enter to run..."
if [ "$SIMULATE" = "true" ]; then
  echo "simulation of git push"
else
  git push
fi
echo ""

# Step 5: git push --tags
echo "Step 5: git push --tags"
read -p "Press Enter to run..."
if [ "$SIMULATE" = "true" ]; then
  echo "simulation of git push --tags"
else
  git push --tags
fi
echo ""

echo "✅ Version $VERSION complete!"
