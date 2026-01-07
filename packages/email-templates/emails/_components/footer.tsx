import * as React from 'react';
import { Text, Hr, Link } from '@react-email/components';
import { colors, typography, spacing } from '../../styles/tokens';

export const Footer = () => {
  return (
    <>
      <Hr style={hrStyle} />
      <Text style={footerStyle}>
        <strong>Cloak</strong> - Database schema capture and anonymization
        <br />
        <Link href="https://www.cloak-db.com" style={linkStyle}>
          www.cloak-db.com
        </Link>
      </Text>
    </>
  );
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
