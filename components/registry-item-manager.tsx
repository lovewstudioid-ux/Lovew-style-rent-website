"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import {
  addRegistryItem,
  createCategory,
  deleteCategory,
  deleteRegistryItem,
  togglePriority,
  updateCategory,
  updateRegistry,
  updateRegistryItem,
} from "@/app/actions/registry";
import {
  CURRENCIES,
  formatPrice,
  type AddressRequest,
  type Registry,
  type RegistryCategory,
  type RegistryItem,
} from "@/lib/registry";

/* ─── shared styles ─────────────────────────────────────────────────────── */
const inputCls =
  "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
const labCls = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";
const btnPrimary =
  "inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60";

/* ─── Placeholder + photo (with graceful fallback) ──────────────────────── */
export function ItemPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f6f3ee]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9 text-ink/25">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
    </div>
  );
}

export function ItemPhoto({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <ItemPlaceholder />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain p-2.5"
      loading="lazy"
    />
  );
}

/* ─── Item meta line (price · qty · size · color) ───────────────────────── */
export function ItemMeta({ it }: { it: RegistryItem }) {
  const priceStr = formatPrice(it.price, it.currency);
  const bits = [
    it.qty > 1 ? `Qty ${it.qty}` : null,
    it.size ? `Size ${it.size}` : null,
    it.color || null,
  ].filter(Boolean);
  return (
    <>
      {priceStr && <p className="mt-0.5 text-[0.82rem] font-light text-ink/70">{priceStr}</p>}
      {bits.length > 0 && <p className="mt-0.5 text-[0.7rem] text-ink/45">{bits.join(" · ")}</p>}
    </>
  );
}

/* ─── OG fetch helper ────────────────────────────────────────────────────── */
async function fetchOg(url: string): Promise<{ title?: string; image?: string; price?: string }> {
  const res = await fetch(`/api/og-fetch?url=${encodeURIComponent(url)}`);
  if (!res.ok) return {};
  return res.json() as Promise<{ title?: string; image?: string; price?: string }>;
}

/* ─── Toggle switch ─────────────────────────────────────────────────────── */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${on ? "bg-wine" : "bg-ink/20"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

/* ─── Heart icon + "Most wanted" toggle ─────────────────────────────────── */
export function Heart({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.8 5.1a5 5 0 0 0-7.1 0L12 6.8l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-8.8a5 5 0 0 0 0-7.1z" />
    </svg>
  );
}

function PriorityToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 border px-4 py-3 text-[0.72rem] uppercase tracking-[0.12em] transition-colors ${on ? "border-wine bg-[#fdf6f7] text-wine" : "border-ink/15 text-ink/55 hover:border-wine"}`}
    >
      <Heart filled={on} className="h-4 w-4" />
      {on ? "Most wanted" : "Mark as most wanted"}
    </button>
  );
}

/* ─── Category picker (existing + create new inline) ────────────────────── */
function CategoryField({
  value,
  onChange,
  cats,
  onCreate,
}: {
  value: string;
  onChange: (id: string) => void;
  cats: RegistryCategory[];
  onCreate: (name: string, isPublic: boolean) => Promise<string | null>;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!newName.trim()) return;
    setBusy(true);
    const id = await onCreate(newName.trim(), isPublic);
    setBusy(false);
    if (id) { onChange(id); setCreating(false); setNewName(""); setIsPublic(true); }
  }

  return (
    <div>
      <label className={labCls}>Category <span className="text-ink/35">(optional)</span></label>
      {!creating ? (
        <select
          className={inputCls}
          value={value}
          onChange={(e) => { e.target.value === "__new" ? setCreating(true) : onChange(e.target.value); }}
        >
          <option value="">Uncategorized</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.is_public ? "" : " (private)"}</option>
          ))}
          <option value="__new">＋ New category…</option>
        </select>
      ) : (
        <div className="space-y-2 border border-wine/25 bg-[#fdf6f7] p-3">
          <input className={inputCls} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Kitchen, Baby, Experiences" autoFocus />
          <label className="flex cursor-pointer items-center gap-2 text-[0.72rem] text-ink/70">
            <Toggle on={isPublic} onClick={() => setIsPublic((v) => !v)} />
            {isPublic ? "Public — everyone with the link sees it" : "Private — only you can see it"}
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={create} className="bg-ink px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-white transition-colors hover:bg-wine disabled:opacity-60">
              {busy ? "…" : "Create"}
            </button>
            <button type="button" onClick={() => { setCreating(false); setNewName(""); }} className="border border-ink/20 px-4 py-2 text-[0.66rem] uppercase tracking-[0.14em] text-ink/60">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Qty / currency+price / size / color fields (shared) ───────────────── */
function DetailFields({
  qty, setQty, currency, setCurrency, price, setPrice, size, setSize, color, setColor,
}: {
  qty: string; setQty: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  size: string; setSize: (v: string) => void;
  color: string; setColor: (v: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labCls}>Quantity</label>
          <input type="number" min={1} className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1" />
        </div>
        <div>
          <label className={labCls}>Price <span className="text-ink/35">(optional)</span></label>
          <div className="flex gap-1.5">
            <select className={`${inputCls} w-24 px-2`} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol}</option>)}
            </select>
            <input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250.000" inputMode="decimal" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labCls}>Size</label>
          <input className={inputCls} value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. M, 38, 500ml" />
        </div>
        <div>
          <label className={labCls}>Color</label>
          <input className={inputCls} value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Black, Sage" />
        </div>
      </div>
    </>
  );
}

/* ─── Add-item form ──────────────────────────────────────────────────────── */
function AddItemForm({
  registryId, cats, onCreateCat, onSaved,
}: {
  registryId: string;
  cats: RegistryCategory[];
  onCreateCat: (name: string, isPublic: boolean) => Promise<string | null>;
  onSaved: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [qty, setQty] = useState("1");
  const [currency, setCurrency] = useState("IDR");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [isPriority, setIsPriority] = useState(false);
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
  }

  const lastFetched = useRef("");
  async function handleFetch() {
    const url = linkUrl.trim();
    if (!url) return;
    lastFetched.current = url;
    setFetching(true);
    setErr("");
    const og = await fetchOg(url);
    setFetching(false);
    if (!og.title && !og.image) return; // all fields optional — no error
    if (og.title && !name) setName(og.title);
    if (og.image && !file) { setImageUrl(og.image); setPreview(""); }
    if (og.price && !price) setPrice(og.price);
  }

  useEffect(() => {
    const url = linkUrl.trim();
    if (!/^https?:\/\/.+\..+/.test(url)) return;
    if (url === lastFetched.current) return;
    const t = setTimeout(() => { void handleFetch(); }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkUrl]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter an item name.");
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("registry_id", registryId);
    fd.append("name", name.trim());
    fd.append("category_id", categoryId);
    fd.append("qty", qty || "1");
    fd.append("currency", currency);
    fd.append("price", price.trim());
    fd.append("size", size.trim());
    fd.append("color", color.trim());
    fd.append("is_priority", String(isPriority));
    fd.append("link_url", linkUrl.trim());
    fd.append("note", note.trim());
    fd.append("image_url", imageUrl.trim());
    if (file) fd.append("image", file);
    const res = await addRegistryItem(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add the item.");
    setName(""); setCategoryId(""); setQty("1"); setPrice(""); setSize(""); setColor("");
    setIsPriority(false); setLinkUrl(""); setNote(""); setImageUrl(""); setFile(null); setPreview("");
    onSaved();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
      {/* Left column */}
      <div className="space-y-4">
        <div>
          <label className={labCls}>Gift link <span className="text-ink/35">(optional — shop, Instagram, TikTok…)</span></label>
          <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Paste any link — details fill in automatically" />
          {fetching && <p className="mt-1.5 text-[0.66rem] text-ink/45">Reading link…</p>}
        </div>
        <div>
          <label className={labCls}>Item name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ceramic dinner set" />
        </div>
        <CategoryField value={categoryId} onChange={setCategoryId} cats={cats} onCreate={onCreateCat} />
        <DetailFields
          qty={qty} setQty={setQty} currency={currency} setCurrency={setCurrency}
          price={price} setPrice={setPrice} size={size} setSize={setSize} color={color} setColor={setColor}
        />
        <PriorityToggle on={isPriority} onClick={() => setIsPriority((v) => !v)} />
        <div>
          <label className={labCls}>Notes</label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Any colour is fine, gift-wrap if possible" />
        </div>
      </div>

      {/* Right column — photo */}
      <div className="space-y-4">
        <div>
          <label className={labCls}>Product photo <span className="text-ink/35">(optional)</span></label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
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
              {file ? <span className="text-ink">{file.name}</span> : imageUrl ? <span className="text-ink">Image fetched from link</span> : "Upload a photo, or paste a link to auto-load"}
              <span className="mt-0.5 block text-[0.7rem] text-ink/40">JPG/PNG, max 8 MB</span>
            </span>
          </button>
          {imageUrl && !file && (
            <p className="mt-1.5 text-[0.66rem] text-ink/45">
              Image fetched from link.{" "}
              <button type="button" className="underline hover:text-wine" onClick={() => { setImageUrl(""); setPreview(""); }}>Clear</button>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.14em] text-ink/35">
          <span className="h-px flex-1 bg-ink/10" /> or paste image URL <span className="h-px flex-1 bg-ink/10" />
        </div>
        <input className={inputCls} value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setFile(null); setPreview(""); }} placeholder="https://…/image.jpg" />

        {err && <p className="text-xs text-wine">{err}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Adding…" : "Add to registry →"}</button>
      </div>
    </form>
  );
}

/* ─── Inline item editor ─────────────────────────────────────────────────── */
function EditItemForm({
  item, cats, onCreateCat, onClose,
}: {
  item: RegistryItem;
  cats: RegistryCategory[];
  onCreateCat: (name: string, isPublic: boolean) => Promise<string | null>;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState(item.name);
  const [categoryId, setCategoryId] = useState(item.category_id ?? "");
  const [qty, setQty] = useState(String(item.qty ?? 1));
  const [currency, setCurrency] = useState(item.currency ?? "IDR");
  const [price, setPrice] = useState(item.price ?? "");
  const [size, setSize] = useState(item.size ?? "");
  const [color, setColor] = useState(item.color ?? "");
  const [isPriority, setIsPriority] = useState(item.is_priority);
  const [linkUrl, setLinkUrl] = useState(item.link_url ?? "");
  const [note, setNote] = useState(item.note ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Item name is required.");
    setBusy(true);
    const fd = new FormData();
    fd.append("id", item.id);
    fd.append("name", name.trim());
    fd.append("category_id", categoryId);
    fd.append("qty", qty || "1");
    fd.append("currency", currency);
    fd.append("price", price.trim());
    fd.append("size", size.trim());
    fd.append("color", color.trim());
    fd.append("is_priority", String(isPriority));
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
        <div className="sm:col-span-2">
          <CategoryField value={categoryId} onChange={setCategoryId} cats={cats} onCreate={onCreateCat} />
        </div>
        <div className="sm:col-span-2">
          <DetailFields
            qty={qty} setQty={setQty} currency={currency} setCurrency={setCurrency}
            price={price} setPrice={setPrice} size={size} setSize={setSize} color={color} setColor={setColor}
          />
        </div>
        <div className="sm:col-span-2">
          <PriorityToggle on={isPriority} onClick={() => setIsPriority((v) => !v)} />
        </div>
        <div>
          <label className={labCls}>Gift link</label>
          <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label className={labCls}>Notes</label>
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any preference…" />
        </div>
        {err && <p className="sm:col-span-2 text-xs text-wine">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine disabled:opacity-60">
            {busy ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onClose} className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ink/60 hover:border-wine">Cancel</button>
        </div>
      </form>
    </div>
  );
}

/* ─── Registry settings (details, address, categories, requests) ────────── */
function SettingsPanel({
  registry, cats, addressRequests, onCatsChange, onClose,
}: {
  registry: Registry;
  cats: RegistryCategory[];
  addressRequests: AddressRequest[];
  onCatsChange: (next: RegistryCategory[]) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState(registry.title);
  const [eventDate, setEventDate] = useState(registry.event_date ?? "");
  const [note, setNote] = useState(registry.note ?? "");
  const [address, setAddress] = useState(registry.shipping_address ?? "");
  const [showAddress, setShowAddress] = useState(registry.show_address);

  // category management
  const [newCat, setNewCat] = useState("");
  const [newCatPublic, setNewCatPublic] = useState(true);
  const [catBusy, setCatBusy] = useState(false);

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

  async function addCat() {
    if (!newCat.trim()) return;
    setCatBusy(true);
    const fd = new FormData();
    fd.append("registry_id", registry.id);
    fd.append("name", newCat.trim());
    fd.append("is_public", String(newCatPublic));
    const res = await createCategory(fd);
    setCatBusy(false);
    if (res.ok && res.id) {
      onCatsChange([...cats, { id: res.id, registry_id: registry.id, name: newCat.trim(), is_public: newCatPublic, created_at: new Date().toISOString() }]);
      setNewCat(""); setNewCatPublic(true);
    }
  }

  async function toggleCat(c: RegistryCategory) {
    const next = !c.is_public;
    onCatsChange(cats.map((x) => (x.id === c.id ? { ...x, is_public: next } : x)));
    const fd = new FormData();
    fd.append("id", c.id);
    fd.append("name", c.name);
    fd.append("is_public", String(next));
    await updateCategory(fd);
    router.refresh();
  }

  async function removeCat(c: RegistryCategory) {
    onCatsChange(cats.filter((x) => x.id !== c.id));
    const fd = new FormData();
    fd.append("id", c.id);
    await deleteCategory(fd);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-8 border border-ink/15 bg-white p-6 shadow-sm md:p-8">
      {/* Details + address */}
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <p className="md:col-span-2 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink/45">Registry details</p>
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
          <textarea className={inputCls} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. … No. …, Jakarta Selatan 12345" />
        </div>
        <div className="md:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <Toggle on={showAddress} onClick={() => setShowAddress((v) => !v)} />
            <span className="text-[0.78rem] text-ink/70">
              {showAddress ? "Address visible to gift-givers" : "Address hidden — givers can request it"}
            </span>
          </label>
          {!showAddress && address && (
            <p className="mt-1.5 text-[0.66rem] text-ink/45">Hidden — guests see a &quot;Request address&quot; button, and their requests show below.</p>
          )}
        </div>
        {err && <p className="md:col-span-2 text-xs text-wine">{err}</p>}
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={busy} className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine disabled:opacity-60">
            {busy ? "Saving…" : "Save details"}
          </button>
          <button type="button" onClick={onClose} className="border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-ink/60 hover:border-wine">Close</button>
        </div>
      </form>

      {/* Categories */}
      <div className="border-t border-ink/10 pt-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink/45">Categories</p>
        <p className="mt-1 text-[0.72rem] text-ink/50">Organize your gifts. Private categories &amp; their items are hidden from guests.</p>
        <div className="mt-4 space-y-2">
          {cats.length === 0 && <p className="text-[0.78rem] text-ink/40">No categories yet.</p>}
          {cats.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border border-ink/10 px-3 py-2">
              <span className="flex-1 text-sm text-ink">{c.name}</span>
              <span className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.12em] text-ink/50">
                <Toggle on={c.is_public} onClick={() => toggleCat(c)} />
                {c.is_public ? "Public" : "Private"}
              </span>
              <button type="button" onClick={() => removeCat(c)} aria-label="Delete category" className="text-ink/40 hover:text-wine">✕</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input className={`${inputCls} max-w-[220px]`} value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" />
          <label className="flex cursor-pointer items-center gap-2 text-[0.7rem] text-ink/60">
            <Toggle on={newCatPublic} onClick={() => setNewCatPublic((v) => !v)} />
            {newCatPublic ? "Public" : "Private"}
          </label>
          <button type="button" disabled={catBusy || !newCat.trim()} onClick={addCat} className="border border-ink/20 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.14em] text-ink transition-colors hover:border-wine hover:text-wine disabled:opacity-40">
            {catBusy ? "…" : "Add category"}
          </button>
        </div>
      </div>

      {/* Address requests */}
      {addressRequests.length > 0 && (
        <div className="border-t border-ink/10 pt-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-ink/45">Address requests ({addressRequests.length})</p>
          <p className="mt-1 text-[0.72rem] text-ink/50">Guests who asked for your shipping address. Send it below, or update your address above first if you need to.</p>
          <div className="mt-4 space-y-2">
            {addressRequests.map((r) => {
              const mailto = r.guest_email
                ? `mailto:${r.guest_email}?subject=${encodeURIComponent(`Shipping address — ${registry.title}`)}&body=${encodeURIComponent(`Hi ${r.guest_name},\n\nHere's the shipping address:\n\n${address || "(add your address in Settings)"}\n\nThank you!`)}`
                : null;
              return (
                <div key={r.id} className="border border-ink/10 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-ink">{r.guest_name}</span>
                    <div className="flex items-center gap-3">
                      {r.guest_email && <span className="text-[0.72rem] text-ink/50">{r.guest_email}</span>}
                      {mailto ? (
                        <a href={mailto} className="border border-wine/40 px-3 py-1 text-[0.64rem] uppercase tracking-[0.12em] text-wine transition-colors hover:bg-wine hover:text-chiffon">Send address →</a>
                      ) : (
                        <span className="text-[0.64rem] text-ink/40">No email given</span>
                      )}
                    </div>
                  </div>
                  {r.message && <p className="mt-0.5 text-[0.75rem] font-light italic text-ink/55">{r.message}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function RegistryItemManager({
  registry, items, categories, addressRequests, shareUrl,
}: {
  registry: Registry;
  items: RegistryItem[];
  categories: RegistryCategory[];
  addressRequests: AddressRequest[];
  shareUrl: string;
}) {
  const router = useRouter();
  const [cats, setCats] = useState<RegistryCategory[]>(categories);
  const [addOpen, setAddOpen] = useState(items.length === 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<string>("all"); // "all" | "none" | categoryId

  async function onCreateCat(name: string, isPublic: boolean): Promise<string | null> {
    const fd = new FormData();
    fd.append("registry_id", registry.id);
    fd.append("name", name);
    fd.append("is_public", String(isPublic));
    const res = await createCategory(fd);
    if (res.ok && res.id) {
      setCats((c) => [...c, { id: res.id!, registry_id: registry.id, name, is_public: isPublic, created_at: new Date().toISOString() }]);
      return res.id;
    }
    return null;
  }

  async function copyShare() {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }
  async function remove(id: string) {
    setConfirmId(null);
    const fd = new FormData();
    fd.append("id", id);
    await deleteRegistryItem(fd);
    router.refresh();
  }
  async function togglePriorityItem(id: string, next: boolean) {
    const fd = new FormData();
    fd.append("id", id);
    fd.append("is_priority", String(next));
    const res = await togglePriority(fd);
    if (!res.ok) { alert(res.error ?? "Couldn't update. Please try again."); return; }
    router.refresh();
  }

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "";
  const hasUncategorized = items.some((it) => !it.category_id);
  const hasPriority = items.some((it) => it.is_priority);
  const shown = items
    .filter((it) =>
      filter === "all" ? true
        : filter === "priority" ? it.is_priority
        : filter === "none" ? !it.category_id
        : it.category_id === filter,
    )
    // "Most wanted" gifts float to the top (stable within each group).
    .sort((a, b) => Number(b.is_priority) - Number(a.is_priority));

  return (
    <>
      {/* Header */}
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
          <code className="min-w-0 flex-1 truncate text-sm text-ink/70">{shareUrl}</code>
          <button type="button" onClick={copyShare} className="bg-ink px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-white transition-colors hover:bg-wine">{copied ? "Copied ✓" : "Copy"}</button>
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="border border-ink/20 px-5 py-2 text-[0.7rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-wine hover:text-wine">Preview</a>
        </div>

        {/* Address-request notification */}
        {addressRequests.length > 0 && (
          <button
            type="button"
            onClick={() => { setSettingsOpen(true); setAddOpen(false); }}
            className="mt-4 flex w-full items-center gap-3 border border-wine/30 bg-[#fdf6f7] px-5 py-3 text-left transition-colors hover:border-wine"
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-wine text-[0.7rem] font-medium text-chiffon">{addressRequests.length}</span>
            <span className="text-[0.82rem] text-ink/75">
              {addressRequests.length === 1 ? "1 guest requested" : `${addressRequests.length} guests requested`} your shipping address — tap to respond.
            </span>
          </button>
        )}

        {/* Toolbar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-ink">{items.length} item{items.length === 1 ? "" : "s"}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setSettingsOpen((v) => !v); setAddOpen(false); }} className="relative border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-ink/65 transition-colors hover:border-wine hover:text-wine">
              Settings
              {addressRequests.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1 text-[0.6rem] font-medium text-chiffon">{addressRequests.length}</span>
              )}
            </button>
            <button type="button" onClick={() => { setAddOpen((v) => !v); setSettingsOpen(false); }} className="bg-ink px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine">{addOpen ? "Close" : "+ Add item"}</button>
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <SettingsPanel registry={registry} cats={cats} addressRequests={addressRequests} onCatsChange={setCats} onClose={() => setSettingsOpen(false)} />
        )}

        {/* Add item form */}
        {addOpen && (
          <AddItemForm registryId={registry.id} cats={cats} onCreateCat={onCreateCat} onSaved={() => setAddOpen(false)} />
        )}

        {/* Filter bar */}
        {(cats.length > 0 || hasUncategorized || hasPriority) && items.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {[{ id: "all", label: "All" }, ...(hasPriority ? [{ id: "priority", label: "♥ Most wanted" }] : []), ...cats.map((c) => ({ id: c.id, label: c.is_public ? c.name : `${c.name} · private` })), ...(hasUncategorized ? [{ id: "none", label: "Uncategorized" }] : [])].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={`border px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${filter === c.id ? "border-wine bg-wine text-chiffon" : "border-ink/20 text-ink/60 hover:border-wine"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Priority legend */}
        {items.length > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-[0.72rem] text-ink/50">
            <Heart filled className="h-3 w-3 text-wine" />
            <span><span className="text-wine">Most wanted</span> — your top picks. Tap the heart on any gift (or in Edit) to mark it; these show first for guests.</span>
          </p>
        )}

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="mt-16 border-t border-ink/10 pt-16 text-center">
            <p className="font-display text-2xl text-ink/40">No items yet.</p>
            <p className="mt-2 text-sm font-light text-ink/45">Add a few wishes, then share your link.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((it) => (
              <React.Fragment key={it.id}>
                <div className="group">
                  <div className="relative aspect-square overflow-hidden border border-ink/8 bg-white">
                    <ItemPhoto src={it.image_url} alt={it.name} />
                    <div className={`absolute inset-x-2 top-2 flex gap-1.5 transition-opacity ${confirmId === it.id ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"}`}>
                      {confirmId === it.id ? (
                        <div className="ml-auto flex items-center gap-2 rounded-sm bg-white/95 px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] shadow-sm">
                          <span className="text-ink/60">Delete?</span>
                          <button type="button" onClick={() => remove(it.id)} className="font-medium text-wine hover:underline">Yes</button>
                          <button type="button" onClick={() => setConfirmId(null)} className="text-ink/45 hover:underline">No</button>
                        </div>
                      ) : (
                        <>
                          <button type="button" onClick={() => setEditingId(editingId === it.id ? null : it.id)} className="flex h-7 items-center gap-1 rounded-sm bg-white/90 px-2 text-[0.6rem] uppercase tracking-[0.1em] text-ink/70 hover:text-wine shadow-sm">Edit</button>
                          <button type="button" onClick={() => setConfirmId(it.id)} aria-label="Delete item" className="ml-auto flex h-7 w-7 items-center justify-center rounded-sm bg-white/90 text-ink/55 hover:text-wine shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                    {/* Always-visible "most wanted" heart toggle */}
                    <button
                      type="button"
                      onClick={() => togglePriorityItem(it.id, !it.is_priority)}
                      aria-label={it.is_priority ? "Remove from most wanted" : "Mark as most wanted"}
                      title={it.is_priority ? "Most wanted — tap to remove" : "Tap to mark most wanted"}
                      className={`absolute left-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full shadow transition-colors ${it.is_priority ? "bg-wine text-chiffon" : "bg-white/90 text-ink/45 hover:text-wine"}`}
                    >
                      <Heart filled={it.is_priority} className="h-4 w-4" />
                    </button>
                    {it.reserved_at && (
                      <span className="absolute right-2 bottom-2 bg-eucalyptus px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white">Reserved</span>
                    )}
                  </div>
                  {it.category_id && (
                    <p className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-wine">{catName(it.category_id)}</p>
                  )}
                  <p className="mt-1 font-display text-base leading-tight text-ink">{it.name}</p>
                  <ItemMeta it={it} />
                  {it.note && <p className="mt-0.5 text-[0.68rem] font-light italic text-ink/45">{it.note}</p>}
                  {it.link_url && (
                    <a href={it.link_url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-[0.66rem] uppercase tracking-[0.12em] text-ink/40 hover:text-wine">View link →</a>
                  )}
                  {it.reserved_by_name && (
                    <p className="mt-0.5 text-[0.66rem] uppercase tracking-[0.12em] text-eucalyptus">by {it.reserved_by_name}</p>
                  )}
                </div>
                {editingId === it.id && (
                  <div className="col-span-full">
                    <EditItemForm item={it} cats={cats} onCreateCat={onCreateCat} onClose={() => setEditingId(null)} />
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
