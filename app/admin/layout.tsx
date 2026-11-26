import { requireAdminPage } from "@/lib/admin";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdminPage();
  return (
    <div className="wrap grid gap-8 py-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="kicker">Admin</p>
        <p className="mt-1 font-medium">{profile?.full_name ?? "Administrator"}</p>
        <AdminNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
