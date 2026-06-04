import { Star, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, defaultLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BodySilhouette } from "@/components/account/body-silhouette";
import {
  saveSizingProfile,
  deleteSizingProfile,
  setDefaultSizingProfile,
} from "@/app/actions/sizing";
import { redirect } from "next/navigation";

export const metadata = { title: "Ukuranku" };

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

type SizingRow = {
  id: string;
  label: string | null;
  size_label: string | null;
  bust_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  shoulder_cm: number | null;
  dress_length_cm: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  notes: string | null;
  is_default: boolean | null;
};

export default async function SizingPage({
  searchParams,
}: {
  searchParams: { edit?: string; new?: string; error?: string; saved?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account/sizing");

  const { data: profiles } = await supabase
    .from("sizing_profiles")
    .select(
      "id,label,size_label,bust_cm,waist_cm,hip_cm,shoulder_cm,dress_length_cm,height_cm,weight_kg,notes,is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  const rows: SizingRow[] = profiles ?? [];
  const editing =
    searchParams.edit ? rows.find((r) => r.id === searchParams.edit) : null;
  const showForm = Boolean(searchParams.new) || Boolean(editing);

  const t = getDictionary(defaultLocale).account.sizing;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-charcoal">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-charcoal/70">{t.subtitle}</p>
      </header>

      <div className="rounded-md border border-rose-gold/30 bg-soft-blush/50 px-4 py-3 text-sm text-charcoal/80">
        {t.banner}
      </div>

      {searchParams.saved ? (
        <div className="rounded-md border border-sage/40 bg-sage/10 px-4 py-3 text-sm">
          {t.save} ✓
        </div>
      ) : null}
      {searchParams.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {searchParams.error}
        </div>
      ) : null}

      {/* List of saved profiles */}
      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-charcoal/20 bg-cream px-6 py-12 text-center text-sm text-charcoal/60">
          {t.empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-charcoal/10 bg-cream p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold text-charcoal">
                      {row.label ?? "My Size"}
                    </p>
                    {row.size_label ? (
                      <span className="rounded-full bg-rose-gold/10 px-2 py-0.5 text-xs font-medium text-rose-gold">
                        {row.size_label}
                      </span>
                    ) : null}
                    {row.is_default ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-2 py-0.5 text-xs font-medium text-sage">
                        <Star className="h-3 w-3 fill-sage" /> {t.defaultBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-charcoal/70">
                    {summariseMeasurements(row, t)}
                  </p>
                  {row.notes ? (
                    <p className="mt-1 text-xs text-charcoal/50">{row.notes}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!row.is_default ? (
                    <form action={setDefaultSizingProfile}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-md p-1.5 text-charcoal/50 hover:bg-soft-blush hover:text-sage"
                        title="Jadikan default"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </form>
                  ) : null}
                  <a
                    href={`/account/sizing?edit=${row.id}`}
                    className="rounded-md p-1.5 text-charcoal/50 hover:bg-soft-blush hover:text-rose-gold"
                    title={t.edit}
                  >
                    <Pencil className="h-4 w-4" />
                  </a>
                  <form
                    action={async (formData) => {
                      "use server";
                      await deleteSizingProfile(formData);
                    }}
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="rounded-md p-1.5 text-charcoal/50 hover:bg-red-50 hover:text-red-600"
                      title={t.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <div>
          <Button asChild size="lg">
            <a href="/account/sizing?new=1">+ {t.add}</a>
          </Button>
        </div>
      ) : (
        <SizingForm row={editing ?? null} t={t} />
      )}
    </div>
  );
}

function summariseMeasurements(
  row: SizingRow,
  t: ReturnType<typeof getDictionary>["account"]["sizing"],
): string {
  const parts: string[] = [];
  if (row.bust_cm) parts.push(`${t.bustLabel} ${row.bust_cm}${t.cmShort}`);
  if (row.waist_cm) parts.push(`${t.waistLabel} ${row.waist_cm}${t.cmShort}`);
  if (row.hip_cm) parts.push(`${t.hipLabel} ${row.hip_cm}${t.cmShort}`);
  if (parts.length === 0) return "—";
  return parts.join(" · ");
}

function SizingForm({
  row,
  t,
}: {
  row: SizingRow | null;
  t: ReturnType<typeof getDictionary>["account"]["sizing"];
}) {
  return (
    <div className="rounded-lg border border-charcoal/10 bg-cream p-6 md:p-8">
      <form
        action={async (formData) => {
          "use server";
          const res = await saveSizingProfile(formData);
          const { redirect: nextRedirect } = await import("next/navigation");
          if (!res.ok) {
            nextRedirect(`/account/sizing?error=${encodeURIComponent(res.error ?? "Error")}`);
          }
          nextRedirect("/account/sizing?saved=1");
        }}
        className="grid gap-8 md:grid-cols-[200px_1fr]"
      >
        {row?.id ? <input type="hidden" name="id" value={row.id} /> : null}

        <div className="hidden md:block">
          <BodySilhouette />
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label">{t.labelLabel}</Label>
              <Input
                id="label"
                name="label"
                type="text"
                defaultValue={row?.label ?? "Ukuranku"}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_label">{t.sizeLabel}</Label>
              <select
                id="size_label"
                name="size_label"
                defaultValue={row?.size_label ?? ""}
                className="flex h-11 w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <option value="">—</option>
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MeasurementField
              id="bust_cm"
              label={t.bustLabel}
              unit={t.cmShort}
              defaultValue={row?.bust_cm}
            />
            <MeasurementField
              id="waist_cm"
              label={t.waistLabel}
              unit={t.cmShort}
              defaultValue={row?.waist_cm}
            />
            <MeasurementField
              id="hip_cm"
              label={t.hipLabel}
              unit={t.cmShort}
              defaultValue={row?.hip_cm}
            />
            <MeasurementField
              id="shoulder_cm"
              label={t.shoulderLabel}
              unit={t.cmShort}
              defaultValue={row?.shoulder_cm}
            />
            <MeasurementField
              id="dress_length_cm"
              label={t.lengthLabel}
              unit={t.cmShort}
              defaultValue={row?.dress_length_cm}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MeasurementField
              id="height_cm"
              label={t.heightLabel}
              unit={t.cmShort}
              defaultValue={row?.height_cm}
            />
            <MeasurementField
              id="weight_kg"
              label={t.weightLabel}
              unit={t.kgShort}
              defaultValue={row?.weight_kg}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notesLabel}</Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={row?.notes ?? ""}
              className="flex w-full rounded-md border border-charcoal/20 bg-cream px-3 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-charcoal/80">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={row?.is_default ?? false}
              className="h-4 w-4 rounded border-charcoal/30 text-rose-gold focus:ring-rose-gold"
            />
            {t.defaultToggle}
          </label>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" size="lg">
              {t.save}
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="/account/sizing">{t.cancel}</a>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function MeasurementField({
  id,
  label,
  unit,
  defaultValue,
}: {
  id: string;
  label: string;
  unit: string;
  defaultValue: number | null | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          defaultValue={defaultValue ?? ""}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal/40">
          {unit}
        </span>
      </div>
    </div>
  );
}
