# Entri website

The full brief lives in `../../Entri/`. Read `../../Entri/CLAUDE.md` first. It is the source of truth for what to build, the writing rules and the terminology.

@AGENTS.md

## Where things are

- `lib/demo/` holds the shared demo data: `types.ts`, `seed.ts` (people), `seed-network.ts` (organizations and resources), `store.ts` (the one store both demos use, saved in the browser and synced across tabs).
- `app/admin` is the caseworker side (Diane R.). `app/app` is the user side (Marcus Bell). `app/brand` is the brand proposal.
- `components/brand/logo.tsx` holds the logo. Colours and fonts are tokens in `app/globals.css`.

## Rules that are easy to break

- No em-dashes in any copy. No "not X but Y" constructions.
- Never use: ex-con, ex-offender, felon, inmate, criminal, offender.
- All data is fictional. Invented phone numbers use 555. Addresses name a street and a nearby cross street, never a building number.
- AI output is always a draft that a person approves.
- Amber for attention. No red.

## Commands

- `npm run dev -- --port 3210` runs the site locally.
- `npm run build`, `npm run lint` and `npx tsc --noEmit` must pass before a phase is called done.
