"use client";

import { useEffect, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "");

export default function AdminKYC() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  const fetchKyc = () => {
    setLoading(true);
    fetch(`${API}/admin/kyc?page=${page}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setVerifications(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchKyc(); }, [page]);

  const handleAction = async (id: number, status: "approved" | "rejected") => {
    setProcessing(true);
    await fetch(`${API}/admin/kyc/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, rejection_reason: rejectionReason }),
    });
    setProcessing(false);
    setDetail(null);
    setRejectionReason("");
    fetchKyc();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: "#fef3c7", color: "#92400e", label: "Menunggu Review" },
      approved: { bg: "#d1fae5", color: "#065f46", label: "Terverifikasi" },
      rejected: { bg: "#fee2e2", color: "#991b1b", label: "Ditolak" },
    };
    const s = map[status] || { bg: "#f1f5f9", color: "#475569", label: status };
    return (
      <span style={{
        padding: "5px 14px", borderRadius: "var(--radius-full)",
        fontSize: "0.78rem", fontWeight: 700, background: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Verifikasi Identitas</h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Review dan verifikasi identitas pelanggan</p>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "20px" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
              <div className="skeleton" style={{ height: "20px", width: "50%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "120px", width: "100%", borderRadius: "var(--radius-md)", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "16px", width: "70%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "36px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : verifications.length === 0 ? (
        <div className="card" style={{ padding: "60px", textAlign: "center", borderRadius: "var(--radius-lg)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🛡️</div>
          <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>Tidak Ada Verifikasi</h3>
          <p style={{ color: "var(--foreground-muted)" }}>Belum ada data verifikasi identitas yang masuk.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "20px" }}>
          {verifications.map((v: any) => (
            <div key={v.id} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>{v.user?.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>{v.user?.email}</div>
                </div>
                {statusBadge(v.status)}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "6px", fontWeight: 600 }}>Foto KTP</div>
                  <div style={{
                    background: "var(--background-secondary)", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)", overflow: "hidden", height: "100px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {v.ktp_image ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/storage/${v.ktp_image}`} alt="KTP"
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setDetail(v)}
                      />
                    ) : <span style={{ color: "var(--foreground-muted)" }}>—</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginBottom: "6px", fontWeight: 600 }}>Selfie + KTP</div>
                  <div style={{
                    background: "var(--background-secondary)", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)", overflow: "hidden", height: "100px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {v.selfie_image ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/storage/${v.selfie_image}`} alt="Selfie"
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setDetail(v)}
                      />
                    ) : <span style={{ color: "var(--foreground-muted)" }}>—</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 600 }}>No. KTP</div>
                  <div style={{ fontWeight: 600, fontFamily: "monospace", fontSize: "0.9rem" }}>{v.ktp_number}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 600 }}>Kontak Darurat</div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{v.emergency_contact_name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-secondary)" }}>{v.emergency_contact_phone}</div>
                </div>
              </div>

              {v.address && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 600, marginBottom: "4px" }}>Alamat</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--foreground-secondary)" }}>{v.address}</div>
                </div>
              )}

              {v.status === "pending" && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleAction(v.id, "approved")}
                    disabled={processing}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                  >
                    ✅ Terima
                  </button>
                  <button
                    onClick={() => setDetail(v)}
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

              {v.status === "rejected" && v.rejection_reason && (
                <div style={{
                  padding: "12px", borderRadius: "var(--radius-md)",
                  background: "var(--error-light)", fontSize: "0.85rem", color: "var(--error)",
                }}>
                  <strong>Alasan Penolakan:</strong> {v.rejection_reason}
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

      {/* Detail/Rejection Modal */}
      {detail && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div className="card" style={{
            width: "100%", maxWidth: "600px", borderRadius: "var(--radius-lg)",
            padding: "32px", maxHeight: "90vh", overflowY: "auto",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "20px" }}>
              Detail Verifikasi Identitas — {detail.user?.name}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "8px", fontWeight: 600 }}>Foto KTP</div>
                {detail.ktp_image && (
                  <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/storage/${detail.ktp_image}`} alt="KTP"
                    style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginBottom: "8px", fontWeight: 600 }}>Selfie + KTP</div>
                {detail.selfie_image && (
                  <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/storage/${detail.selfie_image}`} alt="Selfie"
                    style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} />
                )}
              </div>
            </div>

            {detail.status === "pending" && (
              <>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                  Alasan Penolakan (jika ditolak)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan..."
                  style={{
                    width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                    color: "var(--foreground)", resize: "vertical", minHeight: "80px",
                    marginBottom: "20px", outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { setDetail(null); setRejectionReason(""); }}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)", background: "var(--background-elevated)",
                      cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleAction(detail.id, "rejected")}
                    disabled={processing || !rejectionReason}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                      border: "none", background: "var(--error)", color: "#fff",
                      cursor: "pointer", fontWeight: 600,
                      opacity: processing || !rejectionReason ? 0.5 : 1,
                    }}
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleAction(detail.id, "approved")}
                    disabled={processing}
                    className="btn-primary"
                    style={{ flex: 1, padding: "12px", opacity: processing ? 0.5 : 1 }}
                  >
                    Terima
                  </button>
                </div>
              </>
            )}

            {detail.status !== "pending" && (
              <button
                onClick={() => setDetail(null)}
                style={{
                  width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--background-elevated)",
                  cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
                }}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
