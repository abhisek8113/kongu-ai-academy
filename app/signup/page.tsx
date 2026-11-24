import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Join free" };

export default function Signup() {
  return <div className="wrap max-w-lg py-14"><AuthForm mode="signup" /></div>;
}
