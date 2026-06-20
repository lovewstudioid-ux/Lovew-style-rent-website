"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addRegistryItem, deleteRegistryItem } from "@/app/actions/registry";
import { REGISTRY_CATEGORIES, type Registry, type RegistryItem } from "@/lib/registry";

export function RegistryItemManager({
  registry,
  items,
  shareUrl,
}: {
  registry: Registry;
  items: RegistryItem[];
  shareUrl: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(items.length === 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [price, setPrice] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr(""); setFile(f); setPreview(URL.createObjectURL(f)); setImageUrl("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter an item name.");
    if (!file && !imageUrl.trim()) return setErr("Add a photo or paste an image link.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("registry_id", registry.id);
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("price", price.trim());
    fd.append("link_url", linkUrl.trim());
    fd.append("image_url", imageUrl.trim());
    if (file) fd.append("image", file);
    const res = await addRegistryItem(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add the item.");
    setName(""); setCategory("Other"); setPrice(""); setLinkUrl(""); setImageUrl(""); setFile(null); setPreview("");
    setOpen(false); router.refresh();
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    await deleteRegistryItem(fd);
    router.refresh();
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const inputCls =
    "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <Link href="/registry" className="text-[0.66rem] uppercase tracking-[0.2em] text-chiffon/55 hover:text-chiffon">← All registries</Link>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">{registry.title}</h1>
          {registry.event_date && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-chiffon/55">
              {new Date(registry.event_date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        {/* Share bar */}
        <div className="flex flex-wrap items-center gap-3 border border-ink/12 bg-[#faf8f5] px-5 py-4">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink/45">Share link</span>
          <code className="flex-1 truncate text-sm text-ink/70">{shareUrl}</code>
          <button type="button" onClick={copyShare} className="bg-ink px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-wine">
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="border border-ink/20 px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-wine hover:text-wine">
            Preview
          </a>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{items.length} item{items.length === 1 ? "" : "s"}</h2>
          <button type="button" onClick={() => { setOpen((v) => !v); setErr(""); }} className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine">
            {open ? "Close" : "+ Add item"}
          </button>
        </div>

        {open && (
          <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Item name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ceramic dinner set" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Category</label>
                  <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {REGISTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Price <span className="text-ink/35">(opt)</span></label>
                  <input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rp 250.000" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55">Where to buy <span className="text-ink/35">(optional)</span></label>
                <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
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
                  <span className="text-sm text-ink/60">{file ? <span className="text-ink">{file.name}</span> : "Upload a photo (max 8 MB)"}</span>
                </button>
              </div>
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink/35">
                <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
              </div>
              <input className={inputCls} value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setFile(null); setPreview(""); }} placeholder="Paste an image link" />
              {err && <p className="text-xs text-wine">{err}</p>}
              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">
                {busy ? "Adding…" : "Add to registry →"}
              </button>
            </div>
          </form>
        )}

        {items.length === 0 ? (
          <div className="mt-16 border-t border-ink/10 pt-16 text-center">
            <p className="font-display text-2xl text-ink/40">No items yet.</p>
            <p className="mt-2 text-sm font-light text-ink/45">Add a few wishes, then share your link.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <div key={it.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee9]">
                  {it.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  <button type="button" onClick={() => remove(it.id)} aria-label="Delete" className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-white/85 text-ink/60 opacity-0 transition-opacity hover:text-wine group-hover:opacity-100">✕</button>
                  {it.reserved_at && <span className="absolute left-2 top-2 bg-eucalyptus px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">Reserved</span>}
                </div>
                <p className="mt-2.5 font-display text-base leading-tight text-ink">{it.name}</p>
                {it.price && <p className="text-[0.72rem] text-ink/50">{it.price}</p>}
                {it.reserved_by_name && <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-eucalyptus">by {it.reserved_by_name}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
