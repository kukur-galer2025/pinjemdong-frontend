"use client";

import { useEffect, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

function formatRupiah(n: number | string) { return new Intl.NumberFormat("id-ID").format(Number(n)); }

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [confirmModal, setConfirmModal] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  const fetchPayments = () => {
    setLoading(true);
    const url = filter ? `${API}/admin/payments?status=${filter}&page=${page}` : `${API}/admin/payments?page=${page}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setPayments(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [filter, page]);

  const handleConfirm = async (status: "confirmed" | "rejected") => {
    if (!confirmModal) return;
    setProcessing(true);
    await fetch(`${API}/admin/payments/${confirmModal.id}/confirm`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
    setProcessing(false);
    setConfirmModal(null);
    setAdminNotes("");
    fetchPayments();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: "#fef3c7", color: "#92400e", label: "Menunggu" },
      confirmed: { bg: "#d1fae5", color: "#065f46", label: "Dikonfirmasi" },
      rejected: { bg: "#fee2e2", color: "#991b1b", label: "Ditolak" },
    };
    const s = map[status] || { bg: "#f1f5f9", color: "#475569", label: status };
    return (
      <span style={{
        padding: "4px 12px", borderRadius: "var(--radius-full)",
        fontSize: "0.75rem", fontWeight: 700, background: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div className="admin-header-flex" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Konfirmasi Pembayaran</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Verifikasi bukti transfer dari pelanggan</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["pending", "confirmed", "rejected", ""].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              style={{
                padding: "8px 16px", borderRadius: "var(--radius-full)",
                border: filter === f ? "none" : "1px solid var(--border)",
                background: filter === f ? "var(--primary)" : "var(--background-elevated)",
                color: filter === f ? "#fff" : "var(--foreground-secondary)",
                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
              }}
            >
              {f === "pending" ? "Menunggu" : f === "confirmed" ? "Dikonfirmasi" : f === "rejected" ? "Ditolak" : "Semua"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "20px" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
              <div className="skeleton" style={{ height: "20px", width: "60%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "16px", width: "80%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "36px", width: "40%", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "100px", width: "100%", borderRadius: "var(--radius-md)" }} />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>💳</div>
          <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>Tidak Ada Pembayaran</h3>
          <p style={{ color: "var(--foreground-muted)" }}>Belum ada pembayaran dengan status ini.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "20px" }}>
          {payments.map((p: any) => (
            <div key={p.id} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.9rem" }}>
                  {p.rental?.invoice_number || "—"}
                </span>
                {statusBadge(p.status)}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "4px" }}>Pelanggan</div>
                <div style={{ fontWeight: 600 }}>{p.rental?.user?.name || "—"}</div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "4px" }}>Jumlah</div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>
                    Rp {formatRupiah(p.amount)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "4px" }}>Metode</div>
                  <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{p.payment_method || "transfer"}</div>
                </div>
              </div>

              {p.proof_image && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "6px" }}>Bukti Transfer</div>
                  <div style={{
                    background: "var(--background-secondary)", borderRadius: "var(--radius-md)",
                    padding: "12px", textAlign: "center", border: "1px solid var(--border)",
                  }}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/storage/${p.proof_image}`}
                      alt="Bukti Transfer"
                      style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "var(--radius-sm)", objectFit: "contain" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "16px" }}>
                Dikirim: {new Date(p.created_at).toLocaleString("id-ID")}
              </div>

              {p.status === "pending" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setConfirmModal(p)}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                  >
                    ✅ Konfirmasi
                  </button>
                  <button
                    onClick={() => { setConfirmModal(p); }}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--error)", background: "transparent",
                      color: "var(--error)", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
                    }}
                  >
                    ❌ Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", marginTop: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--background-elevated)" }}>
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

      {/* Confirm Modal */}
      {confirmModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div className="card" style={{
            width: "100%", maxWidth: "440px", borderRadius: "var(--radius-lg)", padding: "32px",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "16px" }}>Konfirmasi Pembayaran</h3>
            <p style={{ color: "var(--foreground-secondary)", marginBottom: "16px", fontSize: "0.9rem" }}>
              Jumlah: <strong>Rp {formatRupiah(confirmModal.amount)}</strong>
            </p>

            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Catatan Admin (opsional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Catatan untuk pelanggan..."
              style={{
                width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                color: "var(--foreground)", resize: "vertical", minHeight: "80px",
                marginBottom: "20px", outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setConfirmModal(null); setAdminNotes(""); }}
                style={{
                  flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--background-elevated)",
                  cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirm("rejected")}
                disabled={processing}
                style={{
                  flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                  border: "none", background: "var(--error)", color: "#fff",
                  cursor: "pointer", fontWeight: 600, opacity: processing ? 0.5 : 1,
                }}
              >
                Tolak
              </button>
              <button
                onClick={() => handleConfirm("confirmed")}
                disabled={processing}
                className="btn-primary"
                style={{ flex: 1, padding: "12px", opacity: processing ? 0.5 : 1 }}
              >
                {processing ? "⏳..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
