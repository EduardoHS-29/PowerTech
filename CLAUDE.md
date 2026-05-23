# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: installs deps, creates DB, runs migrations + seed
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build (Turbopack)
npm run db:migrate   # Run pending Prisma migrations
npm run db:seed      # Re-seed the database (idempotent — uses upsert)
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma Client after schema changes
```

Default seed credentials: `admin@powertech.com` / `admin123`

## This is Next.js 16 — read the docs before coding

**Before writing any code**, read the relevant guide in `node_modules/next/dist/docs/`. This version has breaking changes that differ from training data.

Key differences from older Next.js:

- **`proxy.ts` not `middleware.ts`** — the file and the named export must both be called `proxy`
- **`params` and `searchParams` are Promises** — always `const { id } = await params`
- **`cookies()` is async** — always `const store = await cookies()`
- **`cacheComponents` is disabled** — `export const dynamic` route config is not used; dashboard routes are dynamic because the layout reads cookies. Do not re-enable `cacheComponents: true` without refactoring the layout/header away from direct cookie access
- **Tailwind v4** — no `tailwind.config.js`; configured entirely via `@import "tailwindcss"` in `globals.css`; PostCSS uses `@tailwindcss/postcss`

## Architecture

### Data flow

```
Page / Server Action
  → Service  (src/lib/services/)     — business rules, throws typed errors
    → Repository  (src/lib/repositories/)  — pure Prisma queries only
      → prisma singleton  (src/lib/db/prisma.ts)
```

Pages are Server Components that call services directly. There is no API layer.

### Server Actions

All mutations go through Server Actions co-located in `actions.ts` next to the route they serve. Actions follow this pattern:

```ts
export async function createTurbinaAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  // 1. parse + validate with Zod
  // 2. call service (may throw AppError subclasses)
  // 3. revalidatePath, then redirect — redirect() MUST be outside try/catch
}
```

Return type is always `ActionResult<T>` from `src/lib/errors/index.ts`:
```ts
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

Forms consume actions via `useActionState` (React 19). The `fieldErrors` key matches Zod's `.flatten().fieldErrors` shape.

### Repositories

Each repository uses a typed `select` object:

```ts
const turbinaSelect = { ... } satisfies Prisma.TurbinaSelect;
export type TurbinaRow = Prisma.TurbinaGetPayload<{ select: typeof turbinaSelect }>;
```

Repositories contain only Prisma queries — no business logic, no error throwing.

### Validation (Zod v4)

Schemas live in `src/lib/validations/`. Zod v4 breaking changes:
- Use `message:` instead of `invalid_type_error:` / `errorMap:`
- Use `z.input<typeof schema>` (not `z.infer`) for form data types — required when using `z.coerce` fields, as the input type differs from the output type

### Authentication

- JWT stored in httpOnly cookie `powertech_session`
- `src/proxy.ts` — blocks unauthenticated requests and redirects to `/login`
- `src/lib/auth/session.ts` — `getSession()`, `createSession()`, `deleteSession()`
- The dashboard layout (`src/app/(dashboard)/layout.tsx`) also validates the session for server-side redirect fallback

### Error hierarchy

`src/lib/errors/index.ts` exports: `AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ConflictError`. Services throw these; Server Actions catch them via `handleActionError()`.

### Icons

All icons use FontAwesome (`@fortawesome/react-fontawesome` + `@fortawesome/free-solid-svg-icons`). The FOUC fix is in `src/app/layout.tsx`:
```ts
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
```
Do not add inline SVGs — import from `@fortawesome/free-solid-svg-icons` instead.

### Constants and routes

All routes are defined in `src/lib/constants/index.ts` as the `ROUTES` object. Dynamic routes are functions: `ROUTES.TURBINA(id)`, `ROUTES.ANALISE(id)`. Always use `ROUTES.*` — never hardcode paths.
