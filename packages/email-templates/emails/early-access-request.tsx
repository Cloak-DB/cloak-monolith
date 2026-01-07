import * as React from 'react';
import { Text, Heading, Hr, Link } from '@react-email/components';
import { Layout } from './_components/layout';
import { typography, spacing, colors } from '../styles/tokens';

export interface EarlyAccessEmailTranslations {
  heading: string;
  intro: string;
  emailLabel: string;
  companyLabel?: string;
  useCaseLabel?: string;
  submittedAtLabel: string;
  note: string;
  footerTagline: string;
  footerWebsite: string;
}

interface EarlyAccessRequestEmailProps {
  email: string;
  company?: string;
  useCase?: string;
  submittedAt: string;
  translations: EarlyAccessEmailTranslations;
}

export const EarlyAccessRequestEmail = ({
  email,
  company,
  useCase,
  submittedAt,
  translations,
}: EarlyAccessRequestEmailProps) => {
  return (
    <Layout preview={`${translations.heading} - ${email}`}>
      <Heading style={headingStyle}>{translations.heading}</Heading>

      <Text style={textStyle}>{translations.intro}</Text>

      <div style={cardStyle}>
        <Text style={labelStyle}>{translations.emailLabel}</Text>
        <Text style={valueStyle}>{email}</Text>

        {company && (
          <>
            <Hr style={dividerStyle} />
            <Text style={labelStyle}>{translations.companyLabel}</Text>
            <Text style={valueStyle}>{company}</Text>
          </>
        )}

        {useCase && (
          <>
            <Hr style={dividerStyle} />
            <Text style={labelStyle}>{translations.useCaseLabel}</Text>
            <Text style={valueStyle}>{useCase}</Text>
          </>
        )}

        <Hr style={dividerStyle} />
        <Text style={labelStyle}>{translations.submittedAtLabel}</Text>
        <Text style={valueStyle}>{submittedAt}</Text>
      </div>

      <Text style={noteStyle}>{translations.note}</Text>

      <Hr style={hrStyle} />
      <Text style={footerStyle}>
        <strong>Cloak</strong> - {translations.footerTagline}
        <br />
        <Link href="https://cloak.dev" style={linkStyle}>
          {translations.footerWebsite}
        </Link>
      </Text>
    </Layout>
  );
};

const headingStyle = {
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
  marginTop: '0',
  marginBottom: spacing.lg,
  color: colors.black,
};

const textStyle = {
  fontSize: typography.fontSize.base,
  lineHeight: typography.lineHeight.normal,
  marginBottom: spacing.md,
  color: colors.gray[900],
};

const cardStyle = {
  backgroundColor: colors.gray[50],
  border: `2px solid ${colors.black}`,
  borderRadius: '8px',
  padding: spacing.lg,
  marginTop: spacing.lg,
  marginBottom: spacing.lg,
  boxShadow: `4px 4px 0 ${colors.black}`,
};

const labelStyle = {
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.bold,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: colors.gray[900],
  marginTop: spacing.sm,
  marginBottom: spacing.xs,
};

const valueStyle = {
  fontSize: typography.fontSize.base,
  color: colors.black,
  marginTop: '0',
  marginBottom: spacing.sm,
  fontFamily: typography.fontFamily.mono,
};

const dividerStyle = {
  borderColor: colors.gray[200],
  borderWidth: '1px',
  marginTop: spacing.md,
  marginBottom: spacing.md,
};

const noteStyle = {
  ...textStyle,
  fontSize: typography.fontSize.sm,
  backgroundColor: colors.gray[100],
  padding: spacing.md,
  borderLeft: `4px solid ${colors.black}`,
  marginTop: spacing.xl,
};

const hrStyle = {
  borderColor: colors.gray[200],
  borderWidth: '1px',
  borderStyle: 'solid',
  marginTop: spacing.xl,
  marginBottom: spacing.lg,
};

const footerStyle = {
  fontSize: typography.fontSize.sm,
  lineHeight: typography.lineHeight.relaxed,
  color: colors.gray[900],
  marginTop: spacing.lg,
  textAlign: 'center' as const,
};

const linkStyle = {
  color: colors.black,
  textDecoration: 'underline',
};

export default EarlyAccessRequestEmail;
