import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

// GET /api/products -> list all products
export async function GET() {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, description, price, level, created_at FROM products ORDER BY id DESC",
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/products -> create a new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, level } = body;

    if (!name || !name.trim()) {
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
        { error: 'Field "level" wajib berupa bilangan bulat minimal 0' },
        { status: 400 },
      );
    }

    const pool = getPool();

    // Kolom lama tetap dipertahankan.
    // price menggunakan nilai default database jika tidak dikirim.
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, level)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), description || null, price ?? 0, Number(level)],
    );

    return NextResponse.json(
      {
        id: result.insertId,
        name: name.trim(),
        description: description || null,
        price: price ?? 0,
        level: Number(level),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
