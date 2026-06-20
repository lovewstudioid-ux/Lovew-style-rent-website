"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct, setProductStatus, removeProduct } from "@/app/actions/digitals";
import { DIGITAL_CATEGORIES, type DigitalProduct } from "@/lib/digitals";

export function DigitalsManage({ products }: { products: DigitalProduct[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(products.length === 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Invitations");
  const [price, setPrice] = useState("");
  const [buyUrl, setBuyUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Cover must be an image.");
    if (f.size > 8 * 1024 * 1024) return setErr("Cover too large (max 8 MB).");
    setErr(""); setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setErr("Please enter a title.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("category", category);
    fd.append("price", price.trim());
    fd.append("buy_url", buyUrl.trim());
    fd.append("description", desc.trim());
    if (file) fd.append("cover", file);
    const res = await addProduct(fd);
    setBusy(false);
    if (!res.ok) return setErr(res.error ?? "Could not add.");
    setTitle(""); setPrice(""); setBuyUrl(""); setDesc(""); setFile(null); setPreview(""); setOpen(false);
    router.refresh();
  }

  async function setStatus(id: string, status: string) {
    const fd = new FormData(); fd.append("id", id); fd.append("status", status);
    await setProductStatus(fd); router.refresh();
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const fd = new FormData(); fd.append("id", id);
    await removeProduct(fd); router.refresh();
  }

  const inputCls = "w-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";
  const lab = "mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-ink/55";

  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-12 text-center md:py-16">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Digitals · manage</p>
          <h1 className="mt-4 font-display text-4xl font-normal text-chiffon md:text-5xl">Your templates</h1>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-12 md:py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{products.length} product{products.length === 1 ? "" : "s"}</h2>
          <button type="button" onClick={() => { setOpen((v) => !v); setErr(""); }} className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine">{open ? "Close" : "+ Add template"}</button>
        </div>

        {open && (
          <form onSubmit={submit} className="mt-8 grid gap-4 border border-ink/12 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
            <div className="space-y-4">
              <div><label className={lab}>Title</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bloom — floral invitation" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lab}>Category</label><select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>{DIGITAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={lab}>Price</label><input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rp 250K" /></div>
              </div>
              <div><label className={lab}>Checkout link <span className="text-ink/35">(from your seller platform)</span></label><input className={inputCls} value={buyUrl} onChange={(e) => setBuyUrl(e.target.value)} placeholder="https://…mayar/lynk/karyakarsa link" /></div>
              <div><label className={lab}>Description <span className="text-ink/35">(optional)</span></label><textarea className={inputCls} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's included…" /></div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={lab}>Cover image</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-4 border border-dashed border-ink/25 bg-[#faf8f5] px-4 py-4 text-left transition-colors hover:border-wine">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-16 w-16 flex-shrink-0 rounded-sm object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm bg-ink/5 text-xl text-ink/30">＋</span>
                  )}
                  <span className="text-sm text-ink/60">{file ? <span className="text-ink">{file.name}</span> : "Upload a cover (max 8 MB)"}</span>
                </button>
              </div>
              {err && <p className="text-xs text-wine">{err}</p>}
              <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine disabled:opacity-60">{busy ? "Adding…" : "Add template →"}</button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <p className="mt-16 text-center font-display text-2xl text-ink/40">No templates yet.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p.id} className="border border-ink/12 bg-white p-4">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ef]">
                  {p.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  {p.status !== "published" && <span className="absolute left-2 top-2 bg-ink/70 px-2 py-0.5 text-[0.56rem] uppercase tracking-[0.12em] text-white">Hidden</span>}
                </div>
                <p className="mt-2.5 font-display text-base text-ink">{p.title}</p>
                <p className="text-[0.72rem] text-ink/50">{p.category}{p.price ? ` · ${p.price}` : ""}</p>
                {!p.buy_url && <p className="mt-1 text-[0.66rem] text-wine">⚠ no checkout link</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.status === "published" ? (
                    <button type="button" onClick={() => setStatus(p.id, "hidden")} className="border border-ink/20 px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.12em] text-ink transition-colors hover:border-wine">Hide</button>
                  ) : (
                    <button type="button" onClick={() => setStatus(p.id, "published")} className="bg-ink px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.12em] text-white transition-colors hover:bg-wine">Publish</button>
                  )}
                  <button type="button" onClick={() => remove(p.id)} className="border border-ink/20 px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.12em] text-ink/60 transition-colors hover:border-wine hover:text-wine">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
