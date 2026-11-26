import Link from "next/link";
import { getUnpublished } from "@/lib/published";

export const metadata = { title: "Playgrounds" };
export const dynamic = "force-dynamic";

const items = [
  { id: "playground/python", href: "/playground/python", title: "Python Playground", body: "Python 3 with NumPy, pandas and scikit-learn. 5 graded exercises from basics to a first model.", tag: "Runs in browser" },
  { id: "playground/sql", href: "/playground/sql", title: "SQL Playground", body: "SQLite with the Chinook database. 4 exercises: select, filter, aggregate, join.", tag: "Runs in browser" },
];

export default async function Playgrounds() {
  const off = await getUnpublished();
  const shown = items.filter((i) => !off.has(i.id));
  return (
    <div className="wrap py-12">
      <p className="kicker">Hands-on</p>
      <h1 className="mt-3 text-4xl">Playgrounds</h1>
      <p className="mt-3 max-w-2xl text-mute">Write and run code right here — no installation. For full lessons with datasets, open a course lab in Google Colab.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {shown.map((i) => (
          <Link key={i.id} href={i.href} className="group rounded-2xl border border-rule bg-panel/70 p-6 transition hover:border-madder/60 hover:shadow-glow">
            <span className="pill border-cyan/40 text-cyan">{i.tag}</span>
            <h2 className="mt-4 text-2xl group-hover:text-cyan">{i.title}</h2>
            <p className="mt-2 text-mute">{i.body}</p>
            <span className="mt-5 inline-block text-sm text-madder-light">Open →</span>
          </Link>
        ))}
        {!shown.length && <p className="text-mute">No playgrounds are available right now.</p>}
      </div>
    </div>
  );
}
