# @cloak/email

Email sending service powered by Resend.

## Installation

```bash
pnpm add @cloak/email
```

## Configuration

Set environment variables:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL="Cloak <noreply@cloak.dev>"
```

## Usage

```typescript
import { getEmailClient } from '@cloak/email';
import { render } from '@react-email/components';
import { WelcomeEmail } from '@cloak/email-templates/welcome';

const email = getEmailClient({
  from: 'Cloak <noreply@cloak.dev>',
});

const html = await render(WelcomeEmail({ name: 'John' }));

await email.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html,
});
```

## Architecture

Follows the same pattern as `@cloak/analytics`:
- Factory function `getEmailClient()` creates instances
- Singleton Resend client per process
- Graceful degradation if API key is missing
- App-level singletons in each app
