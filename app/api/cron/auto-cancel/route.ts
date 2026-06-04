/**
 * Vercel cron — runs every 5 minutes (see vercel.json). Cancels any booking
 * stuck in `pending_payment` for more than 30 minutes and releases its
 * variant_unavailable_dates rows so the dress is bookable again.
 *
 * Protected by CRON_SECRET. Vercel sends `Authorization: Bearer $CRON_SECRET`
 * on cron requests; reject anything else.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("auto_cancel_stale_bookings");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, cancelled: data ?? 0, ranAt: new Date().toISOString() });
}
