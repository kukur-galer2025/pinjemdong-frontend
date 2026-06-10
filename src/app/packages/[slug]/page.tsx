"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "");

interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_per_day: string;
  original_price_per_day: string;
  min_dp_percentage: number;
  image: string | null;
  items: {
    quantity: number;
    product: {
      id: number;
      name: string;
      primary_image: { image_path: string } | null;
      category_icon: string;
    }
  }[];
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/storage/${imagePath}`;
}

export default function PackageDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCartWarning, setShowCartWarning] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ show: false, msg: "" });

  useEffect(() => {
    if (!slug) return;
    
    fetch(`${API_URL}/packages/${slug}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Paket tidak ditemukan");
        setPkg(data.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCheckoutPackage = () => {
    if (!pkg) return;
    
    const normalCart = JSON.parse(localStorage.getItem("pinjemdong-cart") || "[]");
    if (normalCart.length > 0) {
      setShowCartWarning(true);
      return; // Route them through warning if they have regular items
    }

    localStorage.setItem("pinjemdong-package", JSON.stringify(pkg));
    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (!pkg) return;
    
    const normalCart = JSON.parse(localStorage.getItem("pinjemdong-cart") || "[]");
    if (normalCart.length > 0) {
      setShowCartWarning(true);
      return;
    }

    addToCartConfirmed();
  };

  const addToCartConfirmed = (checkout: boolean = false) => {
    if (!pkg) return;
    localStorage.removeItem("pinjemdong-cart");
    localStorage.setItem("pinjemdong-package", JSON.stringify(pkg));
    setShowCartWarning(false);
    
    // Wrap dispatchEvent in setTimeout to avoid state-update-during-render warnings
    setTimeout(() => {
      window.dispatchEvent(new Event("cart-updated"));
    }, 0);
    
    if (checkout) {
      router.push("/checkout");
    } else {
      setFlashMessage({ show: true, msg: "Paket VIP ditambahkan ke keranjang" });
      setTimeout(() => setFlashMessage({ show: false, msg: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 24px", minHeight: "80vh" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
          <div>
            <div style={{ height: "400px", borderRadius: "var(--radius-lg)", background: "var(--background-elevated)", animation: "pulse 1.5s infinite", marginBottom: "24px" }}></div>
            <div style={{ width: "60%", height: "40px", borderRadius: "8px", background: "var(--background-elevated)", animation: "pulse 1.5s infinite", marginBottom: "16px" }}></div>
            <div style={{ width: "90%", height: "20px", borderRadius: "4px", background: "var(--background-elevated)", animation: "pulse 1.5s infinite", marginBottom: "12px" }}></div>
            <div style={{ width: "80%", height: "20px", borderRadius: "4px", background: "var(--background-elevated)", animation: "pulse 1.5s infinite" }}></div>
          </div>
          <div>
            <div style={{ height: "400px", borderRadius: "var(--radius-lg)", background: "var(--background-elevated)", animation: "pulse 1.5s infinite" }}></div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}} />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 24px", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ 
          textAlign: "center", padding: "60px 40px", background: "var(--background-secondary)", 
          borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.03)"
        }}>
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "50%", background: "var(--background)", border: "1px solid var(--border)", 
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "16px", color: "var(--foreground)" }}>{error || "Paket Tidak Ditemukan"}</h1>
          <p style={{ color: "var(--foreground-muted)", marginBottom: "32px" }}>Maaf, paket yang Anda cari mungkin telah dihapus atau tautan rusak.</p>
          <Link href="/packages" style={{ 
            display: "inline-block", background: "var(--foreground)", color: "var(--background)", 
            padding: "12px 28px", borderRadius: "var(--radius-full)", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)", transition: "all 0.3s ease"
          }}>Kembali ke Koleksi</Link>
        </div>
      </div>
    );
  }

  const discount = Math.round((1 - Number(pkg.price_per_day) / Number(pkg.original_price_per_day)) * 100);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Toast Notification */}
      {flashMessage.show && (
        <div style={{
          position: "fixed", top: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: "var(--foreground)", color: "var(--background)", padding: "16px 24px",
          borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "12px",
          fontWeight: 600, animation: "slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}>
          <div style={{ background: "var(--background)", color: "var(--foreground)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {flashMessage.msg}
        </div>
      )}

      {/* Cart Warning Modal */}
      {showCartWarning && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCartWarning(false)}></div>
          <div style={{ 
            position: "relative", width: "100%", maxWidth: "420px", background: "var(--background)", 
            borderRadius: "var(--radius-xl)", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            border: "1px solid var(--border)", animation: "zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          }}>
            <div style={{ width: "60px", height: "60px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", color: "#F59E0B" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "12px", color: "var(--foreground)" }}>Kosongkan Keranjang Reguler?</h3>
            <p style={{ color: "var(--foreground-muted)", lineHeight: 1.6, marginBottom: "32px" }}>
              Satu pesanan hanya dapat berisi Paket VIP atau Barang Reguler secara terpisah. Menambahkan Paket VIP ini akan mengganti barang-barang yang ada di keranjang Anda saat ini. Lanjutkan?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => setShowCartWarning(false)}
                style={{ flex: 1, padding: "14px", borderRadius: "var(--radius-full)", background: "var(--background-secondary)", color: "var(--foreground)", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Batal
              </button>
              <button 
                onClick={() => addToCartConfirmed(false)}
                style={{ flex: 1, padding: "14px", borderRadius: "var(--radius-full)", background: "var(--foreground)", color: "var(--background)", border: "none", fontWeight: 700, cursor: "pointer" }}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      <Link href="/packages" style={{ 
        display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "32px", 
        color: "var(--foreground)", background: "var(--background-elevated)", padding: "10px 20px", borderRadius: "30px",
        textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", border: "1px solid var(--border)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)", transition: "all 0.3s ease"
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(-6px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.04)"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Kembali ke VIP Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-start">
        {/* Left: Image & Description */}
        <div className="animate-fade-in-up">
          <div style={{ 
            position: "relative", height: "460px", borderRadius: "var(--radius-xl)", overflow: "hidden", 
            background: "var(--background-secondary)", marginBottom: "36px", 
            boxShadow: "0 30px 60px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.1)",
            transform: "translateZ(0)" // Force GPU acceleration for smoother rendering
          }}>
            {pkg.image ? (
              <Image src={getImageUrl(pkg.image)} alt={pkg.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background-elevated)" }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
            )}
            
            {discount > 0 && (
              <div style={{
                position: "absolute", top: "20px", right: "20px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#fff",
                padding: "8px 18px", borderRadius: "24px",
                fontWeight: 800, fontSize: "1rem", letterSpacing: "0.5px",
                boxShadow: "0 6px 16px rgba(217, 119, 6, 0.4)", border: "1px solid rgba(255,255,255,0.2)"
              }}>
                VIP HEMAT {discount}%
              </div>
            )}
          </div>
          
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: "20px", lineHeight: "1.15", letterSpacing: "-0.02em" }}>
            {pkg.name}
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--foreground-secondary)", lineHeight: "1.7", marginBottom: "40px" }}>
            {pkg.description}
          </p>
        </div>

        {/* Right: Items & Action */}
        <div className="animate-fade-in-up delay-200" style={{ position: "sticky", top: "120px" }}>
          <div style={{ 
            padding: "32px", borderRadius: "var(--radius-xl)", background: "var(--background)", 
            border: "1px solid var(--border)", boxShadow: "0 30px 60px rgba(0,0,0,0.08)" 
          }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "28px", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary-light)", color: "var(--primary)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </span>
              Isi Koleksi Bundling
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {pkg.items.map((item, idx) => (
                <div key={idx} style={{ 
                  display: "flex", alignItems: "center", gap: "16px", padding: "16px", 
                  background: "var(--background-secondary)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border)" 
                }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", border: "1px solid var(--border)", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
                    {item.product.category_icon || "🏕️"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px", color: "var(--foreground)" }}>{item.product.name}</h4>
                    <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>Termasuk dalam layanan VIP</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)", background: "var(--primary-light)", padding: "4px 12px", borderRadius: "16px" }}>
                    {item.quantity}x
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "24px", background: "var(--foreground)", color: "var(--background)", borderRadius: "var(--radius-md)", marginBottom: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--background)", opacity: 0.7 }}>
                <span style={{ fontSize: "0.95rem" }}>Harga Satuan Total</span>
                <span style={{ textDecoration: "line-through", fontSize: "0.95rem" }}>Rp {formatRupiah(pkg.original_price_per_day)}/hari</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>Harga Eksklusif</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1 }}>Rp {formatRupiah(pkg.price_per_day)}</span>
                  <span style={{ fontSize: "1rem", opacity: 0.8 }}>/hari</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={handleCheckoutPackage} 
                style={{ 
                  width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: 800, 
                  borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#fff",
                  border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(217, 119, 6, 0.4)",
                  transition: "all 0.3s ease", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(217, 119, 6, 0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(217, 119, 6, 0.4)"; }}
              >
                Pesan Bundling VIP
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              
              <button 
                onClick={handleAddToCart} 
                style={{ 
                  width: "100%", padding: "16px", fontSize: "1.1rem", fontWeight: 700, 
                  borderRadius: "var(--radius-full)", background: "transparent", color: "var(--foreground)",
                  border: "2px solid var(--border)", cursor: "pointer",
                  transition: "all 0.3s ease", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--background-secondary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Tambahkan ke Keranjang
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--foreground-muted)", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Pembayaran Aman • DP Minimal {pkg.min_dp_percentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
