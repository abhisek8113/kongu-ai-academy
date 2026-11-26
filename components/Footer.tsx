import Link from "next/link";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink">
      <div className="wrap grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-semibold"><span className="block h-3 w-3 bg-madder" />Kongu AI Academy</div>
          <p className="mt-3 max-w-xs text-sm text-mute">Practical AI and data science training. Coimbatore, Tamil Nadu.</p>
        </div>
        <div>
          <div className="kicker">Courses</div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {courses.map((c) => <li key={c.slug}><Link className="hover:text-madder" href={`/courses/${c.slug}`}>{c.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <div className="kicker">Lab tracks</div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {tracks.map((t) => <li key={t.slug}><Link className="hover:text-madder" href={`/labs/${t.slug}`}>{t.name}</Link></li>)}
          </ul>
        </div>
        <div className="text-sm">
          <div className="kicker">Contact</div>
          <p className="mt-3"><a className="hover:text-madder" href="https://wa.me/919514524599">+91 95145 24599</a></p>
          <p><a className="break-all hover:text-madder" href="mailto:abhisekmurugesan@gmail.com">abhisekmurugesan@gmail.com</a></p>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-2 border-t border-rule py-5 font-mono text-[12px] text-mute">
        <span>© {new Date().getFullYear()} Kongu AI Academy</span>
        <span>Coimbatore · Tamil Nadu</span>
      </div>
    </footer>
  );
}
