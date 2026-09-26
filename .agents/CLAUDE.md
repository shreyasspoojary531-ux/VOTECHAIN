# AGENTS.md — VoteChain Project (AI Instructions)

**Read this file first, before every single prompt/task.** Then follow the Reference Map below to find whatever else you need. Do not skip this step.

## Reference Map (go here, not to me, when unsure)

| If you don't know... | Go to |
|---|---|
| Project scope, features, requirements, constraints | `PRD.md` |
| What's already been built, past decisions, past errors/fixes, commit history | `MEMORY.md` |
| Where a file/folder lives, or where a new file should go | `FILESTRUCTURE.md` |
| Visual/UI/design direction (current phase = frontend) | the design skill/guidelines in the project's `/skills` folder |

Never guess-search the codebase randomly. Check `FILESTRUCTURE.md` first — it exists specifically to save tokens.

## Design Direction

UI should follow the visual language of **Resend** (resend.com / their dashboard): minimal, high-contrast (dark-friendly), generous whitespace, restrained color with a single accent used only for primary actions and status, clean sans-serif type (Inter/Geist-style), monospace font for anything identifier-like (transaction IDs, ballot hashes, block hashes), thin/subtle borders instead of heavy shadows or drop-shadows, no decorative gradients beyond a light glow/accent where Resend itself uses one. Apply this consistently across voter-facing and admin screens — do not default to generic Tailwind/shadcn boilerplate styling. Every prompt that touches UI should be told explicitly to match this direction, not just "make it look nice."

## Current Phase

**Frontend only.** Stack: **Next.js (JavaScript, not TypeScript) + Tailwind CSS + Axios + Recharts**. Routing is Next.js's own file-based routing (App Router) — do not add React Router. Do not scaffold backend, database, or blockchain code yet — that's Phase 2/3 in `PRD.md`. All data should come from a mock data/service layer shaped like the future real API so swapping in the real backend later doesn't require rewiring components.

## Prompt & Commit Discipline

- One feature per prompt. Medium-sized: not a single tiny change, not five features bundled together.
- Every prompt ends in exactly one git commit, once the feature works.
- Commit message format: `type(scope): short description` (e.g. `feat(ballot): add candidate selection screen`).
- This lets us roll back to any prompt cleanly — never combine unrelated changes in one commit.

## Code Quality (production-level)

- Plain JavaScript (no TypeScript). Use JSDoc comments on shared functions/services where types would help readability, but don't add a TS toolchain.
- Clean separation, following Next.js App Router conventions: `app/` for routes/pages, `components/` for reusable UI (no business logic in components), `lib/` or `services/` for the mock API/data layer, `hooks/` for custom hooks.
- No leftover `console.log`, no dead code, no unresolved TODOs without a corresponding note in `MEMORY.md`.
- Responsive layouts, accessible markup (labels, semantic elements, keyboard nav where relevant).
- Naming and folder placement must match `FILESTRUCTURE.md`. Update it immediately if structure changes.
- Never use or reference real Aadhaar/voter PII — demo/mock data only, per `PRD.md`.

## Handling Ambiguity & Bugs — no stopping to ask

- If a requirement is unclear: check `PRD.md`, then `MEMORY.md`. If still unclear, make the most reasonable assumption consistent with existing code and the project's stated goals — **do not pause to ask the user** — then log the assumption in `MEMORY.md` under "Decisions & Assumptions" so it can be corrected later if wrong.
- If something breaks: reproduce it, find the actual root cause, apply the minimal correct fix (not a workaround that hides the symptom), verify it, then log it in `MEMORY.md` under "Errors & Fixes" (what broke, why, how it was fixed).
- Never hallucinate an API, library behavior, or file that doesn't exist — check `FILESTRUCTURE.md`/actual files before referencing them.

## End-of-Prompt Checklist (every single time)

1. Feature implemented and verified working.
2. `MEMORY.md` updated — progress log entry + (if relevant) errors/fixes + decisions.
3. `FILESTRUCTURE.md` updated if any files/folders were added, moved, or removed.
4. `PRD.md` checkpoint checkbox ticked off if completed.
5. One git commit made.
