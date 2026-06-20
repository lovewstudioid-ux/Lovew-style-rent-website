"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addWardrobeItem, deleteWardrobeItem } from "@/app/actions/wardrobe";
import { WARDROBE_CATEGORIES, type WardrobeItem } from "@/lib/wardrobe";

export function WardrobeManager({ items, email }: { items: WardrobeItem[]; email: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // add-form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Tops");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const counts: Record<string, number> = { All: items.length };
  for (const c of WARDROBE_CATEGORIES) counts[c] = items.filter((i) => i.category === c).length;
  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);

  function resetForm() {
    setName(""); setCategory("Tops"); setLinkUrl(""); setImageUrl(""); setFile(null); setPreview(""); setErr("");
  }

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr(""); setFile(f); setPreview(URL.createObjectURL(f)); setImageUrl("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter a name.");
    if (!file && !imageUrl.trim()) return setErr("Add a photo or paste an image link.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("link_url", linkUrl.trim());
    fd.append("image_url", imageUrl.trim());
    if (file) fd.append("image", file);
    const res = await addWardrobeItem(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add the item.");
    resetForm(); setOpen(false); router.refresh();
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    await deleteWardrobeItem(fd);
    router.refresh();
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      {/* Header strip */}
      <section className="bg-wine text-chiffon">
        <div className="mx-auto flex max-w-editorial flex-col items-center gap-4 px-6 py-14 text-center md:py-20">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">Wardrobe</p>
          <h1 className="font-display text-4xl font-normal text-chiffon md:text-6xl">My closet</h1>
          <p className="text-[0.78rem] text-chiffon/60">{email}</p>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        {/* Filter + add */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["All", ...WARDROBE_CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`border px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.1em] transition-colors ${
                  filter === c ? "border-wine bg-wine text-chiffon" : "border-ink/15 text-ink/60 hover:border-wine"
                }`}
              >
                {c} {counts[c] ? <span className="opacity-60">{counts[c]}</span> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setOpen((v) => !v); setErr(""); }}
            className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine"
          >
            {open ? "Close" : "+ Add item"}
          </button>
        </div>

        {/* Add form */}
        {open && (
          <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cream linen blazer" />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Category</label>
                <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {WARDROBE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Source link <span className="text-ink/35">(optional)</span></label>
                <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://… where to buy" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Photo</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-14 w-14 flex-shrink-0 rounded-sm object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-xl text-ink/30">＋</span>
                  )}
                  <span className="text-sm text-ink/60">{file ? <span className="text-ink">{file.name}</span> : "Upload a photo (JPG/PNG, max 8 MB)"}</span>
                </button>
              </div>
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink/35">
                <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Image link</label>
                <input className={inputCls} value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setFile(null); setPreview(""); }} placeholder="https://…/photo.jpg" />
              </div>
              {err && <p className="text-xs text-wine">{err}</p>}
              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
                {busy ? "Adding…" : "Add to wardrobe →"}
              </button>
            </div>
          </form>
        )}

        {/* Gallery */}
        {shown.length === 0 ? (
          <div className="mt-16 border-t border-ink/10 pt-16 text-center">
            <p className="font-display text-2xl text-ink/40">{items.length === 0 ? "Your wardrobe is empty." : "Nothing in this category yet."}</p>
            <p className="mt-2 text-sm font-light text-ink/45">{items.length === 0 ? "Tap “Add item” to start building your closet." : "Try another category or add something new."}</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((it) => (
              <div key={it.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee9]">
                  {it.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    aria-label="Delete"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white/85 text-ink/60 opacity-0 transition-opacity hover:text-wine group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <span className="absolute left-2 top-2 bg-ink/70 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">{it.category}</span>
                </div>
                <p className="mt-2.5 font-display text-base leading-tight text-ink">{it.name}</p>
                {it.link_url && (
                  <a href={it.link_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-block text-[0.68rem] uppercase tracking-[0.14em] text-wine hover:underline">
                    Source →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
