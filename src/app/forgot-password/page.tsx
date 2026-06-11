"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email harus diisi");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.email) {
            throw new Error(data.errors.email[0]);
        }
        throw new Error(data.message || "Gagal mengirim permintaan.");
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px", background: "var(--background)" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "40px", borderRadius: "var(--radius-xl)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img 
            src="/logo-dekstop.webp" 
            alt="PinjemDong Logo" 
            className="dark-invert" 
            style={{ height: "48px", width: "auto", objectFit: "contain", margin: "0 auto 20px", display: "block" }}
            onError={(e) => { e.currentTarget.src = "https://placehold.co/200x50?text=Logo+Desktop" }}
          />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "8px", letterSpacing: "-0.02em" }}>Lupa Password</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>
            Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset kata sandi.
          </p>
        </div>

        {error && (
          <div style={{ padding: "12px 16px", background: "var(--error-light)", color: "var(--error)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "0.9rem", border: "1px solid var(--error)", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: "16px", background: "var(--success-light)", color: "var(--success)", borderRadius: "var(--radius-md)", marginBottom: "20px", fontSize: "0.95rem", border: "1px solid var(--success)", display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "1.2rem" }}>✅</span>
            <strong>Berhasil Terkirim!</strong>
            <span style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>{success}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", marginTop: "8px" }}>Mengarahkan kembali ke halaman login...</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground)", outline: "none", transition: "border-color 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="hover-scale"
              style={{ width: "100%", padding: "14px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.3s" }}
            >
              {loading ? "Mengirim..." : "Kirim Link Pemulihan"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link href="/login" style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }} className="hover-scale">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Login
          </Link>
        </div>
        
      </div>
    </div>
  );
}
