"use client";

import { useEffect, useState } from "react";
import RevenueChart from "@/components/RevenueChart";
import CategoryPieChart from "@/components/CategoryPieChart";
import TopProductsBarChart from "@/components/TopProductsBarChart";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface Stats {
  total_users: number;
  total_products: number;
  total_categories: number;
  total_rentals: number;
  active_rentals: number;
  pending_payments: number;
  pending_kyc: number;
  revenue_this_month: number;
  revenue_total: number;
  chart_data?: { name: string; revenue: number }[];
  top_products?: { name: string; total_rented: number }[];
  category_distribution?: { name: string; total_rented: number }[];
}

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pinjemdong-token");
    fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStats({ 
          ...data.stats, 
          chart_data: data.chart_data,
          top_products: data.top_products,
          category_distribution: data.category_distribution
        });
        setRecentRentals(data.recent_rentals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Pengguna", value: stats.total_users, icon: "👥", color: "#7c3aed" },
        { label: "Total Produk", value: stats.total_products, icon: "🏷️", color: "#2563eb" },
        { label: "Penyewaan Aktif", value: stats.active_rentals, icon: "📦", color: "#10b981" },
        { label: "Menunggu Bayar", value: stats.pending_payments, icon: "💳", color: "#f59e0b", alert: stats.pending_payments > 0 },
        { label: "Menunggu Verifikasi", value: stats.pending_kyc, icon: "🛡️", color: "#ef4444", alert: stats.pending_kyc > 0 },
        { label: "Total Pesanan", value: stats.total_rentals, icon: "📋", color: "#8b5cf6" },
      ]
    : [];

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending: { bg: "#fef3c7", color: "#92400e", label: "Menunggu" },
      confirmed: { bg: "#d1fae5", color: "#065f46", label: "Dikonfirmasi" },
      rented: { bg: "#dbeafe", color: "#1e40af", label: "Disewa" },
      returned: { bg: "#ede9fe", color: "#5b21b6", label: "Dikembalikan" },
      completed: { bg: "#d1fae5", color: "#065f46", label: "Selesai" },
      cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Dibatalkan" },
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
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>Selamat datang kembali, Admin! Ini ringkasan hari ini.</p>
      </div>

      {/* Revenue Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px", marginBottom: "28px" }}>
          <div className="card" style={{
            padding: "24px", background: "var(--primary-gradient)", color: "#fff",
            borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "6rem", opacity: 0.1 }}>💰</div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9, marginBottom: "8px" }}>Pendapatan Bulan Ini</p>
            <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Rp {formatRupiah(stats.revenue_this_month)}
            </p>
          </div>
          <div className="card" style={{
            padding: "24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff",
            borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "6rem", opacity: 0.1 }}>📈</div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.9, marginBottom: "8px" }}>Total Pendapatan</p>
            <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Rp {formatRupiah(stats.revenue_total)}
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ padding: "24px" }}>
              <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", marginBottom: "12px" }} />
              <div className="skeleton" style={{ height: "28px", width: "60px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "14px", width: "100px" }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px", marginBottom: "32px" }}>
          {statCards.map((card) => (
            <div key={card.label} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden" }}>
              {card.alert && (
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: "var(--error)", animation: "pulse 2s infinite",
                }} />
              )}
              <div style={{
                width: "44px", height: "44px", borderRadius: "var(--radius-md)",
                background: `${card.color}15`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.3rem", marginBottom: "14px",
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1, marginBottom: "4px", color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--foreground-muted)", fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Charts */}
      {stats && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
          {stats.chart_data && <RevenueChart data={stats.chart_data} />}
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "20px" }}>
            {stats.category_distribution && <CategoryPieChart data={stats.category_distribution} />}
            {stats.top_products && <TopProductsBarChart data={stats.top_products} />}
          </div>
        </div>
      )}

      {/* Recent Rentals Table */}
      <div className="card" style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Pesanan Terbaru</h3>
        </div>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Invoice", "Pelanggan", "Barang", "Status", "Tanggal"].map((h) => (
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
              {recentRentals.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--foreground-muted)" }}>
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                recentRentals.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {r.invoice_number}
                    </td>
                    <td style={{ padding: "14px 16px" }}>{r.user?.name || "-"}</td>
                    <td style={{ padding: "14px 16px", color: "var(--foreground-secondary)" }}>
                      {r.items?.map((i: any) => i.product?.name).join(", ") || "-"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>{statusBadge(r.status)}</td>
                    <td style={{ padding: "14px 16px", color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                      {new Date(r.created_at).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
