import Image from "next/image";
import Link from "next/link";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { SpacesGallery } from "@/components/spaces-gallery";
import type { SpaceListing } from "@/lib/spaces";

export const metadata = { title: "LOVEW Spaces — Studios & venues to book · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function SpacesPage() {
  let listings: SpaceListing[] = [];
  let customerName = "";
  let customerPhone = "";
  if (env.supabaseConfigured) {
    const supabase = createClient();
    const { data } = await supabase
      .from("space_listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    listings = (data ?? []) as SpaceListing[];
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      customerName = (p?.full_name as string) ?? "";
      customerPhone = (p?.phone as string) ?? "";
    }
  }

  return (
    <>
      <section className="relative h-[64vh] min-h-[460px] w-full overflow-hidden border-b border-ink/10">
        <Image src={img(PHOTO.spaceStudio, 1800)} alt="LOVEW Spaces" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full">
          <div className="mx-auto max-w-editorial px-6 pb-12 text-white">
            <Label className="text-white/70">LOVEW Spaces</Label>
            <h1 className="mt-4 max-w-2xl font-display text-[2.6rem] font-normal leading-tight md:text-6xl">
              Studios &amp; venues, <span className="italic">ready when you are.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm font-light text-white/80">
              Hand-picked spaces across Indonesia — reach each studio directly on WhatsApp or Instagram.
            </p>
            <Link href="/spaces/list" className="mt-6 inline-flex items-center gap-3 bg-white px-7 py-3 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-wine hover:text-white">
              List your space →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-16 md:py-24">
        <SpacesGallery listings={listings} customerName={customerName} customerPhone={customerPhone} />
      </section>
    </>
  );
}
