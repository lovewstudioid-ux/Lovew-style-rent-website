import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pengaturan · Partner" };

export default function PartnerSettingsPlaceholder() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-charcoal/20 bg-cream p-10 text-center">
      <Construction className="mx-auto h-10 w-10 text-rose-gold" />
      <h1 className="mt-4 font-display text-2xl text-charcoal">
        Pengaturan partner segera tersedia
      </h1>
      <p className="mt-3 text-sm text-charcoal/70">
        Untuk sementara, ubah info bisnis kamu (brand, alamat, payout, dll.)
        melalui tim LOVEW.
      </p>
      <Button asChild className="mt-6">
        <Link href="/partner/dashboard">← Kembali ke dashboard</Link>
      </Button>
    </div>
  );
}
