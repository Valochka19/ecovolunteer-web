# EcoVolunteer

A volunteering platform with a token economy: volunteers join events run by verified organisations, earn **Social Tokens (ST)** for participation and spend them on rewards from partners. Built for a hackathon by the YMB team (Young Mobile Brains).

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, RLS) · Gemini API** for the in-app assistant.

## Features

- **Four roles** with one account model: volunteer, organisation, admin, partner. Role switching for demo accounts.
- **Events** with covers, tags, participants and a moderation queue for admins.
- **Organisations** with membership and a verification flow (pending / verified / rejected).
- **Social Tokens**: balance per profile, server-side `add_tokens` RPC, rewards catalogue with categories, stock and expiry.
- **Social layer**: posts with images, friendships, direct messages.
- **AI guide widget**: a Gemini-backed assistant that explains the platform to newcomers.
- **Auth and route protection** via Supabase SSR middleware: anonymous users are redirected from `/dashboard` to `/login`.

## Project layout

```
app/
  (auth)/login, (auth)/register    public pages
  (dashboard)/dashboard            protected shell (sidebar, header, bottom nav)
  api/                             profile creation/lookup, role switch, demo seed & cleanup
components/
  auth/, dashboard/, ui/           forms, shell, design system primitives
context/AuthContext.tsx            session, login/register/logout, profile hydration
lib/supabase/                      browser client, SSR middleware, generated DB types
supabase/migrations/               schema: profiles, events, participants, posts,
                                   friendships, messages, moderation, org members, tokens RPC
tests/e2e/                         Playwright suite (see below)
```

## Running locally

```bash
npm install
cp .env.local.example .env.local   # add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_GEMINI_API_KEY
npm run dev                        # http://localhost:3000
```

Apply `supabase/migrations/*.sql` to a Supabase project in order. `POST /api/seed` creates demo accounts (`volunteer@demo.ru`, `org@demo.ru`, `admin@demo.ru`, `partner@demo.ru`); `POST /api/cleanup` removes them.

## E2E tests (Playwright)

```bash
npm run test:e2e        # headless, starts `next dev` itself
npm run test:e2e:ui     # interactive runner
```

Uses the locally installed Google Chrome (`channel: "chrome"`), so no browser download is required.

What is covered (`tests/e2e/`):

- `home.spec.ts` – landing page renders, navigation to `/login`
- `auth-guard.spec.ts` – middleware redirects anonymous `/dashboard` to `/login`, public routes stay open
- `login.spec.ts` – native validation blocks empty submit (asserts zero auth requests), wrong credentials show the inline error, submit button is disabled while the request is in flight, real login reaches `/dashboard`
- `register.spec.ts` – `minLength` rejects short passwords client-side, role radio group toggles

Determinism notes:

- Supabase auth calls that must fail are intercepted with `page.route` and answered with a fixed 400, so the tests do not depend on the network or on the free Supabase project being awake.
- The loading-state test holds the auth response behind a promise and releases it explicitly instead of racing a timer.
- The real-login test is skipped unless `E2E_EMAIL` / `E2E_PASSWORD` are set, so the suite is green without secrets.
- Traces and screenshots are kept only for failures (`test-results/`).

## Notes

- The UI is in Russian: the product targets volunteers and NGOs in Kazakhstan and the CIS.
- Row Level Security is enabled on all user tables; the anon key is safe to expose, the service role key is never used client-side.
