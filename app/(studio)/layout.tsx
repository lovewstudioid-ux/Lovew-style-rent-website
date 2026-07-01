import { StudioFooter } from "@/components/studio-ui";
import { StudioHeaderServer } from "@/components/studio-header-server";

/**
 * Mockup-only umbrella shell. Isolated in the (studio) route group so the live
 * rental homepage at "/" is untouched until these are approved.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StudioHeaderServer />
      <main className="flex-1">{children}</main>
      <StudioFooter />
    </div>
  );
}
