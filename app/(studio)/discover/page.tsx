import Link from "next/link";
import Image from "next/image";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";
import { StyleIdExperience } from "@/components/style-id-experience";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Comcard } from "@/app/actions/comcard";

export const metadata = { title: "Comcard — your body type & model card · LOVEW Studio" };
export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", t: "Enter your measurements", b: "Bust, waist, hips and sizes — it takes about a minute." },
  { n: "02", t: "See your body type", b: "Read instantly with the industry-standard FFIT method used by pro calculators." },
  { n: "03", t: "Download your comcard", b: "Save it as an image or PDF — or build a full model comp card with your photos." },
];

export default async function DiscoverPage() {
  let signedIn = false;
  let email = "";
  let name = "";
  let phone = "";
  let savedMeasurements: Record<string, string | null> | null = null;
  let comcards: Comcard[] = [];

  if (env.supabaseConfigured) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      signedIn = true;
      email = user.email ?? "";
      const { data: profile } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      name = (profile?.full_name as string) ?? "";
      phone = (profile?.phone as string) ?? "";

      const [{ data: measurements }, { data: cards }] = await Promise.all([
        supabase
          .from("style_profiles")
          .select("height_cm, weight_kg, bust, waist, hips, high_hip, top_size, pants_size, shoe_size, feet_length_cm")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("comcards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (measurements) savedMeasurements = measurements as Record<string, string | null>;
      if (cards) comcards = cards as Comcard[];
    }
  }
  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>Comcard · free</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.2rem]">
              Your body,
              <br />
              <span className="italic text-wine">on one card.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              Enter your measurements to read your body type instantly — or build
              a full model comp card with your photos. Download it as an image or
              PDF, ready to share with agencies, stylists, or every fitting.
            </p>
            <div className="mt-11">
              <Link href="#start" className="inline-flex items-center gap-3 bg-ink px-8 py-3.5 text-xs uppercase tracking-[0.24em] text-white transition-colors hover:bg-wine">
                Build your comcard →
              </Link>
            </div>
          </div>
          <div className="relative min-h-[60vh] md:min-h-[82vh]">
            <Image src={img(PHOTO.beauty2, 1200)} alt="Style analysis" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* The Style ID tool */}
      <section id="start" className="scroll-mt-24 border-b border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto max-w-editorial px-6 py-20 md:py-28">
          <StyleIdExperience signedIn={signedIn} email={email} name={name} phone={phone} savedMeasurements={savedMeasurements} comcards={comcards} />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-editorial px-6 py-24 md:py-32">
        <Label>How it works</Label>
        <h2 className="mt-4 max-w-xl font-display text-4xl font-normal text-ink md:text-5xl">A comcard in minutes.</h2>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-ink/15 pt-6">
              <p className="font-display text-2xl text-ink/30">{s.n}</p>
              <h3 className="mt-4 text-sm uppercase tracking-[0.14em] text-ink">{s.t}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/55">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample result card */}
      <section className="border-y border-ink/10 bg-[#faf8f5]">
        <div className="mx-auto grid max-w-editorial items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <Label>A peek at your result</Label>
            <h2 className="mt-4 font-display text-3xl font-normal text-ink md:text-4xl">Your comcard.</h2>
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-ink/60">
              Clean, shareable, and yours — download it as an image or PDF and
              bring it to any fitting, casting, or agency.
            </p>
          </div>
          {/* mock card */}
          <div className="mx-auto w-full max-w-sm border border-ink/12 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <Label className="text-[0.6rem]">Comcard</Label>
              <span className="font-display text-sm text-wine">LOVEW</span>
            </div>
            <p className="mt-6 text-[0.6rem] font-medium uppercase tracking-[0.25em] text-ink/40">Body type</p>
            <p className="mt-1 font-display text-3xl text-wine">Hourglass</p>
            <dl className="mt-6 space-y-2 text-xs text-ink/60">
              <div className="flex justify-between border-b border-ink/5 pb-1.5"><dt>Bust</dt><dd className="text-ink">88 cm</dd></div>
              <div className="flex justify-between border-b border-ink/5 pb-1.5"><dt>Waist</dt><dd className="text-ink">64 cm</dd></div>
              <div className="flex justify-between border-b border-ink/5 pb-1.5"><dt>Hips</dt><dd className="text-ink">92 cm</dd></div>
              <div className="flex justify-between"><dt>Top · Shoe</dt><dd className="text-ink">M · 39</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
