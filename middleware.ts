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

  // Terms acceptance check (if applicable)
  // if (!profile.terms_accepted && path !== "/terms-acceptance") {
  //   return NextResponse.redirect(new URL("/terms-acceptance", request.url));
  // }

  // Redirect from landing or login to dashboard
  if (path === "/" || path.startsWith("/login")) {
    const role = profile.role || "passenger"; // Default to passenger
    
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (role === "driver") {
      if (profile.driver_status === "approved") {
        return NextResponse.redirect(new URL("/driver/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/driver/onboarding", request.url));
      }
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Role-based route protection
  if (path.startsWith("/admin") && profile.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path.startsWith("/driver") && profile.role !== "driver") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Driver approved check
  if (path === "/driver/dashboard" && profile.role === "driver" && profile.driver_status !== "approved") {
    return NextResponse.redirect(new URL("/driver/onboarding", request.url));
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
