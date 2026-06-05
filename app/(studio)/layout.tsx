import { StudioHeader, StudioFooter } from "@/components/studio-ui";

/**
 * Mockup-only umbrella shell. Isolated in the (studio) route group so the live
 * rental homepage at "/" is untouched until these are approved.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudioHeader />
      <main className="flex-1">{children}</main>
      <StudioFooter />
    </div>
  );
}
