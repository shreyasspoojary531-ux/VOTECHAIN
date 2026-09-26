interface ComingSoonProps {
  /** Route path, shown for orientation while pages are unwritten. */
  path: string;
}

/** Minimal placeholder rendered by every scaffold route. */
export default function ComingSoon({ path }: ComingSoonProps) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-xs text-ink-muted">{path}</p>
        <h1 className="mt-2 text-2xl font-semibold">Coming soon</h1>
      </div>
    </main>
  );
}
