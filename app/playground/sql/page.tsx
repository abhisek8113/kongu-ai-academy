import Link from "next/link";
import SqlRunner from "@/components/playground/SqlRunner";
import { sqlExercises } from "@/lib/playground";
import { requirePublished } from "@/lib/published";

export const metadata = { title: "SQL Playground" };
export const dynamic = "force-dynamic";

export default async function SqlPlayground() {
  await requirePublished("playground/sql");
  return (
    <div className="wrap py-10">
      <Link href="/playground" className="eyebrow hover:text-ink">← Playgrounds</Link>
      <h1 className="mt-3 text-4xl">SQL Playground</h1>
      <p className="mt-2 max-w-2xl text-mute">Write SQL against the Chinook music-store database (11 tables: Artist, Album, Track, Customer, Invoice…). SQLite runs entirely in your browser.</p>
      <div className="mt-8"><SqlRunner exercises={sqlExercises} /></div>
    </div>
  );
}
