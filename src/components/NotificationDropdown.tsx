"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    type: string;
    title: string;
    message: string;
    status?: string;
    rental_id?: number;
    payment_id?: number;
    amount?: number;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) return;

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "") + "/api/user-alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications.data || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) return;

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/user-alerts/${id}/mark-as-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("pinjemdong-token");
    if (!token) return;

    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/user-alerts/mark-all-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id, { stopPropagation: () => {} } as any);
    }
    setIsOpen(false);
    
    // Navigate to dashboard (all rental details are on the dashboard)
    router.push("/dashboard");
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'payment_confirmed': return '💰';
      case 'rental_status_updated': return '📦';
      case 'kyc_status_updated': return '📝';
      default: return '🔔';
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "var(--radius-full)",
          border: "1.5px solid var(--border)",
          background: "var(--background-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "1.15rem",
          transition: "all var(--transition-fast)",
          position: "relative",
        }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.7rem",
              fontWeight: 800,
              padding: "2px 6px",
              borderRadius: "10px",
              border: "2px solid var(--background)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass"
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: "350px",
            maxHeight: "450px",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
            background: "var(--background)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--background-secondary)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--foreground-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
                <p style={{ fontSize: "0.9rem" }}>Belum ada notifikasi.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    background: notification.read_at ? "transparent" : "var(--primary-light)",
                    transition: "background var(--transition-fast)",
                    display: "flex",
                    gap: "12px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = notification.read_at ? "var(--background-secondary)" : "var(--primary-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.read_at ? "transparent" : "var(--primary-light)";
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--background-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {getIconForType(notification.data.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, color: "var(--foreground)" }}>
                        {notification.data.title}
                      </h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", whiteSpace: "nowrap", marginLeft: "8px" }}>
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--foreground-secondary)", margin: 0, lineHeight: 1.4 }}>
                      {notification.data.message}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div
            style={{
              padding: "12px",
              borderTop: "1px solid var(--border)",
              textAlign: "center",
              background: "var(--background-secondary)",
            }}
          >
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: "0.85rem",
                color: "var(--foreground-muted)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Ke Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
