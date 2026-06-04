import { Search, Calendar, Sparkles, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = { title: "Cara Kerja" };

const STEPS = [
  {
    icon: Search,
    title: "1. Cari & pilih",
    body: "Filter berdasarkan kota, tanggal, warna, dan ukuran. Simpan ukuranmu sekali, kami filter dress yang muat otomatis.",
  },
  {
    icon: Calendar,
    title: "2. Booking & bayar deposit",
    body: "Pilih tanggal pakai dan booking online. Bayar sewa + deposit dalam satu transaksi. Deposit aman ditahan LOVEW sebagai jaminan.",
  },
  {
    icon: Sparkles,
    title: "3. Pakai & kembalikan",
    body: "Ambil di tempat partner atau dikirim ke rumah. Setelah pakai, kembalikan ke partner. Deposit otomatis kembali dalam 3 hari.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 bg-cream">
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <h1 className="font-display text-4xl font-semibold text-charcoal md:text-5xl">
            Cara kerja LOVEW Style
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-charcoal/70">
            Tiga langkah sederhana — dari mencari sampai mengembalikan dress dengan tenang.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="rounded-2xl border border-charcoal/10 bg-cream p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-gold/10 text-rose-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold text-charcoal">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Deposit section */}
          <section className="mt-20 rounded-2xl bg-soft-blush p-8 md:p-12">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal">
                  Kebijakan deposit — kenapa aman?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/80">
                  Deposit kamu <strong>tidak dipegang partner</strong>, melainkan
                  ditahan LOVEW sebagai pihak ketiga yang netral. Setelah dress
                  dikembalikan tanpa kerusakan, deposit otomatis kembali ke kamu
                  dalam 3 hari. Kalau ada klaim kerusakan, tim LOVEW yang
                  memutuskan berdasarkan bukti — bukan partner sendiri.
                </p>
              </div>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
