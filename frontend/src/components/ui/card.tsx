import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, children, ...props }, ref) => {
    const classes = `rounded-lg border border-hairline bg-surface p-6 ${hover ? 'hover:border-hairline-emphasis hover:bg-surface-raised transition-all' : ''} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
