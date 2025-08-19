// app/api/categories/route.js
import { NextResponse } from "next/server";
import api from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/categories
export async function GET() {
  try {
    const data = await api.categories.getAll();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories  (optional, if your backend supports it)
export async function POST(req) {
  try {
    const body = await req.json();
    const data = await api.fetch("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
