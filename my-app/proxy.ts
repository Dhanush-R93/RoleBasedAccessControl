import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/signin", request.url));
  try {
    // 2. Verify validity and expiration
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret); // This throws an error if invalid/expired
    
    return NextResponse.next();
  } catch (error) {
    // 3. If invalid, clear cookie and redirect
    const response = NextResponse.redirect(new URL("/signin", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: "/dashboard/:path*",
};
