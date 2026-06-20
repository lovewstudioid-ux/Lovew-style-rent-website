/** Event seating chart — shared types. (Slug helper reused from lib/registry.) */

export interface EventRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  event_date: string | null;
  note: string | null;
  created_at: string;
}

export interface EventGuest {
  id: string;
  event_id: string;
  name: string;
  table_label: string;
  seat: string | null;
  note: string | null;
  created_at: string;
}
