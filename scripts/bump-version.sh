#!/bin/bash

# Bump version across all packages
# Usage: ./scripts/bump-version.sh 0.2.3

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.2.3"
  exit 1
fi

VERSION="$1"

# Validate version format (semver-ish)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  echo "❌ Invalid version format: $VERSION"
  echo "Expected format: X.Y.Z or X.Y.Z-tag (e.g., 0.2.3 or 0.2.3-beta)"
  exit 1
fi

echo "🔄 Bumping version to $VERSION..."

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Files to update
APP_PACKAGE="$PROJECT_ROOT/apps/app/package.json"
CLI_PACKAGE="$PROJECT_ROOT/packages/cli/package.json"
CLI_TS="$PROJECT_ROOT/packages/cli/src/cli.ts"

# Update apps/app/package.json
echo "  📦 apps/app/package.json"
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$APP_PACKAGE"

# Update packages/cli/package.json
echo "  📦 packages/cli/package.json"
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" "$CLI_PACKAGE"

# Update CLI_VERSION constant in cli.ts
echo "  📝 packages/cli/src/cli.ts"
sed -i '' "s/const CLI_VERSION = '[^']*'/const CLI_VERSION = '$VERSION'/" "$CLI_TS"

echo ""
echo "✅ Version bumped to $VERSION"
echo ""
echo "Updated files:"
grep -H '"version"' "$APP_PACKAGE" "$CLI_PACKAGE" | sed 's/^/  /'
grep -H "CLI_VERSION" "$CLI_TS" | head -1 | sed 's/^/  /'
echo ""
echo "Next steps:"
echo "  1. git add -A"
echo "  2. git commit -m \"chore: bump version to $VERSION\""
echo "  3. git tag v$VERSION"
echo "  4. git push && git push --tags"
