// app/api/products/route.js
import { NextResponse } from "next/server";
import api from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/products -> list with query params (page, limit, search, etc.)
export async function GET(req) {
  try {
    const sp = req.nextUrl.searchParams;
    const params = Object.fromEntries(sp.entries());
    const data = await api.products.getAll(params);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products -> create (JSON body)
// Note: your current lib/api.js always sends Content-Type: application/json.
// For file uploads (FormData) you'd first need to adjust lib/api.js.
export async function POST(req) {
  try {
    const body = await req.json();
    const data = await api.fetch("/products", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
