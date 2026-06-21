import { FashionSubmitForm } from "@/components/fashion-submit-form";

export const metadata = { title: "List your pieces · LOVEW Fashion" };

export default function ListFashionPage() {
  return (
    <>
      <section className="bg-wine text-chiffon">
        <div className="mx-auto max-w-editorial px-6 py-16 text-center md:py-24">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-chiffon/55">LOVEW Fashion · for providers</p>
          <h1 className="mt-5 font-display text-4xl font-normal text-chiffon md:text-6xl">List your pieces to rent or sell.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-chiffon/80">
            Reach people looking for gowns, kebaya, and outfits across Indonesia.
            Free to list — renters and buyers contact you directly, no commission.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-editorial px-6 py-16 md:py-20">
        <FashionSubmitForm />
      </section>
    </>
  );
}
