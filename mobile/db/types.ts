export interface Car {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  registration: string;
  colour: string | null;
  purchase_price: number;
  purchase_date: string;
  sale_price: number | null;
  sale_date: string | null;
  is_sold: 0 | 1;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: number;
  car_id: number;
  name: string;
  category: string;
  installed_date: string | null;
  installed_mileage: number | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceScheduleItem {
  id: number;
  car_id: number;
  name: string;
  description: string | null;
  interval_miles: number | null;
  interval_months: number | null;
  last_done_date: string | null;
  last_done_mileage: number | null;
  next_due_date: string | null;
  next_due_mileage: number | null;
  created_at: string;
  updated_at: string;
}

export type LogEntryType = 'service' | 'note' | 'cost' | 'fuel';

export interface LogEntry {
  id: number;
  car_id: number;
  entry_type: LogEntryType;
  title: string;
  description: string | null;
  cost: number | null;
  mileage_at_entry: number | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export type ReminderSourceType = 'service_schedule' | 'mot' | 'tax' | 'insurance';

export interface Reminder {
  id: number;
  car_id: number;
  source_type: ReminderSourceType;
  source_id: number | null;
  due_date: string;
  is_dismissed: 0 | 1;
  notification_id: string | null;
  created_at: string;
}
