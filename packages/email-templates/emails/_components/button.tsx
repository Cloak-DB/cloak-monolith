import * as React from 'react';
import { Button as ReactEmailButton } from '@react-email/components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  borders,
} from '../../styles/tokens';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
}

export const Button = ({ href, children }: ButtonProps) => {
  return (
    <ReactEmailButton href={href} style={buttonStyle}>
      {children}
    </ReactEmailButton>
  );
};

const buttonStyle = {
  backgroundColor: colors.black,
  color: colors.white,
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.bold,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: `${spacing.md} ${spacing.xl}`,
  borderRadius: borderRadius.md,
  border: `${borders.width} ${borders.style} ${borders.color}`,
  boxShadow: `4px 4px 0 ${colors.black}`,
};
