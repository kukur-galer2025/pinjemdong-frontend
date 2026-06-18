"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) return;
    
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setUser(data.user);
        setEditName(data.user.name);
        setEditPhone(data.user.phone || "");
      })
      .catch(console.error);
  }, []);

  const handleSaveProfile = async () => {
    setEditSaving(true);
    const token = localStorage.getItem("PinjemLur-token");
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      toast.success("Profil berhasil disimpan!");
      
      // Update local storage so navbar header updates
      const savedUser = localStorage.getItem("PinjemLur-user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        u.name = editName;
        localStorage.setItem("PinjemLur-user", JSON.stringify(u));
      }
    } else {
      toast.error("Gagal menyimpan profil.");
    }
    setEditSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi sandi baru tidak cocok!");
      return;
    }
    setPasswordSaving(true);
    const token = localStorage.getItem("PinjemLur-token");
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Sandi berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Gagal mengubah sandi. Periksa sandi saat ini.");
      }
    } catch {
      toast.error("Gagal terhubung ke server.");
    }
    setPasswordSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
    color: "var(--foreground)", fontSize: "0.95rem", outline: "none",
  };

  if (!user) return <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />;

  return (
    <div className="card animate-fade-in" style={{ padding: "32px" }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px" }}>Edit Profil</h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Nama Lengkap</label>
          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Email</label>
          <input type="email" value={user?.email || ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
        </div>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>No. Telepon</label>
          <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="08xxxxxxxxxx" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Role</label>
          <input type="text" value={user?.role || ""} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed", textTransform: "capitalize" }} />
        </div>
      </div>

      <button onClick={handleSaveProfile} disabled={editSaving} className="btn-primary" style={{ marginTop: "28px", padding: "14px 32px", opacity: editSaving ? 0.6 : 1 }}>
        {editSaving ? "⏳ Menyimpan..." : "💾 Simpan Profil"}
      </button>

      {/* Ubah Sandi Section */}
      <hr style={{ border: "none", borderTop: "1px dashed var(--border)", margin: "40px 0 32px" }} />
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px" }}>Ubah Sandi</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <div style={{ gridColumn: "1 / -1", maxWidth: "400px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Sandi Saat Ini</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </div>
        <div style={{ maxWidth: "400px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Sandi Baru</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 karakter" style={inputStyle} />
        </div>
        <div style={{ maxWidth: "400px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground-secondary)", display: "block", marginBottom: "8px" }}>Konfirmasi Sandi Baru</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi sandi baru" style={inputStyle} />
        </div>
      </div>
      
      <button onClick={handleChangePassword} disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword} className="btn-secondary" style={{ marginTop: "28px", padding: "14px 32px", opacity: passwordSaving || !currentPassword || !newPassword || !confirmPassword ? 0.6 : 1, color: "var(--primary)", borderColor: "var(--primary)" }}>
        {passwordSaving ? "⏳ Menyimpan..." : "🔐 Perbarui Sandi"}
      </button>
    </div>
  );
}
