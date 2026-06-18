"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  photo_url: string | null;
  admin_reply: string | null;
  created_at: string;
  user: { name: string; email: string };
  product: { name: string; slug: string };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setLoading(true);
    const token = localStorage.getItem("PinjemLur-token");
    try {
      const res = await fetch(`${API}/admin/reviews?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.data || []);
        setTotalPages(data.last_page || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleReply = async (id: number) => {
    const token = localStorage.getItem("PinjemLur-token");
    try {
      const res = await fetch(`${API}/admin/reviews/${id}/reply`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ admin_reply: replyText })
      });
      
      if (res.ok) {
        setReplyingTo(null);
        setReplyText("");
        fetchReviews(); // Refresh data
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Memuat ulasan...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>⭐ Kelola Ulasan</h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem" }}>
          Lihat ulasan pelanggan dan berikan balasan.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {reviews.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--foreground-muted)" }}>
            Belum ada ulasan.
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{review.user.name}</div>
                  <div style={{ color: "var(--foreground-secondary)", fontSize: "0.85rem", marginBottom: "4px" }}>
                    Menyewa: <span style={{ fontWeight: 600 }}>{review.product.name}</span>
                  </div>
                  <div style={{ color: "var(--warning)", fontSize: "1.2rem", letterSpacing: "2px" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--foreground-muted)" }}>
                  {new Date(review.created_at).toLocaleDateString("id-ID")}
                </div>
              </div>

              {review.comment && (
                <p style={{ fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "16px", color: "var(--foreground)" }}>
                  "{review.comment}"
                </p>
              )}

              {review.photo_url && (
                <div style={{ marginBottom: "16px" }}>
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/storage/${review.photo_url}`} 
                    alt="Foto Ulasan" 
                    style={{ maxWidth: "200px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }} 
                  />
                </div>
              )}

              {/* Admin Reply Section */}
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                {review.admin_reply ? (
                  <div style={{ background: "var(--primary-light)", padding: "16px", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)", marginBottom: "4px" }}>Balasan Anda:</div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--foreground-secondary)" }}>{review.admin_reply}</p>
                    <button 
                      onClick={() => { setReplyingTo(review.id); setReplyText(review.admin_reply || ""); }}
                      style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.8rem", fontWeight: 600, marginTop: "8px", cursor: "pointer", padding: 0 }}
                    >
                      Edit Balasan
                    </button>
                  </div>
                ) : (
                  <div>
                    {replyingTo === review.id ? (
                      <div>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Ketik balasan Anda di sini..."
                          style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--background-elevated)", minHeight: "80px", marginBottom: "8px", outline: "none", resize: "vertical" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => setReplyingTo(null)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Batal</button>
                          <button onClick={() => handleReply(review.id)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Kirim Balasan</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setReplyingTo(review.id); setReplyText(""); }} 
                        className="btn-secondary" 
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        ↩️ Balas Ulasan
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", marginTop: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--background-elevated)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", fontWeight: 600 }}>
            Halaman {page} dari {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Sebelumnya
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px", opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }}
            >
              Selanjutnya
              <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
