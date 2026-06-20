"use client";

import { useRouter } from "next/navigation";
import { setSpaceStatus, removeSpace } from "@/app/actions/spaces";
import type { SpaceListing } from "@/lib/spaces";

export function SpacesReview({ listings }: { listings: SpaceListing[] }) {
  const router = useRouter();
  const pending = listings.filter((l) => l.status === "pending");
  const published = listings.filter((l) => l.status === "published");

  async function setStatus(id: string, status: string) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("status", status);
    await setSpaceStatus(fd);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing permanently?")) return;
    const fd = new FormData();
    fd.append("id", id);
    await removeSpace(fd);
    router.refresh();
  }

  function Card({ s }: { s: SpaceListing }) {
    return (
      <div className="border border-ink/12 bg-white p-4">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f4f2ef]">
          {s.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.cover_url} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
          )}
          <span className="absolute left-2 top-2 bg-white/90 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.12em] text-ink">{s.space_type}</span>
        </div>
        <p className="mt-3 font-display text-lg text-ink">{s.name}</p>
        <p className="text-[0.72rem] uppercase tracking-[0.12em] text-ink/45">{[s.area, s.city].filter(Boolean).join(", ")} {s.price_from ? `· ${s.price_from}` : ""}</p>
        {s.description && <p className="mt-1 line-clamp-2 text-sm font-light text-ink/55">{s.description}</p>}
        <p className="mt-2 text-xs text-ink/50">
          {s.whatsapp ? `WA ${s.whatsapp}` : ""}{s.whatsapp && s.instagram ? " · " : ""}{s.instagram ? `@${s.instagram}` : ""} · {s.image_urls.length} photo{s.image_urls.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {s.status === "pending" ? (
            <button type="button" onClick={() => setStatus(s.id, "published")} className="bg-ink px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine">Publish</button>
          ) : (
            <button type="button" onClick={() => setStatus(s.id, "pending")} className="border border-ink/20 px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine">Unpublish</button>
          )}
          <button type="button" onClick={() => remove(s.id)} className="border border-ink/20 px-4 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink/60 transition-colors hover:border-wine hover:text-wine">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Spaces · review</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">Submitted spaces</h1>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        <h2 className="font-display text-2xl text-ink">Pending <span className="text-ink/40">{pending.length}</span></h2>
        {pending.length === 0 ? (
          <p className="mt-4 text-sm font-light text-ink/45">Nothing waiting for review.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{pending.map((s) => <Card key={s.id} s={s} />)}</div>
        )}

        <h2 className="mt-16 font-display text-2xl text-ink">Published <span className="text-ink/40">{published.length}</span></h2>
        {published.length === 0 ? (
          <p className="mt-4 text-sm font-light text-ink/45">No published listings yet.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{published.map((s) => <Card key={s.id} s={s} />)}</div>
        )}
      </section>
    </>
  );
}
