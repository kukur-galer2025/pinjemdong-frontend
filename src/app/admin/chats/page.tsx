"use client";

import { useState, useEffect, useRef } from "react";
import { getEcho } from "@/lib/echo";

export default function AdminChats() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminUser, setAdminUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("PinjemLur-user");
    const token = localStorage.getItem("PinjemLur-token");
    if (!userStr || !token) return;
    
    const parsedUser = JSON.parse(userStr);
    setAdminUser({ ...parsedUser, token });
    
    fetchContacts(token);

    const echo = getEcho();
    if (echo) {
      const channel = echo.channel(`chat.${parsedUser.id}`);
      channel.listen(".ChatMessageSent", (e: any) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === e.chat.id)) return prev;
          return [...prev, e.chat];
        });
        fetchContacts(token);
        try {
          // Play a "ting" sound using Web Audio API
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime);
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

  const fetchContacts = async (token: string) => {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setContacts(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/chats?user_id=${userId}`, {
        headers: { "Authorization": `Bearer ${adminUser.token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
        
        fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats/read", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${adminUser.token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ sender_id: userId })
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectContact = (contact: any) => {
    setActiveContact(contact);
    fetchHistory(contact.id);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const msg = newMessage;
    setNewMessage("");

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api/chats", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminUser.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: msg, receiver_id: activeContact.id })
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

  const activeMessages = messages.filter(m => 
    (m.sender_id === activeContact?.id && m.receiver_id === adminUser?.id) ||
    (m.sender_id === adminUser?.id && m.receiver_id === activeContact?.id)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", letterSpacing: "-0.02em" }}>
          💬 Live Chat
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", marginTop: "4px" }}>
          Kelola dan balas pesan dari pengguna secara real-time.
        </p>
      </div>

      {/* Chat Container */}
      <div className="chat-container-mobile" style={{
        display: "flex",
        height: "calc(100vh - 200px)",
        minHeight: "500px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        background: "var(--background-card)",
      }}>

        {/* ─── Left: Contacts List ─── */}
        <div className="chat-sidebar-mobile" style={{
          width: "320px",
          minWidth: "320px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          background: "var(--background)",
        }}>
          {/* Contacts Header */}
          <div style={{
            padding: "20px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--foreground-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Percakapan ({contacts.length})
            </div>
          </div>

          {/* Contacts Scroll */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {contacts.length === 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--foreground-muted)",
                textAlign: "center",
                padding: "24px",
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  fontSize: "1.5rem",
                }}>
                  📭
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Belum Ada Pesan</div>
                <div style={{ fontSize: "0.8rem", marginTop: "4px", opacity: 0.7 }}>
                  Pesan dari pelanggan akan muncul di sini.
                </div>
              </div>
            ) : (
              contacts.map(contact => {
                const isActive = activeContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => selectContact(contact)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                      marginBottom: "4px",
                      background: isActive ? "var(--primary-light)" : "transparent",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "var(--background-card)";
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-full)",
                      background: isActive ? "var(--primary-gradient)" : "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: isActive ? "#fff" : "var(--primary)",
                      flexShrink: 0,
                    }}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: isActive ? 700 : 600,
                        fontSize: "0.95rem",
                        color: isActive ? "var(--primary)" : "var(--foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {contact.name}
                      </div>
                      <div style={{
                        fontSize: "0.78rem",
                        color: "var(--foreground-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: "2px",
                      }}>
                        {contact.email}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── Right: Chat Area ─── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "var(--background)",
        }}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                background: "var(--background-card)",
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--primary-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}>
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "var(--radius-full)",
                    background: "#22c55e",
                    border: "2px solid var(--background-card)",
                  }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>
                    {activeContact.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#22c55e", fontWeight: 600 }}>
                    ● Online
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}>
                {activeMessages.length === 0 ? (
                  <div style={{
                    margin: "auto",
                    textAlign: "center",
                    color: "var(--foreground-muted)",
                  }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💬</div>
                    <div style={{ fontWeight: 600, fontSize: "1rem" }}>Mulai Percakapan</div>
                    <div style={{ fontSize: "0.85rem", marginTop: "4px", opacity: 0.7 }}>
                      Kirim pesan sapaan kepada {activeContact.name}
                    </div>
                  </div>
                ) : (
                  activeMessages.map((m, idx) => {
                    const isMe = m.sender_id === adminUser?.id;
                    const time = new Date(m.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: "2-digit", minute: "2-digit", hour12: false }).replace('.', ':');
                    return (
                      <div key={`${m.id || 'new'}-${idx}`} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}>
                        {!isMe && (
                          <div style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            color: "var(--primary)",
                            marginBottom: "4px",
                            marginLeft: "4px",
                          }}>
                            {activeContact.name}
                          </div>
                        )}
                        <div style={{
                          maxWidth: "65%",
                          padding: "12px 18px",
                          borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isMe ? "var(--primary-gradient)" : "var(--background-card)",
                          color: isMe ? "#fff" : "var(--foreground)",
                          border: isMe ? "none" : "1px solid var(--border)",
                          fontSize: "0.92rem",
                          lineHeight: 1.6,
                          boxShadow: isMe ? "var(--shadow-glow)" : "var(--shadow-sm)",
                        }}>
                          {m.message}
                        </div>
                        <div style={{
                          fontSize: "0.7rem",
                          color: "var(--foreground-muted)",
                          marginTop: "6px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "0 4px",
                        }}>
                          {time}
                          {isMe && (
                            <span style={{ color: "var(--primary)", fontSize: "0.75rem" }}>✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                background: "var(--background-card)",
              }}>
                <form onSubmit={sendMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik balasan..."
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      color: "var(--foreground)",
                      fontSize: "0.92rem",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "var(--primary)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "var(--radius-full)",
                      background: newMessage.trim() ? "var(--primary-gradient)" : "var(--border)",
                      border: "none",
                      color: "#fff",
                      cursor: newMessage.trim() ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                      transition: "all 0.2s",
                      boxShadow: newMessage.trim() ? "var(--shadow-glow)" : "none",
                    }}
                  >
                    ➤
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State */
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--foreground-muted)",
              textAlign: "center",
              padding: "40px",
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "var(--radius-full)",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "2rem",
              }}>
                💬
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--foreground)" }}>
                Pilih Percakapan
              </div>
              <div style={{ fontSize: "0.85rem", marginTop: "8px", maxWidth: "280px", lineHeight: 1.5 }}>
                Pilih pengguna dari daftar di sebelah kiri untuk melihat dan membalas pesan mereka.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
