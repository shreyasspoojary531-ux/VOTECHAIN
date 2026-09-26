# DESIGN.md — Visual Direction

> The aesthetic: a terminal-grade instrument panel. True black canvas, hairline structure, monospaced identifiers, one serif voice for hero moments. Light arrives only where it means something.

## Canvas & surfaces

| Token                 | Value     | Use                                          |
| --------------------- | --------- | -------------------------------------------- |
| `canvas`              | `#000000` | Page background — true black, no gradients   |
| `surface`             | `#0a0a0a` | Cards, panels                                |
| `surface-raised`      | `#141414` | Hover states, elevated elements              |

## Hairline borders (structure, not boxes)

| Token               | Value     | Use                                   |
| ------------------- | --------- | ------------------------------------- |
| `hairline`          | `#1f1f1f` | Default 1px borders/dividers          |
| `hairline-strong`   | `#262626` | Emphasized dividers, input borders    |
| `hairline-emphasis` | `#2e2e2e` | Focus rings, active segment outlines  |

Borders are 1px, structural, and quiet. Prefer full-width dividers over boxed cards.

## Ink (text)

| Token           | Value     | Use                                |
| --------------- | --------- | ---------------------------------- |
| `ink`           | `#f5f5f4` | Primary text                       |
| `ink-secondary` | `#a3a3a3` | Secondary text, labels             |
| `ink-muted`     | `#6b6b6b` | Metadata, timestamps, route paths  |

## Semantic accents (used sparingly, never decoratively)

- `success` `#34d399` — confirmed transactions, verified receipts
- `danger` `#f87171` — destructive actions, verification failure
- `warning` `#fbbf24` — pending states, expiry
- `accent` `#818cf8` — interactive emphasis, links

## Typography

Loaded once in `src/app/layout.tsx` via `next/font/google`:

| Token         | Font        | Role                                                    |
| ------------- | ----------- | ------------------------------------------------------- |
| `font-sans`   | Inter       | UI text, body, forms                                    |
| `font-mono`   | Geist Mono  | Identifiers: txIds, block hashes, Aadhaar last-4, routes |
| `font-display`| Fraunces    | Display-serif for hero-style headings (Vote Journey, etc.) |

Rule: any hash, id, or address renders in `font-mono`. Numbers in tables and audit trails prefer mono.

## Radius scale

| Token         | Value    | Use                              |
| ------------- | -------- | -------------------------------- |
| `rounded-md`  | `8px`    | Buttons, inputs                  |
| `rounded-lg`  | `12px`   | Cards, panels, modals            |
| `rounded-full`| `9999px` | Status pills, avatars, chips     |

Nothing else — no `rounded-sm`/`rounded-xl` improvisation.

## Spacing & motion

- 4px base grid; sections breathe with `py-16`/`py-24`, not boxes.
- Motion: 150–200ms ease-out on hover/focus; no bounce, no parallax.
- Empty states use `ink-muted` mono text (see `coming-soon.tsx` for the pattern).

## Component principles

1. Structure via hairlines and spacing, not shadows or color blocks.
2. One accent per view maximum.
3. Status is always shown with a mono identifier (e.g. block height, txId prefix).
4. Future visuals (Vote Journey, chain linkage, privacy architecture) are diagrams of lines and nodes on the black canvas — hairlines connecting `rounded-full` nodes.
