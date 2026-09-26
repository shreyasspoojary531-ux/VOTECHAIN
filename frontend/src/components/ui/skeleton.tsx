import * as React from 'react';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', ...props }, ref) => {
    const classes = `animate-pulse rounded-lg border border-hairline bg-surface ${className}`;

    return <div ref={ref} className={classes} {...props} />;
  },
);

Skeleton.displayName = 'Skeleton';
