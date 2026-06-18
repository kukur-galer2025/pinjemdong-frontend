"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0b0f19", // Solid dark color for maximum contrast
        color: "#f8fafc", // Solid white/light gray text
        padding: "80px 0 30px",
        marginTop: "auto",
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid #1e293b"
      }}
    >
      {/* Decorative Glow - using radial-gradient instead of filter:blur for performance */}
      <div style={{ position: "absolute", top: 0, left: "20%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, right: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        
        {/* Main Section using Flexbox for perfect spacing */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "40px", marginBottom: "60px" }}>
          
          {/* Brand & Newsletter */}
          <div style={{ flex: "1 1 350px", maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--primary-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)"
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em" }}>
                PinjemLur
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.7, maxWidth: "340px", marginBottom: "24px" }}>
              Platform penyewaan barang terpercaya pertama di Indonesia. Sewa perlengkapan apapun dengan aman, mudah, dan harga terbaik.
            </p>
            
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Berlangganan Promo</h4>
              <div style={{ display: "flex", gap: "8px", maxWidth: "340px" }}>
                <input 
                  type="email" 
                  placeholder="Email Anda..." 
                  style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid #334155", background: "#1e293b", color: "#fff", outline: "none", fontSize: "0.9rem" }}
                />
                <button style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}>
                  Kirim
                </button>
              </div>
            </div>
          </div>

          {/* Links Group */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", flex: "2 1 500px", justifyContent: "space-between" }}>
            {/* Layanan */}
            <div style={{ flex: "1 1 120px" }}>
              <h4 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "1.05rem", color: "#ffffff" }}>Layanan</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Katalog Barang", href: "/catalog" },
                  { label: "Paket Hemat", href: "/packages" },
                  { label: "Cara Sewa", href: "/how-it-works" },
                  { label: "FAQ", href: "/faq" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color var(--transition-fast)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Perusahaan */}
            <div style={{ flex: "1 1 120px" }}>
              <h4 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "1.05rem", color: "#ffffff" }}>Perusahaan</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Tentang Kami", href: "/about" },
                  { label: "Syarat & Ketentuan", href: "/terms" },
                  { label: "Kebijakan Privasi", href: "/privacy" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color var(--transition-fast)" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ flex: "1 1 200px" }}>
              <h4 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "1.05rem", color: "#ffffff" }}>Hubungi Kami</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  <svg style={{ flexShrink: 0, marginTop: "2px" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>Griya Satria Mandalatama<br/>Kluster 3, Karanglewas, Purwokerto</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: "0.95rem" }}>
                  <svg style={{ flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>0812-3456-7890</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#94a3b8", fontSize: "0.95rem" }}>
                  <svg style={{ flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span>hello@PinjemLur.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid #1e293b",
            paddingTop: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "12px", order: 2 }}>
            {[
              <svg key="1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
              <svg key="2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
              <svg key="3" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>,
              <svg key="4" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            ].map((icon, i) => (
              <a
                key={i}
                href="#"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#1e293b",
                  color: "#94a3b8",
                  border: "1px solid #334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary)";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "var(--primary)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1e293b";
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.borderColor = "#334155";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {icon}
              </a>
            ))}
          </div>
          <div style={{ order: 1 }}>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "4px" }}>
              © {new Date().getFullYear()} kelompok A Huket. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}
