import { migration001InitialSchema } from './001_initial_schema';
import type { Migration } from './types';

// Ordered list of all schema migrations. Add new migrations here, in order,
// each with a version number one higher than the last. Never edit a
// migration that has already shipped — add a new one instead, so devices
// that already applied it aren't affected.
export const migrations: Migration[] = [migration001InitialSchema];
