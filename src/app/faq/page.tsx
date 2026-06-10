"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    question: "Bagaimana cara menyewa barang di pinjemdong?",
    answer: "Sangat mudah! Anda cukup mendaftar akun, melakukan verifikasi identitas (KYC) dengan mengunggah foto KTP, lalu cari barang yang Anda inginkan di Katalog. Tentukan tanggal sewa, lakukan pembayaran, dan barang siap diambil atau diantarkan."
  },
  {
    question: "Bagaimana sistem perhitungan harga dan denda keterlambatan?",
    answer: "Harga sewa dihitung per blok 24 jam. Misalnya, jika Anda menyewa 1 Hari dan mengambil barang jam 10:00 pagi, maka Anda harus mengembalikannya sebelum jam 10:00 pagi keesokan harinya. Jika melewati batas waktu tersebut, sistem akan otomatis mengenakan denda sebesar harga sewa 1 hari penuh untuk setiap kelipatan 24 jam keterlambatan."
  },
  {
    question: "Apakah saya perlu membayar deposit atau jaminan?",
    answer: "Tergantung jenis barangnya. Beberapa barang bernilai tinggi (seperti kamera atau drone) mungkin membutuhkan uang muka (DP) atau deposit jaminan yang akan dikembalikan sepenuhnya setelah barang dikembalikan dalam kondisi baik."
  },
  {
    question: "Bagaimana jika barang rusak secara tidak sengaja saat disewa?",
    answer: "Segera laporkan kepada kami melalui Live Chat. Penyewa bertanggung jawab atas kerusakan yang terjadi selama masa sewa sesuai dengan Syarat & Ketentuan yang berlaku. Biaya perbaikan akan dikomunikasikan secara transparan."
  },
  {
    question: "Apakah bisa memperpanjang masa sewa?",
    answer: "Tentu! Anda bisa memperpanjang masa sewa melalui Dashboard Anda sebelum masa sewa aktif berakhir, asalkan barang tersebut belum di-booking oleh pengguna lain di tanggal berikutnya."
  },
  {
    question: "Berapa lama proses Verifikasi Identitas (KYC)?",
    answer: "Tim admin kami biasanya memproses verifikasi identitas dalam waktu 15 - 30 menit pada jam kerja operasional."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "100px 24px 80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ 
            background: "var(--primary-light)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "1px",
            display: "inline-block", marginBottom: "16px"
          }}>
            PUSAT BANTUAN
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.02em" }}>Frequently Asked Questions</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto" }}>
            Punya pertanyaan? Kami telah merangkum jawaban untuk pertanyaan yang paling sering diajukan pelanggan.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "60px" }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="card"
                style={{ 
                  borderRadius: "var(--radius-lg)", 
                  background: "var(--background-elevated)", 
                  border: isOpen ? "1px solid var(--primary)" : "1px solid var(--border)",
                  overflow: "hidden",
                  transition: "all 0.3s ease"
                }}
              >
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{ 
                    width: "100%", padding: "20px 24px", background: "transparent", border: "none", 
                    display: "flex", alignItems: "center", justifyContent: "space-between", 
                    cursor: "pointer", textAlign: "left", color: "var(--foreground)",
                    fontSize: "1.1rem", fontWeight: 700
                  }}
                >
                  {faq.question}
                  <div style={{ 
                    width: "32px", height: "32px", borderRadius: "50%", background: isOpen ? "var(--primary)" : "var(--background-secondary)", 
                    color: isOpen ? "#fff" : "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: "16px"
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>
                
                <div style={{ 
                  maxHeight: isOpen ? "300px" : "0", 
                  opacity: isOpen ? 1 : 0, 
                  overflow: "hidden", 
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: isOpen ? "0 24px 24px" : "0 24px"
                }}>
                  <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.7, margin: 0, paddingTop: "8px", borderTop: "1px dashed var(--border)" }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: "40px", borderRadius: "var(--radius-xl)", background: "var(--primary-gradient)", color: "#fff", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, opacity: 0.1 }}>
            <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          
          <div style={{ position: "relative", zIndex: 10 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px" }}>Masih Punya Pertanyaan Lain?</h2>
            <p style={{ fontSize: "1.05rem", opacity: 0.9, marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
              Tim Support kami siap membantu Anda menyelesaikan kendala kapan saja melalui Live Chat.
            </p>
            <Link href="/" style={{ 
              display: "inline-block", background: "#fff", color: "var(--primary)", padding: "14px 32px", 
              borderRadius: "var(--radius-full)", fontWeight: 800, textDecoration: "none", boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              transition: "transform 0.2s"
            }} className="hover-scale">
              Mulai Percakapan
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
