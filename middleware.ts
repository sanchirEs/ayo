import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Нэвтрэлт шаардлагатай замууд
const PROTECTED = [
  "/account_edit",
  "/account_orders",
  "/account_wishlist",
  "/account_edit_address",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth; // NextAuth session байгаа эсэх
  const path = nextUrl.pathname;

  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (needsAuth && !isAuthed) {
    const loginUrl = new URL("/login", nextUrl);
    // буцааж ирэхэд яг очсон хуудас руу нь оруулъя
    loginUrl.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

// _next/static, images, favicon зэргийг алгасна
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
