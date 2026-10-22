import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let session = null;

  const hasSupabaseConfig =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabaseConfig) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
          },
        }
      );

      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      session = s;
    } catch {
      session = null;
    }
  }

  const protectedRoutes = ["/dashboard", "/meals", "/workouts", "/shopping", "/progress", "/account", "/onboarding"];
  const authRoutes = ["/login", "/signup"];

  const isProtected = protectedRoutes.some((r) => request.nextUrl.pathname.startsWith(r));
  const isAuth = authRoutes.includes(request.nextUrl.pathname);

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
