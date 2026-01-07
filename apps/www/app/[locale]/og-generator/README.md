# OG Image Generator

Local development tool for creating Open Graph images with Cloak DB branding.

## Access

**Development only:** 
- English: `http://localhost:3002/en/og-generator`
- French: `http://localhost:3002/fr/og-generator`

## Features

- ✨ Neobrutalism design matching Cloak DB branding
- 📐 Standard OG image size (1200x630px)
- 🎨 Live preview with dynamic text sizing
- 💾 Download as PNG with proper dimensions

## Usage

1. Start the www dev server: `pnpm --filter=@apps/www dev`
2. Navigate to `http://localhost:3002/en/og-generator`
3. Enter page name and description
4. Preview updates in real-time
5. Click "Download PNG" to save

## Notes

- Text sizing adjusts automatically based on content length
- Preview is scrollable on smaller screens
- Downloaded images are always 1200x630px (standard OG size)
- Light mode only in exported images (matches brand guidelines)

## Tech Stack

- Next.js 15 (App Router)
- html2canvas for image generation
- Cloak DB UI components (@cloak/ui)
- Tailwind CSS with neobrutalism theme
