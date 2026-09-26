import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const inputClasses = `w-full rounded-md border border-hairline-strong bg-canvas px-3 py-2 text-sm text-ink placeholder-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-ink-secondary mb-1">{label}</label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
