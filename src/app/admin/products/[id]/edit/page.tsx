"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const API = (process.env.NEXT_PUBLIC_API_URL || "");

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  useEffect(() => {
    if (!productId) return;

    // Fetch Categories and Product Data concurrently
    Promise.all([
      fetch(`${API}/categories`).then(r => r.json()),
      fetch(`${API}/admin/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([catsData, productData]) => {
      setCategories(catsData.categories || []);
      
      const product = productData.product;
      if (product) {
        setForm({
          name: product.name,
          description: product.description || "",
          terms_conditions: product.terms_conditions || "",
          category_id: product.category_id,
          brand: product.brand || "",
          price_per_day: product.price_per_day,
          min_dp_percentage: product.min_dp_percentage,
          is_active: product.is_active,
          is_featured: product.is_featured,
        });

        // Set existing images
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
        }
      } else {
        setErrorMsg("Produk tidak ditemukan.");
      }
      setLoading(false);
    }).catch(() => {
      setErrorMsg("Gagal memuat data produk.");
      setLoading(false);
    });
  }, [productId]);

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
      
      e.target.value = "";
    }
  };

  const handleRemoveNewImage = (idxToRemove: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!confirm("Yakin ingin menghapus foto ini?")) return;
    
    try {
      const res = await fetch(`${API}/admin/products/${productId}/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Gagal menghapus gambar.");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    }
  };

  const handleMakeExistingPrimary = async (imageId: number) => {
    try {
      const res = await fetch(`${API}/admin/products/${productId}/images/${imageId}/primary`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingImages(data.product.images);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Gagal mengatur gambar utama.");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan jaringan.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value === null ? "" : (typeof value === 'boolean' ? (value ? "1" : "0") : value.toString()));
    });

    if (imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images[]", file);
      });
    }
    
    // IMPORTANT: Laravel needs POST with _method=PUT to parse multipart/form-data for updates
    formData.append("_method", "PUT");

    try {
      const res = await fetch(`${API}/admin/products/${productId}`, {
        method: "POST", // Use POST due to PHP PUT limitation with FormData
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Produk berhasil diperbarui!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Gagal menyimpan perubahan.");
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

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Memuat data produk...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin/products" style={{ textDecoration: "none", color: "var(--foreground-muted)", fontSize: "1.2rem", padding: "8px" }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Edit Produk</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", margin: 0 }}>Perbarui detail produk dan foto.</p>
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
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "12px", color: "var(--foreground)" }}>Foto Tersimpan:</h4>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {existingImages.sort((a, b) => {
                    if (a.is_primary) return -1;
                    if (b.is_primary) return 1;
                    return a.sort_order - b.sort_order;
                  }).map((img) => {
                    const imgUrl = img.image_path.startsWith('http') ? img.image_path : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${img.image_path}`;
                    return (
                      <div key={img.id} style={{ 
                        position: "relative", width: "140px", height: "140px", borderRadius: "var(--radius-md)", 
                        overflow: "hidden", border: img.is_primary ? "3px solid var(--primary)" : "1px solid var(--border)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                      }}>
                        <img src={imgUrl} alt="Produk" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        
                        <button 
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.id)}
                          style={{ position: "absolute", top: "4px", right: "4px", background: "var(--error)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", zIndex: 10 }}
                          title="Hapus gambar ini"
                        >
                          ✕
                        </button>

                        {img.is_primary ? (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 700, textAlign: "center", padding: "4px 0" }}>
                            FOTO UTAMA
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeExistingPrimary(img.id)}
                            style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.7rem", fontWeight: 600, textAlign: "center", padding: "4px 0", cursor: "pointer", border: "none", transition: "background 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.8)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                          >
                            Jadikan Utama
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Images */}
            <div style={{ paddingTop: existingImages.length > 0 ? "16px" : "0", borderTop: existingImages.length > 0 ? "1px solid var(--border)" : "none" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "12px", color: "var(--foreground)" }}>Tambah Foto Baru:</h4>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} style={{ 
                    position: "relative", width: "140px", height: "140px", borderRadius: "var(--radius-md)", 
                    overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}>
                    <img src={preview} alt={`Preview ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button 
                      type="button"
                      onClick={() => handleRemoveNewImage(idx)}
                      style={{ position: "absolute", top: "4px", right: "4px", background: "var(--error)", color: "#fff", border: "none", borderRadius: "var(--radius-full)", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", zIndex: 10 }}
                      title="Batal tambah"
                    >
                      ✕
                    </button>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "0.7rem", fontWeight: 600, textAlign: "center", padding: "4px 0" }}>
                      Akan Diunggah
                    </div>
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
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          {/* DETAIL PRODUK SECTION */}
          <div className="responsive-grid-2">
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nama Produk *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi Produk *</label>
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
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
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Harga Sewa Per Hari (Rp) *</label>
              <input required type="number" min="0" value={form.price_per_day === null ? "" : form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="0" />
            </div>

            <div>
              <label style={labelStyle}>Minimal DP (%) *</label>
              <input required type="number" min="10" max="100" value={form.min_dp_percentage === null ? "" : form.min_dp_percentage} onChange={(e) => setForm({ ...form, min_dp_percentage: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="20" />
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
              {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
