"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

function formatRupiah(n: number | string) { return new Intl.NumberFormat("id-ID").format(Number(n)); }

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("PinjemLur-token") : "";

  const fetchPackages = () => {
    setLoading(true);
    const url = search ? `${API}/admin/packages?search=${search}&page=${page}` : `${API}/admin/packages?page=${page}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setPackages(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchPackages, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menonaktifkan paket sewa ini?")) return;
    try {
      await fetch(`${API}/admin/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPackages();
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
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Manajemen Paket Sewa</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Kelola bundle produk dan diskon paketan</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Cari paket..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <Link 
            href="/admin/packages/create"
            className="btn-primary" 
            style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
          >
            <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Buat Paket
          </Link>
        </div>
      </div>

      <div className="card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--foreground-muted)" }}>
            Memuat data paket sewa...
          </div>
        ) : packages.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--foreground-muted)" }}>
            Belum ada paket sewa yang tersedia.
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Info Paket", "Isi Produk", "Harga Asli", "Harga Promo", "Diskon", "Status", "Aksi"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontWeight: 600,
                      color: "var(--foreground-muted)", fontSize: "0.8rem",
                      textTransform: "uppercase", letterSpacing: "0.05em", background: "var(--background-secondary)"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((p: any, idx: number) => {
                  const discount = Math.round((1 - p.price_per_day / p.original_price_per_day) * 100);
                  
                  return (
                    <tr key={p.id} className={`animate-fade-in-up delay-${(idx % 5) * 100}`} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--background-secondary)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", background: "var(--background-secondary)", flexShrink: 0 }}>
                          {p.image ? (
                            <img src={p.image.startsWith('http') ? p.image : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${p.image}`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)" }}>📦</div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>Min DP: {p.min_dp_percentage}%</div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {p.products && p.products.map((prod: any) => (
                            <span key={prod.id} style={{ fontSize: "0.75rem", padding: "2px 6px", background: "var(--background-elevated)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                              {prod.pivot.quantity}x {prod.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-muted)", textDecoration: "line-through" }}>
                        Rp {formatRupiah(p.original_price_per_day)}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--primary)" }}>
                        Rp {formatRupiah(p.price_per_day)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {discount > 0 ? (
                          <span className="badge badge-success">Hemat {discount}%</span>
                        ) : "-"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {p.is_active ? (
                          <span className="badge badge-success">Aktif</span>
                        ) : (
                          <span className="badge badge-error">Nonaktif</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <Link
                            href={`/admin/packages/${p.id}/edit`}
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
                            Nonaktif
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
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
