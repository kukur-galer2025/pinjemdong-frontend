"use client";

import { useEffect, useState, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    sort_order: 0,
    is_active: true
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (err) {
      toast.error("Gagal mengambil data kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", icon: "", description: "", sort_order: categories.length + 1, is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      icon: cat.icon || "",
      description: cat.description || "",
      sort_order: cat.sort_order,
      is_active: cat.is_active
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("pinjemdong-token");

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/admin/categories/${editingId}` : `${API}/admin/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingId ? "Kategori diperbarui!" : "Kategori ditambahkan!");
        setModalOpen(false);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || "Terjadi kesalahan.");
      }
    } catch (err) {
      toast.error("Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini? Jika ada produk di dalamnya, sistem akan menolak atau menyarankan penonaktifan.")) return;
    
    const token = localStorage.getItem("pinjemdong-token");
    try {
      const res = await fetch(`${API}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Kategori dihapus.");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menghapus.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi.");
    }
  };

  if (loading) {
    return <div style={{ padding: "32px", fontWeight: 600 }}>Memuat data kategori...</div>;
  }

  return (
    <div>
      <Toaster position="top-center" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>📂 Kelola Kategori</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>Kelola semua kategori produk yang tampil di katalog.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.9rem" }}>
          + Tambah Kategori
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>URUTAN</th>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>NAMA & IKON</th>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>DESKRIPSI</th>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>PRODUK</th>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>STATUS</th>
                <th style={{ padding: "16px", fontWeight: 700, color: "var(--foreground-muted)", textAlign: "right" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "var(--foreground-muted)" }}>
                    Belum ada kategori.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px" }}>
                      <span style={{ fontWeight: 700, background: "var(--background)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", border: "1px solid var(--border)" }}>
                        {cat.sort_order}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 600 }}>
                      <span style={{ fontSize: "1.2rem", marginRight: "8px" }}>{cat.icon}</span>
                      {cat.name}
                    </td>
                    <td style={{ padding: "16px", color: "var(--foreground-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cat.description || "-"}
                    </td>
                    <td style={{ padding: "16px", fontWeight: 600 }}>
                      {cat.products_count !== undefined ? `${cat.products_count} Item` : '-'}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span className="badge" style={{ 
                        background: cat.is_active ? "var(--success-light)" : "var(--error-light)", 
                        color: cat.is_active ? "var(--success)" : "var(--error)",
                        fontSize: "0.75rem", padding: "4px 10px"
                      }}>
                        {cat.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button onClick={() => openEditModal(cat)} style={{ background: "none", border: "1px solid var(--primary)", color: "var(--primary)", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", marginRight: "8px" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: "none", border: "1px solid var(--error)", color: "var(--error)", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Kategori */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", borderRadius: "var(--radius-lg)", padding: "24px" }}>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "20px" }}>
              {editingId ? "✏️ Edit Kategori" : "✨ Tambah Kategori"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>Nama Kategori <span style={{ color: "var(--error)" }}>*</span></label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)" }} placeholder="Contoh: Kamera & Foto" />
                </div>
                <div style={{ position: "relative" }} ref={emojiPickerRef}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>Ikon</label>
                  <input type="text" value={formData.icon} onClick={() => setShowEmojiPicker(!showEmojiPicker)} readOnly style={{ width: "80px", padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", textAlign: "center", cursor: "pointer", fontSize: "1.2rem" }} placeholder="📷" />
                  {showEmojiPicker && (
                    <div style={{ position: "absolute", top: "100%", left: "0", zIndex: 10, marginTop: "8px" }}>
                      <EmojiPicker onEmojiClick={(e) => { setFormData({ ...formData, icon: e.emoji }); setShowEmojiPicker(false); }} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>Deskripsi Singkat</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", resize: "vertical" }} placeholder="Penjelasan singkat tentang kategori..." />
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>Urutan Tampil (Sort Order)</label>
                  <input type="number" required value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)" }} min="1" />
                  <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "4px" }}>Angka lebih kecil tampil duluan.</p>
                </div>
                {editingId && (
                  <div style={{ width: "100px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>Status</label>
                    <select value={formData.is_active ? "1" : "0"} onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "1" })} style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)" }}>
                      <option value="1">Aktif</option>
                      <option value="0">Nonaktif</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background)", cursor: "pointer", fontWeight: 600 }}>Batal</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: "12px", opacity: saving ? 0.5 : 1 }}>{saving ? "Menyimpan..." : "Simpan Kategori"}</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
