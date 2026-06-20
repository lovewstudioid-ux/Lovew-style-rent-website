import { SpaceSubmitForm } from "@/components/space-submit-form";

export const metadata = { title: "List your space · LOVEW Spaces" };

export default function ListSpacePage() {
  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-16 text-center md:py-24">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Spaces · for owners</p>
          <h1 className="mt-5 font-display text-4xl font-normal text-chiffon md:text-6xl">List your studio or venue.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-chiffon/80">
            Reach creators and event planners looking for photo studios and venues across Indonesia.
            Free to list — guests book and pay you directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-editorial px-6 py-16 md:py-20">
        <SpaceSubmitForm />
      </section>
    </>
  );
}
