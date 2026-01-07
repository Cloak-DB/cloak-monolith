import { Resend } from 'resend';
import type { EmailConfig, SendEmailParams, EmailClient } from './types';

let resendClient: Resend | null = null;

function getResendClient(apiKey?: string): Resend | null {
  const key = apiKey || process.env.RESEND_API_KEY;

  if (!key) {
    console.warn('[@cloak/email] RESEND_API_KEY not configured');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(key);
  }

  return resendClient;
}

export class EmailService implements EmailClient {
  private client: Resend | null;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.client = getResendClient(config.apiKey);
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async send(params: SendEmailParams): Promise<{ id: string } | null> {
    if (!this.client) {
      console.warn('[@cloak/email] Email client not configured, skipping send');
      return null;
    }

    try {
      const { data, error } = await this.client.emails.send({
        from: this.config.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
        cc: params.cc,
        bcc: params.bcc,
        tags: params.tags,
      });

      if (error) {
        console.error('[@cloak/email] Failed to send email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[@cloak/email] Exception sending email:', error);
      return null;
    }
  }
}

export function getEmailClient(config?: Partial<EmailConfig>): EmailService {
  const fullConfig: EmailConfig = {
    apiKey: config?.apiKey || process.env.RESEND_API_KEY || '',
    from: config?.from || process.env.RESEND_FROM_EMAIL || 'noreply@cloak.dev',
    environment: config?.environment || process.env.NODE_ENV,
  };

  return new EmailService(fullConfig);
}
