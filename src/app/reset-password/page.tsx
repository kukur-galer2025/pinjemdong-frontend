"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError("Link tidak valid atau sudah kadaluarsa. Silakan minta ulang link reset password.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email,
          token,
          password,
          password_confirmation: passwordConfirmation
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
            const firstError = Object.values(data.errors)[0] as string[];
            throw new Error(firstError[0]);
        }
        throw new Error(data.message || "Gagal mereset password.");
      }

      setSuccess(data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--success-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <span style={{ fontSize: "2rem" }}>✅</span>
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "12px", color: "var(--success)" }}>Berhasil!</h2>
        <p style={{ color: "var(--foreground-secondary)", marginBottom: "24px" }}>{success}</p>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && (
        <div style={{ padding: "12px 16px", background: "var(--error-light)", color: "var(--error)", borderRadius: "var(--radius-md)", fontSize: "0.9rem", border: "1px solid var(--error)", display: "flex", alignItems: "center", gap: "8px" }}>
          ⚠️ {error}
        </div>
      )}

      <div>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>Email</label>
        <input
          type="email"
          value={email || ""}
          disabled
          style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground-muted)", outline: "none", opacity: 0.7 }}
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>Password Baru</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            style={{ width: "100%", padding: "12px 16px", paddingRight: "40px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground)", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            required
            disabled={!token || !email}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={!token || !email}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: (!token || !email) ? "not-allowed" : "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
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

      <div>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>Konfirmasi Password Baru</label>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Ketik ulang password baru"
            style={{ width: "100%", padding: "12px 16px", paddingRight: "40px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground)", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
            required
            disabled={!token || !email}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={!token || !email}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: (!token || !email) ? "not-allowed" : "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
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

      <button 
        type="submit" 
        disabled={loading || !token || !email}
        className="hover-scale"
        style={{ width: "100%", padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "1rem", cursor: (loading || !token || !email) ? "not-allowed" : "pointer", opacity: (loading || !token || !email) ? 0.7 : 1, transition: "all 0.3s" }}
      >
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px", background: "var(--background)", position: "relative" }}>
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

      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "40px", borderRadius: "var(--radius-xl)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img 
            src="/logo.png" 
            alt="PinjemLur Logo" 
            className="dark-invert" 
            style={{ height: "48px", width: "auto", objectFit: "contain", margin: "0 auto 20px", display: "block" }}
            onError={(e) => { e.currentTarget.src = "https://placehold.co/200x50?text=Logo" }}
          />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.02em" }}>Buat Password Baru</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>
            Silakan masukkan kata sandi baru Anda yang kuat dan mudah diingat.
          </p>
        </div>

        <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}>Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>

      </div>
    </div>
  );
}
