import Link from "next/link";
import PythonRunner from "@/components/playground/PythonRunner";
import { pythonExercises } from "@/lib/playground";
import { requirePublished } from "@/lib/published";

export const metadata = { title: "Python Playground" };
export const dynamic = "force-dynamic";

export default async function PythonPlayground() {
  await requirePublished("playground/python");
  return (
    <div className="wrap py-10">
      <Link href="/playground" className="eyebrow hover:text-ink">← Playgrounds</Link>
      <h1 className="mt-3 text-4xl">Python Playground</h1>
      <p className="mt-2 max-w-2xl text-mute">Real Python 3 with NumPy, pandas and scikit-learn, running safely inside your browser (Pyodide). Nothing is installed, and each run is limited to 15 seconds.</p>
      <div className="mt-8"><PythonRunner exercises={pythonExercises} /></div>
    </div>
  );
}
