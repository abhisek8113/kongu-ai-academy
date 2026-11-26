import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Lab environments, lessons, notebooks, playgrounds and accounts require login.
// Catalogue pages (/courses, /labs, /courses/<course>, /labs/<track>) stay public as previews.
const PROTECTED = [
  /^\/courses\/[^/]+\/[^/]+/,      // a course lab
  /^\/labs\/[^/]+\/[^/]+/,         // a track lab
  /^\/playground(\/|$)/,
  /^\/course-labs\//,              // lesson HTML, notebooks, datasets
  /^\/dashboard(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/notifications(\/|$)/,
  /^\/account(\/|$)/,
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user && PROTECTED.some((r) => r.test(path))) {
    // Raw files (datasets/notebooks) get a plain 401 instead of a redirect.
    if (path.startsWith("/course-labs/") && !path.endsWith(".html")) {
      return new NextResponse("Please log in to Kongu AI Academy to download lab files.", { status: 401 });
    }
    const url = request.nextUrl.clone();
    const back = path.startsWith("/course-labs/") ? "/courses" : path + request.nextUrl.search;
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(back)}`;
    return NextResponse.redirect(url);
  }
  // Suspended accounts lose access to everything behind login.
  if (user && PROTECTED.some((r) => r.test(path))) {
    const { data: p } = await supabase.from("profiles").select("status, role").eq("id", user.id).maybeSingle();
    if (p?.status === "suspended" && p.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  // Logged-in users don't need the login/signup pages.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next && next.startsWith("/") ? next : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/courses/:path*", "/labs/:path*", "/playground/:path*", "/playground", "/course-labs/:path*", "/dashboard/:path*", "/admin/:path*", "/notifications/:path*", "/account/:path*", "/login", "/signup"],
};
