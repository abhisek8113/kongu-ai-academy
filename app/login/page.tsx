import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in" };

export default function Login({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next?.startsWith("/") ? searchParams.next : undefined;
  return <div className="wrap max-w-md py-14"><AuthForm mode="login" next={next} /></div>;
}
