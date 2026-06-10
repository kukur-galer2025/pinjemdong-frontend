"use client";

import Link from "next/link";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import DistanceErrorModal from "../../components/DistanceErrorModal";

const DeliveryMap = lazy(() => import("../../components/DeliveryMap"));

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "");

interface CartItem {
  product_id: number;
  name: string;
  slug: string;
  price_per_day: number;
  min_dp_percentage: number;
  category_icon: string;
  quantity: number;
  image_url?: string;
  available_units?: number;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
}

function formatRupiah(num: number | string): string {
  return new Intl.NumberFormat("id-ID").format(Number(num));
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [packageData, setPackageData] = useState<any>(null);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [startDate, setStartDate] = useState("");
  const [pickupTime, setPickupTime] = useState("08:00");
  const [endDate, setEndDate] = useState("");
  const [returnTime, setReturnTime] = useState("08:00");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    invoice_number: string;
    total_amount: number;
    min_dp_amount: number;
    min_dp_percentage: number;
  } | null>(null);
  const [error, setError] = useState("");

  // Delivery map states
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number; lng: number; distanceKm: number; deliveryCost: number; address: string;
  } | null>(null);
  const [showDistanceError, setShowDistanceError] = useState(false);
  const [exceededDistance, setExceededDistance] = useState(0);

  // Saved Locations states
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveLocation, setSaveLocation] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");

  const [kycStatus, setKycStatus] = useState<string>("loading");

  const [flashMessage, setFlashMessage] = useState<{show: boolean, msg: string}>({show: false, msg: ""});
  const showFlash = (msg: string) => {
    setFlashMessage({show: true, msg});
    setTimeout(() => setFlashMessage({show: false, msg: ""}), 3000);
  };

  // Track removed item IDs so auto-sync never resurrects them
  const removedIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem("pinjemdong-cart") || "[]");
    setCartItems(cart);

    // Auto-sync: single batch fetch, match by product_id
    if (cart.length > 0) {
      fetch(`${API_URL}/products?per_page=100`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data || !data.data) return;

          // Build lookup map: product_id → product data
          const productMap = new Map<number, any>();
          for (const p of data.data) {
            productMap.set(p.id, p);
          }

          const synced = cart
            .filter((item: any) => !removedIdsRef.current.has(item.product_id))
            .map((item: any) => {
              const apiProduct = productMap.get(item.product_id);
              if (!apiProduct) return item; // product not found in API, keep as-is

              const avail = apiProduct.available_units_count ?? 0;
              let qty = item.quantity;
              if (qty > avail && avail > 0) qty = avail;
              if (avail === 0) qty = 0;

              return {
                ...item,
                slug: apiProduct.slug || item.slug,
                available_units: avail,
                quantity: qty,
                image_url: apiProduct.primary_image?.image_path || item.image_url,
              };
            });

          setCartItems(synced);
          localStorage.setItem("pinjemdong-cart", JSON.stringify(synced));
          
          // Wrap dispatch in setTimeout to ensure it doesn't interrupt the current render cycle
          setTimeout(() => {
            window.dispatchEvent(new Event('cart-updated'));
          }, 0);
        })
        .catch(console.error);
    }

    // Load package if any
    const pkg = JSON.parse(localStorage.getItem("pinjemdong-package") || "null");
    setPackageData(pkg);

    // Load bank accounts
    fetch(`${API_URL}/bank-accounts`)
      .then((r) => r.json())
      .then((data) => setBanks(data.bank_accounts || []))
      .catch(console.error);

    // Load saved addresses
    const token = localStorage.getItem("pinjemdong-token");
    if (token) {
      fetch(`${API_URL}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((data) => setSavedAddresses(data.addresses || []))
        .catch(console.error);
    }

    // Load saved delivery data
    const savedDelivery = localStorage.getItem("pinjemdong-delivery");
    if (savedDelivery) {
      try {
        const { method, loc, address } = JSON.parse(savedDelivery);
        setDeliveryMethod(method || "pickup");
        setDeliveryLocation(loc || null);
        setDeliveryAddress(address || "");
      } catch (e) {}
    }

    // Load saved dates
    const savedDates = localStorage.getItem("pinjemdong-dates");
    if (savedDates) {
      try {
        const { start, end } = JSON.parse(savedDates);
        setStartDate(start || "");
        setEndDate(end || "");
      } catch (e) {}
    }

    // Load saved times
    const savedTimes = localStorage.getItem("pinjemdong-times");
    if (savedTimes) {
      try {
        const { pickup, return: retTime } = JSON.parse(savedTimes);
        setPickupTime(pickup || "08:00");
        setReturnTime(retTime || "08:00");
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Check KYC Status
    const token = localStorage.getItem("pinjemdong-token");
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setKycStatus(data.user.verification?.status || 'unverified');
        }
      })
      .catch(() => setKycStatus('unverified'));
    } else {
      setKycStatus('unverified');
    }
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  let totalDays = 0;
  if (startDate && endDate && pickupTime && returnTime) {
    const startDateTime = new Date(`${startDate}T${pickupTime}:00`);
    const endDateTime = new Date(`${endDate}T${returnTime}:00`);
    const diffInMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
    const billableMinutes = Math.max(0, diffInMinutes - 60);
    totalDays = Math.max(1, Math.ceil(billableMinutes / (24 * 60)));
  }

  const itemsSubtotal = cartItems.reduce((sum, item) => sum + item.price_per_day * item.quantity * totalDays, 0);
  const subtotal = packageData ? packageData.price_per_day * totalDays : itemsSubtotal;
  const deliveryCost = deliveryMethod === "delivery" && deliveryLocation ? deliveryLocation.deliveryCost : 0;
  const totalAmount = subtotal + deliveryCost;
  
  const maxDpPercentage = packageData 
    ? packageData.min_dp_percentage 
    : (cartItems.length > 0 ? Math.max(...cartItems.map((i) => i.min_dp_percentage)) : 20);
    
  const minDpAmount = Math.ceil(totalAmount * maxDpPercentage / 100);

  const handleCheckout = async () => {
    if (!startDate || !endDate || (!packageData && cartItems.length === 0)) return;
    setError("");
    setSubmitting(true);

    if (kycStatus !== 'approved') {
      setError("Verifikasi Identitas (KTP) Anda belum disetujui. Silakan verifikasi melalui Dashboard.");
      return;
    }

    const token = localStorage.getItem("pinjemdong-token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      // VALIDASI STOK SEBELUM CHECKOUT
      if (!packageData) {
        for (const item of cartItems) {
          const checkRes = await fetch(`${API_URL}/products/${item.slug}/check-availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_date: startDate,
              end_date: endDate,
              quantity: item.quantity,
            }),
          });
          const checkData = await checkRes.json();
          if (!checkRes.ok || !checkData.available) {
            setError(`Stok ${item.name} sisa ${checkData.available_units || 0} unit untuk tanggal tersebut.`);
            setSubmitting(false);
            return;
          }
        }
      }

      const res = await fetch(`${API_URL}/rentals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rental_package_id: packageData ? packageData.id : null,
          items: packageData ? [] : cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          start_date: startDate,
          pickup_time: pickupTime,
          end_date: endDate,
          return_time: returnTime,
          delivery_method: deliveryMethod,
          delivery_address: deliveryMethod === "delivery" ? deliveryAddress : null,
          delivery_latitude: deliveryMethod === "delivery" && deliveryLocation ? deliveryLocation.lat : null,
          delivery_longitude: deliveryMethod === "delivery" && deliveryLocation ? deliveryLocation.lng : null,
          delivery_distance_km: deliveryMethod === "delivery" && deliveryLocation ? deliveryLocation.distanceKm : null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal membuat pesanan");

      // Save location if requested
      if (saveLocation && locationLabel && deliveryMethod === "delivery" && deliveryLocation && token) {
        try {
          await fetch(`${API_URL}/user/addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              label: locationLabel,
              address: deliveryAddress,
              latitude: deliveryLocation.lat,
              longitude: deliveryLocation.lng,
            })
          });
        } catch (err) {
          console.error("Gagal menyimpan lokasi:", err);
        }
      }

      // Clear cart
      localStorage.removeItem("pinjemdong-cart");
      localStorage.removeItem("pinjemdong-package");

      router.push("/dashboard");
      setInvoiceData({
        invoice_number: data.rental.invoice_number,
        total_amount: data.payment_info.total_amount,
        min_dp_amount: data.payment_info.min_dp_amount,
        min_dp_percentage: data.payment_info.min_dp_percentage,
      });
    } catch {
      setError("Gagal terhubung ke server.");
    }
    setSubmitting(false);
  };

  const removeItem = (productId: number) => {
    removedIdsRef.current.add(productId);
    setCartItems((prev) => {
      const updated = prev.filter((i) => i.product_id !== productId);
      setTimeout(() => {
        localStorage.setItem("pinjemdong-cart", JSON.stringify(updated));
        window.dispatchEvent(new Event('cart-updated'));
      }, 0);
      return updated;
    });
    showFlash("Barang dihapus dari keranjang");
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (item.product_id === productId) {
          let newQty = item.quantity + delta;
          if (newQty < 1) newQty = 1;
          if (item.available_units !== undefined && newQty > item.available_units) {
            newQty = item.available_units;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
      setTimeout(() => {
        localStorage.setItem("pinjemdong-cart", JSON.stringify(updated));
        window.dispatchEvent(new Event('cart-updated'));
      }, 0);
      return updated;
    });
  };


  // Success state - show invoice
  if (success && invoiceData) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px 80px", textAlign: "center" }}>
        <div className="animate-fade-in-up">
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", borderRadius: "50%", background: "var(--foreground)", color: "var(--background)", marginBottom: "24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.03em" }}>Pesanan Dibuat</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1rem", marginBottom: "40px" }}>
            Invoice: <strong style={{ color: "var(--foreground)" }}>{invoiceData.invoice_number}</strong>
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="card" style={{ padding: "32px", textAlign: "left", marginBottom: "24px", border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "24px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Instruksi Pembayaran
          </h3>

          <div
            style={{
              padding: "24px",
              borderRadius: "var(--radius-md)",
              background: "var(--background-secondary)",
              marginBottom: "24px",
              textAlign: "center",
              border: "1px solid var(--border)"
            }}
          >
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              Transfer Minimal DP ({invoiceData.min_dp_percentage}%)
            </p>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
              Rp {formatRupiah(invoiceData.min_dp_amount)}
            </div>
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", marginTop: "8px" }}>
              Atau lunas: Rp {formatRupiah(invoiceData.total_amount)}
            </p>
          </div>

          <h4 style={{ fontWeight: 600, marginBottom: "16px", fontSize: "0.95rem", color: "var(--foreground-secondary)" }}>Pilihan Rekening:</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {banks.map((bank) => (
              <div
                key={bank.id}
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>{bank.bank_name}</div>
                  <div style={{ color: "var(--foreground-muted)", fontSize: "0.85rem", marginTop: "2px" }}>{bank.account_holder}</div>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    letterSpacing: "0.05em",
                    background: "var(--background)",
                    padding: "6px 12px",
                    borderRadius: "4px"
                  }}
                >
                  {bank.account_number}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "var(--radius-md)",
              background: "var(--background-secondary)",
              fontSize: "0.85rem",
              color: "var(--foreground-muted)",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              borderLeft: "3px solid var(--foreground)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ margin: 0, lineHeight: 1.5 }}>
              Setelah melakukan transfer, silakan masuk ke halaman Dashboard untuk mengunggah bukti pembayaran Anda.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexDirection: "column" }}>
          <Link href="/dashboard" style={{ 
            padding: "16px", background: "var(--foreground)", color: "var(--background)", 
            borderRadius: "var(--radius-full)", fontWeight: 700, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s"
          }}>
            Upload Bukti Pembayaran
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </Link>
          <Link href="/catalog" style={{ 
            padding: "16px", background: "transparent", border: "1px solid var(--border)", color: "var(--foreground)", 
            borderRadius: "var(--radius-full)", fontWeight: 600, textDecoration: "none", transition: "all 0.2s"
          }}>
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "32px 24px 80px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", fontSize: "0.85rem", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--foreground-muted)", textDecoration: "none", fontWeight: 500 }}>Beranda</Link>
        <span style={{ color: "var(--border)", display: "flex", alignItems: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>Checkout</span>
      </div>

      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
        Checkout
      </h1>
      <p style={{ color: "var(--foreground-muted)", marginBottom: "32px", fontSize: "0.95rem" }}>Periksa pesanan Anda sebelum melanjutkan</p>

      {error && (
        <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--error-light)", color: "var(--error)", marginBottom: "20px", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {cartItems.length === 0 && !packageData ? (
        <div style={{ 
          textAlign: "center", padding: "80px 20px", display: "flex", 
          flexDirection: "column", alignItems: "center",
          background: "var(--background-secondary)", borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--border)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.02)"
        }}>
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "50%", background: "var(--background)", 
            border: "1px solid var(--border)", display: "flex", alignItems: "center", 
            justifyContent: "center", marginBottom: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
            position: "relative"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <div style={{ position: "absolute", top: "-2px", right: "-2px", width: "14px", height: "14px", background: "var(--background)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "8px", height: "8px", background: "var(--foreground-muted)", borderRadius: "50%" }}></div>
            </div>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--foreground)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            Keranjang Masih Kosong
          </h3>
          <p style={{ fontSize: "1rem", color: "var(--foreground-muted)", marginBottom: "32px", maxWidth: "300px", lineHeight: 1.6 }}>
            Temukan perlengkapan impian Anda dan mulai petualangan baru hari ini.
          </p>
          <Link href="/catalog" style={{ 
            display: "inline-block", background: "var(--foreground)", color: "var(--background)", 
            padding: "14px 32px", borderRadius: "var(--radius-full)", fontWeight: 600, 
            fontSize: "0.95rem", textDecoration: "none", transition: "all 0.3s ease", 
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.1)"; }}>
            Eksplorasi Katalog
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px", alignItems: "start" }} className="checkout-grid">
          {/* Left - Items & Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
            {/* Cart Items */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Ringkasan Pesanan
                </h3>
                <Link href={packageData ? "/packages" : "/catalog"} style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                  Ubah Pesanan
                </Link>
              </div>

              {packageData ? (
                <div
                  style={{
                    padding: "16px 0",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "56px", height: "56px", borderRadius: "var(--radius-md)",
                        background: "var(--primary-gradient)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "1.8rem",
                      }}
                    >
                      💎
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>{packageData.name}</h4>
                      <span style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                        Rp {formatRupiah(packageData.price_per_day)} <span style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>/hari</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPackageData(null);
                      localStorage.removeItem("pinjemdong-package");
                    }}
                    style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    ✕ Batal Pilih Paket
                  </button>
                </div>
              ) : (
              cartItems.map((item) => (
                  <div
                    key={item.product_id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: "52px", height: "52px", borderRadius: "var(--radius-md)",
                          background: "var(--background-secondary)", display: "flex", alignItems: "center",
                          justifyContent: "center", overflow: "hidden", flexShrink: 0, position: "relative",
                        }}
                      >
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                            Rp {formatRupiah(item.price_per_day)}<span style={{ fontSize: "0.8rem" }}>/hari</span>
                          </span>
                          
                          <div style={{ display: "flex", alignItems: "center", background: "var(--background)", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", overflow: "hidden" }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, -1)}
                              disabled={item.quantity <= 1}
                              style={{ border: "none", background: "transparent", padding: "4px 10px", cursor: item.quantity <= 1 ? "not-allowed" : "pointer", color: item.quantity <= 1 ? "var(--border)" : "var(--foreground)", transition: "all 0.2s" }}
                              onMouseEnter={e => { if(item.quantity > 1) e.currentTarget.style.background = "var(--background-elevated)" }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, width: "24px", textAlign: "center" }}>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, 1)}
                              disabled={item.available_units === undefined || item.quantity >= item.available_units}
                              style={{ border: "none", background: "transparent", padding: "4px 10px", cursor: (item.available_units === undefined || item.quantity >= item.available_units) ? "not-allowed" : "pointer", color: (item.available_units === undefined || item.quantity >= item.available_units) ? "var(--border)" : "var(--foreground)", transition: "all 0.2s" }}
                              onMouseEnter={e => { if(item.available_units !== undefined && item.quantity < item.available_units) e.currentTarget.style.background = "var(--background-elevated)" }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                          </div>
                          
                          <span style={{ fontSize: "0.75rem", color: item.available_units === 0 || item.available_units === undefined || (item.available_units !== undefined && item.quantity >= item.available_units) ? "var(--error)" : "var(--foreground-muted)", fontWeight: 500 }}>
                            {item.available_units === 0 
                              ? "Habis / Sedang Disewa" 
                              : (item.available_units !== undefined 
                                ? `Tersedia: ${item.available_units}` 
                                : "⚠️ Data rusak/usang. Hapus barang ini.")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      style={{ background: "none", border: "none", color: "var(--foreground-muted)", cursor: "pointer", padding: "8px", opacity: 0.5, transition: "all 0.2s", flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--error)"; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "var(--foreground-muted)"; }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Date & Delivery */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "20px", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Tanggal & Pengiriman
              </h3>
              <div className="responsive-grid" style={{ marginBottom: "24px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>Tanggal Mulai</label>
                  <input type="date" value={startDate} min={todayStr} onChange={(e) => {
                    setStartDate(e.target.value);
                    localStorage.setItem("pinjemdong-dates", JSON.stringify({ start: e.target.value, end: endDate }));
                  }}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} 
                    onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>Tanggal Selesai</label>
                  <input type="date" value={endDate} min={startDate || todayStr} onChange={(e) => {
                    setEndDate(e.target.value);
                    localStorage.setItem("pinjemdong-dates", JSON.stringify({ start: startDate, end: e.target.value }));
                  }}
                    style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", outline: "none", fontSize: "0.95rem", transition: "border-color 0.2s" }} 
                    onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                  />
                </div>
              </div>

              <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px", display: "block", color: "var(--foreground-secondary)" }}>Metode Pengambilan</label>
              <div className="responsive-grid" style={{ gap: "12px", marginBottom: "24px" }}>
                {(["pickup", "delivery"] as const).map((m) => (
                  <button key={m} onClick={() => {
                    setDeliveryMethod(m);
                    if (m === "pickup") setDeliveryLocation(null);
                  }}
                    style={{
                      padding: "14px", borderRadius: "var(--radius-md)",
                      border: deliveryMethod === m ? "1.5px solid var(--foreground)" : "1.5px solid var(--border)",
                      background: deliveryMethod === m ? "var(--foreground)" : "transparent",
                      color: deliveryMethod === m ? "var(--background)" : "var(--foreground-secondary)",
                      fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.3s ease",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                    }}
                  >
                    {m === "pickup" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    )}
                    <span>{m === "pickup" ? "Ambil di Toko" : "Antar ke Lokasi"}</span>
                  </button>
                ))}
              </div>

              {deliveryMethod === "delivery" && (
                <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "12px", display: "block", color: "var(--foreground-secondary)" }}>Pilih Lokasi Tersimpan:</label>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => {
                              setDeliveryLocation({
                                lat: addr.latitude,
                                lng: addr.longitude,
                                distanceKm: 0,
                                deliveryCost: 0,
                                address: addr.address,
                              });
                              setDeliveryAddress(addr.address);
                            }}
                            style={{
                              padding: "10px 16px", borderRadius: "var(--radius-full)", border: "1.5px solid var(--primary-light)",
                              background: deliveryAddress === addr.address ? "var(--primary)" : "transparent", 
                              color: deliveryAddress === addr.address ? "#fff" : "var(--primary)", 
                              fontSize: "0.85rem", cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
                            }}
                          >
                            📍 {addr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Suspense fallback={
                    <div style={{ height: "300px", borderRadius: "var(--radius-md)", background: "var(--background-secondary)", display: "flex", alignItems: "center", justifyItems: "center", color: "var(--foreground-muted)", border: "1px dashed var(--border)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
                        Memuat peta lokasi...
                      </div>
                    </div>
                  }>
                    <DeliveryMap
                      onLocationSelect={(data) => {
                        setDeliveryLocation(data);
                        setDeliveryAddress(data.address);
                        setShowDistanceError(false);
                      }}
                      onDistanceExceeded={(dist) => {
                        setDeliveryLocation(null);
                        setExceededDistance(dist);
                        setShowDistanceError(true);
                      }}
                      initialLat={deliveryLocation?.lat}
                      initialLng={deliveryLocation?.lng}
                    />
                  </Suspense>

                  <div style={{ marginTop: "20px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", display: "block", color: "var(--foreground-secondary)" }}>Detail Alamat Lengkap</label>
                    <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Contoh: Depan warung soto, pagar warna biru..." rows={3}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", background: "var(--background-elevated)", color: "var(--foreground)", outline: "none", resize: "vertical", fontSize: "0.95rem", transition: "border-color 0.2s" }} 
                      onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                      onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                    />
                  </div>

                  <div style={{ marginTop: "16px", background: "var(--background-elevated)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                      <input type="checkbox" checked={saveLocation} onChange={(e) => setSaveLocation(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} />
                      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Simpan lokasi ini untuk transaksi berikutnya</span>
                    </label>
                    {saveLocation && (
                      <input
                        type="text" value={locationLabel} onChange={(e) => setLocationLabel(e.target.value)}
                        placeholder="Beri label: Rumah, Kos, Kantor..."
                        style={{ marginTop: "12px", width: "100%", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", outline: "none", fontSize: "0.95rem" }}
                        onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                        onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: "24px" }}>
              <h3 style={{ fontWeight: 700, marginBottom: "16px", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Catatan Pesanan <span style={{ color: "var(--foreground-muted)", fontWeight: 400, fontSize: "0.85rem" }}>(Opsional)</span>
              </h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Ada pesan khusus untuk admin? Tulis di sini..." rows={2}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", outline: "none", resize: "vertical", fontSize: "0.95rem", transition: "border-color 0.2s" }}
                onFocus={e => e.currentTarget.style.borderColor = "var(--foreground)"}
                onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          {/* Right - Summary */}
          <div style={{ flex: "1 1 300px" }}>
          
          {kycStatus !== 'approved' && kycStatus !== 'loading' && (
            <div style={{
              background: "#fee2e2", border: "1px solid #f87171", borderRadius: "var(--radius-lg)",
              padding: "16px 20px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "flex-start"
            }}>
              <div style={{ fontSize: "1.5rem", color: "#b91c1c" }}>⚠️</div>
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#991b1b", fontSize: "1rem", fontWeight: 700 }}>Verifikasi Identitas Diperlukan</h4>
                <p style={{ margin: 0, color: "#7f1d1d", fontSize: "0.85rem", lineHeight: 1.5 }}>
                  Anda harus melakukan verifikasi KTP (KYC) terlebih dahulu sebelum bisa melakukan penyewaan barang.
                </p>
                <Link href="/dashboard" style={{
                  display: "inline-block", marginTop: "12px", background: "#b91c1c", color: "#fff",
                  padding: "6px 16px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none"
                }}>
                  Verifikasi Sekarang
                </Link>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "24px", fontSize: "1.05rem", borderBottom: "1px solid var(--border)", paddingBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Ringkasan Pembayaran
            </h3>

            {totalDays > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "var(--foreground-muted)" }}>Durasi sewa</span>
                    {startDate && pickupTime && endDate && returnTime && (
                      <span style={{ fontSize: "0.8rem", color: "var(--foreground-secondary)", marginTop: "4px" }}>
                        {new Date(startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} {pickupTime} — {new Date(endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} {returnTime}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 700, color: "var(--foreground)", whiteSpace: "nowrap" }}>{totalDays} Hari</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                  {cartItems.map((item) => (
                    <div key={item.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ color: "var(--foreground)", fontSize: "0.9rem", flex: 1, paddingRight: "16px" }}>{item.name} <span style={{ color: "var(--foreground-muted)" }}>×{item.quantity}</span></span>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", flexShrink: 0 }}>Rp {formatRupiah(item.price_per_day * item.quantity * totalDays)}</span>
                    </div>
                  ))}
                </div>

                {deliveryCost > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--foreground-muted)" }}>Ongkir ({deliveryLocation?.distanceKm.toFixed(1)} km)</span>
                    <span style={{ fontWeight: 600 }}>Rp {formatRupiah(deliveryCost)}</span>
                  </div>
                )}
                
                <div style={{ paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--foreground)" }}>Rp {formatRupiah(totalAmount)}</span>
                </div>
                
                <div style={{ padding: "14px 16px", borderRadius: "var(--radius-md)", background: "var(--background-secondary)", border: "1px solid var(--border)", marginTop: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>Min. DP ({maxDpPercentage}%)</span>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)" }}>Rp {formatRupiah(minDpAmount)}</span>
                  </div>
                  <p style={{ color: "var(--foreground-muted)", fontSize: "0.8rem", marginTop: "6px" }}>Bisa DP dulu atau bayar langsung lunas</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", color: "var(--foreground-muted)", textAlign: "center", gap: "12px" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>Pilih <strong>Tanggal Mulai</strong> dan <strong>Tanggal Selesai</strong> untuk melihat total harga.</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting || totalDays <= 0 || (deliveryMethod === "delivery" && !deliveryLocation) || kycStatus !== 'approved'}
              style={{
                width: "100%", padding: "14px", fontSize: "0.95rem", marginTop: "24px", fontWeight: 700,
                borderRadius: "var(--radius-full)", border: "none", cursor: (submitting || totalDays <= 0 || (deliveryMethod === "delivery" && !deliveryLocation) || kycStatus !== 'approved') ? "not-allowed" : "pointer",
                background: (submitting || totalDays <= 0 || (deliveryMethod === "delivery" && !deliveryLocation) || kycStatus !== 'approved') ? "var(--border)" : "var(--foreground)",
                color: (submitting || totalDays <= 0 || (deliveryMethod === "delivery" && !deliveryLocation) || kycStatus !== 'approved') ? "var(--foreground-muted)" : "var(--background)",
                transition: "all 0.3s",
              }}
            >
              {(!packageData && cartItems.some(i => i.available_units === 0 || i.available_units === undefined))
                ? "Selesaikan Masalah Keranjang"
                : deliveryMethod === "delivery" && !deliveryLocation
                  ? "Pilih Lokasi Dulu"
                  : submitting ? "⏳ Memproses..." : (kycStatus !== 'approved' ? "Verifikasi KTP Diperlukan" : "Buat Pesanan")}
            </button>

            <p style={{ textAlign: "center", color: "var(--foreground-muted)", fontSize: "0.8rem", marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Transaksi aman & terenkripsi
            </p>
          </div>
        </div>
      </div>
      )}

      <DistanceErrorModal
        isOpen={showDistanceError}
        onClose={() => setShowDistanceError(false)}
        distance={exceededDistance}
      />

      {/* Flash Message */}
      {flashMessage.show && (
        <div style={{
          position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
          background: "var(--foreground)", color: "var(--background)",
          padding: "12px 24px", borderRadius: "var(--radius-full)",
          fontSize: "0.9rem", fontWeight: 600, zIndex: 1000,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)", animation: "fadeInUp 0.3s ease",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {flashMessage.msg}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .responsive-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
