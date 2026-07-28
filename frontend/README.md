# Electro Pi Task Manager — Frontend

Next.js 15 (App Router) + React 19 + TypeScript front-end for the
Electro Pi task manager. Internationalised with `next-intl` (English / Arabic,
RTL supported via the Cairo font).

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run start    # start the production server
npm run lint     # run eslint
npm run format   # format with prettier
```

## Project layout

```
app/             Next.js App Router routes ([locale] is the locale segment)
components/      Reusable UI (shadcn/ui primitives + app-level components)
data/            Local mock data used while the API is in-flight
hooks/           React Query hooks
i18n/            next-intl routing & request config
lib/             API client, helpers, formatters
messages/        en.json / ar.json
public/          Static assets
services/        Service layer (talks to lib/api/client)
types/           Shared TypeScript types
```

## Conventions

- Page routes that resolve a project use the project's `slug`, not its UUID
  (`/projects/atlas-design-system`). Slugs are auto-generated from the project
  name and de-duplicated with a `-2` suffix on collision.
- All "select" inputs use the `Combobox` component (`components/ui/combobox.tsx`)
  for keyboard-navigable search.
- Mock data is mutated in-memory by the service layer; treat the `let` arrays
  in `services/*.service.ts` as the dev-time source of truth.
