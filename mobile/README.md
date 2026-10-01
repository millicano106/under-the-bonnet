# Under the Bonnet — mobile

Local-first car maintenance tracker. Expo (TypeScript) app with all data stored
on-device in SQLite — no server, no sync, no external APIs yet.

## Stack

- **Expo SDK 57** (TypeScript template)
- **expo-router** for navigation — file-based routing, so the folder
  structure in `app/` doubles as the route map, and it comes with typed
  routes and deep linking out of the box. Chosen over hand-wired React
  Navigation to cut boilerplate now that most new Expo apps default to it.
- **expo-sqlite** for local storage
- **expo-notifications** + **expo-device** for local reminder notifications
  (scheduled on-device only — no push/remote notifications, no backend)
- **@expo/vector-icons** (Feather set) for icons throughout the UI

## Running

```sh
cd mobile
npm install
npx expo start
```

Press `w` for web, or scan the QR code with Expo Go / a simulator.

## ⚠️ Current status / what's left to do

The edit/delete UI and reminder-notification work below has been written but
**not yet installed, type-checked, or run**. The environment this was built in
had no `npm`/`node` on `PATH` (this project expects the `.devcontainer`
image), so the following still needs to happen before it can be trusted:

1. `npm install` in `mobile/` — pulls in the three new dependencies
   (`expo-notifications`, `expo-device`, `@expo/vector-icons`) that were
   added to `package.json` but never actually installed.
2. `npx tsc --noEmit` — the code was written carefully against known
   `expo-notifications ~0.32.17` APIs, but hasn't been type-checked since
   the packages were added, so some adjustment is likely (e.g. the exact
   `NotificationBehavior` field names or trigger shape).
3. Run the app (`npx expo start`, Expo Go) and manually verify:
   - Migration `002_add_reminder_notification_id` applies cleanly against
     an existing on-disk database (delete-and-reinstall if it doesn't, since
     no real user data exists yet on any device).
   - Add/edit/delete works for components, schedule items, and log entries.
   - Creating/editing a schedule item with a future "Next due date" actually
     schedules a local notification (check `lib/notifications.ts` — this is
     the highest-uncertainty piece, since local notification behavior in
     plain Expo Go on SDK 57 hasn't been confirmed on a real device yet).
   - Deleting a schedule item cancels its notification (not just the DB row).

Everything else described in this README below reflects the code as written.

## Data layer

All SQLite code lives in `db/`:

```
db/
  types.ts                        Row types for every table
  client.ts                       DATABASE_NAME constant
  migrate.ts                      Migration runner
  migrations/
    types.ts                      Migration interface
    001_initial_schema.ts         First migration (all 5 tables)
    002_add_reminder_notification_id.ts   Adds reminders.notification_id
    index.ts                      Ordered list of migrations
  repository/
    cars.ts                       CRUD used by the UI
    components.ts                 Full CRUD
    scheduleItems.ts               Full CRUD
    logEntries.ts                  Full CRUD
    reminders.ts                   List/upsert/dismiss, keyed by source
```

Shared, non-DB code:

```
theme.ts              Colors, spacing, radii, typography, shadow tokens
components/           Shared UI: Button, Card, TextField, ListRow,
                       SectionHeader, EmptyState, Badge
lib/
  formValues.ts        Small parse-or-null helpers for form fields
  notifications.ts     expo-notifications wrapper + reminder sync logic
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

### Schema (v2)

- `cars` — one row per car, including purchase/sale price & date and a
  `is_sold` flag.
- `components` — trackable parts (tyres, brakes, oil, etc.), linked to a car.
- `service_schedule_items` — what's due and when (by mileage and/or date),
  per car.
- `log_entries` — free-form notes, service records, costs, fuel-ups.
- `reminders` — derived reminders for a schedule item's due date, each
  optionally holding the `notification_id` of a locally-scheduled OS
  notification (added in migration 002) so it can be cancelled/rescheduled
  later.

All child tables have an indexed `car_id` foreign key with `ON DELETE
CASCADE`, so deleting a car cleans up its related rows. Note that cascading
a schedule-item delete removes its `reminders` row automatically, but does
**not** cancel an already-scheduled OS notification — that's done explicitly
in code (see `lib/notifications.ts`) before the delete happens.

## Reminders & notifications

Scoped to `service_schedule_items.next_due_date` only — `reminders` also
supports `mot`/`tax`/`insurance` source types in the schema, but there's no
date data anywhere in the app for those yet, so they remain unreachable
(see "Not yet implemented" below).

- On app launch, `_layout.tsx` fires a non-blocking permission request
  (`ensureNotificationPermissionsAsync`). If denied, the app carries on
  silently — reminders just won't schedule OS notifications.
- Saving a schedule item with a "Next due date" calls
  `syncReminderNotificationAsync`, which upserts the `reminders` row and
  schedules (or reschedules, cancelling any prior one first) a local
  notification for 9am on that date.
- Deleting a schedule item cancels its notification before the row (and its
  cascaded `reminders` row) is deleted.
- The Schedule tab shows each item's due date inline, plus a "Reminder set"
  badge when a notification is actually scheduled.

## Screens

- `/` — Garage: list of cars, empty state, add button.
- `/add-car` — modal form to add a car.
- `/car/[id]` — Car detail: header info, Mark as Sold action, and
  Financials / Components / Schedule / Log sections (in-screen tabs), each
  of Components/Schedule/Log supporting add/edit/delete.
- `/component-form`, `/schedule-item-form`, `/log-entry-form` — shared
  create+edit modal forms, taking a `carId` param and an optional `id`
  param (present = editing that record).

## Not yet implemented

- Sync, backend, or any external API calls.
- Reminders/notifications for MOT, tax, and insurance due dates — the
  schema supports it (`reminders.source_type`), but there's no date field
  anywhere in the app to derive them from yet.
