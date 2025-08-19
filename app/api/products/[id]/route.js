// app/api/products/[id]/route.js
import { NextResponse } from "next/server";
import api from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/products/:id -> details
export async function GET(_req, { params }) {
  try {
    const data = await api.products.getById(params.id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id -> update (JSON body)
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const data = await api.fetch(`/products/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id -> delete
export async function DELETE(_req, { params }) {
  try {
    const data = await api.fetch(`/products/${params.id}`, {
      method: "DELETE",
    });
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: err?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
