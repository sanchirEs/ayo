// app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import api from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/categories/:id
export async function GET(_req, { params }) {
  try {
    const data = await api.categories.getById(params.id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/categories/:id  (optional)
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const data = await api.fetch(`/categories/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:id  (optional)
export async function DELETE(_req, { params }) {
  try {
    const data = await api.fetch(`/categories/${params.id}`, {
      method: "DELETE",
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
