import { redirect } from "next/navigation";

import PsiAdminPanel from "@/components/admin/PsiAdminPanel";
import { validateAdminSession } from "@/lib/auth";
import { listCaseCards } from "@/lib/cases-data";
import { listPartnerCards } from "@/lib/partners-data";
import { listPersonnelCards } from "@/lib/personnel-data";
import { listPsiCards } from "@/lib/psi-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await validateAdminSession();
  if (!session) {
    redirect("/");
  }

  const [psiCards, personnelCards, caseCards, partnerCards] = await Promise.all([
    listPsiCards(),
    listPersonnelCards(),
    listCaseCards(),
    listPartnerCards(),
  ]);

  return (
    <PsiAdminPanel
      initialPsiCards={psiCards}
      initialPersonnelCards={personnelCards}
      initialCaseCards={caseCards}
      initialPartnerCards={partnerCards}
    />
  );
}
