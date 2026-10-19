import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/products/[id] -> ambil satu karakter
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT id, name, description, price, level, created_at
       FROM products
       WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Karakter tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal mengambil karakter" },
      { status: 500 },
    );
  }
}

// PUT /api/products/[id] -> edit karakter
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, level } = body;

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: 'Field "name" wajib diisi' },
        { status: 400 },
      );
    }

    if (
      level === undefined ||
      level === "" ||
      !Number.isInteger(Number(level)) ||
      Number(level) < 0
    ) {
      return NextResponse.json(
        { error: "Level harus bilangan bulat minimal 0" },
        { status: 400 },
      );
    }

    const pool = getPool();

    const [result] = await pool.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, level = ?
       WHERE id = ?`,
      [name.trim(), description ?? null, price ?? 0, Number(level), id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Karakter tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Karakter berhasil diperbarui",
      id: Number(id),
      name: name.trim(),
      description: description ?? null,
      price: price ?? 0,
      level: Number(level),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal memperbarui karakter" },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id] -> hapus karakter
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = getPool();

    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Karakter tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Karakter berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menghapus karakter" },
      { status: 500 },
    );
  }
}
