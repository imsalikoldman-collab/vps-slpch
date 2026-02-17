import { redirect } from "next/navigation";

import PsiAdminPanel from "@/components/admin/PsiAdminPanel";
import { validateAdminSession } from "@/lib/auth";
import { listPsiCards } from "@/lib/psi-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await validateAdminSession();
  if (!session) {
    redirect("/");
  }

  const cards = await listPsiCards();
  return <PsiAdminPanel initialCards={cards} />;
}
