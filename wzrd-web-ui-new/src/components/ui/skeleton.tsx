import React from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  count?: number;
  variant?: 'default' | 'circle' | 'text' | 'card' | 'list';
}

export function Skeleton({
  className,
  width = '100%',
  height = '1em',
  count = 1,
  variant = 'default'
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-secondary/20 rounded';

  if (variant === 'circle') {
    return (
      <div className={`rounded-full ${baseClass} ${className}`} style={{ width, height }} />
    );
  }

  if (variant === 'text') {
    return (
      <div className={`h-4 ${baseClass} ${className}`} style={{ width }} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`h-24 w-full ${baseClass} ${className}`} />
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`h-4 ${baseClass}`} style={{ width }} />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`h-4 ${baseClass}`} style={{ width }} />
      ))}
    </div>
  );
}
