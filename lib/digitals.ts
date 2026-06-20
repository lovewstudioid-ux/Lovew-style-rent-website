/** Digital products shop — shared types & categories. */

export const DIGITAL_CATEGORIES = ["Invitations", "Social media", "Planners", "Templates", "Other"] as const;

export interface DigitalProduct {
  id: string;
  created_at: string;
  status: string;
  title: string;
  category: string;
  price: string | null;
  description: string | null;
  cover_url: string | null;
  cover_path: string | null;
  buy_url: string | null;
  sort: number;
}
