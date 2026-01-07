# Marketing Website Tasks

## Product Context
Cloak DB: Production-realistic database seeding for development. Local-first, open-source tool for restoring production snapshots to dev with anonymization, smart filtering, and reusable test scenarios.

## Guidelines
- Write specific, measurable tasks
- Update status immediately after completion
- Keep descriptions concise (1-2 lines max)
- Never mention "WIP" or "GET IT NOW" - product validation phase
- **REQUIREMENT:** Bilingual site (English + French)

## Status Key
- `[ ]` Not started
- `[→]` In progress
- `[✓]` Complete
- `[✗]` Cancelled/blocked

## Current Tasks

### Foundation
- [✓] Initialize Next.js 15 app with TypeScript
- [✓] Configure Tailwind CSS with shared design system
- [✓] Set up basic page structure
- [✓] Fix build issues (NODE_ENV=production required)
- [✓] Set up i18n (English/French) - SEO optimized
- [✓] Load Epilogue & Lexend Mega fonts (variable fonts)
- [✓] Create language toggle component
- [✓] Add favicons (Next.js App Router compatible)
- [✓] Configure SEO metadata and Open Graph tags
- [✓] Implement dark mode with theme switcher
- [✓] Create Navbar component with Docs/GitHub links
- [✓] Fix i18n routing: / = English, /fr = French (SEO friendly)

### Structure
- [✓] Set up MDX utilities (gray-matter, file reader)
- [✓] Create docs route structure with sidebar  
- [✓] Set up content directory for MD files (content/docs/en, content/docs/fr)
- [✓] Fix MDX rendering (using react-markdown + remark-gfm + rehype-highlight)
- [✓] Add Tailwind typography plugin for prose styles
- [✓] Create bilingual 404 page
- [ ] Create landing page route structure
- [ ] Add GitHub link to nav

### Landing Page (English)
- [✓] Hero: "Production-Realistic Database Seeding for Development"
- [✓] Value props: Open source, CLI-first, privacy-focused
- [✓] Features: Schema Introspection, Anonymization, Snapshot Management
- [✓] How it works: Visual before/after demonstration
- [✓] Email capture section for early access
- [✓] Footer with GitHub, docs, legal links
- [✓] Neobrutalism design system implementation
- [✓] Dark mode support
- [✓] Scroll animations and interactivity
- [✓] Mobile responsive design

### Docs Structure
- [ ] Getting Started guide (MD)
- [ ] Installation (MD)
- [ ] Core Concepts (MD)
- [ ] Configuration (MD)
- [ ] API Reference (MD)
- [ ] Sidebar navigation component
- [ ] Search functionality (future)

### Pages (French)
- [✓] Translate all sections to French
- [✓] Verify technical terms accuracy
- [✓] Test language switching (/ = EN, /fr = FR)

### Content Strategy
- [ ] Highlight: Production-realistic data locally
- [ ] Emphasize: No cloud dependency, secrets safe
- [ ] Differentiator: Reusable test scenarios (1-click restore)
- [ ] Target: QA teams, developers, demo/sales workflows
- [ ] Positioning: Open-source alternative to Snaplet

### Polish
- [✓] Responsive design (mobile-first)
- [✓] SEO metadata (EN/FR)
- [✓] Analytics integration (PostHog server-side tracking fully operational)
- [✓] Social preview cards (Open Graph metadata)

## Next Steps (Priority Order)

### 1. Email Integration (HIGH PRIORITY) - ✅ COMPLETE
- [✓] Install Resend package: `pnpm add resend`
- [✓] Set up Resend API key in environment variables
- [✓] Create `/api/early-access` Route Handler (not `/api/subscribe`)
- [✓] Implement server-side email validation
- [✓] Send welcome email to new subscribers
- [✓] Store emails via Resend (team notification + user welcome)
- [✓] Update EmailCapture component to use real endpoint
- [✓] Add GDPR-compliant privacy notice to form
- [✓] Configure email templates (welcome, beta invite)
- [✓] Handle duplicate email submissions gracefully
- [✓] Bilingual email support (EN/FR)
- [✓] PostHog analytics tracking for submissions
- **Note:** Requires `RESEND_API_KEY` and optional `EARLY_ACCESS_EMAIL` env vars

### 2. Footer Updates (HIGH PRIORITY) - ✅ COMPLETE
- [✓] Add prominent "Join Beta" CTA button (scrolls to email capture)
- [✓] Verify all footer links are functional
- [✗] Add newsletter signup at bottom of footer (not needed - CTA redirects to main form)
- [✗] Update social media links (when accounts exist)
- [✓] Ensure mobile responsive design
- [✓] Add analytics tracking to footer links
- [✓] Bilingual support (EN/FR)

### 3. Docs Messaging Updates (HIGH PRIORITY) - ✅ COMPLETE
- [✓] Add "Join Beta for Access" banner to all docs pages
- [✓] Create waitlist/beta signup flow (redirects to main email capture)
- [✓] Explain beta program benefits (in banner)
- [✓] Add CTA buttons throughout docs (banner on every page)
- [✓] Update docs intro to mention beta status (banner shows beta badge)
- [✓] Add analytics tracking for docs page views (`docs_page_viewed` event)
- [✓] Add analytics tracking for docs navigation (`docs_nav_clicked` event)
- [✓] Add analytics tracking for beta CTA clicks from docs
- [✓] Bilingual support (EN/FR)

### 4. Blog Section (MEDIUM PRIORITY)
- [ ] Design blog layout (listing page + detail page)
- [ ] Set up MDX for blog posts (similar to docs)
- [ ] Create blog post metadata structure (date, author, tags, excerpt)
- [ ] Implement blog listing with pagination/filtering
- [ ] Add RSS feed generation
- [ ] Create sample blog posts:
  - [ ] "Why We Built Cloak DB"
  - [ ] "How to Anonymize Production Data Safely"
  - [ ] "Testing with Realistic Data: A Developer's Guide"
  - [ ] "Database Seeding Strategies for QA Teams"
- [ ] Add blog link to navbar
- [ ] Ensure bilingual blog support (EN/FR)

### 5. Analytics Enhancements
- [✓] PostHog tracking operational (server-side, ad-blocker resistant)
- [✓] Docs page view tracking (`docs_page_viewed` event with page slug and locale)
- [✓] Docs navigation tracking (`docs_nav_clicked` event)
- [✓] Footer link tracking (`footer_link_clicked` event)
- [✓] Beta CTA tracking (`join_beta_clicked` event from multiple locations)
- [✓] Early access form tracking (`early_access_requested` event)
- [ ] Set up conversion funnels in PostHog dashboard
- [ ] Monitor email capture conversion rates
- [ ] Track docs engagement metrics (time on page, scroll depth)

### 6. Content & Documentation (MEDIUM PRIORITY)
- [ ] Write Getting Started guide content
- [ ] Create API documentation
- [ ] Add code examples to docs
- [ ] Create troubleshooting guide
- [ ] Add FAQ section
- [ ] Add "Beta Access Required" notices throughout

### 7. Legal & Compliance (MEDIUM PRIORITY) - ✅ COMPLETE
- [✓] Create Privacy Policy page (`/privacy`)
- [✓] Create Terms of Service page (`/terms`)
- [✓] Add Beta Program Terms
- [✓] Cookie consent banner (PostHog tracking notice)
- [✓] GDPR compliance review (covered in Privacy Policy)
- [✓] Bilingual support (EN/FR)
- [✓] Fix Suspense boundary issue for useSearchParams in PageViewTracker

### 8. Marketing & Growth (LOW PRIORITY)
- [ ] Set up social media accounts (Twitter/X, LinkedIn)
- [ ] Create demo video/GIF for README
- [ ] Write launch announcement blog post
- [ ] Prepare Product Hunt launch materials
- [ ] Set up email drip campaign for beta waitlist
- [ ] Create case studies from beta users

## Current Status Summary

**✅ Complete:**
- Landing page with neobrutalism design
- Bilingual support (EN/FR)
- Dark mode
- Analytics tracking (server-side PostHog)
- Hero, Features, How It Works, Email Capture, Footer sections
- Responsive mobile design
- SEO optimization
- Email backend integration (Resend) with bilingual templates
- Footer "Join Beta" CTA with analytics tracking
- Legal pages (Privacy Policy + Terms of Service)
- Cookie consent banner (GDPR-compliant)
- Docs beta banner with analytics tracking
- **Docs page view tracking** - All doc page views tracked with `docs_page_viewed` event
- **Build issue fixed** - Suspense boundary added to PageViewTracker
- **Brand name updated** - "CloakDB" → "Cloak DB" (with space)
- **Getting Started docs** - Comprehensive, accurate documentation (no fake binary references)

**📋 Next Up:**
- Blog section
- Monitor analytics metrics and set up PostHog funnels

## Notes

- **Beta Strategy:** Collect emails → Manual review → Send personalized beta invites
- **Content Focus:** Position as Snaplet alternative with local-first, privacy-focused approach
- **Target Audience:** QA teams, developers, demo/sales workflows
- **Analytics:** All interactive elements tracked via `useAnalytics()` hook (server-side, bypasses ad blockers)
- **Design:** Maintain neobrutalism consistency across all new pages
