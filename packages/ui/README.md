# @cloak/ui

Shared UI component library for Cloak applications.

## Purpose
Reusable React components with Tailwind CSS styling, ready to use across apps (www, future apps).

## Architecture

### No-Build Setup
- **Zero compilation**: Components consumed directly as TypeScript/TSX
- **Hot reload**: Changes reflect instantly in consuming apps
- **Turbo caching**: TypeScript checking and linting cached
- **Next.js transpilation**: Next.js handles transpilation at dev/build time

### Structure
```
packages/ui/
├── components/        # React components (Button, Card, etc.)
│   └── button.tsx
├── lib/              # Utilities
│   └── utils.ts      # cn() helper for className merging
├── tailwind.config.ts # Shared Tailwind config
├── tsconfig.json
└── package.json
```

## Usage in Apps

### 1. Install in consuming app
```json
// apps/www/package.json
{
  "dependencies": {
    "@cloak/ui": "workspace:*"
  }
}
```

### 2. Import components
```tsx
// apps/www/app/page.tsx
import { Button } from '@cloak/ui/components/button';
import { cn } from '@cloak/ui/lib/utils';

export default function Page() {
  return (
    <Button variant="default" size="lg">
      Click me
    </Button>
  );
}
```

### 3. Extend Tailwind config
```typescript
// apps/www/tailwind.config.ts
import type { Config } from 'tailwindcss';
import uiConfig from '@cloak/ui/tailwind.config';

const config: Config = {
  presets: [uiConfig],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/components/**/*.{js,ts,jsx,tsx}', // Important!
  ],
  // ... your overrides
};
```

## Components

### Button
Variant-based button component with shadow-offset styling.

**Variants:**
- `yellow` - Yellow-500 background, black border, offset shadow with hover animation
- `blue` - Blue-50 background, black border, offset shadow with hover animation
- `outline` - White background, black border, offset shadow with hover animation
- `ghost` - Transparent with transparent border, on hover shows white bg + black border (no shadow)

**Sizes:**
- `default` - h-10 px-4
- `sm` - h-9 px-3
- `lg` - h-11 px-8
- `icon` - h-10 w-10

**Example:**
```tsx
<Button variant="yellow" size="lg">
  Primary Action
</Button>

<Button variant="blue">
  Secondary Action
</Button>

<Button variant="outline" size="sm">
  Outline
</Button>

<Button variant="ghost">
  Ghost Button
</Button>
```

### Banner
Full-width banner with bold uppercase text and offset shadow.

**Variants:**
- `default` - Orange-100 background (light peachy orange)
- `yellow` - Yellow-400 background (bright yellow)
- `orange` - Orange-300 background (F9D6B3, warm orange)

**Sizes:**
- `sm` - px-4 py-2, text-sm, 4px shadow
- `md` - px-6 py-3, text-base, 6px shadow
- `lg` - px-8 py-4, text-lg, 8px shadow

**Features:**
- Uppercase, bold, centered text
- No hover state (static banner)
- Border-2 black
- Consistent shadow offset matching size

**Example:**
```tsx
<Banner variant="yellow" size="lg">
  Made by developers, for developers
</Banner>

<Banner variant="orange" size="md">
  Important announcement
</Banner>

<Banner variant="default" size="sm">
  Small notice
</Banner>
```

### Input
Text input field with rounded design and offset shadow.

**Features:**
- Rounded-full border with 2px black border
- Offset shadow (6px) that reduces on hover/focus (3px)
- White background
- Smooth animation on interaction
- Disabled state support

**Example:**
```tsx
<Input type="text" placeholder="Enter your email" />

<Input type="password" placeholder="Password" />

<Input
  type="email"
  placeholder="Email address"
  disabled
/>
```

## Utilities

### `cn()` - ClassName merger
Combines `clsx` + `tailwind-merge` for safe className composition.

```tsx
import { cn } from '@cloak/ui/lib/utils';

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  'override-class'
)} />
```

## Design System

### Colors (from Tailwind config)
- `yellow-500` (#FBDB59) - Primary
- `blue-50` (#DAF5F0) - Secondary
- `orange-300` (#F9D6B3) - Accent
- `purple-50` (#FCDFFF) - Accent
- `black` (#000) - Text/borders
- `white` (#fff) - Backgrounds

### Typography
- `font-sans` - Epilogue (body)
- `font-display` - Epilogue (headings)
- `font-mono` - Lexend Mega (code)

### Shadows
- `shadow-offset` - 6px 6px 0 #000 (hard offset shadow)

## Adding Shadcn Components

```bash
# Install in www app, then move to shared package
npx shadcn@latest add button
mv apps/www/components/ui/button.tsx packages/ui/components/

# Or configure shadcn to output directly to packages/ui/components
```

## Development

### Type check
```bash
pnpm --filter @cloak/ui typecheck
```

### Lint
```bash
pnpm --filter @cloak/ui lint
```

## Benefits

✅ **No build complexity**: Direct TypeScript consumption
✅ **Fast hot reload**: Changes propagate instantly
✅ **Type safety**: Full TypeScript support across apps
✅ **Shared design system**: Colors, fonts, shadows consistent
✅ **Turbo caching**: Only rebuild what changed
✅ **Future-proof**: Easy to add build step if needed later

## Notes
- Components use `React.forwardRef` for ref forwarding
- All components support `className` prop for overrides
- Variants use `class-variance-authority` for type-safe props
- Tailwind classes merged with `tailwind-merge` to avoid conflicts

---
This README is AI-maintained. Update when adding new components or utilities.
