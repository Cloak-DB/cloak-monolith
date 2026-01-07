export interface EmailConfig {
  apiKey: string;
  from: string;
  environment?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface EmailClient {
  send(params: SendEmailParams): Promise<{ id: string } | null>;
  isConfigured(): boolean;
}
