import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Нэвтрэлт шаардлагатай замууд
const PROTECTED = [
  "/account_edit",
  "/account_orders",
  "/account_wishlist",
  "/account_edit_address",
];

// Нэвтэрсэн хэрэглэгчдэд хандах хориотой замууд
const AUTH_PAGES = [
  "/login_register",
  "/login",
  "/register",
  "/reset_password",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthed = !!req.auth; // NextAuth session байгаа эсэх
  const path = nextUrl.pathname;

  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  const isAuthPage = AUTH_PAGES.some((p) => path === p || path.startsWith(p + "/"));

  // Нэвтрэлт шаардлагатай хуудас руу нэвтэрээгүй хэрэглэгч оролдвол
  if (needsAuth && !isAuthed) {
    const loginUrl = new URL("/login_register", nextUrl);
    // буцааж ирэхэд яг очсон хуудас руу нь оруулъя
    loginUrl.searchParams.set("redirect", path + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Нэвтэрсэн хэрэглэгч login хуудас руу оролдвол
  if (isAuthPage && isAuthed) {
    // Redirect parameter байвал тэр хуудас руу, үгүй бол home руу
    const redirectUrl = nextUrl.searchParams.get("redirect");
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// _next/static, images, favicon зэргийг алгасна
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
