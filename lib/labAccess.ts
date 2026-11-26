import courseLabs from "./courseLabs.json";

/** Default public demo lab; the live value is platform_settings.public_lab. */
export const DEFAULT_PUBLIC_LAB = process.env.NEXT_PUBLIC_PUBLIC_LAB_SLUG || "playground/python";

const byFolder = new Map((courseLabs as any[]).map((l) => [`${l.folder}/${l.lab}`, `${l.course}/${l.lab}`]));

/** Map a URL path to the lab id it belongs to, or null if the path is not a lab. */
export function labIdFromPath(path: string): string | null {
  let m = path.match(/^\/courses\/([^/]+)\/([^/]+)/);
  if (m) return `${m[1]}/${m[2]}`;
  m = path.match(/^\/labs\/[^/]+\/([^/]+)/);
  if (m) return m[1];
  m = path.match(/^\/playground\/([^/]+)/);
  if (m) return `playground/${m[1]}`;
  m = path.match(/^\/course-labs\/([^/]+)\/([^/]+)/);
  if (m) return byFolder.get(`${m[1]}/${m[2]}`) ?? "course-labs/unknown";
  if (path.startsWith("/course-labs/")) return "course-labs/unknown";
  return null;
}
