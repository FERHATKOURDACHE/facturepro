import { Landing } from "@/components/Landing";
import { getPublicContent } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { siteConfig } = await getPublicContent();

  return <Landing siteConfig={siteConfig} />;
}
