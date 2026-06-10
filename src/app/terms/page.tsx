"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px", background: "var(--background)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--foreground)", letterSpacing: "-0.03em", marginBottom: "16px" }}>
            Syarat & Ketentuan
          </h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1.1rem" }}>
            Pahami aturan main penyewaan agar transaksi aman dan nyaman.
          </p>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: "40px", borderRadius: "var(--radius-xl)" }}>
          
          <section style={{ marginBottom: "32px", padding: "20px", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--primary)" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              Dasar Hukum Perjanjian Sewa-Menyewa
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
              <p style={{ marginBottom: "8px" }}>Syarat dan Ketentuan ini merupakan bentuk kesepakatan tertulis elektronik yang mengikat secara hukum antara Pengguna (Penyewa) dan PinjemDong, yang tunduk pada hukum negara Republik Indonesia, meliputi namun tidak terbatas pada:</p>
              <ul style={{ paddingLeft: "24px" }}>
                <li><strong>Pasal 1320 jo. Pasal 1338 KUHPerdata:</strong> Perjanjian elektronik yang disetujui Pengguna sah dan berlaku mengikat sebagai Undang-Undang bagi kedua belah pihak.</li>
                <li><strong>Pasal 1548 KUHPerdata:</strong> Mengikat secara sah mengenai definisi dan hak serta kewajiban dalam proses sewa-menyewa.</li>
                <li><strong>Pasal 1564 KUHPerdata:</strong> Penyewa bertanggung jawab atas segala kerusakan atau kehilangan barang yang disewakan selama masa sewa berlangsung.</li>
                <li><strong>UU No. 11 Tahun 2008 (UU ITE):</strong> Pengakuan bahwa rekam jejak digital (klik persetujuan, log sistem) merupakan alat bukti hukum yang sah di pengadilan.</li>
              </ul>
            </div>
          </section>
          
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>1.</span> Perhitungan Durasi Sewa (24-Jam Blok)
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
              <p style={{ marginBottom: "12px" }}>
                (1) PinjemDong menerapkan sistem durasi <strong>Blok 24-Jam</strong> yang dihitung secara presisi sejak Jam Pengambilan hingga Jam Pengembalian yang Anda pilih saat <i>checkout</i>.
              </p>
              <ul style={{ paddingLeft: "24px", marginBottom: "12px" }}>
                <li>Setiap blok 24 jam akan dihitung sebagai <strong>1 Hari Sewa</strong>.</li>
                <li>Tidak melayani penyewaan berbasis jam (misal: sewa 3 jam). Durasi minimal adalah 1 hari penuh.</li>
                <li>Jika durasi penggunaan melebihi batas 24 jam (meskipun hanya 2 jam tambahan), maka secara otomatis akan langsung dihitung sebagai penambahan <strong>1 hari sewa penuh</strong>.</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>2.</span> Toleransi Waktu (Grace Period)
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
              <p style={{ marginBottom: "12px" }}>
                (1) Kami memahami bahwa kendala di perjalanan bisa terjadi. Oleh karena itu, kami memberikan toleransi keterlambatan pengembalian selama <strong>maksimal 1 Jam</strong> secara gratis.
              </p>
              <div style={{ padding: "16px", background: "var(--background-elevated)", borderLeft: "4px solid var(--primary)", borderRadius: "var(--radius-md)", margin: "16px 0" }}>
                <strong>Contoh Skenario Toleransi:</strong><br/>
                Jika Anda menyewa barang dari <strong>Senin 10:00 pagi</strong> hingga <strong>Selasa 10:00 pagi</strong> (24 Jam = 1 Hari).<br/>
                ✅ Apabila Anda mengembalikan jam 11:00 (Durasi total 25 Jam), Anda <strong>tetap dihitung 1 Hari</strong>.<br/>
                ❌ Apabila Anda mengembalikan jam 11:01 (Durasi total &gt;25 Jam), Anda akan <strong>dihitung 2 Hari</strong>.
              </div>
            </div>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>3.</span> Denda Keterlambatan Pengembalian
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
              <p>
                (1) Barang yang tidak dikembalikan tepat waktu (melewati batas toleransi 1 jam dari jadwal kembalinya) akan otomatis dikenakan denda keterlambatan sistem.
              </p>
              <p style={{ fontWeight: 600, color: "var(--error)", marginTop: "8px" }}>
                (2) Denda keterlambatan ditetapkan sebesar 100% dari harga sewa barang per hari, dikalikan dengan setiap kelipatan hari (24-jam) keterlambatannya.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>4.</span> Kewajiban Verifikasi Identitas (KYC)
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
              <p>
                (1) Sebelum dapat membuat pesanan pertama, setiap penyewa wajib melakukan verifikasi identitas di menu Dashboard dengan mengunggah foto KTP dan swafoto (selfie). Data ini kami jaga keamanannya dan hanya digunakan untuk kepentingan garansi perlengkapan.
              </p>
            </div>
          </section>
          
          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "var(--primary)" }}>5.</span> Tanggung Jawab atas Kerusakan & Kehilangan
            </h2>
            <div style={{ color: "var(--foreground-secondary)", lineHeight: 1.8, fontSize: "1rem" }}>
              <p>
                (1) Sebagaimana diatur dalam <strong>Pasal 1564 KUHPerdata</strong>, Penyewa bertanggung jawab penuh atas segala bentuk kerusakan, cacat, atau hilangnya perlengkapan yang terjadi selama masa penyewaan.
              </p>
              <p>
                (2) Apabila terjadi kerusakan yang dapat diperbaiki, penyewa wajib menanggung seluruh biaya perbaikan atau servis alat terkait sesuai tagihan dari pihak teknisi resmi PinjemDong.
              </p>
              <p>
                (3) Apabila barang hilang, dicuri, atau dirusak secara sengaja maupun tidak sengaja hingga tidak dapat diservis, maka penyewa wajib melakukan ganti rugi penuh sebesar harga jual resmi barang baru tersebut di pasaran. Apabila penyewa menolak ganti rugi, PinjemDong berhak membawa masalah ini ke jalur perdata maupun pidana sesuai dengan <strong>Pasal 372 KUHP (Tindak Pidana Penggelapan)</strong>.
              </p>
            </div>
          </section>

        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <Link href="/catalog" style={{ 
            display: "inline-block", background: "var(--foreground)", color: "var(--background)", 
            padding: "14px 32px", borderRadius: "var(--radius-full)", fontWeight: 600, 
            fontSize: "1rem", textDecoration: "none", transition: "all 0.3s ease"
          }}>
            Mengerti & Mulai Menyewa
          </Link>
        </div>

      </div>
    </div>
  );
}
