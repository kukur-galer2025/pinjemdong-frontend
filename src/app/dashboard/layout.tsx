"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  verification: { status: string } | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    })
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("pinjemdong-token");
        window.location.href = "/login";
      });
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem("pinjemdong-token");
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).finally(() => {
      localStorage.removeItem("pinjemdong-token");
      localStorage.removeItem("pinjemdong-user");
      window.location.href = "/";
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 24px" }}>
        <div className="skeleton" style={{ height: "120px", borderRadius: "var(--radius-lg)", marginBottom: "24px" }} />
        <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  const kycStatus = user?.verification?.status;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 16px 80px" }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            border: '1px solid var(--border)',
            background: 'var(--background-card)',
            color: 'var(--foreground)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.95rem',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: 'var(--success)', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: 'var(--error)', secondary: '#fff' },
          },
        }}
      />
      {/* Profile Header */}
      <div className="card" style={{ padding: "24px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1 }}>
          <div style={{
            width: "56px", height: "56px", minWidth: "56px", borderRadius: "var(--radius-full)",
            background: "var(--primary-gradient)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.3rem", color: "#fff", fontWeight: 700,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: "clamp(1rem, 4vw, 1.4rem)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Halo, {user?.name}! 👋</h2>
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <span className="badge" style={{
                background: kycStatus === "approved" ? "var(--success-light)" : kycStatus === "pending" ? "var(--warning-light)" : "var(--error-light)",
                color: kycStatus === "approved" ? "var(--success)" : kycStatus === "pending" ? "var(--warning)" : "var(--error)", 
                fontSize: "0.75rem", padding: "6px 12px", fontWeight: 800, letterSpacing: "0.5px"
              }}>
                {kycStatus === "approved" ? "✅ TERVERIFIKASI" : kycStatus === "pending" ? "⏳ MENUNGGU VERIFIKASI" : "❌ BELUM VERIFIKASI"}
              </span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{ 
          padding: "10px 24px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 700,
          color: "var(--foreground)", background: "var(--background)", border: "1.5px solid var(--border)", 
          transition: "all 0.2s", cursor: "pointer" 
        }} 
        onMouseOver={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.borderColor = "var(--error)"; e.currentTarget.style.background = "var(--error-light)"; }} 
        onMouseOut={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--background)"; }}>
          Keluar
        </button>
      </div>

      {/* KYC Warning */}
      {kycStatus !== "approved" && (
        <div style={{ 
          padding: "24px", marginBottom: "28px", borderRadius: "var(--radius-lg)", 
          background: kycStatus === "pending" ? "var(--warning-light)" : "var(--error-light)",
          border: kycStatus === "pending" ? "1.5px solid var(--warning)" : "1.5px solid var(--error)",
          display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap",
          boxShadow: kycStatus === "pending" ? "0 4px 20px rgba(245, 158, 11, 0.1)" : "0 4px 20px rgba(239, 68, 68, 0.1)"
        }}>
          <div style={{ fontSize: "2.5rem", background: "var(--background-card)", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>{kycStatus === "pending" ? "⏳" : "🛡️"}</div>
          <div style={{ flex: 1, minWidth: "250px" }}>
            <h3 style={{ fontWeight: 800, color: "var(--foreground)", marginBottom: "6px", fontSize: "1.1rem" }}>
              {kycStatus === "pending" ? "Menunggu Verifikasi Identitas" : "Verifikasi Identitas Diperlukan"}
            </h3>
            <p style={{ color: "var(--foreground)", fontSize: "0.95rem", opacity: 0.85 }}>
              {kycStatus === "pending" ? "Data Anda sedang diperiksa oleh tim kami. Mohon tunggu maksimal 30 menit." : "Anda harus mengunggah foto KTP sebelum bisa menyewa barang untuk keamanan bersama."}
            </p>
          </div>
          {kycStatus !== "pending" && (
            <Link href="/verification" className="btn-primary" style={{ padding: "12px 28px", fontSize: "0.95rem", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
              Mulai Verifikasi
            </Link>
          )}
        </div>
      )}

      {/* Tabs as Navigation Links */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "2px solid var(--border)", marginBottom: "28px", overflowX: "auto", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {[
          { key: "/dashboard", label: "📦 Riwayat Sewa", exact: true },
          { key: "/dashboard/addresses", label: "📍 Alamat Tersimpan", exact: false },
          { key: "/dashboard/profile", label: "👤 Edit Profil", exact: false },
        ].map((tab) => {
          const isActive = tab.exact ? pathname === tab.key : pathname.startsWith(tab.key);
          return (
            <Link key={tab.key} href={tab.key} style={{
              padding: "12px 20px", border: "none", background: "transparent",
              color: isActive ? "var(--primary)" : "var(--foreground-muted)",
              fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none",
              borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.3s ease",
            }}>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  );
}
