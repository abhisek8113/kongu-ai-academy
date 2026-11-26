import LogoutButton from "@/components/LogoutButton";

export const metadata = { title: "Account suspended", robots: { index: false } };

export default function Suspended() {
  return (
    <div className="wrap max-w-lg py-24 text-center">
      <h1 className="text-3xl">Your account is suspended</h1>
      <p className="mt-4 text-mute">Access to labs and your dashboard is paused. If you think this is a mistake, contact Kongu AI Academy on WhatsApp <a className="text-ink underline" href="https://wa.me/919514524599">+91 95145 24599</a> or email <a className="text-ink underline" href="mailto:abhisekmurugesan@gmail.com">abhisekmurugesan@gmail.com</a>.</p>
      <div className="mt-8"><LogoutButton className="btn-ghost" /></div>
    </div>
  );
}
