# Fonts

Local self-hosted fonts for optimal performance and privacy.

## Fonts Used

### Epilogue (Sans-serif + Display)
- **File**: `Epilogue/Epilogue-VariableFont_wght.ttf` (normal)
- **File**: `Epilogue/Epilogue-Italic-VariableFont_wght.ttf` (italic)
- **Weight range**: 100-900 (variable font)
- **Usage**: Body text (`font-sans`) and headings (`font-display`)
- **Static fallbacks**: Available in `Epilogue/static/` (not used, kept for reference)

### Lexend Mega (Monospace)
- **File**: `Lexend_Mega/LexendMega-VariableFont_wght.ttf`
- **Weight range**: 100-900 (variable font)
- **Usage**: Code blocks, data display (`font-mono`)
- **Static fallbacks**: Available in `Lexend_Mega/static/` (not used, kept for reference)

## Implementation

### @font-face Definitions
Defined in `app/globals.css`:

```css
@font-face {
  font-family: 'Epilogue';
  src: url('/fonts/Epilogue/Epilogue-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Epilogue';
  src: url('/fonts/Epilogue/Epilogue-Italic-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'Lexend Mega';
  src: url('/fonts/Lexend_Mega/LexendMega-VariableFont_wght.ttf') format('truetype');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

### Tailwind Configuration
Configured in `tailwind.config.ts`:

```typescript
fontFamily: {
  sans: ['Epilogue', 'system-ui', '-apple-system', 'sans-serif'],
  display: ['Epilogue', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['Lexend Mega', 'ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

## Usage in Components

```tsx
// Body text (default)
<p className="font-sans">Regular text uses Epilogue</p>

// Headings (automatic via globals.css)
<h1>Headings use font-display (Epilogue heavier weights)</h1>

// Code/data
<code className="font-mono">Uses Lexend Mega</code>
```

## Benefits of Variable Fonts

1. **Performance**: Single file per font family (vs. multiple weight files)
2. **Flexibility**: Any weight from 100-900 via `font-weight` CSS
3. **File size**: ~100KB per variable font vs. ~20KB × 9 weights = 180KB for static
4. **No external requests**: Self-hosted, no Google Fonts CDN dependency
5. **Privacy**: No third-party tracking

## File Cleanup

The `static/` subdirectories contain individual weight files. These are **not used** by the app (variable fonts are used instead) but are kept for reference or future use if needed.

To remove static files (optional):
```bash
rm -rf public/fonts/Epilogue/static
rm -rf public/fonts/Lexend_Mega/static
```

## License

- **Epilogue**: SIL Open Font License (see `Epilogue/OFL.txt` if present)
- **Lexend Mega**: SIL Open Font License (see `Lexend_Mega/OFL.txt`)
