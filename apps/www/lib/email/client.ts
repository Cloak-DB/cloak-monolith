import { getEmailClient } from '@cloak/email';

let emailClient: ReturnType<typeof getEmailClient> | null = null;

export function getEmail() {
  if (!emailClient) {
    emailClient = getEmailClient({
      from: process.env.RESEND_FROM_EMAIL || 'Cloak <noreply@cloak.dev>',
      environment: process.env.NODE_ENV,
    });
  }
  return emailClient;
}
