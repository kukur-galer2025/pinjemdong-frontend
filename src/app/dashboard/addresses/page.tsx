"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import toast from "react-hot-toast";

const AddressMap = lazy(() => import("../../../components/AddressMap"));

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function AddressesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [addrLabel, setAddrLabel] = useState("");
  const [addrAddress, setAddrAddress] = useState("");
  const [addrLat, setAddrLat] = useState("");
  const [addrLng, setAddrLng] = useState("");
  const [addrSaving, setAddrSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) return;

    fetch(`${API_URL}/user/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDeleteAddress = async (id: number) => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) return;
    
    if (!confirm("Hapus alamat tersimpan ini?")) return;

    try {
      const res = await fetch(`${API_URL}/user/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Alamat berhasil dihapus");
      } else {
        toast.error("Gagal menghapus alamat");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal terhubung ke server");
    }
  };

  const handleEditClick = (addr: any) => {
    setEditingId(addr.id);
    setAddrLabel(addr.label);
    setAddrAddress(addr.address);
    setAddrLat(addr.latitude);
    setAddrLng(addr.longitude);
    setShowAddressForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setShowAddressForm(false);
    setEditingId(null);
    setAddrLabel("");
    setAddrAddress("");
    setAddrLat("");
    setAddrLng("");
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token || !addrLabel.trim() || !addrAddress.trim() || !addrLat || !addrLng) {
      toast.error("Semua field harus diisi");
      return;
    }
    setAddrSaving(true);

    try {
      const isEditing = editingId !== null;
      const endpoint = isEditing ? `${API_URL}/user/addresses/${editingId}` : `${API_URL}/user/addresses`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: addrLabel.trim(),
          address: addrAddress.trim(),
          latitude: parseFloat(addrLat),
          longitude: parseFloat(addrLng),
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(isEditing ? "Alamat berhasil diperbarui!" : "Alamat berhasil disimpan!");
        if (isEditing) {
          setAddresses((prev) => prev.map((a) => a.id === editingId ? data.address : a));
        } else {
          setAddresses((prev) => [data.address, ...prev]);
        }
        resetForm();
      } else {
        toast.error(data.message || "Gagal menyimpan alamat");
      }
    } catch {
      toast.error("Gagal terhubung ke server");
    }
    setAddrSaving(false);
  };

  if (loading) return <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }} />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>📍 Alamat Tersimpan</h2>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", marginTop: "4px" }}>{addresses.length} alamat disimpan</p>
        </div>
        <button
          onClick={() => {
            if (showAddressForm) {
              resetForm();
            } else {
              setShowAddressForm(true);
            }
          }}
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "0.85rem" }}
        >
          {showAddressForm ? "✕ Tutup Form" : "＋ Tambah Alamat"}
        </button>
      </div>

      {/* Add/Edit Address Form */}
      {showAddressForm && (
        <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "16px" }}>
            {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px", color: "var(--foreground-secondary)" }}>Label / Nama Tempat</label>
              <input
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                placeholder="Contoh: Rumah, Kantor, Kos..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                  color: "var(--foreground)", fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            
            <div style={{ zIndex: 10 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px", color: "var(--foreground-secondary)" }}>Pilih Lokasi di Peta</label>
              <Suspense fallback={
                <div style={{ height: "280px", borderRadius: "var(--radius-md)", background: "var(--background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-muted)", border: "1px dashed var(--border)" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                    Memuat peta lokasi...
                  </div>
                </div>
              }>
                <AddressMap
                  onLocationSelect={(data) => {
                    setAddrLat(data.lat.toString());
                    setAddrLng(data.lng.toString());
                    // Only auto-fill if empty or from a search
                    if (!addrAddress || addrAddress === `Lat: ${addrLat}, Lng: ${addrLng}`) {
                      setAddrAddress(data.address);
                    }
                  }}
                  initialLat={addrLat ? parseFloat(addrLat) : undefined}
                  initialLng={addrLng ? parseFloat(addrLng) : undefined}
                />
              </Suspense>
            </div>
            
            <div style={{ marginTop: "4px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "6px", color: "var(--foreground-secondary)" }}>Detail Alamat Lengkap</label>
              <textarea
                value={addrAddress}
                onChange={(e) => setAddrAddress(e.target.value)}
                placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota..."
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)", background: "var(--background-elevated)",
                  color: "var(--foreground)", fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box",
                }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <button onClick={resetForm} style={{
                flex: "1 1 120px", padding: "14px 20px", borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)", background: "var(--background-elevated)",
                cursor: "pointer", fontWeight: 600, color: "var(--foreground-secondary)", fontSize: "0.9rem",
              }}>Batal</button>
              <button
                onClick={handleSaveAddress}
                disabled={addrSaving || !addrLabel || !addrAddress || !addrLat || !addrLng}
                className="btn-primary"
                style={{ flex: "2 1 200px", padding: "14px", fontSize: "0.9rem", opacity: addrSaving || !addrLabel || !addrAddress || !addrLat || !addrLng ? 0.5 : 1 }}
              >
                {addrSaving ? "⏳ Menyimpan..." : "💾 Simpan Alamat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showAddressForm ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📍</div>
          <h3 style={{ fontWeight: 700, marginBottom: "8px" }}>Belum Ada Alamat</h3>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>Simpan alamat favorit agar lebih cepat saat checkout.</p>
          <button onClick={() => setShowAddressForm(true)} className="btn-primary" style={{ padding: "12px 24px", fontSize: "0.9rem" }}>
            ＋ Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {addresses.map((addr) => (
            <div key={addr.id} className="card" style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px", flexDirection: "row" }} className="address-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "1.1rem" }}>📌</span>
                    <h3 style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1rem" }}>{addr.label}</h3>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground-secondary)", marginBottom: "8px", lineHeight: "1.5" }}>{addr.address}</p>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", background: "var(--background-secondary)", padding: "3px 8px", borderRadius: "4px", fontFamily: "monospace" }}>
                    {Number(addr.latitude).toFixed(6)}, {Number(addr.longitude).toFixed(6)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => handleEditClick(addr)} style={{
                    background: "var(--background)", color: "var(--primary)", border: "1.5px solid var(--primary-light)",
                    padding: "10px", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }} title="Edit Alamat"
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--background)"; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button onClick={() => handleDeleteAddress(addr.id)} style={{
                    background: "var(--error-light)", color: "var(--error)", border: "1.5px solid rgba(239, 68, 68, 0.2)",
                    padding: "10px", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }} title="Hapus Alamat"
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--error-light)"; }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @media (max-width: 480px) {
          .address-item {
            flex-direction: column !important;
          }
          .address-item > div:last-child {
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 1px dashed var(--border);
          }
        }
      `}</style>
    </div>
  );
}
