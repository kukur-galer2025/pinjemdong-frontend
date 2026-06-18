"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useTheme } from "@/components/ThemeProvider";

function LoginForm() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin
        ? { email, password }
        : { name, email, phone, password, password_confirmation: confirmPassword };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
        setLoading(false);
        return;
      }

      // Save token
      localStorage.setItem("PinjemLur-token", data.token);
      localStorage.setItem("PinjemLur-user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            google_id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            avatar: userInfo.picture,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("PinjemLur-token", data.token);
          localStorage.setItem("PinjemLur-user", JSON.stringify(data.user));
          window.location.href = "/dashboard";
        } else {
          setError(data.message || "Gagal login dengan Google.");
        }
      } catch (err) {
        setError("Gagal terhubung ke Google.");
      }
      setLoading(false);
    },
    onError: () => {
      setError("Gagal login dengan Google.");
    },
  });

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)",
    background: "var(--background-elevated)",
    color: "var(--foreground)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  return (
    <div
      style={{
        padding: "40px 24px",
        overflowY: "auto",
        height: "100vh",
      }}
    >
      <div
        className="animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px 0",
        }}
      >
        {/* Back to Home */}
        <div style={{ marginBottom: "32px", alignSelf: "flex-start" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--foreground-secondary)",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              background: "var(--background-secondary)",
              transition: "all var(--transition-fast)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "var(--border)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "var(--background-secondary)")}
          >
            <span style={{ fontSize: "1.2rem" }}>←</span> Kembali ke Beranda
          </Link>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <img 
            src="/logo.png" 
            alt="PinjemLur Logo" 
            className="dark-invert" 
            style={{ height: "48px", width: "auto", objectFit: "contain", marginBottom: "16px" }}
            onError={(e) => { e.currentTarget.src = "https://placehold.co/200x50?text=Logo" }}
          />
          <div style={{ display: "inline-block", background: "var(--primary-light)", color: "var(--primary)", padding: "4px 12px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 700, marginBottom: "16px" }}>
            ✨ Nggak Perlu Beli, PinjemLur Aja!
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            {isLogin ? "Selamat Datang Kembali" : "Buat Akun Baru"}
          </h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1rem", marginTop: "8px" }}>
            {isLogin ? "Masuk ke akun PinjemLur Anda untuk melanjutkan" : "Daftar gratis dan mulai menyewa barang idamanmu"}
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--border)",
            background: "var(--background-elevated)",
            color: "var(--foreground)",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all var(--transition-fast)",
            marginBottom: "24px",
            boxShadow: "var(--shadow-sm)",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.borderColor = "var(--primary)")}
          onMouseOut={(e) => !loading && (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLogin ? "Masuk dengan Google" : "Daftar dengan Google"}
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", fontWeight: 500 }}>atau dengan email</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-light)",
              color: "var(--error)",
              fontSize: "0.9rem",
              fontWeight: 500,
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)" }}>
                Password
              </label>
              {isLogin && (
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                  Lupa password?
                </Link>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                style={{...inputStyle, paddingRight: "40px"}}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                Konfirmasi Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  style={{...inputStyle, paddingRight: "40px"}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                  aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.05rem",
              marginTop: "12px",
              opacity: loading ? 0.7 : 1,
              boxShadow: "var(--shadow-md)",
            }}
          >
            {loading ? "⏳ Memproses..." : isLogin ? "Masuk ke Akun" : "Daftar Sekarang"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: "32px", color: "var(--foreground-secondary)", fontSize: "0.95rem" }}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            {isLogin ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "unconfigured-client-id";
  const { theme, toggleTheme } = useTheme();

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-layout relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border)",
            background: "var(--background-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            color: "var(--foreground)",
            zIndex: 50,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "var(--foreground-muted)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          {theme === "light" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>
          )}
        </button>
        {/* Left side: Image & Badge (hidden on small screens) */}
        <div
          className="login-image-container relative bg-black overflow-hidden"
          style={{
            borderTopRightRadius: "var(--radius-2xl)",
            borderBottomRightRadius: "var(--radius-2xl)",
          }}
        >
          <Image
            src="/login_hero.png"
            alt="Premium Rental Equipment"
            fill
            style={{ objectFit: "cover", opacity: 0.6 }}
            priority
          />
          
          {/* Gradient Overlay for aesthetic */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
            }}
          />

          {/* Floating Content / Badge */}
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              right: "60px",
              color: "white",
              zIndex: 10,
            }}
            className="animate-fade-in-up"
          >
            <div
              className="glass"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                borderRadius: "var(--radius-full)",
                marginBottom: "24px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>✨</span>
              <span style={{ fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.5px" }}>
                #1 Platform Sewa Barang Terpercaya
              </span>
            </div>

            <h2 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "16px" }}>
              Penuhi Kebutuhanmu,<br />Tanpa Harus Membeli.
            </h2>
            <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", maxWidth: "500px", lineHeight: 1.6 }}>
              Dari kamera profesional hingga peralatan camping premium, sewa dengan aman, cepat, dan transparan bersama PinjemLur.
            </p>

            <div style={{ display: "flex", gap: "24px", marginTop: "40px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>10K+</span>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Barang Tersedia</span>
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>50K+</span>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Penyewa Aktif</span>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Memuat...</div>}>
          <LoginForm />
        </Suspense>

        <style jsx>{`
          .login-layout {
            display: grid;
            grid-template-columns: 1fr;
            min-height: 100vh;
          }
          .login-image-container {
            display: none;
          }
          @media (min-width: 900px) {
            .login-layout {
              grid-template-columns: 1fr 1fr;
            }
            .login-image-container {
              display: block;
            }
          }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
}
