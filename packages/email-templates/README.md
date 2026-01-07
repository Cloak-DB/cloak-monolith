# @cloak/email-templates

React Email templates with minimalist design system.

## Development

Start the preview server:

```bash
cd packages/email-templates
pnpm dev
```

This opens http://localhost:3003 with live preview of all email templates.

## Templates

- `early-access-request.tsx` - Early access request notification

## Design System

**Ultra minimalist design:**
- System fonts only
- Black, white, minimal grays
- 2px solid borders (neobrutalism)
- Consistent spacing scale (4/8/16/24/32/48px)
- No images for maximum deliverability

## Usage

```typescript
import { render } from '@react-email/components';
import { EarlyAccessRequestEmail } from '@cloak/email-templates/early-access-request';

const html = await render(
  EarlyAccessRequestEmail({
    email: 'user@example.com',
    company: 'Acme Inc',
    useCase: 'Database anonymization',
    submittedAt: new Date().toISOString(),
  })
);
```
