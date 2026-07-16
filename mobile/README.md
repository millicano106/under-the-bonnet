# Under the Bonnet — mobile

Local-first car maintenance tracker. Expo (TypeScript) app with all data stored
on-device in SQLite — no server, no sync, no external APIs yet.

## Stack

- **Expo SDK 54** (TypeScript template) — pinned for Expo Go compatibility
- **expo-router** for navigation — file-based routing, so the folder
  structure in `app/` doubles as the route map, and it comes with typed
  routes and deep linking out of the box. Chosen over hand-wired React
  Navigation to cut boilerplate now that most new Expo apps default to it.
- **expo-sqlite** for local storage

## Running

```sh
cd mobile
npm install
npx expo start
```

Press `w` for web, or scan the QR code with Expo Go / a simulator.

## Data layer

All SQLite code lives in `db/`:

```
db/
  types.ts               Row types for every table
  client.ts               DATABASE_NAME constant
  migrate.ts              Migration runner
  migrations/
    types.ts              Migration interface
    001_initial_schema.ts  First migration (all 5 tables)
    index.ts               Ordered list of migrations
  repository/
    cars.ts                CRUD used by the UI
    components.ts
    scheduleItems.ts
    logEntries.ts
```

### Migration system

Schema changes are tracked using SQLite's own `PRAGMA user_version`, not
`CREATE TABLE IF NOT EXISTS`. This means the app can ship schema changes
without ever wiping a user's local data.

- Each migration is an object `{ version, name, up(db) }` in
  `db/migrations/`, registered in order in `db/migrations/index.ts`.
- On launch, `RootLayout` (`app/_layout.tsx`) opens the database through
  `<SQLiteProvider onInit={migrateDbIfNeeded}>`.
- `migrateDbIfNeeded` (`db/migrate.ts`) reads the current `PRAGMA
  user_version`, finds every migration with a higher version number, and
  applies them **in order**, each inside its own transaction, bumping
  `user_version` after each one succeeds.
- Screens read the database via `useSQLiteContext()`, which only resolves
  once migrations have finished — so no screen can query a half-migrated
  database.

**To add a new migration later:**

1. Create `db/migrations/00N_some_change.ts` exporting
   `{ version: N, name: '...', up: async (db) => { ... } }`.
2. Add it to the array in `db/migrations/index.ts`.
3. Never edit a migration that has already shipped — devices that already
   applied it won't re-run it, so a later edit only affects fresh installs
   and creates drift. Add a new migration instead, even for a one-line fix.

### Schema (v1)

- `cars` — one row per car, including purchase/sale price & date and a
  `is_sold` flag.
- `components` — trackable parts (tyres, brakes, oil, etc.), linked to a car.
- `service_schedule_items` — what's due and when (by mileage and/or date),
  per car.
- `log_entries` — free-form notes, service records, costs, fuel-ups.
- `reminders` — derived/generated due dates (service schedule, MOT, tax,
  insurance), stored separately so they can be scheduled as local
  notifications later.

All child tables have an indexed `car_id` foreign key with `ON DELETE
CASCADE`, so deleting a car cleans up its related rows.

## Screens

- `/` — Garage: list of cars, empty state, add button.
- `/add-car` — modal form to add a car.
- `/car/[id]` — Car detail: header info, Mark as Sold action, and
  Financials / Components / Schedule / Log sections (in-screen tabs).

## Not yet implemented

- Sync, backend, or any external API calls.
- Editing/deleting components, schedule items, or log entries (tables and
  read paths exist; write UI comes later).
- Local notification scheduling for reminders.
