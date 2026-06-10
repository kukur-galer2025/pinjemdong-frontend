export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "100px 24px 80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ 
            background: "var(--primary-light)", color: "var(--primary)",
            padding: "6px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "1px",
            display: "inline-block", marginBottom: "16px"
          }}>
            LEGAL
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.02em" }}>Kebijakan Privasi</h1>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1.1rem" }}>Terakhir diperbarui: 10 Juni 2026</p>
        </div>

        <div className="card" style={{ padding: "40px", borderRadius: "var(--radius-xl)", background: "var(--background-elevated)", border: "1px solid var(--border)", lineHeight: 1.8, color: "var(--foreground-secondary)" }}>
          
          <section style={{ marginBottom: "32px", padding: "20px", background: "var(--primary-light)", borderRadius: "var(--radius-lg)", border: "1px solid var(--primary)", color: "var(--foreground-secondary)" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              Dasar Hukum Perlindungan Data
            </h2>
            <div style={{ lineHeight: 1.8, fontSize: "0.95rem" }}>
              <p style={{ marginBottom: "8px" }}>Kebijakan Privasi ini disusun berdasarkan kepatuhan PinjemDong terhadap regulasi hukum di Indonesia, yang meliputi:</p>
              <ul style={{ paddingLeft: "24px", margin: 0 }}>
                <li><strong>UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP):</strong> Mengatur prinsip pengumpulan, pemrosesan, dan pelindungan data pribadi pengguna.</li>
                <li><strong>UU No. 11 Tahun 2008 jo. UU No. 19 Tahun 2016 (UU ITE):</strong> Mengatur penyelenggaraan sistem dan transaksi elektronik yang aman dan andal.</li>
                <li><strong>PP No. 71 Tahun 2019 (PSTE):</strong> Mengatur kewajiban Penyelenggara Sistem Elektronik (PSE) dalam menjaga kerahasiaan dan ketersediaan data pengguna.</li>
              </ul>
            </div>
          </section>

          <p style={{ marginBottom: "24px" }}>
            Di <strong>pinjemdong</strong>, privasi pengunjung dan pelanggan kami adalah prioritas utama. Dokumen Kebijakan Privasi ini berisi jenis informasi yang dikumpulkan dan dicatat oleh kami serta bagaimana kami menggunakannya.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "40px", marginBottom: "16px" }}>1. Informasi yang Kami Kumpulkan</h2>
          <p style={{ marginBottom: "16px" }}>
            (1) Kami dapat mengumpulkan informasi identifikasi pribadi dari Pengguna dengan berbagai cara, termasuk, tetapi tidak terbatas pada, ketika Pengguna mengunjungi situs web kami, mendaftar di situs, melakukan pemesanan (sewa), memverifikasi identitas (KYC), dan sehubungan dengan aktivitas, layanan, fitur, atau sumber daya lain yang kami sediakan di Situs kami.
          </p>
          <ul style={{ paddingLeft: "24px", marginBottom: "24px" }}>
            <li><strong>Informasi Kontak:</strong> Nama, alamat email, nomor telepon.</li>
            <li><strong>Informasi Pengiriman:</strong> Alamat lengkap untuk pengiriman barang.</li>
            <li><strong>Informasi Identitas (KYC):</strong> Foto KTP dan foto selfie memegang KTP untuk keperluan keamanan penyewaan.</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "40px", marginBottom: "16px" }}>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p style={{ marginBottom: "16px" }}>
            (1) Pinjemdong menggunakan informasi yang dikumpulkan untuk tujuan berikut:
          </p>
          <ul style={{ paddingLeft: "24px", marginBottom: "24px" }}>
            <li>Memproses pesanan penyewaan Anda dan memastikan barang sampai dengan aman.</li>
            <li>Memverifikasi identitas pengguna untuk meminimalisir risiko penipuan atau pencurian barang.</li>
            <li>Mengirimkan email berkala terkait status pesanan, notifikasi denda keterlambatan, atau pembaruan kata sandi.</li>
            <li>Meningkatkan layanan pelanggan dan merespons permintaan Anda lebih efisien melalui Live Chat.</li>
          </ul>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "40px", marginBottom: "16px" }}>3. Perlindungan Data Anda</h2>
          <p style={{ marginBottom: "24px" }}>
            (1) Sesuai amanat <strong>Pasal 16 ayat (1) UU PDP</strong>, Kami menerapkan praktik pengumpulan, penyimpanan, dan pemrosesan data yang tepat serta tindakan keamanan tingkat tinggi untuk melindungi dari akses yang tidak sah, perubahan, pengungkapan, atau penghancuran informasi pribadi, nama pengguna, kata sandi, informasi transaksi, dan data KYC (terutama foto KTP) yang disimpan di Sistem kami.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "40px", marginBottom: "16px" }}>4. Berbagi Informasi Pribadi Anda</h2>
          <p style={{ marginBottom: "24px" }}>
            (1) Berdasarkan <strong>Pasal 39 UU PDP</strong>, Kami <strong>tidak akan menjual, memperdagangkan, atau menyewakan</strong> informasi identifikasi pribadi Pengguna kepada pihak ketiga mana pun tanpa persetujuan eksplisit dari Pengguna.
          </p>
          <p style={{ marginBottom: "24px" }}>
            (2) Pengecualian terhadap ayat (1), PinjemDong berhak dan berkewajiban memberikan informasi identitas pribadi (termasuk KTP) kepada pihak Penegak Hukum (Kepolisian RI, Kejaksaan, atau Pengadilan) secara sah apabila terdapat indikasi tindak pidana penipuan, pencurian, atau penggelapan aset perusahaan sesuai dengan prosedur hukum yang berlaku di Republik Indonesia.
          </p>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginTop: "40px", marginBottom: "16px" }}>5. Persetujuan Anda</h2>
          <p style={{ marginBottom: "24px" }}>
            (1) Dengan menggunakan Situs dan Layanan kami, Anda dengan ini menyatakan setuju dan tunduk pada seluruh ketentuan Kebijakan Privasi ini secara sadar dan tanpa paksaan.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "40px 0 24px" }} />
          
          <p style={{ fontSize: "0.95rem" }}>
            Jika Anda memiliki pertanyaan tambahan atau memerlukan informasi lebih lanjut tentang Kebijakan Privasi kami, jangan ragu untuk menghubungi kami melalui fitur Live Chat atau email ke <strong>privacy@pinjemdong.com</strong>.
          </p>

        </div>
      </div>
    </div>
  );
}
