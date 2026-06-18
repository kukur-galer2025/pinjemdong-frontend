"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

function formatRupiah(n: number | string) { return new Intl.NumberFormat("id-ID").format(Number(n)); }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("PinjemLur-token") : "";

  const fetchProducts = () => {
    setLoading(true);
    const url = search ? `${API}/admin/products?search=${search}&page=${page}` : `${API}/admin/products?page=${page}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setProducts(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch(`${API}/categories`).then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timer);
  }, [search, page]);



  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await fetch(`${API}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
    color: "var(--foreground)", fontSize: "0.9rem", outline: "none",
  };

  return (
    <div>
      <div className="admin-header-flex" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Manajemen Produk</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Kelola katalog produk dan harga sewa</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Cari produk..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <Link 
            href="/admin/products/create"
            className="btn-primary" 
            style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
          >
            <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Produk
          </Link>
        </div>
      </div>

      <div className="card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Produk", "Kategori", "Harga/Hari", "Min. DP", "Unit", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontWeight: 600,
                    color: "var(--foreground-muted)", fontSize: "0.8rem",
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    {[...Array(7)].map((__, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div className="skeleton" style={{ height: "16px", width: `${50 + j * 8}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--foreground-muted)" }}>
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                products.map((p: any, idx: number) => (
                  <tr key={p.id} className={`animate-fade-in-up delay-${(idx % 5) * 100}`} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--background-secondary)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>{p.brand}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "var(--radius-full)",
                        background: "var(--primary-light)", color: "var(--primary)",
                        fontSize: "0.78rem", fontWeight: 600,
                      }}>
                        {p.category?.name}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>Rp {formatRupiah(p.price_per_day)}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--primary)" }}>{p.min_dp_percentage}%</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontWeight: 700 }}>{p.units?.length || 0}</span>
                      <span style={{ color: "var(--foreground-muted)", fontSize: "0.8rem" }}> unit</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem", fontWeight: 700,
                        background: p.is_active ? "#d1fae5" : "#fee2e2",
                        color: p.is_active ? "#065f46" : "#991b1b",
                      }}>
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                      {p.is_featured && (
                        <span style={{
                          display: "inline-block", marginLeft: "8px",
                          padding: "4px 8px", borderRadius: "var(--radius-full)",
                          fontSize: "0.7rem", fontWeight: 700,
                          background: "#fef3c7", color: "#d97706",
                        }}>
                          ⭐ Unggulan
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          style={{
                            padding: "6px 14px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "6px",
                            border: "1px solid var(--border)", background: "var(--background-elevated)",
                            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                            color: "var(--primary)", textDecoration: "none"
                          }}
                        >
                          <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            padding: "6px 14px", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "6px",
                            border: "1px solid var(--error-light)", background: "var(--error-light)",
                            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                            color: "var(--error)", textDecoration: "none"
                          }}
                        >
                          <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderTop: "1px solid var(--border)", background: "var(--background-elevated)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", fontWeight: 600 }}>
              Halaman {page} dari {totalPages}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
              >
                <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Sebelumnya
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
              >
                Selanjutnya
                <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
