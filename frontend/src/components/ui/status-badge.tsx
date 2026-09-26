import * as React from 'react';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  variant: 'success' | 'warning' | 'danger' | 'accent' | 'muted';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className = '', status, variant, ...props }, ref) => {
    const baseClasses = 'inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider';
    
    const variantClasses = {
      success: 'border-success/30 text-success',
      warning: 'border-warning/30 text-warning',
      danger: 'border-danger/30 text-danger',
      accent: 'border-accent/30 text-accent',
      muted: 'border-hairline text-ink-muted',
    };
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    return (
      <span ref={ref} className={classes} {...props}>
        {status}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
