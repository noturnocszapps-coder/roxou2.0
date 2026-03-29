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
    // This shouldn't happen if triggers are set up, but handle it gracefully
    // Instead of redirecting to login, we allow the request to proceed
    // The client-side AuthProvider will handle the profile creation/fallback
    console.warn("MIDDLEWARE: Profile not found for user", user.id);
    
    // If it's a protected route, we can allow it if we assume a default role
    // or we can redirect to a safe landing page like /dashboard
    if (path.startsWith("/admin") || path.startsWith("/driver")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
    // Fetch driver record for verification status - this is the ONLY source of truth for approval
    const { data: drivers } = await supabase
      .from("drivers")
      .select("verification_status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const driver = drivers && drivers.length > 0 ? drivers[0] : null;
    const verification_status = driver?.verification_status;

    // Debug log for validation
    console.log('DRIVER STATUS:', verification_status);

    const isApproved = verification_status === "approved";

    if (isApproved) {
      // Approved driver:
      // - Allowed: /driver/dashboard, /driver/* (except onboarding), /profile, /blocked, /chat/*
      // - Redirected to /driver/dashboard if on: /, /login, /dashboard, /driver/onboarding
      if (path === "/driver/onboarding" || path === "/" || path === "/dashboard" || path.startsWith("/login")) {
        return NextResponse.redirect(new URL("/driver/dashboard", request.url));
      }
      
      // If trying to access passenger dashboard or admin, redirect to driver dashboard
      if (path === "/dashboard" || path.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/driver/dashboard", request.url));
      }
    } else {
      // Non-approved driver (pending, rejected, or no record):
      // - Allowed: /driver/onboarding, /profile, /blocked
      // - Redirected to /driver/onboarding if on: /, /login, /dashboard, /driver/dashboard, /driver/* (except onboarding)
      if (path !== "/driver/onboarding" && path !== "/profile" && path !== "/blocked") {
        return NextResponse.redirect(new URL("/driver/onboarding", request.url));
      }
    }
  } 
  // 3. Passenger Rule
  else {
    if (path.startsWith("/admin") || path.startsWith("/driver")) {
      return NextResponse.redirect(new URL("/", request.url));
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
