"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Toaster } from "react-hot-toast";

const navItems = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
  { href: "/admin/orders", icon: "📦", label: "Pesanan" },
  { href: "/admin/payments", icon: "💳", label: "Pembayaran" },
  { href: "/admin/kyc", icon: "🛡️", label: "Verifikasi Identitas" },
  { href: "/admin/products", icon: "🏷️", label: "Produk" },
  { href: "/admin/categories", icon: "📂", label: "Kategori" },
  { href: "/admin/packages", icon: "🎁", label: "Paket Sewa" },
  { href: "/admin/reviews", icon: "⭐", label: "Ulasan" },
  { href: "/admin/chats", icon: "💬", label: "Live Chat" },
  { href: "/admin/users", icon: "👥", label: "Pengguna" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("PinjemLur-token");
    const saved = localStorage.getItem("PinjemLur-user");
    if (!token || !saved) {
      router.push("/login");
      return;
    }
    try {
      const u = JSON.parse(saved);
      if (u.role !== "admin") {
        router.push("/");
        return;
      }
      setUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("PinjemLur-token");
    localStorage.removeItem("PinjemLur-user");
    router.push("/login");
  };

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="skeleton" style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)", margin: "0 auto 16px" }} />
          <div className="skeleton" style={{ width: "120px", height: "16px", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '1px solid var(--border)',
            background: 'var(--background-card)',
            color: 'var(--text-primary)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.95rem',
            fontWeight: 500,
            maxWidth: '90vw',
            wordBreak: 'break-word',
          },
          success: {
            iconTheme: {
              primary: 'var(--success)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--danger)',
              secondary: '#fff',
            },
          },
        }}
      />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 40, display: "none",
          }}
          className="admin-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          width: "280px",
          background: "var(--background-card)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-md)",
              background: "var(--primary-gradient)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.2rem", boxShadow: "var(--shadow-glow)",
            }}>
              📦
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                PinjemLur
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Admin Panel
              </div>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 12px", marginBottom: "4px" }}>
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: isActive ? "var(--primary)" : "var(--foreground-secondary)",
                  background: isActive ? "var(--primary-light)" : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.95rem",
                  marginBottom: "4px",
                  transition: "all var(--transition-fast)",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{ padding: "16px", borderTop: "1px solid var(--border)" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
            borderRadius: "var(--radius-md)", textDecoration: "none",
            color: "var(--foreground-muted)", fontSize: "0.9rem", fontWeight: 500,
            marginBottom: "8px",
          }}>
            🌐 Lihat Website
          </Link>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
              borderRadius: "var(--radius-md)", border: "none", background: "none",
              color: "var(--foreground-muted)", fontSize: "0.9rem", fontWeight: 500,
              cursor: "pointer", width: "100%", textAlign: "left",
              marginBottom: "8px",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
              borderRadius: "var(--radius-md)", border: "none",
              background: "var(--error-light)", color: "var(--error)",
              fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "280px", minHeight: "100vh" }} className="admin-main">
        {/* Top Bar */}
        <header className="admin-header" style={{
          height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "var(--background-card)", position: "sticky", top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="admin-hamburger"
            style={{
              display: "none", border: "none", background: "none",
              fontSize: "1.5rem", cursor: "pointer", color: "var(--foreground)",
            }}
          >
            ☰
          </button>
          <div className="admin-date-hidden" style={{ fontSize: "0.9rem", color: "var(--foreground-muted)" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "var(--radius-full)",
              background: "var(--primary-gradient)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem",
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>Admin</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content-pad">
          {children}
        </div>
      </div>

      <style jsx>{`
        .admin-header { padding: 0 32px; }
        .admin-content-pad { padding: 32px; }
        
        @media (max-width: 900px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { margin-left: 0 !important; width: 100vw; overflow-x: hidden; }
          .admin-hamburger { display: block !important; margin-right: 16px; }
          .admin-overlay { display: block !important; }
        }
        
        @media (max-width: 600px) {
          .admin-header { padding: 0 16px; }
          .admin-content-pad { padding: 16px; overflow-x: hidden; }
          .admin-date-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
