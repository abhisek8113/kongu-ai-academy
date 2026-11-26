import Link from "next/link";

// Add only real, permission-given feedback here. The section stays hidden while the list is empty.
export const testimonials: { quote: string; name: string; role: string }[] = [];

export default function Testimonials() {
  return (
    <section className="border-t border-rule py-16">
      <div className="wrap">
        {testimonials.length > 0 && (
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="reveal glass p-6">
                <blockquote className="text-[15px]">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm"><span className="font-medium">{t.name}</span><br /><span className="text-mute">{t.role}</span></figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="reveal flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line bg-panel/60 p-6 sm:p-8">
          <div>
            <p className="kicker">Proof you can check</p>
            <h2 className="mt-2 text-2xl">Every certificate is verifiable online.</h2>
            <p className="mt-1 text-mute">Employers and colleges can confirm a Kongu AI Academy certificate with its ID.</p>
          </div>
          <Link href="/verify" className="btn-ghost">Verify a certificate</Link>
        </div>
      </div>
    </section>
  );
}
