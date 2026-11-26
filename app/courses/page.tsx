import Link from "next/link";
import { courses } from "@/lib/courseLabs";

export const metadata = { title: "Courses" };

export default function Courses() {
  return (
    <div className="wrap pt-12">
      <p className="kicker">Courses</p>
      <h1 className="mt-3 text-[40px] font-semibold leading-tight">Lab courses</h1>
      <p className="mt-3 max-w-2xl text-mute">
        Read the lesson, open the notebook in Google Colab, complete the exercises and run the self-check. Each lab comes with its dataset.
      </p>
      {courses.map((c, i) => (
        <section key={c.slug} className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 className="text-2xl"><span className="font-mono text-[15px] text-mute">{String(i + 1).padStart(2, "0")}</span> <Link href={`/courses/${c.slug}`} className="hover:text-madder">{c.name}</Link></h2>
            <span className="font-mono text-[13px] text-mute">{c.labs.length} labs</span>
          </div>
          <ol>
            {c.labs.map((l) => (
              <li key={l.lab} className="border-b border-rule">
                <Link href={`/courses/${c.slug}/${l.lab}`} className="group grid grid-cols-[3rem_1fr_auto] gap-4 py-3.5">
                  <span className="font-mono text-[13px] text-mute">{String(l.num).padStart(2, "0")}</span>
                  <span className="group-hover:text-madder group-hover:underline">{l.title}</span>
                  <span className="font-mono text-[12px] text-mute">{[l.level, l.time.replace("~", "")].filter(Boolean).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
