import * as React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface IconProps extends React.SVGAttributes<SVGElement> {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({
  icon: IconComponent,
  size = 'md',
  className,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      className={cn('inline-block', className)}
      {...props}
    />
  );
}
