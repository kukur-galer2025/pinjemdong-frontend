"use client";

import { useState, useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const userStr = localStorage.getItem("pinjemdong-user");
    const token = localStorage.getItem("pinjemdong-token");
    if (!userStr || !token) return;
    
    const parsedUser = JSON.parse(userStr);
    setUser({ ...parsedUser, token });
    
    if (parsedUser.role === "admin") return;

    fetchChats(token);

    const echo = getEcho();
    if (echo) {
      const channel = echo.channel(`chat.${parsedUser.id}`);
      channel.listen(".ChatMessageSent", (e: any) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === e.chat.id)) return prev;
          return [...prev, e.chat];
        });
        
        if (!isOpenRef.current) {
          setUnreadCount(prev => prev + 1);
        }

        try {
          // Play a "ting" sound using Web Audio API so no external mp3 is needed
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // High C note (ting!)
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          }
        } catch(e) {}
      });

      return () => {
        echo.leaveChannel(`chat.${parsedUser.id}`);
      };
    }
  }, []);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      setUnreadCount(0);
      if (user?.token) {
        // Mark as read
        fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats/read", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ sender_id: 1 })
        }).catch(() => {});
      }
    }
  }, [isOpen, unreadCount, user]);

  const fetchChats = async (token: string) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const msg = newMessage;
    setNewMessage("");

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.some(m => m.id === data.chat.id)) return prev;
          return [...prev, data.chat];
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role === "admin") return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-[9999] transition-all duration-300 transform ${
          isOpen 
            ? 'bg-zinc-800 text-white rotate-90 scale-90 shadow-lg' 
            : 'text-white hover:scale-105'
        }`}
        style={!isOpen ? {
          background: "linear-gradient(135deg, var(--primary) 0%, #4C1D95 100%)",
          boxShadow: "0 10px 25px rgba(124, 58, 237, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset"
        } : {}}
      >
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
        <svg className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          )}
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed z-[9998] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 origin-bottom-right bottom-0 right-0 w-full h-[100dvh] rounded-none sm:bottom-28 sm:right-6 sm:w-[380px] sm:h-[550px] sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.15)] border border-transparent sm:border-zinc-200/60 dark:sm:border-zinc-800/60" style={{ background: "var(--background)" }}>
          
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg, var(--foreground) 0%, #1a1a1a 100%)", 
            color: "var(--background)", padding: "20px", display: "flex", justifyContent: "space-between", 
            alignItems: "center", zIndex: 10, flexShrink: 0, position: "relative", overflow: "hidden" 
          }}>
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)", filter: "blur(20px)" }}></div>
            
            <div style={{ width: "46px", height: "46px", background: "linear-gradient(135deg, #2a2a2a 0%, #111 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", zIndex: 2 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.3rem", background: "linear-gradient(to bottom right, #fff, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>P</span>
              <div style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "14px", height: "14px", background: "#10B981", borderRadius: "50%", border: "2px solid #111", animation: "pulse 2s infinite" }}></div>
            </div>
            <div style={{ flex: 1, marginLeft: "14px", zIndex: 2 }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2, margin: 0, color: "#fff" }}>Admin pinjemdong</h3>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "3px", fontWeight: 500, margin: 0 }}>Biasanya membalas dalam 5 menit</p>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: "var(--background)", opacity: 0.7, background: "transparent", border: "none", cursor: "pointer", padding: "4px" }} aria-label="Tutup Obrolan">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="custom-scrollbar" style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "var(--background-secondary)", position: "relative" }}>
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

            {messages.length === 0 ? (
              <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "0 16px", zIndex: 10 }}>
                <div style={{ width: "80px", height: "80px", background: "var(--background)", borderRadius: "50%", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "2.5rem" }}>👋</span>
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "1.1rem", margin: "0 0 6px 0" }}>Halo! Ada yang bisa dibantu?</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", margin: 0 }}>Tanyakan ketersediaan stok atau konsultasikan kebutuhan sewa Anda di sini.</p>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.sender_id === user.id;
                return (
                  <div key={`${m.id || 'new'}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", zIndex: 10, animation: "slideUp 0.3s ease" }}>
                    <div style={{
                      maxWidth: "85%", padding: "14px 18px", borderRadius: "20px",
                      background: isMe ? "linear-gradient(135deg, var(--primary) 0%, #6D28D9 100%)" : "var(--background)",
                      color: isMe ? "#ffffff" : "var(--foreground)",
                      border: isMe ? "none" : "1px solid var(--border)",
                      borderBottomRightRadius: isMe ? "6px" : "20px",
                      borderBottomLeftRadius: isMe ? "20px" : "6px",
                      boxShadow: isMe ? "0 8px 20px rgba(124, 58, 237, 0.25)" : "0 4px 15px rgba(0,0,0,0.03)"
                    }}>
                      <div style={{ fontSize: "0.95rem", lineHeight: 1.5, letterSpacing: "0.2px" }}>{m.message}</div>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--foreground-muted)", marginTop: "6px", padding: "0 6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
                      {new Date(m.created_at || Date.now()).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', hour12: false}).replace('.', ':')}
                      {isMe && (
                        <svg width="14" height="14" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "16px 20px", background: "var(--background)", borderTop: "1px solid var(--border)", zIndex: 10 }}>
            <form onSubmit={sendMessage} style={{ display: "flex", gap: "8px", position: "relative", alignItems: "center" }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tulis pesan..."
                style={{
                  width: "100%", background: "var(--background-secondary)", border: "1px solid var(--border)", 
                  color: "var(--foreground)", borderRadius: "30px", padding: "14px 56px 14px 20px", 
                  outline: "none", fontSize: "0.95rem", transition: "all 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 2px rgba(124, 58, 237, 0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                style={{
                  position: "absolute", right: "6px", width: "40px", height: "40px", 
                  background: newMessage.trim() ? "var(--primary)" : "var(--foreground-muted)", 
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                  color: "#fff", border: "none", cursor: newMessage.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s", boxShadow: newMessage.trim() ? "0 4px 10px rgba(124, 58, 237, 0.3)" : "none",
                  opacity: newMessage.trim() ? 1 : 0.5
                }}
              >
                <svg width="20" height="20" style={{ marginLeft: "2px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(75, 85, 99, 0.5);
        }
      `}</style>
    </>
  );
}
