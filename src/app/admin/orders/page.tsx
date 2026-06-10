"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

const statusOptions = [
  { value: "pending_payment", label: "Menunggu Pembayaran" },
  { value: "pending", label: "Menunggu Konfirmasi" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "ready_pickup", label: "Siap Ambil" },
  { value: "delivering", label: "Diantar" },
  { value: "rented", label: "Disewa" },
  { value: "returned", label: "Dikembalikan" },
  { value: "cancelled", label: "Dibatalkan" },
];

const statusMap: Record<string, { bg: string; color: string; label: string }> = {
  pending_payment: { bg: "#f3f4f6", color: "#4b5563", label: "Menunggu Pembayaran" },
  pending: { bg: "#fef3c7", color: "#92400e", label: "Menunggu Konfirmasi" },
  confirmed: { bg: "#d1fae5", color: "#065f46", label: "Dikonfirmasi" },
  ready_pickup: { bg: "#dbeafe", color: "#1e40af", label: "Siap Ambil" },
  delivering: { bg: "#e0e7ff", color: "#3730a3", label: "Diantar" },
  rented: { bg: "#dbeafe", color: "#1e40af", label: "Disewa" },
  returned: { bg: "#ede9fe", color: "#5b21b6", label: "Dikembalikan" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Dibatalkan" },
};

function formatRupiah(n: number | string) { return new Intl.NumberFormat("id-ID").format(Number(n)); }

export default function AdminOrders() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [modalRental, setModalRental] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [returnCondition, setReturnCondition] = useState("perfect");
  const [returnNotes, setReturnNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  const fetchRentals = () => {
    setLoading(true);
    const url = filter ? `${API}/admin/rentals?status=${filter}&page=${page}` : `${API}/admin/rentals?page=${page}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { 
        setRentals(data.data || []); 
        setTotalPages(data.last_page || 1);
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRentals(); }, [filter, page]);

  const handleExport = () => {
    setExporting(true);
    const url = filter ? `${API}/admin/rentals/export?status=${filter}` : `${API}/admin/rentals/export`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `laporan-transaksi-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setTimeout(() => setExporting(false), 800); // give a tiny delay to show success
    })
    .catch((err) => {
      console.error(err);
      setExporting(false);
    });
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    const url = filter ? `${API}/admin/rentals/export/pdf?status=${filter}` : `${API}/admin/rentals/export/pdf`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `laporan-transaksi-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setTimeout(() => setExportingPdf(false), 800);
    })
    .catch((err) => {
      console.error(err);
      setExportingPdf(false);
    });
  };

  const handleUpdateStatus = async () => {
    if (!modalRental || !newStatus) return;
    setUpdating(true);
    const body: any = { status: newStatus };
    if (newStatus === "returned") {
      body.return_condition = returnCondition;
      body.return_notes = returnNotes;
    }
    try {
      const res = await fetch(`${API}/admin/rentals/${modalRental.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Status pesanan berhasil diperbarui!");
      } else {
        const err = await res.json();
        toast.error(err.message || "Gagal memperbarui status.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setUpdating(false);
      setModalRental(null);
      fetchRentals();
    }
  };

  const handlePrintInvoice = () => {
    if (!modalRental) return;
    const url = `${API}/admin/rentals/${modalRental.id}/invoice`;
    
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      if (!response.ok) throw new Error("Gagal mencetak PDF");
      return response.blob();
    })
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `invoice-${modalRental.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("PDF Invoice berhasil diunduh!");
    })
    .catch((err) => {
      console.error(err);
      toast.error("Gagal mengunduh PDF Invoice.");
    });
  };

  const selectStyle = {
    padding: "10px 14px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
    color: "var(--foreground)", fontSize: "0.9rem", cursor: "pointer", outline: "none",
  };

  return (
    <div>
      <div className="admin-header-flex" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Manajemen Pesanan</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Kelola semua penyewaan barang</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", background: "var(--background-elevated)", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", paddingRight: "12px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Filter</span>
            <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} style={{...selectStyle, border: "none", background: "transparent", padding: "4px 8px", boxShadow: "none"}}>
              <option value="">Semua Status</option>
              <option value="pending_payment">Menunggu Pembayaran</option>
              <option value="pending">Menunggu Konfirmasi</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="ready_pickup">Siap Ambil</option>
              <option value="delivering">Diantar</option>
              <option value="rented">Disewa</option>
              <option value="returned">Dikembalikan</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            disabled={exporting}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "var(--radius-full)", 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
              color: "#fff", 
              border: "none", 
              cursor: exporting ? "not-allowed" : "pointer", 
              fontSize: "0.85rem", 
              fontWeight: 700,
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              opacity: exporting ? 0.8 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            className="hover-scale"
          >
            {exporting ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Menyiapkan...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h2"></path><path d="M8 17h2"></path><path d="M14 13h2"></path><path d="M14 17h2"></path></svg>
                Excel
              </>
            )}
          </button>
          <button 
            onClick={handleExportPdf}
            disabled={exportingPdf}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "var(--radius-full)", 
              background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", 
              color: "#fff", 
              border: "none", 
              cursor: exportingPdf ? "not-allowed" : "pointer", 
              fontSize: "0.85rem", 
              fontWeight: 700,
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
              opacity: exportingPdf ? 0.8 : 1,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            className="hover-scale"
          >
            {exportingPdf ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                Menyiapkan...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Invoice", "Pelanggan", "Barang", "Total", "Status", "Tanggal", "Aksi"].map((h) => (
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
                      <td key={j} style={{ padding: "16px" }}>
                        <div className="skeleton" style={{ height: "16px", width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--foreground-muted)" }}>
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                rentals.map((r: any) => {
                  const s = statusMap[r.status] || { bg: "#f1f5f9", color: "#475569", label: r.status };
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 600, fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {r.invoice_number}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>{r.user?.email}</div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-secondary)", maxWidth: "200px" }}>
                        {r.items?.map((i: any) => i.product?.name).join(", ")}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>
                        Rp {formatRupiah(r.total_amount || 0)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem", fontWeight: 700, background: s.bg, color: s.color,
                        }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                        {new Date(r.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => { setModalRental(r); setNewStatus(""); }}
                          style={{
                            padding: "6px 14px", borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)", background: "var(--background-elevated)",
                            cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
                            color: "var(--primary)",
                          }}
                        >
                          Update
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

      {/* Status Update Modal */}
      {modalRental && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px",
        }}>
          <div className="card" style={{
            width: "100%", maxWidth: "480px", borderRadius: "var(--radius-lg)",
            padding: "32px", animation: "fadeInUp 0.3s ease",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "4px" }}>Update Status Pesanan</h3>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", margin: 0 }}>
                Invoice: <strong>{modalRental.invoice_number}</strong>
              </p>
              <button 
                onClick={handlePrintInvoice}
                style={{ 
                  background: "transparent", border: "1px solid var(--border)", 
                  padding: "4px 10px", borderRadius: "var(--radius-sm)", 
                  fontSize: "0.8rem", fontWeight: 600, color: "var(--primary)",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                }}
                className="hover-scale"
              >
                🖨️ Cetak PDF
              </button>
            </div>

            <div style={{ background: "var(--background-secondary)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--foreground-secondary)", fontSize: "0.85rem" }}>Total Sewa:</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Rp {formatRupiah(modalRental.subtotal || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "var(--foreground-secondary)", fontSize: "0.85rem" }}>Ongkir:</span>
                <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Rp {formatRupiah(modalRental.delivery_cost || 0)}</span>
              </div>
              {Number(modalRental.penalty_amount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "var(--error)" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Denda Telat ({modalRental.late_days} Hari):</span>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>+ Rp {formatRupiah(modalRental.penalty_amount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border)" }}>
                <span style={{ color: "var(--foreground)", fontSize: "0.85rem", fontWeight: 700 }}>Total Tagihan Akhir:</span>
                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--primary)" }}>Rp {formatRupiah(modalRental.final_total_amount || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--foreground)", fontSize: "0.85rem", fontWeight: 700 }}>Sisa Tagihan (Belum Lunas):</span>
                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--error)" }}>Rp {formatRupiah(modalRental.final_remaining_amount || 0)}</span>
              </div>
            </div>

            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Status Baru</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ ...selectStyle, width: "100%", marginBottom: "16px" }}>
              <option value="">Pilih status...</option>
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {newStatus === "returned" && (
              <>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Kondisi Barang</label>
                <select value={returnCondition} onChange={(e) => setReturnCondition(e.target.value)} style={{ ...selectStyle, width: "100%", marginBottom: "16px" }}>
                  <option value="perfect">Sempurna</option>
                  <option value="minor_damage">Kerusakan Ringan</option>
                  <option value="major_damage">Kerusakan Berat</option>
                  <option value="lost">Hilang</option>
                </select>

                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Catatan</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Catatan kondisi barang..."
                  style={{ ...selectStyle, width: "100%", minHeight: "80px", resize: "vertical", marginBottom: "16px" }}
                />
              </>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setModalRental(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--background-elevated)",
                  cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || updating}
                className="btn-primary"
                style={{ flex: 1, padding: "12px", opacity: !newStatus || updating ? 0.5 : 1 }}
              >
                {updating ? "⏳ Memproses..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
