'use client';

import React from 'react';
import Nav from './Nav';

/**
 * Shared AppShell container wrapping page layout with the Resend-style navigation shell.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent/30">
      <Nav />
      <main className="flex-1 pt-14">{children}</main>
    </div>
  );
}
