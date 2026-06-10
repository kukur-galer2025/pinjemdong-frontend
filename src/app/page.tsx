"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/api";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Category data will be fetched dynamically from the API



const steps = [
  {
    step: "01",
    title: "Pilih Barang",
    desc: "Jelajahi katalog kami dan temukan barang yang Anda butuhkan. Filter berdasarkan kategori dan ketersediaan.",
    icon: "🔍",
  },
  {
    step: "02",
    title: "Tentukan Tanggal",
    desc: "Pilih tanggal mulai dan selesai sewa. Sistem otomatis menghitung total biaya dan DP minimal.",
    icon: "📅",
  },
  {
    step: "03",
    title: "Transfer & Konfirmasi",
    desc: "Transfer DP ke rekening kami, upload bukti transfer, lalu tunggu konfirmasi admin.",
    icon: "💳",
  },
  {
    step: "04",
    title: "Ambil & Gunakan",
    desc: "Ambil barang di lokasi kami atau pilih pengantaran. Nikmati barangnya selama masa sewa!",
    icon: "🎉",
  },
];

const stats = [
  { number: "10K+", label: "Pengguna Aktif" },
  { number: "2.5K+", label: "Barang Tersedia" },
  { number: "50K+", label: "Transaksi Sukses" },
  { number: "4.9", label: "Rating Rata-rata" },
];

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch products
    fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "") + "/api/products?featured=1&per_page=8", {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((res) => setProducts(res.data || []))
      .catch(() => {});

    // Fetch categories
    fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "") + "/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "80px 24px 100px",
          minHeight: "85vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Decorations */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[80px] items-center">
            {/* Left - Text */}
            <div className="animate-fade-in-up">
              <div style={{ 
                background: "var(--background-elevated)", color: "var(--foreground)", border: "1px solid var(--border)",
                padding: "6px 20px", borderRadius: "20px", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.5px",
                display: "inline-block", marginBottom: "24px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)"
              }}>
                ✨ LAYANAN SEWA KELAS SATU
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  marginBottom: "24px",
                  letterSpacing: "-0.03em",
                }}
              >
                Pengalaman Sewa
                <br />
                <span style={{ background: "linear-gradient(135deg, var(--foreground) 0%, var(--foreground-muted) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> Premium Tanpa Batas.</span>
              </h1>

              <p
                style={{
                  fontSize: "1.15rem",
                  color: "var(--foreground-secondary)",
                  lineHeight: 1.7,
                  marginBottom: "36px",
                  maxWidth: "540px",
                }}
              >
                Dari kamera profesional hingga perlengkapan eksklusif, temukan ribuan barang untuk disewa dengan standar kualitas terbaik. Aman, cepat, dan terpercaya.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalog" style={{ 
                  display: "inline-flex", justifyContent: "center", alignItems: "center", background: "var(--foreground)", color: "var(--background)", 
                  padding: "16px 36px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "1.05rem", textDecoration: "none", 
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", transition: "all 0.3s ease" 
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}>
                  Eksplorasi Katalog →
                </Link>
                <Link href="/how-it-works" style={{ 
                  display: "inline-flex", justifyContent: "center", alignItems: "center", background: "transparent", color: "var(--foreground)", border: "1.5px solid var(--border)",
                  padding: "16px 36px", borderRadius: "var(--radius-full)", fontWeight: 700, fontSize: "1.05rem", textDecoration: "none", transition: "all 0.3s ease" 
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--foreground)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                  Pelajari Layanan Kami
                </Link>
              </div>

              {/* Trust Badges */}
              <div style={{ display: "flex", gap: "24px", marginTop: "48px", flexWrap: "wrap" }}>
                {["✅ Deposit Aman", "🔒 Identitas Terverifikasi", "⭐ 4.9 Rating"].map((badge) => (
                  <span key={badge} style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", fontWeight: 500 }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Hero Visual */}
            <div className="animate-fade-in-up delay-200">
              <div 
                className="relative w-full rounded-3xl"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.08), inset 0 0 40px rgba(255,255,255,0.02)",
                  minHeight: "460px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden"
                }}
              >
                {/* Beautiful Unsplash Image Background */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=1600&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                
                {/* Cinematic Dark Overlay for Legibility */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(10,10,10,0.85))" }}></div>
                
                {/* Dotted Pattern on top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div style={{ width: "100px", height: "100px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 1 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#ffffff", textAlign: "center", marginBottom: "12px", zIndex: 1, letterSpacing: "-0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                  Eksplorasi Katalog
                </h3>
                <p style={{ color: "rgba(255,255,255,0.85)", textAlign: "center", fontSize: "1rem", maxWidth: "250px", zIndex: 1, textShadow: "0 2px 5px rgba(0,0,0,0.5)" }}>
                  Koleksi eksklusif untuk gaya hidup tanpa batas
                </p>

                {/* Floating Cards */}
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: "-20px",
                    padding: "16px 24px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                    animation: "float 5s ease-in-out infinite",
                    animationDelay: "0.5s",
                    zIndex: 2,
                  }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--background-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>Sony A7 III</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", fontWeight: 500 }}>Perlengkapan Pro</div>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: "40px",
                    left: "-30px",
                    padding: "16px 24px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
                    animation: "float 6s ease-in-out infinite",
                    animationDelay: "1.5s",
                    zIndex: 2,
                  }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--background-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>⛺</div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)" }}>Tenda Eiger</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", fontWeight: 500 }}>Paket Camping</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUSTED BRANDS SECTION
          ============================================ */}
      <section style={{ padding: "0 0 60px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Menyewakan Produk dari Merek Terpercaya
          </p>
        </div>
        <div className="marquee-container" style={{ maxWidth: "100%", margin: "0 auto" }}>
          <div className="marquee-content">
            {/* First Set */}
            {[
              { icon: "📷", name: "SONY", logo: "/images/brands/sony.svg" },
              { icon: "📸", name: "CANON", logo: "/images/brands/canon.svg" },
              { icon: "⛺", name: "EIGER", logo: "/images/brands/eiger.svg" },
              { icon: "🎮", name: "PLAYSTATION", logo: "/images/brands/playstation.svg" },
              { icon: "🚁", name: "DJI", logo: "/images/brands/dji.svg" },
              { icon: "⌚", name: "APPLE", logo: "/images/brands/apple.svg" },
              { icon: "📱", name: "SAMSUNG", logo: "/images/brands/samsung.svg" },
              { icon: "⛰️", name: "CONSINA", logo: "/images/brands/consina.svg" },
            ].map((brand, i) => (
              <div key={`brand1-${i}`} className="brand-logo" style={{ height: "40px", minWidth: "120px", display: "flex", justifyContent: "center" }}>
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
                  <span>{brand.icon}</span> {brand.name}
                </div>
              </div>
            ))}
            {/* Duplicated Set for infinite loop effect */}
            {[
              { icon: "📷", name: "SONY", logo: "/images/brands/sony.svg" },
              { icon: "📸", name: "CANON", logo: "/images/brands/canon.svg" },
              { icon: "⛺", name: "EIGER", logo: "/images/brands/eiger.svg" },
              { icon: "🎮", name: "PLAYSTATION", logo: "/images/brands/playstation.svg" },
              { icon: "🚁", name: "DJI", logo: "/images/brands/dji.svg" },
              { icon: "⌚", name: "APPLE", logo: "/images/brands/apple.svg" },
              { icon: "📱", name: "SAMSUNG", logo: "/images/brands/samsung.svg" },
              { icon: "⛰️", name: "CONSINA", logo: "/images/brands/consina.svg" },
            ].map((brand, i) => (
              <div key={`brand2-${i}`} className="brand-logo" style={{ height: "40px", minWidth: "120px", display: "flex", justifyContent: "center" }}>
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div style={{ display: 'none', alignItems: 'center', gap: '10px' }}>
                  <span>{brand.icon}</span> {brand.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ============================================
          STATS SECTION
          ============================================ */}
      <section
        style={{
          padding: "40px 24px",
          background: "var(--background-secondary)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "32px",
              textAlign: "center",
            }}
            className="stats-grid"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="gradient-text" style={{ fontSize: "2.2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
                  {stat.number}
                </div>
                <div style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CATEGORIES SECTION
          ============================================ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimateOnScroll>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
              Kategori
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.02em" }}>
              Mau Sewa <span className="gradient-text">Apa Hari Ini?</span>
            </h2>
            <p style={{ color: "var(--foreground-secondary)", maxWidth: "500px", margin: "12px auto 0", fontSize: "1.05rem" }}>
              Pilih dari berbagai kategori barang yang tersedia
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="card"
                style={{
                  padding: "28px 20px",
                  textAlign: "center",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{cat.icon || "📦"}</div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "4px" }}>{cat.name}</h3>
                <span style={{ color: "var(--foreground-muted)", fontSize: "0.8rem" }}>{cat.products_count} barang</span>
              </Link>
            ))}
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============================================
          FEATURED PRODUCTS SECTION
          ============================================ */}
      <section style={{ padding: "40px 24px 80px", background: "var(--background-secondary)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "36px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
                ✨ Populer
              </span>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.02em" }}>
                Barang Paling Diminati
              </h2>
            </div>
            <Link href="/catalog" className="btn-secondary" style={{ padding: "10px 24px" }}>
              Lihat Semua →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/item/${product.slug}`}
                className="card flex flex-col"
                style={{
                  textDecoration: "none",
                  color: "var(--foreground)",
                  overflow: "hidden",
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    height: "150px",
                    background: "var(--primary-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                      🔥 Populer
                    </span>
                  )}
                  {product.primary_image ? (
                    <Image
                      src={product.primary_image.image_path.startsWith('http') ? product.primary_image.image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + product.primary_image.image_path}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>📦</span>
                  )}
                </div>

                {/* Product Info */}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "12px 14px" }}>
                <span
                  style={{
                    color: "var(--foreground-muted)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "4px",
                  }}
                >
                  {product.category?.name}
                </span>
                <h3 className="line-clamp-2" style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: "1.3", margin: 0, marginBottom: "8px" }}>
                  {product.name}
                </h3>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700 }}>
                    ★ {parseFloat(product.reviews_avg_rating || 0).toFixed(1)}
                  </span>
                  <span style={{ color: "var(--foreground-muted)", fontSize: "0.7rem" }}>
                    ({product.reviews_count || 0} ulasan)
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
                    Sewa →
                  </div>
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          BENEFITS SECTION
          ============================================ */}
      <section className="benefits-section" style={{
        position: "relative",
        padding: "100px 24px",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimateOnScroll>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="badge" style={{ marginBottom: "12px", background: "var(--primary-light)", color: "var(--primary)", backdropFilter: "blur(4px)" }}>
              Kenapa Memilih Kami?
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.02em", color: "var(--foreground)" }}>
              Keuntungan Menyewa di <span className="gradient-text">pinjemdong</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "💰", title: "Harga Termurah", desc: "Nikmati harga sewa paling kompetitif dibandingkan tempat lain." },
              { icon: "✨", title: "Barang Terawat 100%", desc: "Semua barang dicek dan dibersihkan sebelum disewakan kepada Anda." },
              { icon: "🚀", title: "Proses Cepat & Mudah", desc: "Tanpa ribet! Booking langsung dari web, bayar, dan ambil barang." },
              { icon: "🚚", title: "Bisa Diantar", desc: "Mager keluar rumah? Kami sediakan opsi pengantaran ke lokasi Anda." }
            ].map((benefit, i) => (
              <div
                key={i}
                className="animate-fade-in-up"
                style={{
                  background: "var(--background-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: "32px 24px",
                  textAlign: "center",
                  transition: "transform 0.3s ease, background 0.3s ease",
                  cursor: "default",
                  opacity: 0.95,
                  boxShadow: "var(--shadow-md)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.background = "var(--background-elevated)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "var(--background-card)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
              >
                <div style={{
                  fontSize: "2.5rem",
                  marginBottom: "20px",
                  background: "var(--primary-light)",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  margin: "0 auto 20px"
                }}>
                  {benefit.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "12px", color: "var(--foreground)" }}>{benefit.title}</h3>
                <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS SECTION
          ============================================ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <AnimateOnScroll>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
              Cara Kerja
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.02em" }}>
              Semudah <span className="gradient-text">4 Langkah</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.step}
                className="card"
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div
                  className="gradient-text"
                  style={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    opacity: 0.15,
                    position: "absolute",
                    top: "16px",
                    right: "20px",
                  }}
                >
                  {step.step}
                </div>
                <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>{step.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "10px" }}>{step.title}</h3>
                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS SECTION
          ============================================ */}
      <section style={{ padding: "40px 24px 80px", background: "var(--background-secondary)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="badge badge-primary" style={{ marginBottom: "12px" }}>
              Ulasan Pelanggan
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, marginTop: "12px", letterSpacing: "-0.02em" }}>
              Apa Kata <span className="gradient-text">Mereka?</span>
            </h2>
            <p style={{ color: "var(--foreground-secondary)", maxWidth: "500px", margin: "12px auto 0", fontSize: "1.05rem" }}>
              Ribuan pelanggan telah mempercayakan kebutuhan sewa mereka kepada kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Andi Saputra",
                role: "Content Creator",
                text: "Pinjemdong sangat membantu saya bikin konten tanpa harus beli perlengkapan mahal. Prosesnya gampang banget, admin cepat tanggap. Bakal langganan terus!",
                img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150"
              },
              {
                name: "Siti Aminah",
                role: "Mahasiswi Pecinta Alam",
                text: "Kemarin sewa tenda dan matras buat acara kampus. Barangnya bener-bener wangi, bersih, dan terawat. Harganya juga sangat ramah di kantong mahasiswa!",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
              },
              {
                name: "Budi Santoso",
                role: "Freelance Photographer",
                text: "Sangat recommended! Sewa lensa tele pas ada job liputan konser dadakan. Barang bisa diantar tepat waktu dan kualitasnya luar biasa tanpa cacat.",
                img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150"
              }
            ].map((review, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
                  {[...Array(5)].map((_, idx) => (
                    <span key={idx} style={{ color: "#f59e0b", fontSize: "1.2rem" }}>★</span>
                  ))}
                </div>
                <p style={{
                  color: "var(--foreground-secondary)",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  flex: 1,
                  marginBottom: "24px"
                }}>
                  "{review.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                  <img
                    src={review.img}
                    alt={review.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--primary-light)"
                    }}
                  />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)", marginBottom: "2px" }}>{review.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section style={{ padding: "40px 24px 80px" }}>
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "var(--primary-gradient)",
            borderRadius: "var(--radius-xl)",
            padding: "60px 40px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-xl), 0 0 60px rgba(124, 58, 237, 0.15)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30%",
              left: "-10%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 900, color: "#fff", marginBottom: "16px", letterSpacing: "-0.02em" }}>
              Siap Mulai Menyewa?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
              Daftar sekarang dan dapatkan akses ke ribuan barang berkualitas dengan harga terjangkau.
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "16px 40px",
                background: "#fff",
                color: "#7c3aed",
                borderRadius: "var(--radius-md)",
                fontWeight: 700,
                fontSize: "1.05rem",
                textDecoration: "none",
                transition: "all var(--transition-fast)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              Daftar Gratis 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          RESPONSIVE STYLES
          ============================================ */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center;
          }
          .hero-visual-container {
            display: none;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
