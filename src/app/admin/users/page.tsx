"use client";

import { useEffect, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [blacklistModal, setBlacklistModal] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  const fetchUsers = () => {
    setLoading(true);
    const url = search ? `${API}/admin/users?search=${search}&page=${page}` : `${API}/admin/users?page=${page}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setUsers(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleBlacklist = async (userId: number, isBlacklisted: boolean) => {
    setProcessing(true);
    await fetch(`${API}/admin/users/${userId}/blacklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ is_blacklisted: isBlacklisted, reason }),
    });
    setProcessing(false);
    setBlacklistModal(null);
    setReason("");
    fetchUsers();
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
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Manajemen Pengguna</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Kelola akun pelanggan dan status verifikasi</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="🔍 Cari pengguna..."
          style={{ ...inputStyle, width: "280px" }}
        />
      </div>

      <div className="card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Nama", "Email", "Telepon", "Identitas", "Status", "Terdaftar", "Aksi"].map((h) => (
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
                        <div className="skeleton" style={{ height: "16px", width: `${50 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--foreground-muted)" }}>
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const kycStatus = u.verification?.status || "belum";
                  const kycMap: Record<string, { bg: string; color: string; label: string }> = {
                    belum: { bg: "#f1f5f9", color: "#475569", label: "Belum Submit" },
                    pending: { bg: "#fef3c7", color: "#92400e", label: "Menunggu" },
                    approved: { bg: "#d1fae5", color: "#065f46", label: "Terverifikasi" },
                    rejected: { bg: "#fee2e2", color: "#991b1b", label: "Ditolak" },
                  };
                  const kyc = kycMap[kycStatus] || kycMap.belum;

                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", opacity: u.is_blacklisted ? 0.5 : 1 }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "var(--radius-full)",
                            background: "var(--primary-gradient)", display: "flex", alignItems: "center",
                            justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                            flexShrink: 0,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ fontWeight: 700 }}>{u.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-secondary)" }}>{u.email}</td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-secondary)" }}>{u.phone || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem", fontWeight: 700, background: kyc.bg, color: kyc.color,
                        }}>
                          {kyc.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {u.is_blacklisted ? (
                          <span style={{
                            padding: "4px 10px", borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem", fontWeight: 700, background: "#fee2e2", color: "#991b1b",
                          }}>
                            🚫 Blacklist
                          </span>
                        ) : (
                          <span style={{
                            padding: "4px 10px", borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem", fontWeight: 700, background: "#d1fae5", color: "#065f46",
                          }}>
                            Aktif
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                        {new Date(u.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => setBlacklistModal(u)}
                          style={{
                            padding: "6px 14px", borderRadius: "var(--radius-md)",
                            border: `1px solid ${u.is_blacklisted ? "var(--success)" : "var(--error)"}`,
                            background: "transparent",
                            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                            color: u.is_blacklisted ? "var(--success)" : "var(--error)",
                          }}
                        >
                          {u.is_blacklisted ? "✅ Unblock" : "🚫 Blacklist"}
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* Blacklist Modal */}
      {blacklistModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div className="card" style={{
            width: "100%", maxWidth: "440px", borderRadius: "var(--radius-lg)", padding: "32px",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>
              {blacklistModal.is_blacklisted ? "Unblock Pengguna" : "Blacklist Pengguna"}
            </h3>
            <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
              {blacklistModal.name} ({blacklistModal.email})
            </p>

            {!blacklistModal.is_blacklisted && (
              <>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Alasan Blacklist</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Masukkan alasan..."
                  style={{
                    width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                    color: "var(--foreground)", resize: "vertical", minHeight: "80px",
                    marginBottom: "20px", outline: "none",
                  }}
                />
              </>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setBlacklistModal(null); setReason(""); }}
                style={{
                  flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--background-elevated)",
                  cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleBlacklist(
                  blacklistModal.id,
                  !blacklistModal.is_blacklisted
                )}
                disabled={processing || (!blacklistModal.is_blacklisted && !reason)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                  border: "none",
                  background: blacklistModal.is_blacklisted ? "var(--success)" : "var(--error)",
                  color: "#fff", cursor: "pointer", fontWeight: 600,
                  opacity: processing || (!blacklistModal.is_blacklisted && !reason) ? 0.5 : 1,
                }}
              >
                {processing ? "⏳..." : blacklistModal.is_blacklisted ? "Unblock" : "Blacklist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
