import React from 'react';
import { cn } from '@/lib/utils';

interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
}

export function MaterialIcon({ name, className, ...props }: MaterialIconProps) {
  return (
    <span 
      className={cn("material-symbols-outlined", className)} 
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}