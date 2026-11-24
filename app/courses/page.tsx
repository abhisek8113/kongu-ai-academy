import Link from "next/link";
import { courses } from "@/lib/courseLabs";

export const metadata = { title: "Course labs" };

export default function Courses() {
  return (
    <div className="wrap py-12">
      <h1 className="text-4xl font-extrabold">Course labs</h1>
      <p className="mt-3 max-w-2xl text-[#5d5550]">
        Full lessons with runnable Google Colab notebooks and real datasets. Read the lesson, open the notebook in Colab, complete the exercises and check your answers.
      </p>
      <div className="mt-8 grid gap-8">
        {courses.map((c) => (
          <section key={c.slug} className="card">
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl font-display font-extrabold text-white" style={{ background: c.color }}>{c.labs.length}</span>
              <div>
                <h2 className="text-2xl font-extrabold"><Link href={`/courses/${c.slug}`} className="hover:underline">{c.name}</Link></h2>
                <p className="text-sm text-[#5d5550]">{c.labs.length} labs · Google Colab · datasets included</p>
              </div>
              <Link href={`/courses/${c.slug}`} className="btn-red ml-auto">Open course</Link>
            </div>
            <ol className="mt-5 grid gap-2 sm:grid-cols-2">
              {c.labs.map((l) => (
                <li key={l.lab}>
                  <Link href={`/courses/${c.slug}/${l.lab}`} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-2 hover:ring-2 hover:ring-saffron">
                    <span><span className="text-[#5d5550]">{String(l.num).padStart(2, "0")}</span> {l.title}</span>
                    <span className="whitespace-nowrap text-sm text-[#5d5550]">{l.time}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
