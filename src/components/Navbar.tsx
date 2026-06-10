"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role?: string; email?: string } | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("pinjemdong-user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      const token = localStorage.getItem("pinjemdong-token");
      if (!token) return;
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.wishlist) {
          setWishlistCount(data.wishlist.length);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchWishlistCount();

    // Listen for custom event when wishlist is updated
    window.addEventListener('wishlist-updated', fetchWishlistCount);
    return () => window.removeEventListener('wishlist-updated', fetchWishlistCount);
  }, []);

  useEffect(() => {
    const fetchCartCount = () => {
      const packageStr = localStorage.getItem("pinjemdong-package");
      const packageCart = packageStr && packageStr !== "null" && packageStr !== "undefined" ? JSON.parse(packageStr) : null;
      
      if (packageCart) {
        setCartCount(1);
      } else {
        const cart = JSON.parse(localStorage.getItem("pinjemdong-cart") || "[]");
        const count = cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      }
    };

    fetchCartCount();

    window.addEventListener('cart-updated', fetchCartCount);
    return () => window.removeEventListener('cart-updated', fetchCartCount);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("pinjemdong-token");
    localStorage.removeItem("pinjemdong-user");
    setUser(null);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = "/login";
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "var(--glass-backdrop)" : "none",
        WebkitBackdropFilter: scrolled ? "var(--glass-backdrop)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            📦
          </div>
          <span
            className="gradient-text hidden sm:inline"
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            pinjemdong
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/", label: "Beranda" },
            { href: "/catalog", label: "Katalog" },
            { href: "/packages", label: "Paket Hemat" },
            { href: "/how-it-works", label: "Cara Sewa" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "var(--foreground-secondary)",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                position: "relative",
                paddingBottom: "2px",
              }}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Theme Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden sm:flex"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              background: "var(--background-elevated)",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "var(--foreground)"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "var(--foreground-muted)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {theme === "light" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/></svg>
            )}
          </button>

          {user && (
            <div className="hidden sm:block">
              <NotificationDropdown />
            </div>
          )}

          {/* Cart */}
          <Link
            href="/checkout"
            className="hidden sm:flex"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              background: "var(--background-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground)",
              transition: "all 0.3s ease",
              textDecoration: "none",
              position: "relative",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "var(--foreground-muted)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "var(--error)",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: "bold",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                border: "2px solid var(--background)"
              }}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden sm:flex"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border)",
              background: "var(--background-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground)",
              transition: "all 0.3s ease",
              textDecoration: "none",
              position: "relative",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = "var(--foreground-muted)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {wishlistCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                background: "var(--error)",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: "bold",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                border: "2px solid var(--background)"
              }}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Login / User Button */}
          {user ? (
            <div className="hidden sm:block profile-dropdown-container" style={{ position: "relative" }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="btn-primary flex items-center"
                style={{ padding: "10px 20px", fontSize: "0.9rem", gap: "8px", border: "none", cursor: "pointer", color: "#ffffff" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                {user.name.split(" ")[0]}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: profileDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="glass animate-fade-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    right: 0,
                    width: "220px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--background-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-lg)",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", background: "var(--background-elevated)" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "4px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || 'Pengguna'}</p>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <Link
                      href={user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      Dashboard {user.role === 'admin' ? 'Admin' : 'Pesanan'}
                    </Link>
                    {user.role !== 'admin' && (
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem", transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit Profil
                      </Link>
                    )}
                  </div>
                  <div style={{ padding: "8px", borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", width: "100%", borderRadius: "var(--radius-md)", color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s", textAlign: "left",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary hidden sm:inline-flex" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>
              Masuk
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col items-center justify-center"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border)",
              background: "var(--background-elevated)",
              cursor: "pointer",
              gap: "4px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "18px",
                height: "2px",
                background: "var(--foreground)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
                transform: mobileMenuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
              }}
            />
            <span
              style={{
                width: "18px",
                height: "2px",
                background: "var(--foreground)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
                opacity: mobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                width: "18px",
                height: "2px",
                background: "var(--foreground)",
                borderRadius: "2px",
                transition: "all var(--transition-fast)",
                transform: mobileMenuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden glass animate-fade-in flex flex-col"
          style={{
            margin: "8px 16px 0",
            padding: "16px",
            borderRadius: "var(--radius-lg)",
            gap: "2px",
            background: "var(--background)",
            boxShadow: "var(--shadow-xl)"
          }}
        >
          {/* Menu Utama */}
          <div style={{ marginBottom: "4px" }}>
            <h4 style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 12px", marginBottom: "4px" }}>Menu Utama</h4>
            {[
              { href: "/", label: "🏠  Beranda" },
              { href: "/catalog", label: "📦  Katalog" },
              { href: "/packages", label: "💎  Paket Hemat" },
              { href: "/how-it-works", label: "📋  Cara Sewa" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--foreground)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "block", transition: "background var(--transition-fast)",
                }}
                className="mobile-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ height: "1px", background: "var(--border)", margin: "4px 12px 8px" }} />

          {/* Aktivitas */}
          <div style={{ marginBottom: "4px" }}>
            <h4 style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 12px", marginBottom: "4px" }}>Aktivitas</h4>
            {[
              { href: "/checkout", label: "🛒  Keranjang" },
              { href: "/wishlist", label: `❤️  Wishlist ${wishlistCount > 0 ? `(${wishlistCount})` : ''}` },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--foreground)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "block", transition: "background var(--transition-fast)",
                }}
                className="mobile-nav-link"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ height: "1px", background: "var(--border)", margin: "4px 12px 8px" }} />

          {/* Akun */}
          <div>
            <h4 style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "1px", padding: "0 12px", marginBottom: "4px" }}>Pengaturan & Akun</h4>
            {user ? (
              <>
                <div style={{ padding: "8px 12px", marginBottom: "4px", background: "var(--background-elevated)", borderRadius: "var(--radius-md)" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{user.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: 0 }}>{user.email || 'Pengguna Terverifikasi'}</p>
                </div>
                
                <Link
                  href={user.role === 'admin' ? "/admin" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px", transition: "background var(--transition-fast)",
                  }}
                  className="mobile-nav-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  Dashboard {user.role === 'admin' ? 'Admin' : 'Pesanan'}
                </Link>

                {user.role !== 'admin' && (
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px", transition: "background var(--transition-fast)",
                    }}
                    className="mobile-nav-link"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit Profil
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--danger)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background var(--transition-fast)",
                  }}
                  className="mobile-nav-link"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Keluar (Logout)
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--primary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600, display: "block", transition: "background var(--transition-fast)",
                }}
                className="mobile-nav-link"
              >
                👤 Masuk / Daftar
              </Link>
            )}
            
            <button
              onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
              style={{
                padding: "10px 12px", borderRadius: "var(--radius-md)", color: "var(--foreground)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background var(--transition-fast)",
              }}
              className="mobile-nav-link"
            >
              <span>{theme === "light" ? "🌙" : "☀️"}</span>
              Ganti Tema ({theme === "light" ? "Gelap" : "Terang"})
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .mobile-nav-link {
          transition: all 0.2s ease-in-out !important;
        }
        .mobile-nav-link:hover {
          background: var(--background-elevated) !important;
          color: var(--primary) !important;
          transform: translateX(6px) !important;
        }
      `}} />
    </nav>
  );
}
