"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

export default function CreateProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    terms_conditions: "",
    category_id: 1,
    brand: "",
    price_per_day: 0,
    min_dp_percentage: 20,
    is_active: true,
    is_featured: false,
    total_units: 1,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((r) => r.json())
      .then((d) => {
        const cats = d.categories || [];
        setCategories(cats);
        if (cats.length > 0) setForm((f) => ({ ...f, category_id: cats[0].id }));
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran file terlalu besar. Maksimal 2MB per gambar.");
        return;
      }
      
      setErrorMsg("");
      setImageFiles(prev => [...prev, file]);
      setImagePreviews(prev => [...prev, URL.createObjectURL(file)]);
      
      // Reset input so the same file can be selected again if needed
      e.target.value = "";
    }
  };

  const handleMakePrimary = (idxToPrimary: number) => {
    if (idxToPrimary === 0) return; // Already primary

    setImageFiles(prev => {
      const newArr = [...prev];
      const temp = newArr[0];
      newArr[0] = newArr[idxToPrimary];
      newArr[idxToPrimary] = temp;
      return newArr;
    });

    setImagePreviews(prev => {
      const newArr = [...prev];
      const temp = newArr[0];
      newArr[0] = newArr[idxToPrimary];
      newArr[idxToPrimary] = temp;
      return newArr;
    });
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, typeof value === 'boolean' ? (value ? "1" : "0") : value.toString());
    });

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images[]", file);
      });
    }

    try {
      const res = await fetch(`${API}/admin/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Produk berhasil ditambahkan!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        if (err.errors) {
          const msgs = Object.values(err.errors).flat().join(", ");
          setErrorMsg(msgs);
        } else {
          setErrorMsg(err.message || "Gagal menyimpan produk.");
        }
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--border)", background: "var(--background-elevated)",
    color: "var(--foreground)", fontSize: "0.95rem", outline: "none",
    transition: "border-color 0.2s"
  };

  const labelStyle = { fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "8px", color: "var(--foreground-secondary)" };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin/products" style={{ textDecoration: "none", color: "var(--foreground-muted)", fontSize: "1.2rem", padding: "8px" }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Tambah Produk Baru</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", margin: 0 }}>Masukkan detail produk dan unggah foto.</p>
        </div>
      </div>

      <div className="card" style={{ padding: "32px", borderRadius: "var(--radius-lg)" }}>
        {errorMsg && (
          <div style={{ padding: "12px 16px", background: "var(--error-light)", color: "var(--error)", borderRadius: "var(--radius-md)", marginBottom: "24px", fontWeight: 600, fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* FOTO PRODUK SECTION */}
          <div style={{ padding: "24px", background: "var(--background-secondary)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-hover)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px" }}>Foto Produk</h3>
            
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
              {/* Existing / Selected Images */}
              {imagePreviews.map((preview, idx) => (
                <div key={idx} style={{ 
                  position: "relative", width: "140px", height: "140px", borderRadius: "var(--radius-md)", 
                  overflow: "hidden", border: idx === 0 ? "3px solid var(--primary)" : "1px solid var(--border)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                }}>
                  <img src={preview} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  
                  {/* Delete Button */}
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "var(--error)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", zIndex: 10 }}
                    title="Hapus gambar ini"
                  >
                    ✕
                  </button>

                  {/* Primary Badge or Action */}
                  {idx === 0 ? (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, textAlign: "center", padding: "4px 0" }}>
                      FOTO UTAMA
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(idx)}
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.7rem", fontWeight: 600, textAlign: "center", padding: "4px 0", cursor: "pointer", border: "none", transition: "background 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>
              ))}

              {/* Add New Box */}
              <label 
                style={{
                  width: "140px", height: "140px", borderRadius: "var(--radius-md)", 
                  background: "var(--background-elevated)", border: "2px dashed var(--border)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--foreground-muted)", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--foreground-muted)"; }}
              >
                <div style={{ fontSize: "2rem", fontWeight: 300 }}>+</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Tambah Foto</div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <div style={{ marginTop: "16px", fontSize: "0.8rem", color: "var(--foreground-muted)", lineHeight: 1.6 }}>
              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                <li>Unggah foto satu per satu menggunakan kotak <strong>+ Tambah Foto</strong>.</li>
                <li>Gunakan tombol <strong>Jadikan Utama</strong> untuk mengatur foto utama.</li>
                <li>Format yang didukung: <strong>JPG, PNG, WEBP</strong> (Maksimal 2 MB per gambar).</li>
              </ul>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          {/* DETAIL PRODUK SECTION */}
          <div className="responsive-grid-2">
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nama Produk *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="Misal: Tenda Dome Eiger 4 Orang" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi Produk *</label>
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="Deskripsi lengkap produk..." />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Syarat & Ketentuan Tambahan</label>
              <textarea value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Misal: Dilarang mencuci, wajib dikembalikan kering, dll. (Kosongkan jika tidak ada)" />
            </div>

            <div>
              <label style={labelStyle}>Kategori *</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })} style={inputStyle}>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Merek</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} style={inputStyle} placeholder="Opsional" />
            </div>

            <div>
              <label style={labelStyle}>Harga Sewa Per Hari (Rp) *</label>
              <input required type="number" min="0" value={form.price_per_day || ""} onChange={(e) => setForm({ ...form, price_per_day: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="0" />
            </div>

            <div>
              <label style={labelStyle}>Minimal DP (%) *</label>
              <input required type="number" min="10" max="100" value={form.min_dp_percentage || ""} onChange={(e) => setForm({ ...form, min_dp_percentage: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="20" />
            </div>

            <div>
              <label style={labelStyle}>Jumlah Unit Awal *</label>
              <input required type="number" min="1" value={form.total_units || ""} onChange={(e) => setForm({ ...form, total_units: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="1" />
            </div>

            <div>
              <label style={labelStyle}>Status Produk</label>
              <select value={form.is_active ? "1" : "0"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })} style={inputStyle}>
                <option value="1">Aktif (Tersedia disewa)</option>
                <option value="0">Nonaktif (Disembunyikan)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tandai Sebagai Unggulan?</label>
              <select value={form.is_featured ? "1" : "0"} onChange={(e) => setForm({ ...form, is_featured: e.target.value === "1" })} style={inputStyle}>
                <option value="1">⭐ Ya, Unggulan</option>
                <option value="0">Tidak</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px", justifyContent: "flex-end", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="btn-secondary"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-primary" 
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "⏳ Menyimpan..." : "💾 Simpan Produk Baru"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
