import { getAccountNav } from "@/lib/account-nav";
import { StudioHeader } from "@/components/studio-ui";

/** Server wrapper — fetches account state, then renders the client studio header. */
export async function StudioHeaderServer() {
  const account = await getAccountNav();
  return <StudioHeader account={account} />;
}
