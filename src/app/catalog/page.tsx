"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_per_day: string;
  brand: string;
  min_dp_percentage: number;
  is_featured: boolean;
  category: { name: string; slug: string; icon: string };
  primary_image: { image_path: string } | null;
  reviews_count: number;
  reviews_avg_rating: string | null;
  available_units_count: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  products_count: number;
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, isAdded: boolean} | null>(null);
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({ from: 0, to: 0 });

  // Fetch categories
  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("PinjemLur-token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Assuming the API returns a list of wishlist items or products
          // We need the product IDs
          if (data.wishlist) {
            const ids = data.wishlist.map((item: any) => item.product_id || item.id);
            setWishlistIds(ids);
          }
        }
      } catch (e) {
        console.error("Error fetching wishlist", e);
      }
    };
    fetchWishlist();
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Debounce price filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      if (minPrice !== debouncedMinPrice || maxPrice !== debouncedMaxPrice) {
        setCurrentPage(1);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [minPrice, maxPrice]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, debouncedSearchQuery, selectedBrand, debouncedMinPrice, debouncedMaxPrice, availableOnly, sortBy, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (debouncedSearchQuery) params.set("search", debouncedSearchQuery);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (debouncedMinPrice) params.set("min_price", debouncedMinPrice);
    if (debouncedMaxPrice) params.set("max_price", debouncedMaxPrice);
    if (availableOnly) params.set("available_only", "1");
    if (sortBy) params.set("sort", sortBy);
    params.set("page", currentPage.toString());
    params.set("per_page", "12");

    try {
      const res = await fetch(`${API_URL}/products?${params}`);
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setPaginationInfo({ from: data.from || 0, to: data.to || 0 });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    // Optimistic update
    const isAdding = !wishlistIds.includes(productId);
    setWishlistIds(prev => 
      isAdding ? [...prev, productId] : prev.filter(id => id !== productId)
    );

    try {
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (res.ok) {
        window.dispatchEvent(new Event("wishlist-updated"));
        setToastMsg({
          title: isAdding ? "Tersimpan ke Wishlist" : "Dihapus dari Wishlist",
          desc: isAdding ? "Barang telah berhasil ditambahkan." : "Barang telah dihapus dari daftar.",
          isAdded: isAdding
        });
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        // Revert on failure
        setWishlistIds(prev => 
          prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
      }
    } catch (err) {
      console.error("Wishlist toggle error", err);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMinPrice("");
    setDebouncedMaxPrice("");
    setAvailableOnly(false);
    setSortBy("latest");
    setCurrentPage(1);
  };

  const productIcons: Record<string, string> = {
    "kamera-foto": "📸",
    "alat-camping": "⛺",
    "konsol-game": "🎮",
    "perlengkapan-pesta": "🎉",
    "peralatan-teknik": "🔧",
    "fashion-kostum": "👗",
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 80px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Link href="/" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
            Beranda
          </Link>
          <span style={{ color: "var(--foreground-muted)" }}>›</span>
          <span style={{ color: "var(--foreground)", fontWeight: 500, fontSize: "0.9rem" }}>Katalog</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          Katalog <span className="gradient-text">Barang Sewa</span>
        </h1>
        <p style={{ color: "var(--foreground-secondary)", marginTop: "8px", fontSize: "1.05rem" }}>
          Temukan barang yang Anda butuhkan dari koleksi kami
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Desktop & Mobile Sidebar Filters */}
        <aside 
          className={`shrink-0 w-full lg:w-[280px] glass lg:sticky lg:top-24 rounded-[var(--radius-lg)] shadow-sm transition-all duration-300 ${isMobileFilterOpen ? "block" : "hidden lg:block"}`}
          style={{ zIndex: 10, padding: "32px 28px" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Filter</h3>
            <button 
              className="lg:hidden" 
              onClick={() => setIsMobileFilterOpen(false)}
              style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Brand Filter */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Merek</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)",
                  background: "var(--background-elevated)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              >
                <option value="">Semua Merek</option>
                <option value="Sony">Sony</option>
                <option value="Canon">Canon</option>
                <option value="Nintendo">Nintendo</option>
                <option value="Playstation">Playstation</option>
                <option value="DJI">DJI</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Eiger">Eiger</option>
                <option value="Consina">Consina</option>
              </select>
            </div>

            {/* Price Filters */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Harga per Hari</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Rp</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid var(--border)",
                      background: "var(--background-elevated)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Rp</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "var(--radius-md)",
                      border: "1.5px solid var(--border)",
                      background: "var(--background-elevated)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Availability Toggle */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ketersediaan</label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.95rem", color: "var(--foreground)" }}>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => {
                    setAvailableOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "var(--primary)",
                    cursor: "pointer"
                  }}
                />
                Sembunyikan Stok Habis
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full">

      {/* Search & Filter Bar */}
      <div
        className="glass"
        style={{
          padding: "16px 20px",
          borderRadius: "var(--radius-lg)",
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: "1 1 250px", position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.1rem",
              opacity: 0.5,
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Cari barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 40px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border)",
              background: "var(--background-elevated)",
              color: "var(--foreground)",
              fontSize: "0.95rem",
              outline: "none",
              transition: "border-color var(--transition-fast)",
            }}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="flex lg:hidden items-center gap-2"
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--border)",
            background: "var(--background-elevated)",
            color: "var(--foreground)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span>⚙️</span> Filter
        </button>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--border)",
            background: "var(--background-elevated)",
            color: "var(--foreground)",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="latest">Terbaru</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
          <option value="popular">Terpopuler</option>
          <option value="rating">Rating Tertinggi</option>
        </select>
      </div>

      {/* Active Filter Chips */}
      {(selectedBrand || minPrice || maxPrice || availableOnly || selectedCategory) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}>
          {selectedCategory && (
            <span style={{ padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Kategori: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <button onClick={() => setSelectedCategory("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>✕</button>
            </span>
          )}
          {selectedBrand && (
            <span style={{ padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Merek: {selectedBrand}
              <button onClick={() => setSelectedBrand("")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>✕</button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span style={{ padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Rp {minPrice || 0} - Rp {maxPrice || "~"}
              <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>✕</button>
            </span>
          )}
          {availableOnly && (
            <span style={{ padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
              Hanya Tersedia
              <button onClick={() => setAvailableOnly(false)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>✕</button>
            </span>
          )}
          <button 
            onClick={resetFilters}
            style={{ padding: "6px 12px", background: "transparent", color: "var(--error)", border: "none", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            Hapus Semua
          </button>
        </div>
      )}

      {/* Category Chips */}
      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "36px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <button
          onClick={() => {
            setSelectedCategory("");
            setCurrentPage(1);
          }}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-full)",
            border: "1.5px solid var(--border)",
            background: !selectedCategory ? "var(--primary)" : "var(--background-elevated)",
            color: !selectedCategory ? "var(--primary-foreground)" : "var(--foreground)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all var(--transition-fast)",
          }}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setSelectedCategory(cat.slug);
              setCurrentPage(1);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-full)",
              border: "1.5px solid var(--border)",
              background: selectedCategory === cat.slug ? "var(--primary)" : "var(--background-elevated)",
              color: selectedCategory === cat.slug ? "var(--primary-foreground)" : "var(--foreground)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{cat.icon}</span> {cat.name}
            <span
              style={{
                opacity: 0.6,
                fontSize: "0.75rem",
              }}
            >
              ({cat.products_count})
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="skeleton" style={{ height: "150px", borderRadius: 0 }} />
              <div style={{ padding: "20px" }}>
                <div className="skeleton" style={{ height: "14px", width: "40%", marginBottom: "10px" }} />
                <div className="skeleton" style={{ height: "18px", width: "80%", marginBottom: "12px" }} />
                <div className="skeleton" style={{ height: "14px", width: "30%", marginBottom: "16px" }} />
                <div className="skeleton" style={{ height: "24px", width: "50%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ 
          textAlign: "center", padding: "100px 20px", display: "flex", flexDirection: "column", alignItems: "center",
          background: "var(--background-secondary)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.02)", width: "100%"
        }}>
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "50%", background: "var(--background)", border: "1px solid var(--border)", 
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--foreground)", marginBottom: "8px", letterSpacing: "-0.02em" }}>Koleksi Tidak Ditemukan</h3>
          <p style={{ color: "var(--foreground-muted)", maxWidth: "300px", lineHeight: 1.6, marginBottom: "24px" }}>
            Maaf, kami tidak menemukan barang yang sesuai dengan kriteria pencarian Anda saat ini.
          </p>
          <button 
            onClick={resetFilters}
            style={{ 
              background: "var(--foreground)", color: "var(--background)", 
              padding: "12px 28px", borderRadius: "var(--radius-full)", fontWeight: 600, border: "none", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)", transition: "all 0.3s ease"
            }}
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/item/${product.slug}`}
              className="card flex flex-col group"
              style={{
                textDecoration: "none",
                color: "var(--foreground)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Product Image Placeholder */}
              <div
                style={{
                  height: "150px",
                  background: "var(--primary-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3.5rem",
                  position: "relative",
                }}
              >
                {product.is_featured && (
                  <span
                    className="badge"
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(255,255,255,0.9)",
                      color: "#7c3aed",
                      zIndex: 2,
                    }}
                  >
                    ⭐ Unggulan
                  </span>
                )}
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    backdropFilter: "blur(4px)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    zIndex: 2,
                  }}
                >
                  DP {product.min_dp_percentage}%
                </span>
                {product.available_units_count === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      zIndex: 3,
                    }}
                  >
                    Stok Habis
                  </div>
                )}
                {/* Removed Wishlist Overlay */}

                {product.primary_image ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <Image
                      src={product.primary_image.image_path.startsWith('http') ? product.primary_image.image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + product.primary_image.image_path}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="transition-transform duration-500 group-hover:scale-110" style={{ fontSize: '3rem' }}>
                    {productIcons[product.category?.slug] || "📦"}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <span
                    style={{
                      color: "var(--foreground-muted)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {product.category?.name}
                  </span>
                  <button
                    onClick={(e) => handleWishlistToggle(e, product.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "1.2rem", lineHeight: 1 }}
                    title={wishlistIds.includes(product.id) ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
                  >
                    {wishlistIds.includes(product.id) ? "❤️" : "🤍"}
                  </button>
                </div>
                <h3 className="line-clamp-2" style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: "1.3", margin: 0, marginBottom: "8px" }}>
                  {product.name}
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700 }}>
                    ★ {product.reviews_avg_rating ? Number(product.reviews_avg_rating).toFixed(1) : "0.0"}
                  </span>
                  <span style={{ color: "var(--foreground-muted)", fontSize: "0.7rem" }}>
                    ({product.reviews_count})
                  </span>
                  <span style={{ marginLeft: "auto", color: "var(--success)", fontSize: "0.7rem", fontWeight: 700 }}>
                    {product.available_units_count} unit
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "12px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ whiteSpace: "nowrap" }}>
                    <span className="gradient-text font-extrabold" style={{ fontSize: "0.9rem" }}>
                      Rp {formatRupiah(product.price_per_day)}
                    </span>
                    <span style={{ color: "var(--foreground-muted)", fontSize: "0.65rem", marginLeft: "2px" }}>
                      /hari
                    </span>
                  </div>
                  <div
                    className="transition-all duration-300 group-hover:!bg-[var(--primary)] group-hover:!text-white"
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                      borderRadius: "var(--radius-md)",
                      background: "var(--primary-light)",
                      color: "var(--primary)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      width: "100%",
                    }}
                  >
                    Detail →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>
            Menampilkan <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{paginationInfo.from}-{paginationInfo.to}</span> dari <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{totalItems}</span> barang
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)",
                  background: "var(--background-elevated)",
                  color: currentPage === 1 ? "var(--foreground-muted)" : "var(--foreground)",
                  fontWeight: 600,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                ← Prev
              </button>
              
              {/* Logic for simple pagination numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => (
                  <div key={`page-${p}`} style={{ display: "flex", gap: "8px" }}>
                    {i > 0 && p - arr[i - 1] > 1 && (
                      <span style={{ display: "flex", alignItems: "center", color: "var(--foreground-muted)" }}>...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "var(--radius-md)",
                        border: "1.5px solid var(--border)",
                        background: currentPage === p ? "var(--primary)" : "var(--background-elevated)",
                        color: currentPage === p ? "var(--primary-foreground)" : "var(--foreground)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {p}
                    </button>
                  </div>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)",
                  background: "var(--background-elevated)",
                  color: currentPage === totalPages ? "var(--foreground-muted)" : "var(--foreground)",
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      </div> {/* Close Main Content flex-1 div */}
      </div> {/* Close Layout 2-col flex div */}

      {/* Login Prompt Modal */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowLoginModal(false)}
        >
          <div 
            className="card"
            style={{ 
              width: "100%", 
              maxWidth: "400px", 
              padding: "32px 24px", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              textAlign: "center",
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
          >
            <div 
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                marginBottom: "20px"
              }}
            >
              🔒
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
              Perlu Masuk Akun
            </h3>
            <p style={{ color: "var(--foreground-secondary)", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.5" }}>
              Anda harus masuk (login) terlebih dahulu untuk dapat menyimpan barang favorit ini ke dalam Wishlist Anda.
            </p>
            <div style={{ display: "flex", gap: "12px", width: "100%", flexDirection: "row" }}>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  color: "var(--foreground)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--background-elevated)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Batal
              </button>
              <Link 
                href="/login"
                className="btn-primary"
                style={{ flex: 1, padding: "12px", fontSize: "0.95rem", textAlign: "center" }}
              >
                Masuk Sekarang
              </Link>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}} />
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div 
          className="fixed top-24 right-6 z-50 flex items-center gap-5 rounded-[var(--radius-lg)] shadow-xl border border-[var(--border)]"
          style={{ 
            padding: "20px 28px 20px 24px",
            background: "var(--glass-bg)", 
            backdropFilter: "var(--glass-backdrop)",
            WebkitBackdropFilter: "var(--glass-backdrop)",
            animation: "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <div 
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              background: toastMsg.isAdded ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: toastMsg.isAdded ? "var(--success)" : "var(--error)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {toastMsg.isAdded ? "✓" : "✕"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{toastMsg.title}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--foreground-secondary)" }}>{toastMsg.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
