import Link from "next/link";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { prefillUrl } from "@/lib/inquiry";

export const metadata = { title: "Start your styling journey · LOVEW Studio" };
export const dynamic = "force-dynamic";

const WA_NUMBER = "6281353752257";
const ASSESSMENT_ID = "pb7lVy";
const MEASUREMENT_ID = "2ExDEp";

/** Tally embed URL (clean, on-brand) + any prefill params. */
function embed(id: string, params: Record<string, string | null | undefined>): string {
  return prefillUrl(
    `https://tally.so/embed/${id}?alignLeft=1&hideTitle=0&transparentBackground=1`,
    params,
  );
}

function wa(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function getClient() {
  if (!env.supabaseConfigured) return null;
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const [{ data: profile }, { data: m }] = await Promise.all([
      supabase.from("profiles").select("full_name, nick_name, phone, instagram").eq("id", user.id).maybeSingle(),
      supabase.from("style_profiles").select("height_cm, bust, waist, hips, top_size, shoe_size, feet_length_cm").eq("user_id", user.id).maybeSingle(),
    ]);
    return {
      name: (profile?.full_name as string) ?? "",
      nickname: (profile?.nick_name as string) ?? "",
      email: user.email ?? "",
      whatsapp: (profile?.phone as string) ?? "",
      instagram: (profile?.instagram as string) ?? "",
      height: m?.height_cm ? `${m.height_cm}` : "",
      bust: m?.bust ? `${m.bust}` : "",
      waist: m?.waist ? `${m.waist}` : "",
      hips: m?.hips ? `${m.hips}` : "",
      size: (m?.top_size as string) ?? "",
      shoes: m?.shoe_size ? `${m.shoe_size}${m?.feet_length_cm ? ` | ${m.feet_length_cm} cm` : ""}` : "",
    };
  } catch {
    return null;
  }
}

const STEP_BADGE = "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-wine font-display text-lg text-chiffon";
const WA_BTN = "inline-flex items-center gap-2.5 bg-ink px-6 py-3 text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-wine";

export default async function StylingStartPage() {
  const client = await getClient();
  const first = client?.name?.split(" ")[0] || "";

  const contact = client
    ? { name: client.name, nickname: client.nickname, email: client.email, whatsapp: client.whatsapp, instagram: client.instagram }
    : {};
  const measurements = client
    ? { height: client.height, bust: client.bust, waist: client.waist, hips: client.hips, size: client.size, shoes: client.shoes }
    : {};

  return (
    <>
      {/* Hero */}
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-16 text-center md:py-24">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">Personal styling · onboarding</p>
          <h1 className="mt-5 font-display text-4xl font-normal md:text-6xl">
            {first ? <>So excited, {first} ✨</> : <>Your styling journey starts here ✨</>}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-[0.9rem] font-light leading-relaxed text-chiffon/70">
            To give you the most personalised recommendations, I need to get to know you a little first.
            Four quick steps — take your time, no rush.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <div className="space-y-14">
          {/* Step 1 — Assessment */}
          <div>
            <div className="flex items-center gap-4">
              <span className={STEP_BADGE}>1</span>
              <div>
                <h2 className="font-display text-2xl text-ink">Styling assessment</h2>
                <p className="text-[0.82rem] font-light text-ink/55">Your lifestyle, style preferences, and what you&apos;re looking to change.</p>
              </div>
            </div>
            <div className="mt-5 border border-ink/12 bg-white p-2 shadow-sm">
              <iframe
                src={embed(ASSESSMENT_ID, contact)}
                title="Styling assessment form"
                className="h-[640px] w-full"
                frameBorder="0"
              />
            </div>
          </div>

          {/* Step 2 — Measurements */}
          <div>
            <div className="flex items-center gap-4">
              <span className={STEP_BADGE}>2</span>
              <div>
                <h2 className="font-display text-2xl text-ink">Body measurements</h2>
                <p className="text-[0.82rem] font-light text-ink/55">
                  So I can recommend the right sizes across brands.
                  {client && (client.bust || client.height) ? " Your saved measurements are pre-filled — just check and submit." : ""}
                </p>
              </div>
            </div>
            <div className="mt-5 border border-ink/12 bg-white p-2 shadow-sm">
              <iframe
                src={embed(MEASUREMENT_ID, { ...contact, ...measurements })}
                title="Body measurement form"
                className="h-[640px] w-full"
                frameBorder="0"
              />
            </div>
            <p className="mt-2 text-[0.72rem] font-light text-ink/45">
              Haven&apos;t measured yet? Build your{" "}
              <Link href="/discover" className="text-wine underline underline-offset-2 hover:text-ink">free comcard</Link>{" "}
              first — it saves your measurements for next time.
            </p>
          </div>

          {/* Step 3 — Outfit photos */}
          <div>
            <div className="flex items-center gap-4">
              <span className={STEP_BADGE}>3</span>
              <div>
                <h2 className="font-display text-2xl text-ink">5 outfit photos</h2>
                <p className="text-[0.82rem] font-light text-ink/55">Real everyday looks you&apos;ve actually worn recently — no need to style anything.</p>
              </div>
            </div>
            <div className="mt-5 border border-ink/12 bg-[#faf8f5] px-6 py-5">
              <ul className="space-y-1.5 text-[0.85rem] font-light leading-relaxed text-ink/70">
                <li>• 1–2 regular weekday outfits</li>
                <li>• 1 casual weekend look</li>
                <li>• 1 evening / going-out outfit</li>
                <li>• 1 of your choice</li>
              </ul>
              <p className="mt-3 text-[0.78rem] font-light text-ink/50">
                Photos from the last 3–6 months are ideal — a mirror selfie is totally fine!
              </p>
              <a
                href={wa(`Hi Jocelyn! ✨ Here are my 5 outfit photos for the styling project${first ? ` — ${client?.name}` : ""}`)}
                target="_blank" rel="noopener noreferrer"
                className={`${WA_BTN} mt-5`}
              >
                Send photos via WhatsApp →
              </a>
            </div>
          </div>

          {/* Step 4 — Style references */}
          <div>
            <div className="flex items-center gap-4">
              <span className={STEP_BADGE}>4</span>
              <div>
                <h2 className="font-display text-2xl text-ink">Style references</h2>
                <p className="text-[0.82rem] font-light text-ink/55">5–10 outfits or looks you&apos;re drawn to — just what catches your eye.</p>
              </div>
            </div>
            <div className="mt-5 border border-ink/12 bg-[#faf8f5] px-6 py-5">
              <ul className="space-y-1.5 text-[0.85rem] font-light leading-relaxed text-ink/70">
                <li>→ <span className="text-ink">Instagram:</span> save posts to a Collection, then screenshot or share the collection link</li>
                <li>→ <span className="text-ink">Pinterest:</span> create a board and share the board link</li>
              </ul>
              <p className="mt-3 text-[0.78rem] font-light text-ink/50">
                No need to overthink it — even &ldquo;I like this vibe but not sure why&rdquo; is useful! 😊
              </p>
              <a
                href={wa(`Hi Jocelyn! Here are my style references for the styling project${first ? ` — ${client?.name}` : ""}`)}
                target="_blank" rel="noopener noreferrer"
                className={`${WA_BTN} mt-5`}
              >
                Share references via WhatsApp →
              </a>
            </div>
          </div>
        </div>

        {/* Closing note */}
        <div className="mt-16 border-t border-ink/10 pt-8 text-center">
          <p className="mx-auto max-w-md font-display text-xl italic leading-relaxed text-ink/70">
            Once I have all four, I&apos;ll start on your style analysis and get back to you within 4–5 days. 🤍
          </p>
          <a
            href={wa("Hi Jocelyn! I have a question about my styling onboarding 😊")}
            target="_blank" rel="noopener noreferrer"
            className="mt-6 inline-block text-[0.72rem] uppercase tracking-[0.2em] text-wine underline-offset-4 hover:underline"
          >
            Questions? Chat with me →
          </a>
        </div>
      </section>
    </>
  );
}
