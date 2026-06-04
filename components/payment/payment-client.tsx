"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/format";

interface PaymentClientProps {
  t: {
    tabBank: string;
    tabQris: string;
    bankAccount: string;
    bankAmount: string;
    bankCode: string;
    bankNote: string;
    qrisNote: string;
    copy: string;
    copied: string;
  };
  amount: number;
  bookingCode: string;
  bank: { name: string; account: string; holder: string };
}

/**
 * Client component for the payment instructions area: tabs (Bank / QRIS),
 * copy-to-clipboard buttons, QR image placeholder. Decoupled from the server
 * page so we can keep most of the page server-rendered.
 */
export function PaymentClient({ t, amount, bookingCode, bank }: PaymentClientProps) {
  const [tab, setTab] = useState<"bank" | "qris">("bank");

  return (
    <div className="rounded-2xl border border-charcoal/10 bg-cream p-2">
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-soft-blush p-1">
        <TabBtn active={tab === "bank"} onClick={() => setTab("bank")}>{t.tabBank}</TabBtn>
        <TabBtn active={tab === "qris"} onClick={() => setTab("qris")}>{t.tabQris}</TabBtn>
      </div>

      {tab === "bank" ? (
        <div className="space-y-4 p-5 text-sm">
          <CopyRow label={t.bankAccount} value={`${bank.name} • ${bank.account} a/n ${bank.holder}`} copyValue={bank.account} />
          <CopyRow label={t.bankAmount} value={formatIDR(amount)} copyValue={String(amount)} />
          <CopyRow label={t.bankCode} value={bookingCode} copyValue={bookingCode} />
          <p className="rounded-md bg-soft-blush/60 p-3 text-xs text-charcoal/70">{t.bankNote}</p>
        </div>
      ) : (
        <div className="space-y-4 p-5 text-sm">
          <p className="text-charcoal/70">{t.qrisNote}</p>
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-md border border-dashed border-charcoal/20 bg-soft-blush/40 text-xs text-charcoal/50">
            {/* Drop your QRIS PNG at public/qris.png to replace this placeholder. */}
            QRIS image: <br /> /public/qris.png
          </div>
          <CopyRow label={t.bankAmount} value={formatIDR(amount)} copyValue={String(amount)} />
          <CopyRow label={t.bankCode} value={bookingCode} copyValue={bookingCode} />
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-cream text-rose-gold shadow-sm" : "text-charcoal/70 hover:text-charcoal",
      )}
    >
      {children}
    </button>
  );
}

function CopyRow({ label, value, copyValue }: { label: string; value: string; copyValue: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-widest text-charcoal/50">{label}</p>
        <p className="mt-1 break-words font-mono text-base text-charcoal">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(copyValue);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-charcoal/15 px-2 py-1 text-xs hover:bg-soft-blush"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-sage" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
