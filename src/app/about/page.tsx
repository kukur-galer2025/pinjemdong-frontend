import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingBottom: "80px" }}>
      {/* Hero Section */}
      <div style={{ 
        position: "relative",
        textAlign: "center", 
        padding: "120px 24px 80px",
        background: "var(--foreground)",
        color: "var(--background)",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
        
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <span style={{ 
            background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.3)",
            padding: "6px 20px", borderRadius: "20px", fontWeight: 800, fontSize: "0.85rem", letterSpacing: "1px",
            display: "inline-block", marginBottom: "24px"
          }}>
            TENTANG KAMI
          </span>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "24px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Lebih dari Sekadar <br />
            <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Menyewa Barang
            </span>
          </h1>
          <p style={{ fontSize: "1.15rem", opacity: 0.8, lineHeight: "1.7", fontWeight: 400 }}>
            PinjemLur hadir untuk memberikan akses tanpa batas ke berbagai perlengkapan impian Anda, tanpa beban kepemilikan. Kami memicu petualangan dan momen berharga Anda.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "-40px auto 0", position: "relative", zIndex: 10, padding: "0 24px" }}>
        {/* Stats Row */}
        <div className="card" style={{ 
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", 
          padding: "40px", borderRadius: "var(--radius-xl)", background: "var(--background-elevated)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)", marginBottom: "80px", textAlign: "center"
        }}>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", marginBottom: "8px" }}>10K+</div>
            <div style={{ color: "var(--foreground-secondary)", fontWeight: 600, fontSize: "0.95rem" }}>Barang Tersedia</div>
          </div>
          <div style={{ width: "1px", background: "var(--border)", margin: "0 auto", display: "none" }} className="divider-desktop"></div>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", marginBottom: "8px" }}>50K+</div>
            <div style={{ color: "var(--foreground-secondary)", fontWeight: 600, fontSize: "0.95rem" }}>Pelanggan Puas</div>
          </div>
          <div style={{ width: "1px", background: "var(--border)", margin: "0 auto", display: "none" }} className="divider-desktop"></div>
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", marginBottom: "8px" }}>99%</div>
            <div style={{ color: "var(--foreground-secondary)", fontWeight: 600, fontSize: "0.95rem" }}>Kualitas Terjamin</div>
          </div>
        </div>

        {/* Misi Kami */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", marginBottom: "100px" }} className="responsive-grid-2">
          <div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.02em" }}>Misi Kami</h2>
            <p style={{ color: "var(--foreground-secondary)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "20px" }}>
              Kami percaya bahwa pengalaman berharga tidak harus diukur dari seberapa banyak barang yang Anda miliki, melainkan dari seberapa sering Anda menggunakannya untuk menciptakan momen.
            </p>
            <p style={{ color: "var(--foreground-secondary)", fontSize: "1.1rem", lineHeight: 1.8 }}>
              Pinjemdong bertujuan mengurangi konsumerisme berlebihan sekaligus mendukung gaya hidup berkelanjutan dengan cara memaksimalkan fungsi barang melalu ekonomi berbagi (<em>sharing economy</em>).
            </p>
          </div>
          <div style={{ position: "relative", height: "400px", borderRadius: "var(--radius-xl)", overflow: "hidden", background: "var(--background-secondary)" }}>
            {/* Menggunakan image placeholder atau ilustrasi sederhana */}
            <div style={{ position: "absolute", inset: 0, background: "var(--primary-gradient)", opacity: 0.1 }}></div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
          </div>
        </div>

        {/* Keunggulan */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px", letterSpacing: "-0.02em" }}>Mengapa Memilih Kami?</h2>
          <p style={{ color: "var(--foreground-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>Berbagai alasan mengapa ribuan orang mempercayakan kebutuhan perlengkapan mereka kepada PinjemLur.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "80px" }}>
          {[
            { icon: "🛡️", title: "Terpercaya & Aman", desc: "Setiap barang telah melewati proses Quality Control ketat sebelum dan sesudah disewa." },
            { icon: "💸", title: "Harga Transparan", desc: "Tidak ada biaya tersembunyi. Denda keterlambatan pun dihitung proporsional per 24 jam." },
            { icon: "🚚", title: "Pengiriman Fleksibel", desc: "Ambil sendiri di toko atau gunakan layanan kurir instan kami untuk kenyamanan Anda." }
          ].map((item, idx) => (
            <div key={idx} className="card" style={{ padding: "40px 32px", borderRadius: "var(--radius-lg)", background: "var(--background-elevated)", textAlign: "center", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "20px" }}>{item.icon}</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "12px" }}>{item.title}</h3>
              <p style={{ color: "var(--foreground-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
