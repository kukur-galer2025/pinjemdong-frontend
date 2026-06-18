"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface Rental {
  id: number;
  invoice_number: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: string;
  dp_amount: string;
  remaining_amount: string;
  late_fee_amount: string;
  final_total_amount: string;
  final_remaining_amount: string;
  penalty_amount: string | number;
  late_days: number;
  delivery_method: string;
  status: string;
  items: { product_id: number; product: { name: string; primary_image: object | null } }[];
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending_payment: { label: "Menunggu Pembayaran", color: "var(--warning)", bg: "var(--warning-light)" },
  pending_confirmation: { label: "Menunggu Konfirmasi", color: "var(--accent)", bg: "var(--accent-light)" },
  pending: { label: "Menunggu Konfirmasi", color: "var(--warning)", bg: "var(--warning-light)" },
  confirmed: { label: "Dikonfirmasi", color: "var(--primary)", bg: "var(--primary-light)" },
  ready_pickup: { label: "Siap Diambil", color: "var(--success)", bg: "var(--success-light)" },
  delivering: { label: "Sedang Diantar", color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
  rented: { label: "Sedang Disewa", color: "var(--primary)", bg: "var(--primary-light)" },
  returned: { label: "Dikembalikan", color: "var(--success)", bg: "var(--success-light)" },
  completed: { label: "Selesai", color: "var(--success)", bg: "var(--success-light)" },
  cancelled: { label: "Dibatalkan", color: "var(--error)", bg: "var(--error-light)" },
};

export default function DashboardOrdersPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Review modal state
  const [reviewModal, setReviewModal] = useState<{ rentalId: number; productId: number; productName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState<File | null>(null);

  // Payment modal state
  const [payModal, setPayModal] = useState<{ rentalId: number; totalAmount: string | number; dpAmount: string | number; remainingAmount: string | number; penaltyAmount: string | number; lateDays: number; } | null>(null);
  const [payType, setPayType] = useState<"dp" | "full_payment" | "remaining">("dp");
  const [payAmount, setPayAmount] = useState("");
  const [payProof, setPayProof] = useState<File | null>(null);
  const [paySaving, setPaySaving] = useState(false);
  const [payMsg, setPayMsg] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [payHistory, setPayHistory] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paySummary, setPaySummary] = useState<any>(null);
  const [payLoading, setPayLoading] = useState(false);

  // Load payment details when modal opens
  const loadPaymentDetails = async (rentalId: number) => {
    setPayLoading(true);
    const token = localStorage.getItem("PinjemLur-token");
    try {
      const res = await fetch(`${API_URL}/rentals/${rentalId}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayHistory(data.payments || []);
      setPaySummary(data.summary || null);
      // Auto-select correct payment type
      if (data.summary) {
        if (data.summary.total_confirmed > 0 && data.summary.remaining > 0) {
          setPayType("remaining");
          setPayAmount(String(data.summary.remaining));
        } else if (data.summary.total_confirmed === 0) {
          setPayType("dp");
          setPayAmount(String(data.summary.min_dp));
        }
      }
    } catch { /* ignore */ }
    setPayLoading(false);
  };

  // Auto-fill amount when payment type changes
  useEffect(() => {
    if (payModal && paySummary) {
      const total = Number(paySummary.total_amount);
      const remaining = Number(paySummary.remaining);
      const minDp = Number(paySummary.min_dp);

      if (payType === "dp") {
        setPayAmount(String(minDp));
      } else if (payType === "full_payment") {
        setPayAmount(String(total));
      } else if (payType === "remaining") {
        setPayAmount(String(remaining));
      }
    }
  }, [payType, payModal, paySummary]);

  useEffect(() => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    Promise.all([
      fetch(`${API_URL}/rentals`, { headers }).then((res) => res.json()).then((data) => setRentals(data.data || data || [])),
      fetch(`${API_URL}/bank-accounts`).then((res) => res.json()).then((data) => setBankAccounts(data.bank_accounts || [])),
    ])
      .then(() => {
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    setReviewSaving(true);
    setReviewMsg("");
    const token = localStorage.getItem("PinjemLur-token");
    
    const formData = new FormData();
    formData.append("product_id", reviewModal.productId.toString());
    formData.append("rental_id", reviewModal.rentalId.toString());
    formData.append("rating", reviewRating.toString());
    if (reviewComment) formData.append("comment", reviewComment);
    if (reviewPhoto) formData.append("photo", reviewPhoto);

    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    
    if (res.ok) {
      setReviewMsg("✅ Ulasan berhasil dikirim!");
      setTimeout(() => { setReviewModal(null); setReviewMsg(""); setReviewComment(""); setReviewRating(5); setReviewPhoto(null); }, 1500);
    } else {
      setReviewMsg("❌ Gagal mengirim ulasan.");
    }
    setReviewSaving(false);
  };

  const handleUploadPayment = async () => {
    if (!payModal || !payProof || !payAmount) return;
    setPaySaving(true);
    setPayMsg("");
    const token = localStorage.getItem("PinjemLur-token");

    const formData = new FormData();
    formData.append("type", payType);
    formData.append("amount", payAmount);
    formData.append("proof_image", payProof);

    try {
      const res = await fetch(`${API_URL}/rentals/${payModal.rentalId}/payments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPayMsg("✅ Bukti pembayaran berhasil dikirim! Menunggu konfirmasi admin.");
        // Reload rentals
        const headers2 = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        fetch(`${API_URL}/rentals`, { headers: headers2 }).then(r => r.json()).then(d => setRentals(d.data || d || []));
        setTimeout(() => { setPayModal(null); setPayMsg(""); setPayProof(null); setPayAmount(""); setPayHistory([]); setPaySummary(null); }, 2500);
      } else {
        setPayMsg(`❌ ${data.message || "Gagal mengunggah bukti."}`);
      }
    } catch {
      setPayMsg("❌ Gagal terhubung ke server.");
    }
    setPaySaving(false);
  };

  if (loading) {
    return <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />;
  }

  return (
    <>
      <div className="animate-fade-in">
      {rentals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--foreground-muted)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📭</div>
          <h3 style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>Belum Ada Pesanan</h3>
          <p>Anda belum pernah menyewa barang. Yuk mulai!</p>
          <Link href="/catalog" className="btn-primary" style={{ marginTop: "24px", display: "inline-flex" }}>
            Jelajahi Katalog
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {rentals.map((rental) => {
            let status = statusLabels[rental.status] || { label: rental.status, color: "var(--foreground-muted)", bg: "var(--background-secondary)" };
            // Override: if confirmed but fully paid, show LUNAS badge
            const isFullyPaid = Number(rental.remaining_amount) <= 0 && Number(rental.dp_amount) > 0;
            if (isFullyPaid && (rental.status === "confirmed" || rental.status === "ready_pickup" || rental.status === "delivering" || rental.status === "rented")) {
              status = { ...status, label: status.label + " • LUNAS", color: "var(--success)", bg: "var(--success-light)" };
            }
            const canReview = rental.status === "returned" || rental.status === "completed";
            const canPay = rental.status === "pending_payment" || rental.status === "pending_confirmation" || rental.status === "confirmed" || rental.status === "rented" || rental.status === "returned";
            return (
              <div key={rental.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontFamily: "monospace" }}>{rental.invoice_number}</span>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rental.items.map((item) => item.product.name).join(", ")}
                    </h3>
                  </div>
                  <span className="badge" style={{ background: status.bg, color: status.color, flexShrink: 0, fontSize: "0.7rem" }}>{status.label}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "0.85rem", marginBottom: "14px" }}>
                  <div>
                    <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.75rem" }}>Tanggal Sewa</span>
                    <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{formatDate(rental.start_date)} — {formatDate(rental.end_date)}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.75rem" }}>Total Keseluruhan</span>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>Rp {formatRupiah(rental.final_total_amount)}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.75rem" }}>Sudah Bayar</span>
                    <span style={{ fontWeight: 600, color: "var(--success)" }}>Rp {formatRupiah(rental.dp_amount)}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--foreground-muted)", display: "block", fontSize: "0.75rem" }}>Sisa Tagihan</span>
                    <span style={{ fontWeight: 600, color: Number(rental.final_remaining_amount) > 0 ? "var(--error)" : "var(--success)" }}>
                      {Number(rental.final_remaining_amount) <= 0 ? "✅ LUNAS" : `Rp ${formatRupiah(rental.final_remaining_amount)}`}
                    </span>
                  </div>
                </div>
                {Number(rental.penalty_amount) > 0 && (
                  <div style={{ background: "var(--error-light)", border: "1px solid var(--error)", padding: "10px", borderRadius: "var(--radius-md)", fontSize: "0.8rem", color: "var(--error)", fontWeight: 600 }}>
                    ⚠️ Anda terlambat mengembalikan barang {rental.late_days} hari. Dikenakan denda sebesar Rp {formatRupiah(rental.penalty_amount)}.
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                  {canPay && !isFullyPaid && (
                    <button
                      onClick={() => {
                        setPayModal({
                          rentalId: rental.id,
                          totalAmount: rental.final_total_amount,
                          dpAmount: rental.dp_amount,
                          remainingAmount: rental.final_remaining_amount,
                          penaltyAmount: rental.penalty_amount || 0,
                          lateDays: rental.late_days || 0
                        });
                        setPayProof(null);
                        setPayMsg("");
                        setPayHistory([]);
                        setPaySummary(null);
                        loadPaymentDetails(rental.id);
                      }}
                      className="btn-primary"
                      style={{
                        padding: "10px 18px", fontSize: "0.8rem", borderRadius: "var(--radius-md)",
                      }}
                    >
                      💳 {rental.status === "pending_confirmation" ? "Lihat Pembayaran" : Number(rental.remaining_amount) > 0 && Number(rental.dp_amount) > 0 ? "Lunasi Sisa" : "Bayar Sekarang"}
                    </button>
                  )}
                  {/* View payment history for fully paid */}
                  {isFullyPaid && canPay && (
                    <button
                      onClick={() => {
                        setPayModal({
                          rentalId: rental.id,
                          totalAmount: (Number(rental.total_amount) || 0) + (Number(rental.penalty_amount) || 0),
                          dpAmount: rental.dp_amount,
                          remainingAmount: (Number(rental.remaining_amount) || 0) + (Number(rental.penalty_amount) || 0),
                          penaltyAmount: rental.penalty_amount || 0,
                          lateDays: rental.late_days || 0
                        });
                        setPayProof(null);
                        setPayMsg("");
                        setPayHistory([]);
                        setPaySummary(null);
                        loadPaymentDetails(rental.id);
                      }}
                      style={{
                        padding: "10px 18px", fontSize: "0.8rem", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--success)", background: "transparent",
                        color: "var(--success)", cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      ✅ Lihat Pembayaran
                    </button>
                  )}
                  {canReview && rental.items.map((item) => (
                    <button
                      key={item.product_id}
                      onClick={() => setReviewModal({ rentalId: rental.id, productId: item.product_id, productName: item.product.name })}
                      style={{
                        padding: "10px 18px", fontSize: "0.8rem", borderRadius: "var(--radius-md)",
                        border: "1px solid var(--accent)", background: "transparent",
                        color: "var(--accent)", cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      ⭐ Review {item.product.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Review Modal */}
      {mounted && reviewModal && createPortal(
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "460px", borderRadius: "var(--radius-lg)", padding: "32px" }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }}>⭐ Beri Ulasan</h3>
            <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>{reviewModal.productName}</p>

            {reviewMsg && (
              <div style={{
                padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "16px",
                background: reviewMsg.startsWith("✅") ? "var(--success-light)" : "var(--error-light)",
                color: reviewMsg.startsWith("✅") ? "var(--success)" : "var(--error)",
                fontWeight: 600, fontSize: "0.9rem",
              }}>{reviewMsg}</div>
            )}

            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "10px" }}>Rating</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewRating(star)} style={{
                  width: "48px", height: "48px", borderRadius: "var(--radius-md)",
                  border: reviewRating >= star ? "2px solid var(--accent)" : "1px solid var(--border)",
                  background: reviewRating >= star ? "var(--accent-light)" : "var(--background-elevated)",
                  cursor: "pointer", fontSize: "1.4rem", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {reviewRating >= star ? "★" : "☆"}
                </button>
              ))}
            </div>

            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Komentar (opsional)</label>
            <textarea
              value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              style={{
                width: "100%", padding: "12px", borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                color: "var(--foreground)", resize: "vertical", minHeight: "80px",
                marginBottom: "16px", outline: "none", fontSize: "0.95rem",
              }}
            />

            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Foto (opsional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setReviewPhoto(e.target.files?.[0] || null)}
              style={{
                width: "100%", padding: "10px", borderRadius: "var(--radius-md)",
                border: "1.5px dashed var(--border)", background: "var(--background-elevated)",
                marginBottom: "20px", fontSize: "0.85rem", color: "var(--foreground-secondary)"
              }}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setReviewModal(null); setReviewMsg(""); setReviewPhoto(null); }} style={{
                flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: "var(--background-elevated)",
                cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
              }}>Batal</button>
              <button onClick={handleSubmitReview} disabled={reviewSaving} className="btn-primary" style={{ flex: 1, padding: "12px", opacity: reviewSaving ? 0.5 : 1 }}>
                {reviewSaving ? "⏳..." : "Kirim Ulasan"}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Payment Modal */}
      {mounted && payModal && createPortal(
        <div onClick={(e) => { if (e.target === e.currentTarget) { setPayModal(null); setPayMsg(""); setPayProof(null); setPayHistory([]); setPaySummary(null); }}} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "80px 16px 24px 16px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "560px", borderRadius: "var(--radius-lg)", padding: "0", maxHeight: "100%", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", background: "var(--background-card)" }}>

            {/* Header */}
            <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--background-card)", zIndex: 2, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontWeight: 800, fontSize: "1.15rem" }}>💳 Pembayaran</h3>
                <button onClick={() => { setPayModal(null); setPayMsg(""); setPayProof(null); setPayHistory([]); setPaySummary(null); }} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--foreground-muted)" }}>✕</button>
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* Info Tagihan Utama yang Cerdas & Rinci */}
              <div style={{ background: "var(--background-secondary)", padding: "20px", borderRadius: "var(--radius-lg)", marginBottom: "24px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--foreground-secondary)" }}>Total Harga Sewa</span>
                  <span style={{ fontWeight: 600 }}>Rp {formatRupiah((Number(payModal.totalAmount) - Number(payModal.penaltyAmount)) || 0)}</span>
                </div>
                {Number(payModal.penaltyAmount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem", color: "var(--error)" }}>
                    <span style={{ fontWeight: 600 }}>Denda Keterlambatan ({payModal.lateDays} Hari)</span>
                    <span style={{ fontWeight: 700 }}>+ Rp {formatRupiah(payModal.penaltyAmount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
                  <span style={{ color: "var(--foreground-secondary)" }}>Sudah Dibayar <span className="badge" style={{ fontSize: "0.65rem", background: "var(--success-light)", color: "var(--success)" }}>Dikonfirmasi</span></span>
                  <span style={{ fontWeight: 600, color: "var(--success)" }}>- Rp {formatRupiah(paySummary?.total_confirmed || 0)}</span>
                </div>
                
                {paySummary?.total_pending > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.95rem" }}>
                    <span style={{ color: "var(--foreground-secondary)" }}>Menunggak Konfirmasi <span className="badge" style={{ fontSize: "0.65rem", background: "var(--warning-light)", color: "var(--warning)" }}>Pending</span></span>
                    <span style={{ fontWeight: 600, color: "var(--warning)" }}>- Rp {formatRupiah(paySummary.total_pending)}</span>
                  </div>
                )}
                
                <div style={{ borderTop: "2px dashed var(--border)", paddingTop: "16px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>Sisa Tagihan</span>
                  <span style={{ fontWeight: 800, fontSize: "1.3rem", color: Number(payModal.remainingAmount) > 0 ? "var(--error)" : "var(--success)" }}>
                    {Number(payModal.remainingAmount) <= 0 ? "✅ LUNAS" : `Rp ${formatRupiah(payModal.remainingAmount)}`}
                  </span>
                </div>
              </div>

              {payLoading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <div className="skeleton" style={{ height: "40px", width: "40px", borderRadius: "50%", margin: "0 auto 16px" }}></div>
                  <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>Memuat riwayat pembayaran...</p>
                </div>
              ) : (
                <>
                  {/* Riwayat Pembayaran */}
                  {payHistory.length > 0 && (
                    <div style={{ marginBottom: "28px" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        Riwayat Transaksi <span className="badge" style={{ fontSize: "0.7rem", background: "var(--primary-light)", color: "var(--primary)" }}>{payHistory.length}</span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {payHistory.map((pay) => (
                          <div key={pay.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--background-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", fontSize: "0.85rem" }}>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "2px" }}>{pay.payment_type === 'dp' ? 'Down Payment (DP)' : pay.payment_type === 'full_payment' ? 'Pembayaran Penuh' : 'Pelunasan Sisa'}</div>
                              <div style={{ color: "var(--foreground-muted)", fontSize: "0.75rem" }}>{formatDate(pay.created_at)}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontWeight: 700, marginBottom: "4px" }}>Rp {formatRupiah(pay.amount)}</div>
                              <span className="badge" style={{ 
                                fontSize: "0.65rem", padding: "2px 6px",
                                background: pay.status === 'confirmed' ? 'var(--success-light)' : pay.status === 'rejected' ? 'var(--error-light)' : 'var(--warning-light)',
                                color: pay.status === 'confirmed' ? 'var(--success)' : pay.status === 'rejected' ? 'var(--error)' : 'var(--warning)'
                              }}>
                                {pay.status === 'confirmed' ? '✅ Dikonfirmasi' : pay.status === 'rejected' ? '❌ Ditolak' : '⏳ Menunggu'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Upload Bukti Baru (Hanya jika belum lunas) */}
                  {Number(payModal.remainingAmount) > 0 && (
                    <div style={{ borderTop: "2px dashed var(--border)", paddingTop: "24px", marginTop: "8px" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "16px" }}>Upload Pembayaran Baru</h4>
                      
                      {payMsg && (
                        <div style={{
                          padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "16px",
                          background: payMsg.startsWith("✅") ? "var(--success-light)" : "var(--error-light)",
                          color: payMsg.startsWith("✅") ? "var(--success)" : "var(--error)",
                          fontWeight: 600, fontSize: "0.85rem",
                        }}>{payMsg}</div>
                      )}

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "12px" }}>Pilih Opsi Pembayaran</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          {paySummary?.total_confirmed === 0 && (
                            <>
                              <div 
                                onClick={() => setPayType("dp")}
                                style={{
                                  padding: "16px", borderRadius: "var(--radius-md)", cursor: "pointer",
                                  border: payType === "dp" ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                                  background: payType === "dp" ? "var(--primary-light)" : "var(--background-elevated)",
                                  transition: "all 0.2s", position: "relative", overflow: "hidden"
                                }}
                              >
                                {payType === "dp" && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--primary)", color: "#fff", padding: "2px 8px", fontSize: "0.65rem", fontWeight: "bold", borderBottomLeftRadius: "8px" }}>PILIHAN</div>}
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: payType === "dp" ? "var(--primary)" : "var(--foreground-secondary)" }}>Bayar DP Dulu</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)", marginTop: "4px" }}>Rp {formatRupiah(paySummary.min_dp)}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "4px" }}>Min. 30% dari total</div>
                              </div>
                              <div 
                                onClick={() => setPayType("full_payment")}
                                style={{
                                  padding: "16px", borderRadius: "var(--radius-md)", cursor: "pointer",
                                  border: payType === "full_payment" ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                                  background: payType === "full_payment" ? "var(--primary-light)" : "var(--background-elevated)",
                                  transition: "all 0.2s", position: "relative", overflow: "hidden"
                                }}
                              >
                                {payType === "full_payment" && <div style={{ position: "absolute", top: 0, right: 0, background: "var(--primary)", color: "#fff", padding: "2px 8px", fontSize: "0.65rem", fontWeight: "bold", borderBottomLeftRadius: "8px" }}>PILIHAN</div>}
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: payType === "full_payment" ? "var(--primary)" : "var(--foreground-secondary)" }}>Bayar Lunas</div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)", marginTop: "4px" }}>Rp {formatRupiah(paySummary.total_amount)}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--success)", marginTop: "4px", fontWeight: 600 }}>Tanpa ribet pelunasan!</div>
                              </div>
                            </>
                          )}
                          
                          {paySummary?.total_confirmed > 0 && (
                             <div 
                                onClick={() => setPayType("remaining")}
                                style={{
                                  gridColumn: "1 / -1",
                                  padding: "16px", borderRadius: "var(--radius-md)", cursor: "pointer",
                                  border: payType === "remaining" ? "2px solid var(--primary)" : "1.5px solid var(--border)",
                                  background: payType === "remaining" ? "var(--primary-light)" : "var(--background-elevated)",
                                  transition: "all 0.2s",
                                  display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: payType === "remaining" ? "var(--primary)" : "var(--foreground-secondary)" }}>Pelunasan Sisa Tagihan</div>
                                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "4px" }}>Wajib lunas sebelum pengembalian</div>
                                </div>
                                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--foreground)" }}>Rp {formatRupiah(paySummary.remaining)}</div>
                              </div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "12px" }}>Nominal yang Harus Ditransfer</label>
                        <div style={{
                            width: "100%", padding: "16px", borderRadius: "var(--radius-md)",
                            border: "1.5px solid var(--primary)", background: "var(--primary-light)",
                            display: "flex", alignItems: "center", justifyContent: "space-between"
                          }}>
                          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>
                            Rp {formatRupiah(Number(payAmount || 0))}
                          </div>
                          <div style={{ fontSize: "0.7rem", fontWeight: 800, background: "var(--primary)", color: "#fff", padding: "4px 8px", borderRadius: "6px", letterSpacing: "0.5px" }}>
                            NOMINAL PASTI
                          </div>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "var(--foreground-secondary)", marginTop: "10px", lineHeight: 1.4 }}>
                          ℹ️ Sistem telah menghitung nominal ini secara otomatis berdasarkan pilihan pembayaran Anda (termasuk denda jika ada). Silakan transfer <b>tepat</b> sesuai angka di atas.
                        </p>
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "12px" }}>Transfer ke Rekening</label>
                        <div style={{ display: "grid", gap: "10px" }}>
                          {bankAccounts.map((bank) => (
                            <div key={bank.id} style={{
                              padding: "16px", borderRadius: "var(--radius-md)",
                              border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ background: "var(--background)", width: "42px", height: "42px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--primary)", border: "1px solid var(--border)", fontSize: "0.85rem" }}>
                                  {bank.bank_name.substring(0, 3).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--foreground)", marginBottom: "2px" }}>{bank.bank_name}</div>
                                  <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>a/n {bank.account_name}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 800, letterSpacing: "1px", fontSize: "1.05rem", color: "var(--primary)" }}>{bank.account_number}</div>
                                <button onClick={() => { navigator.clipboard.writeText(bank.account_number); alert("Nomor rekening berhasil disalin!"); }} style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--accent)", cursor: "pointer", marginTop: "4px", fontWeight: 700, padding: 0 }}>Salin 📋</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: "24px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Bukti Transfer (Gambar)</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && file.size > 2 * 1024 * 1024) {
                                alert("Ukuran file maksimal 2MB!");
                                e.target.value = '';
                                return;
                              }
                              setPayProof(file || null);
                            }}
                            style={{
                              position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2
                            }}
                          />
                          <div style={{
                            padding: "24px", borderRadius: "var(--radius-md)", border: payProof ? "2px solid var(--primary)" : "2px dashed var(--border)",
                            background: payProof ? "var(--primary-light)" : "var(--background-elevated)", textAlign: "center",
                            transition: "all 0.2s"
                          }}>
                            {payProof ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{ background: "var(--primary)", color: "#fff", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>✓</div>
                                <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.95rem" }}>{payProof.name}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{(payProof.size / 1024 / 1024).toFixed(2)} MB • Klik untuk mengganti gambar</div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                <div style={{ background: "var(--background)", color: "var(--foreground-muted)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>📸</div>
                                <div style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.95rem" }}>Klik atau Tarik Foto Kesini</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>Format: JPG, JPEG, PNG (Maksimal 2 MB)</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleUploadPayment}
                        disabled={paySaving || !payProof || !payAmount}
                        className="btn-primary"
                        style={{ width: "100%", padding: "14px", fontSize: "0.95rem", opacity: paySaving || !payProof || !payAmount ? 0.5 : 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                      >
                        {paySaving ? "⏳ Mengunggah..." : "📤 Kirim Bukti Pembayaran"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
