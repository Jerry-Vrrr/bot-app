  // middleware.ts
  import { getToken } from "next-auth/jwt";
  import { NextRequest, NextResponse } from "next/server";

  export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    const protectedRoutes = ["/chatbots", "/profile"];

    if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
      if (!token) {
        
        const signInUrl = new URL("/signin", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ["/chatbots/", "/chatbots/:path*", "/profile/"],
  };
