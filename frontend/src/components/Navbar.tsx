'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/70 backdrop-blur-md border-b border-hairline/60 shadow-lg py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: Brand / Wordmark */}
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-ink hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
        >
          VoteChain
        </Link>

        {/* Right: Auth Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-xs font-medium text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-xs font-medium bg-ink text-canvas rounded-full px-4 py-1.5 hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Get started
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-ink-secondary hover:text-ink p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-md"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-menu"
          aria-label="Toggle Navigation Menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden bg-surface/95 backdrop-blur-lg border-b border-hairline px-6 py-6 space-y-3 transition-all"
        >
          <div className="flex flex-col space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-ink-secondary hover:text-ink py-1 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium bg-ink text-canvas text-center rounded-full py-2.5 hover:bg-neutral-200 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
