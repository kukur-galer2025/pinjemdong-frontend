"use client";

import { useEffect, useState } from "react";
import { getEcho } from "@/lib/echo";

export default function NotificationListener() {
  const [notification, setNotification] = useState<{ title: string; message: string; type: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("PinjemLur-user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const echo = getEcho();
      if (!echo) return;

      const channel = echo.channel(`notifications.${user.id}`);
      
      channel.listen(".NotificationEvent", (e: any) => {
        console.log("Real-time Notification Received!", e);
        
        // Play "Ting!" sound using Web Audio API
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (err) {
          console.error("Failed to play notification sound", err);
        }

        // Show toast
        setNotification({
          title: e.title,
          message: e.message,
          type: e.type || "info"
        });

        // Hide toast after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      });

      return () => {
        echo.leaveChannel(`notifications.${user.id}`);
      };
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!notification) return null;

  return (
    <div style={{
      position: "fixed",
      top: "24px",
      right: "24px",
      zIndex: 9999,
      background: notification.type === "success" ? "var(--success)" : 
                  notification.type === "error" ? "var(--error)" : "var(--primary)",
      color: "#fff",
      padding: "16px 20px",
      borderRadius: "var(--radius-lg)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      maxWidth: "350px",
      animation: "slideIn 0.3s ease-out forwards"
    }}>
      <div style={{ fontSize: "1.5rem" }}>
        {notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "🔔"}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "4px" }}>{notification.title}</div>
        <div style={{ fontSize: "0.85rem", lineHeight: 1.4, opacity: 0.95 }}>{notification.message}</div>
      </div>
      <button 
        onClick={() => setNotification(null)}
        style={{ background: "none", border: "none", color: "#fff", opacity: 0.5, cursor: "pointer", padding: "0 0 0 8px" }}
      >
        ✕
      </button>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
