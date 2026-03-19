import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
}

const variantStyles = {
  default: 'bg-secondary text-secondary-foreground border border-border/50',
  primary: 'bg-primary/20 text-primary border border-primary/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  error: 'bg-red-500/20 text-red-400 border border-red-500/30',
  outline: 'bg-transparent text-foreground border border-border',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export const StatusDot = ({ status }: { status: 'online' | 'offline' | 'error' | 'warning' }) => {
  const colors = {
    online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    offline: 'bg-muted-foreground',
    error: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    warning: 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]',
  };

  return (
    <span className={cn('inline-block w-2 h-2 rounded-full', colors[status])} />
  );
};
