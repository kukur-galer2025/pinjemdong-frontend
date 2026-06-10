"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "");

interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_per_day: string;
  original_price_per_day: string;
  image: string | null;
  items: {
    quantity: number;
    product: {
      name: string;
      primary_image: { image_path: string } | null;
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

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/packages`)
      .then((r) => r.json())
      .then((data) => {
        setPackages(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 24px", minHeight: "80vh" }}>
        {/* Title Skeleton */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "48px" }}>
          <div style={{ width: "140px", height: "28px", borderRadius: "20px", background: "var(--background-elevated)", marginBottom: "16px", animation: "pulse 1.5s infinite" }}></div>
          <div style={{ width: "320px", height: "40px", borderRadius: "8px", background: "var(--background-elevated)", marginBottom: "16px", animation: "pulse 1.5s infinite" }}></div>
          <div style={{ width: "480px", height: "20px", borderRadius: "8px", background: "var(--background-elevated)", animation: "pulse 1.5s infinite" }}></div>
        </div>
        {/* Cards Skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: "var(--radius-lg)", background: "var(--background)", border: "1px solid var(--border)", overflow: "hidden", height: "420px", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "220px", background: "var(--background-elevated)", animation: "pulse 1.5s infinite" }}></div>
              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ width: "70%", height: "24px", background: "var(--background-elevated)", borderRadius: "4px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ width: "100%", height: "14px", background: "var(--background-elevated)", borderRadius: "4px", marginBottom: "8px", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ width: "80%", height: "14px", background: "var(--background-elevated)", borderRadius: "4px", marginBottom: "24px", animation: "pulse 1.5s infinite" }}></div>
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ width: "120px", height: "28px", background: "var(--background-elevated)", borderRadius: "4px", animation: "pulse 1.5s infinite" }}></div>
                  <div style={{ width: "100px", height: "36px", background: "var(--background-elevated)", borderRadius: "var(--radius-full)", animation: "pulse 1.5s infinite" }}></div>
                </div>
              </div>
            </div>
          ))}
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

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Premium Hero Banner */}
      <div style={{ 
        position: "relative",
        textAlign: "center", 
        marginBottom: "64px",
        padding: "80px 24px",
        background: "var(--foreground)",
        color: "var(--background)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "0 24px 50px rgba(0,0,0,0.1)"
      }}>
        {/* Subtle glow effect inside the banner */}
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
        
        <span style={{ 
          background: "rgba(245,158,11,0.15)", color: "#FBBF24", border: "1px solid rgba(245,158,11,0.3)",
          padding: "6px 20px", borderRadius: "20px", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "1px",
          display: "inline-block", marginBottom: "24px", position: "relative"
        }}>
          💎 VIP COLLECTION
        </span>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "20px", letterSpacing: "-0.03em", lineHeight: 1.1, position: "relative" }}>
          Koleksi Bundling <br/>
          <span style={{ background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Eksklusif
          </span>
        </h1>
        <p style={{ fontSize: "1.15rem", opacity: 0.8, maxWidth: "600px", margin: "0 auto", lineHeight: "1.6", position: "relative", fontWeight: 400 }}>
          Nikmati kemudahan premium dengan perlengkapan lengkap yang dirancang khusus untuk petualangan tanpa batas Anda.
        </p>
      </div>

      {packages.length === 0 ? (
        <div style={{ 
          textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center",
          background: "var(--background-secondary)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.02)"
        }}>
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "50%", background: "var(--background)", border: "1px solid var(--border)", 
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)"
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--foreground)", marginBottom: "8px", letterSpacing: "-0.02em" }}>Belum Ada Paket</h3>
          <p style={{ color: "var(--foreground-muted)", maxWidth: "300px", lineHeight: 1.6 }}>Nantikan koleksi paket eksklusif dari kami yang akan segera hadir.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {packages.map((pkg) => {
            const discount = Math.round((1 - Number(pkg.price_per_day) / Number(pkg.original_price_per_day)) * 100);
            
            return (
              <Link href={`/packages/${pkg.slug}`} key={pkg.id} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="card" style={{ 
                  overflow: "hidden", height: "100%", display: "flex", flexDirection: "column",
                  transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-12px)";
                  e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.08)";
                  e.currentTarget.style.borderColor = "var(--primary-light)";
                  const btn = e.currentTarget.querySelector('.explore-btn') as HTMLElement;
                  if (btn) {
                    btn.style.background = "var(--primary)";
                    btn.style.transform = "scale(1.05)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  const btn = e.currentTarget.querySelector('.explore-btn') as HTMLElement;
                  if (btn) {
                    btn.style.background = "var(--foreground)";
                    btn.style.transform = "scale(1)";
                  }
                }}
                >
                  <div style={{ position: "relative", height: "220px", background: "var(--background-secondary)" }}>
                    {pkg.image ? (
                      <Image 
                        src={getImageUrl(pkg.image)} 
                        alt={pkg.name} fill style={{ objectFit: "cover" }} 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background-elevated)" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      </div>
                    )}
                    
                    {discount > 0 && (
                      <div style={{
                        position: "absolute", top: "12px", right: "12px",
                        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "#fff",
                        padding: "6px 14px", borderRadius: "20px",
                        fontWeight: 800, fontSize: "0.8rem", letterSpacing: "0.5px",
                        boxShadow: "0 4px 12px rgba(217, 119, 6, 0.4)", border: "1px solid rgba(255,255,255,0.2)"
                      }}>
                        VIP HEMAT {discount}%
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", lineHeight: "1.3" }}>
                      {pkg.name}
                    </h3>
                    
                    <p style={{ color: "var(--foreground-secondary)", fontSize: "0.9rem", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {pkg.description}
                    </p>
                    
                    <div style={{ marginBottom: "24px" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Isi Paket:
                      </span>
                      <ul style={{ padding: 0, listStyle: "none", margin: 0, color: "var(--foreground-secondary)", fontSize: "0.85rem" }}>
                        {pkg.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} style={{ marginBottom: "6px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span><span style={{ fontWeight: 600, color: "var(--foreground)" }}>{item.quantity}x</span> {item.product.name}</span>
                          </li>
                        ))}
                        {pkg.items.length > 3 && (
                          <li style={{ fontStyle: "italic", opacity: 0.7, paddingLeft: "24px", marginTop: "4px" }}>+ {pkg.items.length - 3} item eksklusif lainnya</li>
                        )}
                      </ul>
                    </div>

                    <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                      <div>
                        {discount > 0 && (
                          <div style={{ fontSize: "0.85rem", textDecoration: "line-through", color: "var(--foreground-muted)", marginBottom: "2px" }}>
                            Rp {formatRupiah(pkg.original_price_per_day)}
                          </div>
                        )}
                        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                          Rp {formatRupiah(pkg.price_per_day)} <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--foreground-muted)" }}>/hari</span>
                        </div>
                      </div>
                      
                      <div className="explore-btn" style={{ 
                        padding: "10px 20px", fontSize: "0.95rem", fontWeight: 600, 
                        background: "var(--foreground)", color: "var(--background)",
                        borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", gap: "8px",
                        transition: "all 0.3s ease",
                      }}>
                        Eksplorasi
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
