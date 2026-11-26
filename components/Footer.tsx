import Link from "next/link";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";
import { Logo } from "@/components/SiteNav";

export default function Footer() {
  return (
    <footer className="border-t border-rule bg-[linear-gradient(180deg,#070B18,#0A1022)]">
      <div className="wrap grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5"><Logo /><span className="font-display text-[15px] font-semibold tracking-[0.08em]">KONGU AI ACADEMY</span></div>
          <p className="mt-4 max-w-xs text-sm text-mute">Practical AI, machine learning and data science training for students, colleges and teams across Tamil Nadu and India.</p>
          <p className="mt-4 font-display text-sm text-gold">Learn AI. Build Intelligence. Shape Tomorrow.</p>
        </div>
        <div>
          <p className="kicker">Courses</p>
          <ul className="mt-4 space-y-2 text-sm">
            {courses.map((c) => <li key={c.slug}><Link className="text-mute hover:text-ink" href={`/courses/${c.slug}`}>{c.name}</Link></li>)}
            <li><Link className="text-mute hover:text-ink" href="/#courses">All programmes</Link></li>
          </ul>
        </div>
        <div>
          <p className="kicker">Labs</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-mute hover:text-ink" href="/#labs">All 25 Colab labs</Link></li>
            {tracks.map((t) => <li key={t.slug}><Link className="text-mute hover:text-ink" href={`/labs/${t.slug}`}>{t.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="kicker">Training</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-mute hover:text-ink" href="/#institutions">College training</Link></li>
            <li><Link className="text-mute hover:text-ink" href="/#corporate">Corporate training</Link></li>
            <li><Link className="text-mute hover:text-ink" href="/programmes">Open programmes</Link></li>
            <li><Link className="text-mute hover:text-ink" href="/verify">Verify a certificate</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="kicker">Contact</p>
          <ul className="mt-4 space-y-2">
            <li><a className="text-mute hover:text-ink" href="https://wa.me/919514524599">WhatsApp · +91 95145 24599</a></li>
            <li><a className="text-mute hover:text-ink" href="tel:+919514524599">Call · +91 95145 24599</a></li>
            <li><a className="break-all text-mute hover:text-ink" href="mailto:abhisekmurugesan@gmail.com">abhisekmurugesan@gmail.com</a></li>
            <li className="text-mute">Coimbatore, Tamil Nadu</li>
          </ul>
          <Link href="/#demo" className="btn-red mt-5 min-h-[40px] px-4 text-sm">Book Free Demo</Link>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-3 border-t border-rule py-6 text-xs text-mute">
        <span>© {new Date().getFullYear()} Kongu AI Academy. All rights reserved.</span>
        <span className="flex gap-5"><Link href="/privacy" className="hover:text-ink">Privacy policy</Link><Link href="/terms" className="hover:text-ink">Terms & conditions</Link></span>
      </div>
    </footer>
  );
}
