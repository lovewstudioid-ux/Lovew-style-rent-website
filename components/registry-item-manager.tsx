"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import {
  addRegistryItem,
  deleteRegistryItem,
  updateRegistry,
  updateRegistryItem,
} from "@/app/actions/registry";
import { REGISTRY_CATEGORIES, type Registry, type RegistryItem } from "@/lib/registry";

/* ─── shared styles ─────────────────────────────────────────────────────── */
const inputCls =
  "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";
const btnPrimary =
  "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

/* ─── OG fetch helper ────────────────────────────────────────────────────── */
async function fetchOg(url: string): Promise<{ title?: string; image?: string; price?: string; promoImage?: boolean }> {
  const res = await fetch(`/api/og-fetch?url=${encodeURIComponent(url)}`);
  if (!res.ok) return {};
  return res.json() as Promise<{ title?: string; image?: string; price?: string; promoImage?: boolean }>;
}

/* ─── Add-item form ──────────────────────────────────────────────────────── */
function AddItemForm({
  registryId,
  onSaved,
}: {
  registryId: string;
  onSaved: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [price, setPrice] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Please choose an image file.");
    if (f.size > 8 * 1024 * 1024) return setErr("Image is too large (max 8 MB).");
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setImageUrl("");
    setPhotoHint(false);
  }

  const lastFetched = useRef("");
  const [priceHint, setPriceHint] = useState(false);
  const [photoHint, setPhotoHint] = useState(false);

  async function handleFetch(auto = false) {
    const url = linkUrl.trim();
    if (!url) return;
    lastFetched.current = url;
    setFetching(true);
    setErr("");
    setPriceHint(false);
    setPhotoHint(false);
    const og = await fetchOg(url);
    setFetching(false);
    if (!og.title && !og.image) {
      // Stay quiet on auto attempts — only warn when the user clicks Fetch.
      if (!auto) setErr("Couldn't auto-read this link — fill in the details manually.");
      return;
    }
    if (og.title && !name) setName(og.title);
    if (og.image && !file) { setImageUrl(og.image); setPreview(""); }
    if (og.price && !price) setPrice(og.price);
    // Some shops (Shopee especially) hide the price from links — nudge to add it.
    if (!og.price && !price) setPriceHint(true);
    // Shopee shares only a promo card (price baked in) — ask for a clean photo.
    if (og.promoImage && !file) setPhotoHint(true);
  }

  // Auto-fetch shortly after a full URL is pasted/typed — no button click needed.
  useEffect(() => {
    const url = linkUrl.trim();
    if (!/^https?:\/\/.+\..+/.test(url)) return;
    if (url === lastFetched.current) return;
    const t = setTimeout(() => { void handleFetch(true); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkUrl]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter an item name.");
    if (!file && !imageUrl.trim()) return setErr("Add a photo or paste an image link, or use Fetch to auto-load from the product URL.");
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("registry_id", registryId);
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("price", price.trim());
    fd.append("link_url", linkUrl.trim());
    fd.append("note", note.trim());
    fd.append("image_url", imageUrl.trim());
    if (file) fd.append("image", file);
    const res = await addRegistryItem(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add the item.");
    setName(""); setCategory("Other"); setPrice(""); setLinkUrl(""); setNote("");
    setImageUrl(""); setFile(null); setPreview("");
    onSaved();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
      {/* Left column */}
      <div className="space-y-4">
        <div>
          <label className={labCls}>Shopping link <span className="text-ink/35">(paste — details fill in automatically)</span></label>
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://shopee.co.id/…"
            />
            <button
              type="button"
              disabled={!linkUrl.trim() || fetching}
              onClick={() => handleFetch(false)}
              className="flex-shrink-0 border border-ink/20 px-4 py-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
            >
              {fetching ? "…" : "Refresh"}
            </button>
          </div>
          {fetching && <p className="mt-1.5 text-[0.66rem] text-ink/45">Reading link…</p>}
        </div>
        <div>
          <label className={labCls}>Item name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ceramic dinner set" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labCls}>Category</label>
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {REGISTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labCls}>
              Price <span className="text-ink/35">(opt)</span>
            </label>
            <input
              className={`${inputCls} ${priceHint ? "border-wine" : ""}`}
              value={price}
              onChange={(e) => { setPrice(e.target.value); if (e.target.value) setPriceHint(false); }}
              placeholder="Rp 250.000"
            />
          </div>
        </div>
        {priceHint && !price && (
          <p className="-mt-1 text-[0.66rem] text-wine">
            This shop hides its price from links — please type it here 👆
          </p>
        )}
        <div>
          <label className={labCls}>Note for guests <span className="text-ink/35">(optional)</span></label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Any colour is fine, gift-wrap if possible" />
        </div>
      </div>

      {/* Right column — photo */}
      <div className="space-y-4">
        <div>
          <label className={labCls}>Product photo</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={`flex w-full items-center gap-4 border border-dashed bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine ${photoHint && !file ? "border-wine" : "border-ink/25"}`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-14 w-14 flex-shrink-0 rounded-sm object-cover" />
            ) : imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-14 w-14 flex-shrink-0 rounded-sm object-cover" onError={() => setImageUrl("")} />
            ) : (
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-xl text-ink/30">＋</span>
            )}
            <span className="text-sm text-ink/60">
              {file
                ? <span className="text-ink">{file.name}</span>
                : imageUrl
                  ? <span className="text-ink">Image fetched from link</span>
                  : "Upload a photo, or paste a link to auto-load"}
              <span className="mt-0.5 block text-[0.7rem] text-ink/40">JPG/PNG, max 8 MB</span>
            </span>
          </button>
          {photoHint && !file && (
            <p className="mt-1.5 text-[0.66rem] text-wine">
              Shopee only shares a promo image — upload a clean product photo for the best look 👆
            </p>
          )}
          {imageUrl && !file && (
            <p className="mt-1.5 text-[0.66rem] text-ink/45">
              Image fetched from product link.{" "}
              <button type="button" className="underline hover:text-wine" onClick={() => { setImageUrl(""); setPreview(""); }}>
                Clear
              </button>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink/35">
          <span className="h-px flex-1 bg-ink/10" /> or paste image URL <span className="h-px flex-1 bg-ink/10" />
        </div>
        <input
          className={inputCls}
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setFile(null); setPreview(""); }}
          placeholder="https://…/image.jpg"
        />

        {err && <p className="text-xs text-wine">{err}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? "Adding…" : "Add to registry →"}
        </button>
      </div>
    </form>
  );
}

/* ─── Inline item editor ─────────────────────────────────────────────────── */
function EditItemForm({
  item,
  onClose,
}: {
  item: RegistryItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(item.price ?? "");
  const [linkUrl, setLinkUrl] = useState(item.link_url ?? "");
  const [note, setNote] = useState(item.note ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Item name is required.");
    setBusy(true);
    const fd = new FormData();
    fd.append("id", item.id);
    fd.append("name", name.trim());
    fd.append("category", category);
    fd.append("price", price.trim());
    fd.append("link_url", linkUrl.trim());
    fd.append("note", note.trim());
    const res = await updateRegistryItem(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    router.refresh();
    onClose();
  }

  return (
    <div className="col-span-full mt-2 border border-wine/30 bg-[#faf8f5] p-4 shadow-sm">
      <p className="mb-3 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-wine">Edit item</p>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labCls}>Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labCls}>Category</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {REGISTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labCls}>Price</label>
          <input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rp 250.000" />
        </div>
        <div>
          <label className={labCls}>Shopping link</label>
          <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={labCls}>Note for guests</label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any preference…" />
        </div>
        {err && <p className="sm:col-span-2 text-xs text-wine">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine disabled:opacity-60">
            {busy ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onClose} className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ink/60 hover:border-wine">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Registry settings panel ────────────────────────────────────────────── */
function SettingsPanel({ registry, onClose }: { registry: Registry; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState(registry.title);
  const [eventDate, setEventDate] = useState(registry.event_date ?? "");
  const [note, setNote] = useState(registry.note ?? "");
  const [address, setAddress] = useState(registry.shipping_address ?? "");
  const [showAddress, setShowAddress] = useState(registry.show_address);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setErr("Title is required.");
    setBusy(true);
    const fd = new FormData();
    fd.append("id", registry.id);
    fd.append("title", title.trim());
    fd.append("event_date", eventDate);
    fd.append("note", note.trim());
    fd.append("shipping_address", address.trim());
    fd.append("show_address", String(showAddress));
    const res = await updateRegistry(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not save.");
    router.refresh();
    onClose();
  }

  return (
    <div className="mt-6 border border-ink/15 bg-white p-6 shadow-sm md:p-8">
      <p className="mb-5 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink/45">Registry settings</p>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labCls}>Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labCls}>Event date <span className="text-ink/35">(optional)</span></label>
          <input type="date" className={inputCls} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div>
          <label className={labCls}>Note to guests <span className="text-ink/35">(optional)</span></label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A little message for guests…" />
        </div>
        <div className="md:col-span-2">
          <label className={labCls}>Shipping address <span className="text-ink/35">(optional)</span></label>
          <textarea
            className={inputCls}
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Jl. … No. …, Jakarta Selatan 12345"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={showAddress}
              onClick={() => setShowAddress((v) => !v)}
              className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${showAddress ? "bg-wine" : "bg-ink/20"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${showAddress ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
            <span className="text-[0.78rem] text-ink/70">
              {showAddress ? "Address visible to gift-givers" : "Address hidden from gift-givers"}
            </span>
          </label>
          {!showAddress && address && (
            <p className="mt-1.5 text-[0.66rem] text-ink/45">Address saved but only you can see it — toggle to share.</p>
          )}
        </div>
        {err && <p className="md:col-span-2 text-xs text-wine">{err}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={busy} className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine disabled:opacity-60">
            {busy ? "Saving…" : "Save settings"}
          </button>
          <button type="button" onClick={onClose} className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ink/60 hover:border-wine">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
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
  const [addOpen, setAddOpen] = useState(items.length === 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  async function remove(id: string) {
    const fd = new FormData();
    fd.append("id", id);
    await deleteRegistryItem(fd);
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <Link href="/registry" className="text-[0.66rem] uppercase tracking-[0.2em] text-chiffon/55 hover:text-chiffon">
            ← All registries
          </Link>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">
            {registry.title}
          </h1>
          {registry.event_date && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-chiffon/55">
              {new Date(registry.event_date).toLocaleDateString(undefined, {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        {/* Share bar */}
        <div className="flex flex-wrap items-center gap-3 border border-ink/12 bg-[#faf8f5] px-5 py-4">
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink/45">Share link</span>
          <code className="min-w-0 flex-1 truncate text-sm text-ink/70">{shareUrl}</code>
          <button
            type="button"
            onClick={copyShare}
            className="bg-ink px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-wine"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink/20 px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-wine hover:text-wine"
          >
            Preview
          </a>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ink">
            {items.length} item{items.length === 1 ? "" : "s"}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSettingsOpen((v) => !v); setAddOpen(false); }}
              className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink/65 transition-colors hover:border-wine hover:text-wine"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => { setAddOpen((v) => !v); setSettingsOpen(false); }}
              className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine"
            >
              {addOpen ? "Close" : "+ Add item"}
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <SettingsPanel registry={registry} onClose={() => setSettingsOpen(false)} />
        )}

        {/* Add item form */}
        {addOpen && (
          <AddItemForm
            registryId={registry.id}
            onSaved={() => setAddOpen(false)}
          />
        )}

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="mt-16 border-t border-ink/10 pt-16 text-center">
            <p className="font-display text-2xl text-ink/40">No items yet.</p>
            <p className="mt-2 text-sm font-light text-ink/45">Add a few wishes, then share your link.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <React.Fragment key={it.id}>
                <div className="group">
                  <div className="relative aspect-square overflow-hidden border border-ink/8 bg-white">
                    {it.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image_url} alt={it.name} className="h-full w-full object-contain p-2.5" loading="lazy" />
                    )}
                    {/* Hover actions */}
                    <div className="absolute inset-x-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(editingId === it.id ? null : it.id)}
                        className="flex h-7 items-center gap-1 rounded-sm bg-white/90 px-2 text-[0.6rem] uppercase tracking-[0.1em] text-ink/70 hover:text-wine"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(it.id)}
                        aria-label="Delete"
                        className="ml-auto flex h-7 w-7 items-center justify-center bg-white/90 text-ink/60 hover:text-wine"
                      >
                        ✕
                      </button>
                    </div>
                    {it.reserved_at && (
                      <span className="absolute left-2 bottom-2 bg-eucalyptus px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">
                        Reserved
                      </span>
                    )}
                  </div>
                  <p className="mt-2.5 font-display text-base leading-tight text-ink">{it.name}</p>
                  {it.price && <p className="mt-0.5 text-[0.82rem] font-light text-ink/70">{it.price}</p>}
                  {it.note && (
                    <p className="mt-0.5 text-[0.68rem] font-light italic text-ink/45">{it.note}</p>
                  )}
                  {it.link_url && (
                    <a href={it.link_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-[0.66rem] uppercase tracking-[0.12em] text-ink/40 hover:text-wine">
                      View product →
                    </a>
                  )}
                  {it.reserved_by_name && (
                    <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-eucalyptus">
                      by {it.reserved_by_name}
                    </p>
                  )}
                </div>

                {/* Inline edit panel — spans full row */}
                {editingId === it.id && (
                  <div className="col-span-full">
                    <EditItemForm item={it} onClose={() => setEditingId(null)} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
