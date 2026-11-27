import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLogin({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next?.startsWith("/admin") ? searchParams.next : undefined;
  return (
    <div className="wrap max-w-md py-14">
      <div className="rounded-2xl border border-gold/40 p-1"><AuthForm mode="login" portal="admin" next={next} /></div>
    </div>
  );
}
