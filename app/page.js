"use client";

import { useEffect, useState } from "react";

const emptyForm = { name: "", level: "" };

export default function Home() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data");
      }

      setProducts(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openActions(product) {
    setSelected(product);
    setModal("actions");
    setNotice("");
    setError("");
  }

  function openCreate() {
    setSelected(null);
    setEditingId(null);
    setForm(emptyForm);
    setModal("form");
    setNotice("");
    setError("");
  }

  function openEdit() {
    if (!selected) return;

    setEditingId(selected.id);
    setForm({
      name: selected.name || "",
      level: String(selected.level ?? ""),
    });

    setModal("form");
    setError("");
  }

  function closeModal() {
    setModal("");
    setSelected(null);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Nama karakter wajib diisi.");
      return;
    }

    if (
      form.level.trim() === "" ||
      !Number.isInteger(Number(form.level)) ||
      Number(form.level) < 0
    ) {
      setError("Level harus berupa bilangan bulat minimal 0.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          level: Number(form.level),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data");
      }

      const message = editingId
        ? "Karakter berhasil diperbarui."
        : "Karakter berhasil ditambahkan.";

      closeModal();
      await loadProducts();
      setNotice(message);
    } catch (err) {
      setError(err.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${selected.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus data");
      }

      closeModal();
      await loadProducts();
      setNotice("Karakter berhasil dihapus.");
    } catch (err) {
      setError(err.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    String(product.name || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const highestLevel = products.length
    ? Math.max(...products.map((p) => Number(p.level) || 0))
    : 0;

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-r border-slate-100 bg-white md:sticky md:top-0 md:h-screen md:w-60">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6 md:border-0">
          <a
            href="#"
            className="text-2xl font-bold tracking-tight text-emerald-600"
          >
            NEX<span className="font-normal text-slate-700">LEVEL</span>
          </a>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 md:hidden">
            Dashboard
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:flex-col md:gap-2 md:px-4">
          <div className="flex shrink-0 items-center gap-3 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800">
            <span>▦</span> Dashboard
          </div>

          <button
            onClick={openCreate}
            className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="text-lg">＋</span> Tambah Karakter
          </button>

          <button
            onClick={loadProducts}
            className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span>↻</span> Muat Ulang
          </button>
        </nav>

        <div className="mt-auto hidden border-t border-slate-100 p-5 md:block">
          <p className="text-xs text-slate-400">CHARACTER DATABASE</p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Character Management
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <section className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama karakter..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <p className="text-xs text-slate-400">Character Manager</p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
          {/* Page title */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-400">Workspace / Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Overview
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Pantau dan kelola karakter yang tersimpan.
              </p>
            </div>

            <button
              onClick={openCreate}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              + Tambah Karakter
            </button>
          </div>

          {/* Notifications */}
          {error && !modal && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              {notice}
              <button
                onClick={() => setNotice("")}
                className="ml-3 font-semibold underline"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Statistics */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-emerald-600 bg-emerald-600 p-5 text-white shadow-sm">
              <p className="text-sm text-emerald-50">Total Karakter</p>
              <p className="mt-4 text-4xl font-bold">
                {loading ? "—" : products.length}
              </p>
              <p className="mt-2 text-xs text-emerald-100">
                Seluruh data karakter
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-[#d2eee5] p-5">
              <p className="text-sm text-slate-700">Level Tertinggi</p>
              <p className="mt-4 text-4xl font-bold text-emerald-700">
                {loading ? "—" : highestLevel}
              </p>
              <p className="mt-2 text-xs text-slate-500">Level maksimum</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-[#d2eee5] p-5">
              <p className="text-sm text-slate-700">Karakter Level 50+</p>
              <p className="mt-4 text-4xl font-bold text-emerald-700">
                {loading
                  ? "—"
                  : products.filter((p) => Number(p.level) >= 50).length}
              </p>
              <p className="mt-2 text-xs text-slate-500">Level minimal 50</p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-[#d2eee5] p-5">
              <p className="text-sm text-slate-700">Hasil Pencarian</p>
              <p className="mt-4 text-4xl font-bold text-emerald-700">
                {loading ? "—" : filteredProducts.length}
              </p>
              <p className="mt-2 text-xs text-slate-500">Karakter yang cocok</p>
            </div>
          </section>

          {/* Character cards */}
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Daftar Karakter</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Klik salah satu kartu untuk mengelola datanya.
                </p>
              </div>

              <span className="text-sm text-slate-400">
                {filteredProducts.length} karakter
              </span>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Memuat data karakter...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl text-emerald-700">
                  ♙
                </div>
                <h3 className="mt-4 font-semibold">Karakter tidak ditemukan</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Tambahkan karakter baru atau ubah kata pencarian.
                </p>
                {!search && (
                  <button
                    onClick={openCreate}
                    className="mt-5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    + Tambah Karakter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((p, index) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openActions(p)}
                    className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label={`Kelola karakter ${p.name}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-bold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                        {String(p.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                        ID: {p.id}
                      </span>
                    </div>

                    <h3 className="mt-5 truncate text-lg font-semibold">
                      {p.name}
                    </h3>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">
                        Character Level
                      </span>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                        Lv. {p.level ?? "—"}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      Karakter #{index + 1} · Klik untuk mengelola →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
            Character Manager · Next.js & MySQL
          </footer>
        </div>
      </section>

      {/* Modal: choose action */}
      {modal === "actions" && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="actions-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700">
              {String(selected.name || "?")
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2
              id="actions-title"
              className="mt-4 text-center text-xl font-bold"
            >
              {selected.name}
            </h2>

            <p className="mt-2 text-center text-sm text-slate-500">
              Level {selected.level ?? "—"} · Pilih tindakan untuk karakter ini.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={openEdit}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg text-blue-700">
                  ✎
                </span>
                <span>
                  <span className="block font-semibold">Edit Karakter</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Ubah nama atau level
                  </span>
                </span>
              </button>

              <button
                onClick={() => setModal("delete")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-red-200 hover:bg-red-50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-lg text-red-600">
                  ×
                </span>
                <span>
                  <span className="block font-semibold text-red-700">
                    Hapus Karakter
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Hapus data dari database
                  </span>
                </span>
              </button>
            </div>

            <button
              onClick={closeModal}
              className="mt-5 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Modal: create or edit */}
      {modal === "form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Character Information
                </p>
                <h2 id="form-title" className="mt-2 text-2xl font-bold">
                  {editingId ? "Edit Karakter" : "Tambah Karakter"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Isi informasi karakter di bawah ini.
                </p>
              </div>

              <button
                onClick={closeModal}
                aria-label="Tutup popup"
                className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Nama Karakter
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama karakter"
                  required
                  maxLength={255}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="mb-2 block text-sm font-medium"
                >
                  Level Karakter
                </label>
                <input
                  id="level"
                  name="level"
                  type="number"
                  min="0"
                  step="1"
                  value={form.level}
                  onChange={handleChange}
                  placeholder="Contoh: 90"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Tambah Karakter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: confirm deletion */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
              !
            </div>

            <h2
              id="delete-title"
              className="mt-4 text-center text-xl font-bold"
            >
              Hapus Karakter?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-slate-500">
              Kamu yakin ingin menghapus karakter{" "}
              <strong className="text-slate-800">{selected.name}</strong>? Data
              ini akan dihapus dari database dan tindakan ini tidak dapat
              dibatalkan.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setModal("actions");
                  setError("");
                }}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
