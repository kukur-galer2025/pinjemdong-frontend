"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

function formatRupiah(n: number | string) { return new Intl.NumberFormat("id-ID").format(Number(n)); }

export default function EditPackage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params?.id;

  const [products, setProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price_per_day: 0,
    original_price_per_day: 0,
    min_dp_percentage: 20,
    is_active: true,
  });

  const [items, setItems] = useState<{product_id: number, quantity: number}[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("pinjemdong-token") : "";

  useEffect(() => {
    if (!packageId) return;

    Promise.all([
      fetch(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/admin/packages/${packageId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([productsData, packageData]) => {
      setProducts(productsData.data || []);
      
      const pack = packageData.package;
      if (pack) {
        setForm({
          name: pack.name,
          description: pack.description || "",
          price_per_day: pack.price_per_day,
          original_price_per_day: pack.original_price_per_day,
          min_dp_percentage: pack.min_dp_percentage,
          is_active: pack.is_active,
        });

        if (pack.image) {
          const imgUrl = pack.image.startsWith('http') ? pack.image : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${pack.image}`;
          setImagePreview(imgUrl);
        }

        if (pack.products) {
          const packItems = pack.products.map((p: any) => ({
            product_id: p.id,
            quantity: p.pivot.quantity
          }));
          setItems(packItems);
        }
      } else {
        setErrorMsg("Paket tidak ditemukan.");
      }
      setLoading(false);
    }).catch(() => {
      setErrorMsg("Gagal memuat data paket.");
      setLoading(false);
    });
  }, [packageId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran file terlalu besar. Maksimal 2MB.");
        return;
      }
      setErrorMsg("");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addItem = () => {
    if (products.length === 0) return;
    setItems([...items, { product_id: products[0].id, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: string, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  useEffect(() => {
    if (loading) return;
    let total = 0;
    items.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      if (p) {
        total += p.price_per_day * item.quantity;
      }
    });
    setForm(f => ({ ...f, original_price_per_day: total }));
  }, [items, products, loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("Pilih minimal 1 produk untuk paket ini.");
      setSaving(false);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value === null ? "" : (typeof value === 'boolean' ? (value ? "1" : "0") : value.toString()));
    });

    items.forEach((item, idx) => {
      formData.append(`items[${idx}][product_id]`, item.product_id.toString());
      formData.append(`items[${idx}][quantity]`, item.quantity.toString());
    });

    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    // IMPORTANT: Laravel needs POST with _method=PUT to parse multipart/form-data for updates
    formData.append("_method", "PUT");

    try {
      const res = await fetch(`${API}/admin/packages/${packageId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        toast.success("Paket Sewa berhasil diperbarui!");
        router.push("/admin/packages");
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
    return <div style={{ padding: "40px", textAlign: "center" }}>Memuat data paket...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/admin/packages" style={{ textDecoration: "none", color: "var(--foreground-muted)", fontSize: "1.2rem", padding: "8px" }}>
          ←
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Edit Paket Sewa</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", margin: 0 }}>Perbarui bundel produk dan harga.</p>
        </div>
      </div>

      <div className="card" style={{ padding: "32px", borderRadius: "var(--radius-lg)" }}>
        {errorMsg && (
          <div style={{ padding: "12px 16px", background: "var(--error-light)", color: "var(--error)", borderRadius: "var(--radius-md)", marginBottom: "24px", fontWeight: 600, fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* INFO PAKET */}
          <div className="responsive-grid-2">
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nama Paket *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi Paket *</label>
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
            </div>
            
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Ubah Foto Paket (Opsional)</label>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                {imagePreview && (
                  <div style={{ width: "80px", height: "80px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={imagePreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Preview" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  onChange={handleImageChange}
                  style={{ ...inputStyle, padding: "8px", background: "transparent", border: "none" }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          {/* ISI PRODUK */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Isi Paket Produk</h3>
              <button type="button" onClick={addItem} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
                + Tambah Item
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)", color: "var(--foreground-muted)" }}>
                Belum ada produk. Klik tombol "+ Tambah Item" untuk mulai memilih produk.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", background: "var(--background-secondary)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <div style={{ flex: 2 }}>
                      <select 
                        value={item.product_id} 
                        onChange={(e) => updateItem(index, 'product_id', Number(e.target.value))} 
                        style={inputStyle}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Rp {formatRupiah(p.price_per_day)}/hari)</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ width: "100px" }}>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", padding: "8px" }}
                      title="Hapus Item"
                    >
                      <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "var(--background-secondary)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
              <span>Total Harga Asli Per Hari:</span>
              <span>Rp {formatRupiah(form.original_price_per_day)}</span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

          {/* HARGA & STATUS */}
          <div className="responsive-grid-2">
            <div>
              <label style={labelStyle}>Harga Promo Paket Per Hari (Rp) *</label>
              <input required type="number" min="0" max={form.original_price_per_day} value={form.price_per_day || ""} onChange={(e) => setForm({ ...form, price_per_day: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="0" />
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", marginTop: "6px", fontWeight: 600 }}>
                {form.original_price_per_day > 0 && form.price_per_day > 0 
                  ? `Diskon ${Math.round((1 - form.price_per_day / form.original_price_per_day) * 100)}%` 
                  : ""}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Minimal DP (%) *</label>
              <input required type="number" min="10" max="100" value={form.min_dp_percentage || ""} onChange={(e) => setForm({ ...form, min_dp_percentage: e.target.value ? Number(e.target.value) : 0 })} style={inputStyle} placeholder="20" />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Status Paket</label>
              <select value={form.is_active ? "1" : "0"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "1" })} style={inputStyle}>
                <option value="1">Aktif (Tersedia disewa)</option>
                <option value="0">Nonaktif (Disembunyikan)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => router.push("/admin/packages")}
              className="btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={saving || items.length === 0} className="btn-primary" style={{ opacity: (saving || items.length === 0) ? 0.7 : 1 }}>
              {saving ? "⏳ Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
