import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const url = new URL(request.url);
  const path = url.pathname;

  // Public routes
  const isPublicRoute = path === "/" || path.startsWith("/login") || path.startsWith("/auth");

  if (!user) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // If user is authenticated, fetch profile to check role and status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // This shouldn't happen if triggers are set up, but handle it
    if (path !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // Blocked user check
  if (profile.is_blocked && path !== "/blocked") {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  // Deterministic Role-Based Redirects
  const role = profile.role || "passenger";
  
  // 1. Admin Rule
  if (role === "admin") {
    if (!path.startsWith("/admin") && path !== "/profile" && path !== "/blocked") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  } 
  // 2. Driver Rule
  else if (role === "driver") {
    const { data: driver } = await supabase
      .from("drivers")
      .select("verification_status")
      .eq("user_id", user.id)
      .maybeSingle();

    const isApproved = driver?.verification_status === "approved";

    if (isApproved) {
      // Approved driver should only be in /driver routes (except onboarding) or profile
      if (!path.startsWith("/driver") || path === "/driver/onboarding") {
        if (path !== "/profile" && path !== "/blocked" && !path.startsWith("/chat")) {
          return NextResponse.redirect(new URL("/driver/dashboard", request.url));
        }
      }
    } else {
      // Pending/Rejected/No-row driver should only be in /driver/onboarding or profile
      if (path !== "/driver/onboarding" && path !== "/profile" && path !== "/blocked") {
        return NextResponse.redirect(new URL("/driver/onboarding", request.url));
      }
    }
  } 
  // 3. Passenger Rule
  else {
    if (path.startsWith("/admin") || path.startsWith("/driver")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // If on landing or login, go to dashboard
    if (path === "/" || path.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
