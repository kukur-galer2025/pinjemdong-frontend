"use client";

import Link from "next/link";
import { useState, useEffect, lazy, Suspense } from "react";

const DeliveryMap = lazy(() => import("../../components/DeliveryMap"));

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "");

export default function VerificationPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [ktpNumber, setKtpNumber] = useState("");
  const [ktpImage, setKtpImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number>(-6.200000);
  const [longitude, setLongitude] = useState<number>(106.816666);
  const [saveAsPrimary, setSaveAsPrimary] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) { window.location.href = "/login"; return; }

    fetch(`${API_URL}/verification/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.verification?.status || null);
        setRejectionReason(data.verification?.rejection_reason || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!ktpNumber || ktpNumber.length !== 16 || isNaN(Number(ktpNumber))) {
      setError("Nomor KTP wajib diisi dan harus berupa 16 digit angka.");
      return;
    }
    if (!ktpImage) {
      setError("Anda belum mengunggah Foto KTP.");
      return;
    }
    if (!selfieImage) {
      setError("Anda belum mengunggah Foto Selfie bersama KTP.");
      return;
    }
    if (!emergencyName || emergencyName.trim().length < 3) {
      setError("Nama Kontak Darurat wajib diisi dengan benar.");
      return;
    }
    if (!emergencyPhone || emergencyPhone.trim().length < 9 || isNaN(Number(emergencyPhone))) {
      setError("Nomor Telepon Darurat tidak valid.");
      return;
    }
    if (!address || address.trim().length < 10) {
      setError("Detail Alamat harus diisi secara lengkap (jalan, RT/RW, dsb).");
      return;
    }

    setSubmitting(true);

    const token = localStorage.getItem("pinjemdong-token");
    const formData = new FormData();
    formData.append("ktp_number", ktpNumber);
    formData.append("emergency_contact_name", emergencyName);
    formData.append("emergency_contact_phone", emergencyPhone);
    formData.append("address", address);
    formData.append("latitude", latitude.toString());
    formData.append("longitude", longitude.toString());
    if (saveAsPrimary) formData.append("save_as_primary_address", "1");
    if (ktpImage) formData.append("ktp_image", ktpImage);
    if (selfieImage) formData.append("selfie_image", selfieImage);

    try {
      const res = await fetch(`${API_URL}/verification/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Gagal mengirim verifikasi.");
      } else {
        setMessage(data.message);
        setStatus("pending");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 24px" }}>
        <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  // Already approved
  if (status === "approved") {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: "20px" }}>✅</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>Identitas Terverifikasi!</h1>
        <p style={{ color: "var(--foreground-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
          Akun Anda sudah diverifikasi. Anda bisa langsung menyewa barang sekarang.
        </p>
        <Link href="/catalog" className="btn-primary" style={{ padding: "16px 40px" }}>
          Jelajahi Katalog →
        </Link>
      </div>
    );
  }

  // Pending
  if (status === "pending") {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "5rem", marginBottom: "20px" }}>⏳</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>Menunggu Verifikasi</h1>
        <p style={{ color: "var(--foreground-secondary)", fontSize: "1.1rem", marginBottom: "32px" }}>
          Data verifikasi Anda sedang diperiksa oleh tim kami. Biasanya proses ini memakan waktu kurang dari 30 menit.
        </p>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: "14px 32px" }}>
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)",
    background: "var(--background-elevated)",
    color: "var(--foreground)",
    fontSize: "0.95rem",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 24px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            width: "72px", height: "72px", borderRadius: "var(--radius-xl)",
            background: "var(--primary-gradient)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2rem", margin: "0 auto 20px",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          🛡️
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Verifikasi Identitas</h1>
        <p style={{ color: "var(--foreground-secondary)", fontSize: "1rem", maxWidth: "500px", margin: "0 auto" }}>
          Untuk keamanan bersama, kami memerlukan verifikasi identitas sebelum Anda bisa menyewa barang.
        </p>
      </div>

      {/* Rejected warning */}
      {status === "rejected" && (
        <div className="card" style={{ padding: "20px", marginBottom: "24px", background: "var(--error-light)", borderColor: "var(--error)" }}>
          <h4 style={{ color: "var(--error)", fontWeight: 700, marginBottom: "4px" }}>❌ Verifikasi Ditolak</h4>
          <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem" }}>
            Alasan: {rejectionReason || "Data tidak valid. Silakan kirim ulang."}
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--error-light)", color: "var(--error)", marginBottom: "16px", fontSize: "0.9rem", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--success-light)", color: "var(--success)", marginBottom: "16px", fontSize: "0.9rem", fontWeight: 500 }}>
          ✅ {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* KTP Section */}
        <div className="card" style={{ padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🪪 Data KTP
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                Nomor KTP (16 digit)
              </label>
              <input type="text" value={ktpNumber} onChange={(e) => setKtpNumber(e.target.value)} placeholder="32xxxxxxxxxxxxxx" maxLength={16} required style={inputStyle} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                  Foto KTP (Jelas, tidak buram)
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB!"); e.target.value = ''; return; }
                      setKtpImage(file || null);
                    }}
                    required
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2 }}
                  />
                  <div style={{
                    padding: ktpImage ? "12px" : "24px", borderRadius: "var(--radius-md)", border: ktpImage ? "2px solid var(--primary)" : "2px dashed var(--border)",
                    background: ktpImage ? "var(--primary-light)" : "var(--background-elevated)", textAlign: "center", transition: "all 0.2s"
                  }}>
                    {ktpImage ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "100%", height: "140px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={URL.createObjectURL(ktpImage)} alt="Preview KTP" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.85rem", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ktpImage.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--primary)" }}>{(ktpImage.size / 1024 / 1024).toFixed(2)} MB • Klik area ini untuk ganti</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div style={{ background: "var(--background)", color: "var(--foreground-muted)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🪪</div>
                        <div style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.95rem" }}>Klik atau Tarik Foto KTP</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>Format: JPG/PNG (Maks 2MB)</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>
                  Foto Selfie Memegang KTP
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB!"); e.target.value = ''; return; }
                      setSelfieImage(file || null);
                    }}
                    required
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 2 }}
                  />
                  <div style={{
                    padding: selfieImage ? "12px" : "24px", borderRadius: "var(--radius-md)", border: selfieImage ? "2px solid var(--primary)" : "2px dashed var(--border)",
                    background: selfieImage ? "var(--primary-light)" : "var(--background-elevated)", textAlign: "center", transition: "all 0.2s"
                  }}>
                    {selfieImage ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "100%", height: "140px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={URL.createObjectURL(selfieImage)} alt="Preview Selfie" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.85rem", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selfieImage.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--primary)" }}>{(selfieImage.size / 1024 / 1024).toFixed(2)} MB • Klik area ini untuk ganti</div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div style={{ background: "var(--background)", color: "var(--foreground-muted)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🤳</div>
                        <div style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.95rem" }}>Klik atau Tarik Foto Selfie</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>Format: JPG/PNG (Maks 2MB)</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card" style={{ padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            📞 Kontak Darurat
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", display: "block", color: "var(--foreground-secondary)" }}>
                Nama Kontak Darurat (Keluarga/Teman)
              </label>
              <input type="text" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Nama lengkap" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", display: "block", color: "var(--foreground-secondary)" }}>
                No. Telepon Kontak Darurat
              </label>
              <input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="08xxxxxxxxxx" required style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card" style={{ padding: "28px", marginBottom: "28px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            📍 Alamat Lengkap
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "24px" }}>
            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", border: "1.5px solid var(--border)", height: "280px" }}>
              <Suspense fallback={<div className="skeleton" style={{ width: "100%", height: "100%" }} />}>
                <DeliveryMap
                  initialLat={latitude}
                  initialLng={longitude}
                  onLocationSelect={(data) => {
                    setLatitude(data.lat);
                    setLongitude(data.lng);
                    if (data.address && data.address !== "Memuat alamat...") {
                      setAddress(data.address);
                    }
                  }}
                  onDistanceExceeded={() => {}}
                />
              </Suspense>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", display: "block", color: "var(--foreground-secondary)" }}>
                  Detail Alamat (Jalan, RT/RW, Patokan)
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Contoh No. 123, RT 01/RW 02, Patokan: Pagar Hitam..."
                  required
                  style={{ ...inputStyle, height: "calc(100% - 28px)", resize: "none" }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 600, marginTop: "auto" }}>
                <input 
                  type="checkbox" 
                  checked={saveAsPrimary} 
                  onChange={(e) => setSaveAsPrimary(e.target.checked)} 
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)", cursor: "pointer" }} 
                />
                Simpan sebagai Alamat Utama
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: "100%", padding: "16px", fontSize: "1.05rem", opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "⏳ Mengirim..." : "Kirim Verifikasi 🚀"}
        </button>
      </form>
    </div>
  );
}
