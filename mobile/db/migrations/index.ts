import { migration001InitialSchema } from './001_initial_schema';
import { migration002AddReminderNotificationId } from './002_add_reminder_notification_id';
import { migration003AddInvoicePhotos } from './003_add_invoice_photos';
import { migration004AddSettings } from './004_add_settings';
import type { Migration } from './types';

// Ordered list of all schema migrations. Add new migrations here, in order,
// each with a version number one higher than the last. Never edit a
// migration that has already shipped — add a new one instead, so devices
// that already applied it aren't affected.
export const migrations: Migration[] = [
  migration001InitialSchema,
  migration002AddReminderNotificationId,
  migration003AddInvoicePhotos,
  migration004AddSettings,
];
