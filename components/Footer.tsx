import Link from "next/link";
import { tracks } from "@/lib/labs";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e8dfd8] bg-cream">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <div className="font-display text-lg font-extrabold text-madder">Kongu AI Academy</div>
          <p className="mt-2 text-sm text-[#5d5550]">Practitioner-led AI and Data Science training for campuses and teams. Coimbatore, Tamil Nadu.</p>
        </div>
        <div>
          <div className="font-semibold">Lab tracks</div>
          <ul className="mt-2 space-y-1 text-sm">
            {tracks.map((t) => (
              <li key={t.slug}><Link className="hover:underline" href={`/labs/${t.slug}`}>{t.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Contact</div>
          <p className="mt-2">WhatsApp / phone: <a className="underline" href="https://wa.me/919514524599">+91 95145 24599</a></p>
          <p>Email: <a className="underline" href="mailto:abhisekmurugesan@gmail.com">abhisekmurugesan@gmail.com</a></p>
        </div>
      </div>
      <div className="wrap pb-6 text-xs text-[#5d5550]">© {new Date().getFullYear()} Kongu AI Academy</div>
    </footer>
  );
}
