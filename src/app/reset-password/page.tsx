"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground)", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
          required
          disabled={!token || !email}
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>Konfirmasi Password Baru</label>
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Ketik ulang password baru"
          style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-secondary)", color: "var(--foreground)", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
          required
          disabled={!token || !email}
        />
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
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px", background: "var(--background)" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "40px", borderRadius: "var(--radius-xl)" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--background-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
          </div>
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
