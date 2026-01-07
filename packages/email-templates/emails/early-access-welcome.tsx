import * as React from 'react';
import { Text, Heading, Hr, Link } from '@react-email/components';
import { Layout } from './_components/layout';
import { Button } from './_components/button';
import { typography, spacing, colors } from '../styles/tokens';

export interface EarlyAccessWelcomeTranslations {
  heading: string;
  intro: string;
  resourcesHeading: string;
  docsLabel: string;
  docsDescription: string;
  githubLabel: string;
  githubDescription: string;
  outro: string;
  footerTagline: string;
  footerWebsite: string;
}

interface EarlyAccessWelcomeEmailProps {
  translations: EarlyAccessWelcomeTranslations;
  docsUrl: string;
  githubUrl: string;
}

export const EarlyAccessWelcomeEmail = ({
  translations,
  docsUrl,
  githubUrl,
}: EarlyAccessWelcomeEmailProps) => {
  return (
    <Layout preview={translations.heading}>
      <Heading style={headingStyle}>{translations.heading}</Heading>

      <Text style={textStyle}>{translations.intro}</Text>

      <Heading as="h2" style={subHeadingStyle}>
        {translations.resourcesHeading}
      </Heading>

      <div style={cardStyle}>
        <Text style={resourceLabelStyle}>{translations.docsLabel}</Text>
        <Text style={resourceDescStyle}>{translations.docsDescription}</Text>
        <Button href={docsUrl}>{translations.docsLabel}</Button>
      </div>

      <div style={cardStyle}>
        <Text style={resourceLabelStyle}>{translations.githubLabel}</Text>
        <Text style={resourceDescStyle}>{translations.githubDescription}</Text>
        <Button href={githubUrl}>{translations.githubLabel}</Button>
      </div>

      <Text style={outroStyle}>{translations.outro}</Text>

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

const subHeadingStyle = {
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.bold,
  marginTop: spacing.xl,
  marginBottom: spacing.md,
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
  marginTop: spacing.md,
  marginBottom: spacing.md,
  boxShadow: `4px 4px 0 ${colors.black}`,
};

const resourceLabelStyle = {
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  color: colors.black,
  marginTop: '0',
  marginBottom: spacing.xs,
};

const resourceDescStyle = {
  fontSize: typography.fontSize.sm,
  color: colors.gray[900],
  marginTop: '0',
  marginBottom: spacing.md,
  lineHeight: typography.lineHeight.relaxed,
};

const outroStyle = {
  ...textStyle,
  marginTop: spacing.xl,
  fontWeight: typography.fontWeight.medium,
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

export default EarlyAccessWelcomeEmail;
