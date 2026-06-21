import Image from "next/image";
import Link from "next/link";
import { PHOTO, img } from "@/lib/studio";
import { Label } from "@/components/studio-ui";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { FashionGallery } from "@/components/fashion-gallery";
import type { FashionListing } from "@/lib/fashion";

export const metadata = { title: "LOVEW Fashion — Rent & shop the look · LOVEW Studio" };
export const dynamic = "force-dynamic";

export default async function FashionPage() {
  let listings: FashionListing[] = [];
  if (env.supabaseConfigured) {
    const supabase = createClient();
    const { data } = await supabase
      .from("fashion_listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    listings = (data ?? []) as FashionListing[];
  }

  return (
    <>
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-editorial md:grid-cols-2 md:items-stretch">
          <div className="flex flex-col justify-center px-6 py-20 md:py-32 md:pr-16">
            <Label>LOVEW Fashion</Label>
            <h1 className="mt-8 font-display text-[3rem] font-normal leading-[1.04] tracking-[-0.01em] text-ink md:text-[4.4rem]">
              Rent the look.
              <br />
              <span className="italic text-wine">Or make it yours.</span>
            </h1>
            <p className="mt-8 max-w-md text-[0.95rem] font-light leading-relaxed text-ink/55">
              A curated edit of pieces to <em>rent</em> and <em>shop</em> from independent providers across
              Indonesia. Found something? Message the provider directly to arrange it.
            </p>
            <div className="mt-10">
              <Link href="/fashion/list" className="inline-flex items-center gap-3 bg-ink px-7 py-3 text-xs uppercase tracking-[0.22em] text-white transition-colors hover:bg-wine">
                List your pieces →
              </Link>
            </div>
          </div>
          <div className="relative min-h-[58vh] md:min-h-[82vh]">
            <Image src={img(PHOTO.maroonGown, 1400)} alt="LOVEW Fashion" fill priority sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-16 md:py-24">
        <FashionGallery listings={listings} />
      </section>
    </>
  );
}
