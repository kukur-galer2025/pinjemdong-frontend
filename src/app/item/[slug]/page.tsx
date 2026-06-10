"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "");

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  terms_conditions: string | null;
  price_per_day: string;
  late_fee_per_day: string;
  min_dp_percentage: number;
  brand: string;
  total_units: number;
  category: { name: string; slug: string; icon: string };
  images: { id: number; image_path: string; is_primary: boolean }[];
  units: { id: number; serial_number: string; status: string }[];
  reviews: { id: number; rating: number; comment: string; photo_url: string | null; admin_reply: string | null; user: { name: string }; created_at: string }[];
  reviews_count: number;
  reviews_avg_rating: string | null;
  available_units_count: number;
  primary_image?: { image_path: string };
}

interface Availability {
  available: boolean;
  available_units: number;
  total_days: number;
  price_per_day: number;
  subtotal: number;
  min_dp_percentage: number;
  min_dp_amount: number;
}

interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  price_per_day: number;
  min_dp_percentage: number;
  category_icon: string;
  quantity: number;
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

const productIcons: Record<string, string> = {
  "kamera-foto": "📸",
  "alat-camping": "⛺",
  "konsol-game": "🎮",
  "perlengkapan-pesta": "🎉",
  "peralatan-teknik": "🔧",
  "fashion-kostum": "👗",
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookedDates, setBookedDates] = useState<{start_date: string, end_date: string}[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [pickupTime, setPickupTime] = useState<string>("08:00");
  const [returnTime, setReturnTime] = useState<string>("08:00");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [activeTab, setActiveTab] = useState<"description" | "terms" | "reviews">("description");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // New states for enhancements
  const [showLightbox, setShowLightbox] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, isSuccess: boolean} | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setBookedDates(data.booked_dates || []);
        setLoading(false);
        // Fetch related products based on category
        if (data.product?.category?.slug) {
          fetch(`${API_URL}/products?category=${data.product.category.slug}&per_page=4`)
            .then((r) => r.json())
            .then((resData) => {
              setRelatedProducts(
                (resData.data || []).filter((p: Product) => p.id !== data.product.id).slice(0, 4)
              );
            });
        }
        
        // Check wishlist status
        const token = localStorage.getItem("pinjemdong-token");
        if (token && data.product) {
          fetch(`${API_URL}/wishlist`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
          .then(r => r.json())
          .then(wData => {
            if (wData.wishlist) {
              setIsWishlisted(wData.wishlist.some((item: any) => item.product_id === data.product.id));
            }
          });
        }
      })
      .catch((err) => {
        console.error("Gagal memuat produk", err);
        setLoading(false);
      });

    // Load saved dates if any
    const savedDates = localStorage.getItem("pinjemdong-dates");
    if (savedDates) {
      try {
        const { start, end } = JSON.parse(savedDates);
        setDateRange([new Date(start), new Date(end)]);
      } catch (e) {}
    }

    const savedTimes = localStorage.getItem("pinjemdong-times");
    if (savedTimes) {
      try {
        const { pickup, return: retTime } = JSON.parse(savedTimes);
        if (pickup) setPickupTime(pickup);
        if (retTime) setReturnTime(retTime);
      } catch (e) {}
    }
  }, [slug]);

  const handleAddToCart = (redirect = false) => {
    if (!product) return;

    setAddingToCart(true);

    const cart = JSON.parse(localStorage.getItem("pinjemdong-cart") || "[]");
    
    // Clear package if normal item is added
    localStorage.removeItem("pinjemdong-package");

    const existingIndex = cart.findIndex((item: any) => item.product_id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price_per_day: product.price_per_day,
        quantity: quantity,
        category_icon: product.category?.icon,
        min_dp_percentage: product.min_dp_percentage,
        image_url: product.images?.[0]?.image_path ? (product.images[0].image_path.startsWith('http') ? product.images[0].image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + product.images[0].image_path) : null,
        available_units: product.available_units_count,
      });
    }

    localStorage.setItem("pinjemdong-cart", JSON.stringify(cart));

    window.dispatchEvent(new Event('cart-updated'));

    setAddingToCart(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
    
    showToast("Berhasil Masuk Keranjang", `${quantity} unit ${product.name} telah dimasukkan ke keranjang.`, true);

    if (redirect) {
      router.push("/checkout");
    }
  };

  const showToast = (title: string, desc: string = "", isSuccess: boolean = true) => {
    setToastMsg({ title, desc, isSuccess });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Tautan Disalin", "Tautan produk berhasil disalin ke clipboard.", true);
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) {
      showToast("Perlu Masuk Akun", "Masuk (login) terlebih dahulu untuk menyimpan ke Wishlist.", false);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    if (!product) return;

    // Optimistic UI update
    const newStatus = !isWishlisted;
    setIsWishlisted(newStatus);
    showToast(
      newStatus ? "Tersimpan ke Wishlist" : "Dihapus dari Wishlist",
      newStatus ? "Barang telah berhasil ditambahkan." : "Barang telah dihapus dari daftar.",
      newStatus
    );

    try {
      const res = await fetch(`${API_URL}/wishlist/${product.id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      if (!res.ok) {
        // Revert on failure
        setIsWishlisted(!newStatus);
        showToast("Gagal Menyimpan", "Gagal mengubah wishlist. Silakan coba lagi.", false);
        console.error("Wishlist API failed:", await res.text());
      } else {
        // Trigger event for Navbar badge
        window.dispatchEvent(new Event('wishlist-updated'));
      }
    } catch (e) {
      // Revert on failure
      setIsWishlisted(!newStatus);
      showToast("Kesalahan Jaringan", "Gagal menghubungi server.", false);
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)", marginBottom: "24px" }} />
        <div className="skeleton" style={{ height: "32px", width: "60%", marginBottom: "16px" }} />
        <div className="skeleton" style={{ height: "20px", width: "40%", marginBottom: "24px" }} />
        <div className="skeleton" style={{ height: "120px" }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px" }}>😕</div>
        <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Barang Tidak Ditemukan</h2>
        <Link href="/catalog" className="btn-primary" style={{ marginTop: "24px" }}>
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px 80px" }}>
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
              background: toastMsg.isSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
              color: toastMsg.isSuccess ? "var(--success)" : "var(--error)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            {toastMsg.isSuccess ? "✓" : "✕"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.01em" }}>{toastMsg.title}</h4>
            {toastMsg.desc && <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--foreground-secondary)" }}>{toastMsg.desc}</p>}
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}} />
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && product.images && product.images.length > 0 && (
        <div className="animate-fade-in" style={{
          position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <button onClick={() => setShowLightbox(false)} style={{
            position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.2)",
            border: "none", color: "#fff", width: "40px", height: "40px", borderRadius: "50%",
            fontSize: "1.2rem", cursor: "pointer", zIndex: 1101
          }}>✕</button>
          <div style={{ position: "relative", width: "90vw", height: "80vh", maxWidth: "1000px" }}>
            <Image
              src={product.images[currentImageIndex].image_path.startsWith('http') ? product.images[currentImageIndex].image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + product.images[currentImageIndex].image_path}
              alt={product.name}
              fill
              style={{ objectFit: 'contain' }}
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", fontSize: "0.85rem", flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontWeight: 500 }}>Beranda</Link>
        <span style={{ color: "var(--border)", display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "1px" }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <Link href="/catalog" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontWeight: 500 }}>Katalog</Link>
        <span style={{ color: "var(--border)", display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "1px" }}><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{product.name}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "40px",
          alignItems: "start",
        }}
        className="product-grid"
      >
        {/* Left - Product Info */}
        <div>
          {/* Main Image */}
          <div
            style={{
              height: "400px",
              background: "var(--primary-gradient)",
              borderRadius: "var(--radius-xl)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
              boxShadow: "var(--shadow-xl)",
              position: "relative",
              overflow: "hidden",
              cursor: "zoom-in"
            }}
            onClick={() => setShowLightbox(true)}
          >
            <div style={{ position: "absolute", top: "16px", right: "16px", display: "flex", gap: "8px", zIndex: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); handleShare(); }} style={{
                width: "44px", height: "44px", borderRadius: "50%", 
                background: "var(--background-elevated)", color: "var(--foreground)",
                border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s",
                padding: 0
              }} className="hover-scale">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(); }} style={{
                width: "44px", height: "44px", borderRadius: "50%", 
                background: "var(--background-elevated)", 
                color: isWishlisted ? "var(--error)" : "var(--foreground)",
                border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", transition: "all 0.2s",
                padding: 0
              }} className="hover-scale">
                <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Premium DP Badge Overlay */}
            <div style={{
              position: "absolute", top: "16px", left: "16px", zIndex: 10,
              background: "rgba(0,0,0,0.65)", color: "#fff", backdropFilter: "blur(6px)",
              padding: "6px 14px", borderRadius: "var(--radius-full)",
              fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <span style={{ color: "var(--accent)" }}>💎</span> Min. DP {product.min_dp_percentage}%
            </div>

            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[currentImageIndex].image_path.startsWith('http') ? product.images[currentImageIndex].image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + product.images[currentImageIndex].image_path}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            ) : (
              <span style={{ fontSize: "8rem" }}>{productIcons[product.category?.slug] || "📦"}</span>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }} className="hide-scrollbar">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    flexShrink: 0, width: "80px", height: "80px", borderRadius: "var(--radius-md)",
                    position: "relative", overflow: "hidden",
                    border: currentImageIndex === index ? "2px solid var(--foreground)" : "2px solid transparent",
                    cursor: "pointer", padding: 0, background: "var(--background-secondary)",
                    opacity: currentImageIndex === index ? 1 : 0.5,
                    transition: "all 0.3s ease"
                  }}
                >
                  <Image src={img.image_path.startsWith('http') ? img.image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + img.image_path} alt={`Thumbnail ${index + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                </button>
              ))}
            </div>
          )}

          {/* Product Info */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
            <span className="badge badge-primary">{product.category?.name}</span>
            {product.brand && <span className="badge" style={{ background: "var(--background-secondary)", color: "var(--foreground-secondary)" }}>{product.brand}</span>}
          </div>

          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.02em" }}>{product.name}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
            <span style={{ color: "#f59e0b", fontSize: "1rem" }}>
              ★ {product.reviews_avg_rating ? Number(product.reviews_avg_rating).toFixed(1) : "0.0"}
            </span>
            <span style={{ color: "var(--foreground-muted)" }}>({product.reviews_count} ulasan)</span>
            <span style={{ color: "var(--success)", fontWeight: 600 }}>
              {product.available_units_count} unit tersedia
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "16px", borderBottom: "2px solid var(--border)", marginBottom: "24px" }}>
            {(["description", "terms", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "12px 16px", border: "none", background: "transparent",
                  color: activeTab === tab ? "var(--primary)" : "var(--foreground-muted)",
                  fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                  borderBottom: activeTab === tab ? "3px solid var(--primary)" : "3px solid transparent",
                  marginBottom: "-2px", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {tab === "description" ? "📝 Deskripsi" : tab === "terms" ? "⚠️ Syarat & Ketentuan" : `⭐ Ulasan (${product.reviews_count})`}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="animate-fade-in" style={{ maxWidth: "768px" }}>
              <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="animate-fade-in" style={{ maxWidth: "768px" }}>
              {product.terms_conditions && (
                <div style={{ marginBottom: "24px", padding: "20px", background: "var(--warning-light)", borderRadius: "var(--radius-md)" }}>
                  <h4 style={{ fontWeight: 700, marginBottom: "8px", color: "var(--warning)" }}>⚠️ Syarat Khusus Barang Ini</h4>
                  <p style={{ fontSize: "0.9rem", color: "var(--foreground-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{product.terms_conditions}</p>
                </div>
              )}
              <div
                style={{
                  padding: "16px 20px", background: "var(--error-light)",
                  borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "12px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>⏰</span>
                <div>
                  <span style={{ fontWeight: 700, color: "var(--error)", fontSize: "0.9rem" }}>Peringatan Denda:</span>
                  <span style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", marginLeft: "8px" }}>
                    Keterlambatan pengembalian akan dikenakan denda otomatis sebesar 100% harga sewa/hari.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="animate-fade-in" style={{ maxWidth: "768px" }}>
              {product.reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--foreground-muted)", background: "var(--background-elevated)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "16px" }}>💬</div>
                  <h3 style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>Belum Ada Ulasan</h3>
                  <p style={{ fontSize: "0.9rem" }}>Jadilah yang pertama menyewa dan memberikan ulasan untuk barang ini!</p>
                </div>
              ) : (
                <>
                  {/* Rating Summary Header */}
                  <div className="card" style={{ padding: "24px", marginBottom: "24px", display: "flex", gap: "32px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center", minWidth: "120px" }}>
                      <div style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: "var(--foreground)", letterSpacing: "-0.03em" }}>
                        {Number(product.reviews_avg_rating).toFixed(1)}
                      </div>
                      <div style={{ color: "#f59e0b", fontSize: "1.2rem", margin: "8px 0" }}>
                        {"★".repeat(Math.round(Number(product.reviews_avg_rating)))}{"☆".repeat(5 - Math.round(Number(product.reviews_avg_rating)))}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", fontWeight: 600 }}>
                        {product.reviews_count} Ulasan
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = product.reviews.filter(r => r.rating === star).length;
                        const percentage = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0;
                        return (
                          <div key={star} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                            <div style={{ width: "24px", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                              {star} <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>★</span>
                            </div>
                            <div style={{ flex: 1, height: "8px", background: "var(--background)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${percentage}%`, height: "100%", background: "#f59e0b", borderRadius: "4px" }}></div>
                            </div>
                            <div style={{ width: "32px", fontSize: "0.75rem", color: "var(--foreground-muted)", textAlign: "right", fontWeight: 600 }}>
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {product.reviews.map((review) => (
                      <div key={review.id} style={{ padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                          {/* Avatar */}
                          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)" }}>
                            {review.user.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px", flexWrap: "wrap", gap: "8px" }}>
                              <div>
                                <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)", margin: 0 }}>{review.user.name}</h4>
                                <div style={{ color: "var(--foreground-muted)", fontSize: "0.75rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ color: "var(--success)" }}>✅ Terverifikasi</span> • 
                                  {new Date(review.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                              </div>
                              <div style={{ color: "#f59e0b", fontSize: "0.95rem", letterSpacing: "2px" }}>
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                              </div>
                            </div>
                            
                            {review.comment && (
                              <p style={{ color: "var(--foreground-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginTop: "12px", marginBottom: 0 }}>
                                {review.comment}
                              </p>
                            )}
                            
                            {review.photo_url && (
                              <div style={{ marginTop: "16px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", display: "inline-block" }}>
                                <Image 
                                  src={review.photo_url.startsWith('http') ? review.photo_url : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${review.photo_url}`} 
                                  alt="Foto Ulasan" 
                                  width={120} height={120} 
                                  style={{ objectFit: "cover", cursor: "pointer", transition: "transform 0.2s" }} 
                                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                  onClick={() => window.open(review.photo_url?.startsWith('http') ? review.photo_url : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${review.photo_url}`, '_blank')}
                                  unoptimized
                                />
                              </div>
                            )}

                            {review.admin_reply && (
                              <div style={{ marginTop: "16px", padding: "16px", background: "var(--background-secondary)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--primary)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "1.1rem" }}>👨‍💻</span>
                                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--foreground)" }}>Balasan Admin</span>
                                </div>
                                <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                                  {review.admin_reply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right - Booking Card (Sticky) */}
        <div className="booking-sidebar">
          <div 
            className="card booking-card" 
            style={{ 
              padding: "20px", 
              background: "var(--glass-bg)", 
              backdropFilter: "var(--glass-backdrop)",
              WebkitBackdropFilter: "var(--glass-backdrop)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-md)" 
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--foreground)" }}>
                Rp {formatRupiah(product.price_per_day)}
              </span>
              <span style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", fontWeight: 500 }}> / hari</span>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", display: "block" }}>📅 Ketersediaan Barang</label>
              <div className="calendar-wrapper">
                <Calendar 
                  selectRange={true}
                  onChange={(val) => {
                    if (Array.isArray(val)) {
                      setDateRange(val as [Date, Date]);
                      if (val[0] && val[1]) {
                        // Adjust for timezone to get correct YYYY-MM-DD
                        const start = new Date(val[0].getTime() - (val[0].getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                        const end = new Date(val[1].getTime() - (val[1].getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                        localStorage.setItem("pinjemdong-dates", JSON.stringify({ start, end }));
                      }
                    }
                  }}
                  value={dateRange as any}
                  tileDisabled={({ date, view }) => {
                    if (view !== 'month' || !product) return false;
                    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split("T")[0];
                    
                    // Hitung berapa unit yang sedang disewa pada tanggal d
                    const overlaps = bookedDates.filter(b => d >= b.start_date && d <= b.end_date).length;
                    
                    // Disable hanya jika jumlah yang disewa >= total stok
                    return overlaps >= product.available_units_count;
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px", display: "block", color: "var(--foreground-secondary)" }}>Jam Ambil</label>
                  <select 
                    value={pickupTime} 
                    onChange={(e) => {
                      setPickupTime(e.target.value);
                      localStorage.setItem("pinjemdong-times", JSON.stringify({ pickup: e.target.value, return: returnTime }));
                    }}
                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", outline: "none" }}
                  >
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "6px", display: "block", color: "var(--foreground-secondary)" }}>Jam Kembali</label>
                  <select 
                    value={returnTime} 
                    onChange={(e) => {
                      setReturnTime(e.target.value);
                      localStorage.setItem("pinjemdong-times", JSON.stringify({ pickup: pickupTime, return: e.target.value }));
                    }}
                    style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", outline: "none" }}
                  >
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {product.available_units_count > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", background: "var(--background-elevated)", borderRadius: "var(--radius-full)", width: "fit-content", border: "1px solid var(--border)", overflow: "hidden" }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: "36px", height: "36px", border: "none", background: "transparent", color: "var(--foreground)", fontSize: "1.1rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--background-secondary)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >-</button>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, width: "32px", textAlign: "center", color: "var(--foreground)" }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.available_units_count, quantity + 1))}
                    style={{ width: "36px", height: "36px", border: "none", background: "transparent", color: "var(--foreground)", fontSize: "1.1rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--background-secondary)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >+</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={addingToCart}
                    className="hover-scale"
                    style={{ 
                      width: "100%", padding: "12px 16px", fontSize: "0.9rem", fontWeight: 600, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "var(--radius-full)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      transition: "all 0.3s", cursor: "pointer",
                      background: "var(--foreground)", border: "none", color: "var(--background)"
                    }}
                  >
                    Sewa Sekarang
                  </button>

                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={addingToCart}
                    className="hover-scale"
                    style={{ 
                      width: "100%", padding: "12px 16px", fontSize: "0.9rem", fontWeight: 600, 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: "var(--radius-full)", transition: "all 0.3s",
                      border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)",
                      cursor: "pointer"
                    }}
                  >
                    {added ? "Tersimpan" : "Tambah ke Keranjang"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: "14px 16px", textAlign: "center", background: "var(--error-light)", color: "var(--error)", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: "0.95rem" }}>
                Barang Kosong (Stok Habis)
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "28px", padding: "0 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--foreground-secondary)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--foreground)", letterSpacing: "-0.01em" }}>Jaminan Kualitas</div>
                <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>Barang terawat dan berfungsi 100%</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--foreground-secondary)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--accent-light)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--foreground)", letterSpacing: "-0.01em" }}>Pembayaran Aman</div>
                <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>Transaksi dilindungi sistem enkripsi</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--foreground-secondary)" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--foreground)", letterSpacing: "-0.01em" }}>Dukungan Pelanggan</div>
                <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>Bantuan cepat untuk kendala penyewaan</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>Barang <span className="gradient-text">Serupa</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rp) => (
              <Link key={rp.id} href={`/item/${rp.slug}`} className="card flex flex-col hover-scale" style={{ textDecoration: "none", color: "var(--foreground)", overflow: "hidden" }}>
                <div style={{ height: "140px", background: "var(--primary-gradient)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {rp.primary_image ? (
                    <Image src={rp.primary_image.image_path.startsWith('http') ? rp.primary_image.image_path : (process.env.NEXT_PUBLIC_API_BASE_URL || "") + rp.primary_image.image_path} alt={rp.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <span style={{ fontSize: "3rem" }}>{productIcons[product.category?.slug] || "📦"}</span>
                  )}
                </div>
                <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h4 className="line-clamp-2" style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.3 }}>{rp.name}</h4>
                  <div style={{ marginTop: "auto", color: "var(--primary)", fontWeight: 800, fontSize: "0.9rem" }}>
                    Rp {formatRupiah(rp.price_per_day)} <span style={{ fontSize: "0.7rem", color: "var(--foreground-muted)", fontWeight: 400 }}>/hari</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bar */}
      <div className="mobile-sticky-bar" style={{ background: "var(--glass-bg)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", borderTop: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", fontWeight: 500, letterSpacing: "0.02em" }}>Harga Sewa</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
              Rp {formatRupiah(product.price_per_day)}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", flex: 1, justifyContent: "flex-end" }}>
            <button
              style={{ padding: "12px", borderRadius: "var(--radius-full)", border: "1.5px solid var(--border)", background: "transparent", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}
              onClick={() => handleAddToCart(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </button>
            <button
              style={{ padding: "12px 24px", fontSize: "0.95rem", borderRadius: "var(--radius-full)", background: "var(--foreground)", color: "var(--background)", fontWeight: 700, border: "none", flex: 1, maxWidth: "160px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              onClick={() => handleAddToCart(true)}
            >
              Sewa
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hover-scale:hover {
          transform: translateY(-2px);
        }
        .booking-sidebar {
          position: sticky;
          top: 100px;
        }
        .mobile-sticky-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--background);
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
          z-index: 100;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
        }

        /* Dark Mode adjustments for mobile bar */
        @media (prefers-color-scheme: dark) {
          .mobile-sticky-bar {
            background: var(--background-elevated);
            box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
          }
        }
        [data-theme="dark"] .mobile-sticky-bar {
          background: var(--background-elevated);
          box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
        }

        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: 1fr !important;
          }
          .booking-sidebar {
            position: static !important;
          }
          .mobile-sticky-bar {
            display: block;
          }
        }
      `}</style>


    </div>
  );
}
