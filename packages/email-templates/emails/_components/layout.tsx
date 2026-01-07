import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Preview,
} from '@react-email/components';
import { colors, typography, spacing } from '../../styles/tokens';

interface LayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const Layout = ({ children, preview }: LayoutProps) => {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={contentStyle}>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
};

const bodyStyle = {
  backgroundColor: colors.white,
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.fontSize.base,
  color: colors.gray[900],
  margin: '0',
  padding: '0',
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
};

const contentStyle = {
  padding: `${spacing['2xl']} ${spacing.lg}`,
};
