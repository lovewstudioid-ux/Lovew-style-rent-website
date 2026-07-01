-- Style ID update: link saved results to user accounts
-- Run in Supabase SQL Editor (idempotent — safe to re-run)

ALTER TABLE public.style_id_results
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS style_id_results_user_id_idx
  ON public.style_id_results(user_id);
