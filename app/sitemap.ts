import type { MetadataRoute } from "next";
import { courses } from "@/lib/courseLabs";
import { tracks } from "@/lib/labs";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kongu-ai-academy.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    "/", "/courses", "/labs", "/programmes", "/verify", "/privacy", "/terms",
    ...courses.flatMap((c) => [`/courses/${c.slug}`, ...c.labs.map((l) => `/courses/${c.slug}/${l.lab}`)]),
    ...tracks.flatMap((t) => [`/labs/${t.slug}`, ...t.labs.map((l) => `/labs/${t.slug}/${l.id}`)]),
  ];
  return urls.map((u) => ({ url: `${SITE}${u}`, changeFrequency: u === "/" ? "weekly" : "monthly", priority: u === "/" ? 1 : 0.6 }));
}
