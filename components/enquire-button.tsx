"use client";

import { useState } from "react";
import { createInquiry } from "@/app/actions/inquiries";
import { PhoneInput } from "@/components/phone-input";

export function EnquireButton({
  source,
  listingId,
  listingName,
  whatsapp,
  instagram,
  defaultName = "",
  defaultPhone = "",
}: {
  source: "space" | "fashion";
  listingId: string;
  listingName: string;
  whatsapp: string | null;
  instagram: string | null;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState(defaultName);
  const [contact, setContact] = useState(defaultPhone);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<{ ref: string; wa: string | null } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setErr("Please enter your name.");
    if (!contact.trim()) return setErr("Please enter your WhatsApp number.");
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("source", source);
    fd.append("listing_id", listingId);
    fd.append("listing_name", listingName);
    fd.append("vendor_contact", whatsapp || instagram || "");
    fd.append("customer_name", name.trim());
    fd.append("customer_contact", contact.trim());
    fd.append("note", note.trim());
    const res = await createInquiry(fd);
    setBusy(false);
    if (!res.ok || !res.ref) return setErr(res.error ?? "Something went wrong.");

    const wa = whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi! I'd like to enquire about "${listingName}" via LOVEW. (Ref ${res.ref})`)}`
      : null;
    setDone({ ref: res.ref, wa });
    if (wa) window.open(wa, "_blank", "noopener");
  }

  const inputCls = "w-full border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-wine";

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(null); setErr(""); }}
        className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 text-[0.72rem] uppercase tracking-[0.18em] text-ink transition-colors hover:border-wine hover:text-wine"
      >
        Enquire →
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <p className="font-display text-xl text-ink">Enquire</p>
              <button type="button" onClick={() => setOpen(false)} className="text-xs uppercase tracking-[0.2em] text-ink/45 hover:text-wine">Close ✕</button>
            </div>
            <p className="mt-1 text-sm font-light text-ink/55">{listingName}</p>

            {done ? (
              <div className="mt-5 text-center">
                <p className="font-display text-lg text-ink">You&apos;re connected ✓</p>
                <p className="mt-1 text-sm font-light text-ink/60">
                  {done.wa ? "We opened WhatsApp for you." : "Reach the provider on Instagram below."} Your reference is <b>{done.ref}</b> — mention it to the provider.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {done.wa && <a href={done.wa} target="_blank" rel="noopener noreferrer" className="bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-wine">Open WhatsApp →</a>}
                  {instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="border border-ink/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink hover:border-wine">Instagram → @{instagram}</a>}
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                <PhoneInput value={contact} onChange={setContact} />
                <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Date / details (optional)" />
                {err && <p className="text-xs text-wine">{err}</p>}
                <button type="submit" disabled={busy} className="w-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-wine disabled:opacity-60">
                  {busy ? "Connecting…" : "Connect with provider →"}
                </button>
                <p className="text-center text-[0.66rem] font-light text-ink/40">We&apos;ll connect you on WhatsApp and note your enquiry.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
