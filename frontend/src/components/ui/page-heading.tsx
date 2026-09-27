import * as React from 'react';
import Link from 'next/link';

interface PageHeadingProps {
  eyebrow?: string;
  eyebrowTone?: 'muted' | 'accent' | 'success';
  backHref?: string;
  backLabel?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  centered?: boolean;
}

/**
 * Shared page-header pattern used across all dashboard/detail/form pages.
 * Styling-only component: fixes eyebrow size, title scale (text-3xl / 600),
 * description size, and heading-to-subtext spacing in one place.
 */
export function PageHeading({
  eyebrow,
  eyebrowTone = 'muted',
  backHref,
  backLabel,
  title,
  description,
  centered = false,
}: PageHeadingProps) {
  const eyebrowToneClasses = {
    muted: 'text-ink-muted',
    accent: 'text-accent',
    success: 'text-success',
  };

  return (
    <div className={`space-y-1 ${centered ? 'text-center' : ''}`}>
      {backHref && backLabel && (
        <Link
          href={backHref}
          className="block text-xs text-ink-muted hover:text-ink hover:underline"
        >
          ← {backLabel}
        </Link>
      )}
      {eyebrow && (
        <p
          className={`text-xs uppercase tracking-widest text-ink-muted ${eyebrowToneClasses[eyebrowTone]}`}
        >
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {description && <p className="text-sm text-ink-secondary">{description}</p>}
    </div>
  );
}

export default PageHeading;
