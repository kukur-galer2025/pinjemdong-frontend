"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price_per_day: string;
  brand: string;
  category: { name: string; slug: string; icon: string };
  primary_image: object | null;
  reviews_count: number;
  reviews_avg_rating: string | null;
  available_units_count?: number;
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

const productIcons: Record<string, string> = {
  "kamera-foto": "📸", "alat-camping": "⛺", "konsol-game": "🎮",
  "perlengkapan-pesta": "🎉", "peralatan-teknik": "🔧", "fashion-kostum": "👗",
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(true);
  const [flashMessage, setFlashMessage] = useState<{show: boolean, msg: string}>({show: false, msg: ""});

  const showFlash = (msg: string) => {
    setFlashMessage({show: true, msg});
    setTimeout(() => setFlashMessage({show: false, msg: ""}), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("PinjemLur-token");
    if (!token) {
      setLoggedIn(false);
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setWishlist(data.wishlist || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeFromWishlist = async (productId: number) => {
    // Get product name for flash message before deleting
    const product = wishlist.find(p => p.id === productId);
    const productName = product ? product.name : "Barang";

    // Optimistic deletion for instant feedback
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    window.dispatchEvent(new Event('wishlist-updated'));
    showFlash(`"${productName}" berhasil dihapus.`);

    const token = localStorage.getItem("PinjemLur-token");
    try {
      await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const addToCart = (product: WishlistProduct) => {
    const isAvailable = product.available_units_count === undefined || product.available_units_count > 0;
    if (!isAvailable) {
      showFlash(`Maaf, "${product.name}" sedang habis disewa.`);
      return;
    }

    const packageCart = localStorage.getItem("PinjemLur-package");
    if (packageCart && packageCart !== "null") {
      const confirmReplace = window.confirm("Keranjang Anda saat ini berisi Paket VIP.\nMenambahkan barang individual akan membatalkan paket tersebut.\nLanjutkan?");
      if (!confirmReplace) return;
      localStorage.removeItem("PinjemLur-package");
    }

    const currentCart = JSON.parse(localStorage.getItem("PinjemLur-cart") || "[]");
    const existingIndex = currentCart.findIndex((i: any) => i.product_id === product.id);
    
    if (existingIndex >= 0) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price_per_day: product.price_per_day,
        quantity: 1,
        image_url: product.primary_image ? (product.primary_image as any).image_path : null
      });
    }
    
    localStorage.setItem("PinjemLur-cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cart-updated'));
    showFlash(`"${product.name}" dimasukkan ke Keranjang! 🛒`);
  };

  if (!loggedIn) {
    return (
      <div style={{ textAlign: "center", padding: "120px 24px", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }}></div>
          <div style={{ width: "90px", height: "90px", background: "var(--background-elevated)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", position: "relative", zIndex: 1 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px", color: "var(--foreground)" }}>Masuk untuk melihat Wishlist</h1>
        <p style={{ color: "var(--foreground-muted)", marginBottom: "32px", maxWidth: "400px", lineHeight: 1.6 }}>Anda perlu masuk ke akun Anda terlebih dahulu untuk mengelola dan melihat barang-barang impian Anda.</p>
        <Link href="/login" className="btn-primary" style={{ padding: "14px 40px", borderRadius: "30px", fontWeight: 600, fontSize: "1.05rem", boxShadow: "0 10px 25px rgba(124, 58, 237, 0.3)" }}>
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px" }}>
        <div style={{ width: "48px", height: "48px", background: "var(--background-elevated)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(124, 58, 237, 0.1)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          Wishlist <span className="gradient-text">Saya</span>
          {!loading && wishlist.length > 0 && <span style={{ fontSize: "1.3rem", color: "var(--foreground-muted)", fontWeight: 600, marginLeft: "10px" }}>({wishlist.length})</span>}
        </h1>
      </div>
      <p style={{ color: "var(--foreground-secondary)", marginBottom: "40px", fontSize: "1.05rem" }}>Barang-barang istimewa yang sedang Anda pantau</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ overflow: "hidden", borderRadius: "24px" }}>
              <div className="skeleton" style={{ height: "200px" }} />
              <div style={{ padding: "24px" }}>
                <div className="skeleton" style={{ height: "16px", width: "60%", marginBottom: "12px", borderRadius: "8px" }} />
                <div className="skeleton" style={{ height: "24px", width: "80%", marginBottom: "16px", borderRadius: "8px" }} />
                <div className="skeleton" style={{ height: "20px", width: "50%", borderRadius: "8px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 20px", background: "var(--background-secondary)", borderRadius: "32px", border: "1px dashed var(--border)" }}>
          <div style={{ position: "relative", marginBottom: "32px", display: "inline-block" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)", filter: "blur(20px)", zIndex: 0 }}></div>
            <div style={{ width: "90px", height: "90px", background: "var(--background-elevated)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", position: "relative", zIndex: 1 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
          </div>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "12px", color: "var(--foreground)" }}>Wishlist Kosong</h3>
          <p style={{ color: "var(--foreground-muted)", marginBottom: "32px", fontSize: "1.05rem", maxWidth: "400px", margin: "0 auto 32px" }}>Sepertinya Anda belum menemukan barang yang memikat hati. Mari jelajahi katalog kami.</p>
          <Link href="/catalog" style={{ 
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "16px 48px", borderRadius: "100px", fontWeight: 800, fontSize: "1.1rem",
            color: "#ffffff", textDecoration: "none",
            background: "linear-gradient(135deg, var(--primary) 0%, #4C1D95 100%)",
            boxShadow: "0 10px 30px rgba(124, 58, 237, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)",
            position: "relative", overflow: "hidden", transition: "all 0.3s ease"
          }}
          className="hover-scale"
          >
            <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              Eksplorasi Katalog <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
            {/* Shimmer animation element */}
            <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)", transform: "skewX(-20deg)", animation: "shimmer 3s infinite", zIndex: 0 }}></div>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {wishlist.map((product) => (
            <div 
              key={product.id} 
              style={{ 
                overflow: "hidden", position: "relative", borderRadius: "24px", 
                background: "var(--background)", border: "1px solid var(--border)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)", transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                display: "flex", flexDirection: "column"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.03)";
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(product.id);
                }}
                style={{
                  position: "absolute", top: "16px", right: "16px", zIndex: 10,
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.9)", border: "none", 
                  color: "var(--error)", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", backdropFilter: "blur(8px)"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--error)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.transform = "scale(1.15) rotate(90deg)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.color = "var(--error)";
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                }}
                title="Hapus dari Wishlist"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
              
              <Link href={`/item/${product.slug}`} style={{ textDecoration: "none", color: "var(--foreground)", display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
                
                {/* Live Stock Badge */}
                <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 10, background: (product.available_units_count === undefined || product.available_units_count > 0) ? "rgba(16, 185, 129, 0.85)" : "rgba(161, 161, 170, 0.85)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: "100px", color: "#ffffff", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
                  {(product.available_units_count === undefined || product.available_units_count > 0) ? (
                    <><div style={{ width: "6px", height: "6px", background: "#ffffff", borderRadius: "50%", animation: "pulse 2s infinite" }}></div> Tersedia</>
                  ) : (
                    <><div style={{ width: "6px", height: "6px", background: "#ffffff", borderRadius: "50%", opacity: 0.5 }}></div> Habis</>
                  )}
                </div>

                <div style={{ height: "200px", background: "var(--background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.05) 0%, transparent 50%)", zIndex: 1 }}></div>
                  {product.primary_image ? (
                    <Image
                      src={(product.primary_image as any).image_path}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover', transition: "transform 0.5s ease" }}
                      unoptimized
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                    />
                  ) : (
                    productIcons[product.category?.slug] || "📦"
                  )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "20px" }}>
                  <span
                    style={{
                      color: "var(--primary)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "6px",
                    }}
                  >
                    {product.category?.name}
                  </span>
                  
                  <h3 className="line-clamp-2" style={{ fontSize: "1.05rem", fontWeight: 800, lineHeight: "1.4", margin: 0, marginBottom: "12px", color: "var(--foreground)" }}>
                    {product.name}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                    <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "4px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span style={{ color: "#d97706", fontSize: "0.75rem", fontWeight: 800 }}>
                        {product.reviews_avg_rating ? Number(product.reviews_avg_rating).toFixed(1) : "0.0"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "16px",
                      borderTop: "1px dashed var(--border)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      position: "relative"
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--foreground-muted)", fontSize: "0.7rem", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Tarif Sewa</span>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <span className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 900 }}>
                          Rp {formatRupiah(product.price_per_day)}
                        </span>
                        <span style={{ color: "var(--foreground-muted)", fontSize: "0.75rem", marginLeft: "2px", fontWeight: 600 }}>
                          /hr
                        </span>
                      </div>
                    </div>
                    
                    {/* Quick Add To Cart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      style={{ 
                        width: "44px", height: "44px", borderRadius: "14px", 
                        background: "var(--foreground)", color: "var(--background)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                        transformOrigin: "center",
                        opacity: (product.available_units_count === undefined || product.available_units_count > 0) ? 1 : 0.5,
                        pointerEvents: (product.available_units_count === undefined || product.available_units_count > 0) ? "auto" : "none"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.25)";
                        e.currentTarget.style.background = "var(--primary)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                        e.currentTarget.style.background = "var(--foreground)";
                        e.currentTarget.style.color = "var(--background)";
                      }}
                      title="Sewa Cepat"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Premium Flash Message / Toast */}
      {flashMessage.show && (
        <div style={{
          position: "fixed",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15, 15, 20, 0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: "#ffffff",
          padding: "14px 24px",
          borderRadius: "100px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)",
          zIndex: 9999,
          animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          fontSize: "0.95rem",
          fontWeight: 600,
          whiteSpace: "nowrap"
        }}>
          <div style={{ width: "24px", height: "24px", background: "rgba(16, 185, 129, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{flashMessage.msg}</span>
        </div>
      )}
    </div>
  );
}
