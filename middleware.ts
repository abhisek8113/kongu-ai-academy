import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { labIdFromPath } from "@/lib/labAccess";

// Account areas: login required.
const ACCOUNT = [/^\/dashboard(\/|$)/, /^\/admin(\/|$)/, /^\/notifications(\/|$)/, /^\/account(\/|$)/];

function noStore(res: NextResponse) {
  // Protected pages must never be served from the browser/back-forward cache after logout.
  res.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return res;
}

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
  const lab = labIdFromPath(path);
  const isAccount = ACCOUNT.some((r) => r.test(path));
  const redirect = (pathname: string, search = "") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname; url.search = search;
    return noStore(NextResponse.redirect(url));
  };
  const back = path.startsWith("/course-labs/") ? "/courses" : path + request.nextUrl.search;

  if (lab) {
    // The database decides: the single public lab, or a signed-in member with an active subscription.
    const { data: allowed } = await supabase.rpc("has_lab_access", { lab });
    if (!allowed) {
      if (path.startsWith("/course-labs/") && !path.endsWith(".html")) {
        return new NextResponse(user ? "An active membership is required to download lab files." : "Please log in to download lab files.", { status: user ? 403 : 401 });
      }
      if (!user) return redirect("/login", `?next=${encodeURIComponent(back)}`);
      return redirect("/pricing", `?locked=${encodeURIComponent(back)}`);
    }
  }
  if (!user && isAccount) return redirect("/login", `?next=${encodeURIComponent(back)}`);

  if (user && (isAccount || lab)) {
    const { data: p } = await supabase.from("profiles").select("status, role").eq("id", user.id).maybeSingle();
    if (p?.status === "suspended" && p.role !== "admin") return redirect("/suspended");
  }
  if (user && (path === "/login" || path === "/signup")) {
    const next = request.nextUrl.searchParams.get("next");
    return redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
  }
  return lab || isAccount ? noStore(response) : response;
}

export const config = {
  matcher: ["/courses/:path*", "/labs/:path*", "/playground/:path*", "/course-labs/:path*", "/dashboard/:path*", "/admin/:path*", "/notifications/:path*", "/account/:path*", "/login", "/signup"],
};
