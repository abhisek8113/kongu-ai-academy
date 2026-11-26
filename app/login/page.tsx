import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Student login" };

export default function Login({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const next = searchParams.next?.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : undefined;
  return <div className="wrap max-w-md py-14"><AuthForm mode="login" next={next} notice={searchParams.error?.slice(0, 200)} /></div>;
}
