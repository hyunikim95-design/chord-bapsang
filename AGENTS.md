<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Notes

- This is a Next.js 16 / React 19 harmony-practice web app.
- The main UI lives in `app/page.tsx` and is currently a client component.
- Harmony analysis helpers live in `lib/harmony.ts`.
- Static practice data lives under `data/`, especially:
  - `data/chordDescriptions.ts`
  - `data/guitarVoicings.ts`
  - `data/practicePresets.ts`
- Before editing Next.js app files, read the relevant local docs in `node_modules/next/dist/docs/`.
- Prefer focused edits. The app currently keeps much of the state and UI flow in `app/page.tsx`, so avoid broad refactors unless explicitly requested.
- Run `npm run lint` or a TypeScript no-emit check after changes when practical.
