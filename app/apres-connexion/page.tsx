import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getCompanyProfileStatus } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

export default async function ApresConnexionPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const { isComplete } = await getCompanyProfileStatus();

  if (!isComplete) {
    redirect("/parametres?onboarding=required");
  }

  redirect("/dashboard");
}
