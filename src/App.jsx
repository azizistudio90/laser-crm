import { useState, useEffect, useRef } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9).toUpperCase();
const now = () => Date.now();
const fmt = (ts) => new Date(ts).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const fmtDate = (ts) => new Date(ts).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
const msLeft = (expiry) => Math.max(0, expiry - now());
const fmtCountdown = (ms) => {
  if (ms <= 0) return "TAMAT";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndIp = () => `${rnd([103,175,60,211])}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

// ── static data ───────────────────────────────────────────────────────────────
const DEVICES = ["iPhone 15", "Samsung S24", "MacBook Pro", "Windows PC", "iPad Air", "Redmi Note 13"];
const LOCATIONS = ["Kuala Lumpur", "Johor Bahru", "Penang", "Seremban", "Kota Kinabalu", "Kuching", "Ipoh"];
const TEMPLATE_NAMES = [
  "Bouquet Perkahwinan Set","Hiasan Raya Deluxe Pack","Name Tag Korporat",
  "Kotak Hadiah Minimalis","Frame Foto 4R","Kad Kahwin Floral",
  "Bookmark Quran Set","Bunting Aqiqah Bundle",
];

const mockCustomers = [
  { id: 1, name: "Amirah Zahra",   email: "amirah@gmail.com",  phone: "011-2345678", orders: 5, spent: 185, joined: "2024-01-15", status: "VIP" },
  { id: 2, name: "Haziq Firdaus",  email: "haziq@gmail.com",   phone: "012-3456789", orders: 2, spent: 60,  joined: "2024-03-02", status: "Aktif" },
  { id: 3, name: "Nurul Hana",     email: "nurul@gmail.com",   phone: "013-4567890", orders: 8, spent: 320, joined: "2023-11-20", status: "VIP" },
  { id: 4, name: "Syafiq Danial",  email: "syafiq@gmail.com",  phone: "019-5678901", orders: 1, spent: 25,  joined: "2024-05-10", status: "Baru" },
  { id: 5, name: "Farah Liyana",   email: "farah@gmail.com",   phone: "017-6789012", orders: 3, spent: 95,  joined: "2024-02-28", status: "Aktif" },
  { id: 6, name: "Izzatul Iman",   email: "izzatul@gmail.com", phone: "016-7890123", orders: 6, spent: 210, joined: "2023-12-05", status: "VIP" },
];

const mockOrders = [
  { id: "#L001", customer: "Amirah Zahra",  template: "Bouquet Perkahwinan Set",   price: 45, date: "2024-06-10", status: "Selesai" },
  { id: "#L002", customer: "Nurul Hana",    template: "Hiasan Raya Deluxe Pack",   price: 65, date: "2024-06-09", status: "Selesai" },
  { id: "#L003", customer: "Haziq Firdaus", template: "Name Tag Korporat",         price: 30, date: "2024-06-08", status: "Pending" },
  { id: "#L004", customer: "Farah Liyana",  template: "Kotak Hadiah Minimalis",    price: 35, date: "2024-06-07", status: "Selesai" },
  { id: "#L005", customer: "Syafiq Danial", template: "Frame Foto 4R",             price: 25, date: "2024-06-06", status: "Selesai" },
  { id: "#L006", customer: "Izzatul Iman",  template: "Bunting Aqiqah Bundle",     price: 55, date: "2024-06-05", status: "Refund" },
];

const mockTemplates = [
  { id: 1, name: "Bouquet Perkahwinan Set",  category: "Perkahwinan", price: 45, sold: 124, rating: 4.9, status: "Aktif" },
  { id: 2, name: "Hiasan Raya Deluxe Pack",  category: "Perayaan",    price: 65, sold: 89,  rating: 4.8, status: "Aktif" },
  { id: 3, name: "Name Tag Korporat",        category: "Korporat",    price: 30, sold: 67,  rating: 4.7, status: "Aktif" },
  { id: 4, name: "Kotak Hadiah Minimalis",   category: "Hadiah",      price: 35, sold: 201, rating: 4.9, status: "Aktif" },
  { id: 5, name: "Frame Foto 4R",            category: "Umum",        price: 25, sold: 312, rating: 4.6, status: "Aktif" },
  { id: 6, name: "Bunting Aqiqah Bundle",    category: "Perayaan",    price: 55, sold: 45,  rating: 4.5, status: "Draf" },
  { id: 7, name: "Kad Kahwin Floral",        category: "Perkahwinan", price: 40, sold: 178, rating: 5.0, status: "Aktif" },
  { id: 8, name: "Bookmark Quran Set",       category: "Agama",       price: 20, sold: 95,  rating: 4.8, status: "Aktif" },
];

// seed download links
const seedLinks = () => mockCustomers.slice(0, 4).map((c, i) => ({
  id: uid(),
  customer: c.name,
  email: c.email,
  template: TEMPLATE_NAMES[i],
  created: now() - (i + 1) * 3600000,
  expiry: now() + (23 - i * 4) * 3600000,
  downloaded: i < 2,
  downloadedAt: i < 2 ? now() - i * 1800000 : null,
  device: i < 2 ? rnd(DEVICES) : null,
  location: i < 2 ? rnd(LOCATIONS) : null,
  ip: i < 2 ? rndIp() : null,
}));

const seedLogs = (links) => links
  .filter(l => l.downloaded)
  .map(l => ({ id: uid(), customer: l.customer, template: l.template, ts: l.downloadedAt, device: l.device, location: l.location, ip: l.ip }));

const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "▦" },
  { id: "pesanan",    label: "Pesanan",     icon: "◫" },
  { id: "pelanggan",  label: "Pelanggan",   icon: "◉" },
  { id: "template",   label: "Template",    icon: "◈" },
  { id: "tracking",   label: "Tracking",    icon: "◎" },
];

// ── colour tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:     "#0a0a0f",
  panel:  "rgba(255,255,255,0.025)",
  border: "rgba(255,255,255,0.07)",
  accent: "#ff6b35",
  accentGlow: "rgba(255,107,53,0.3)",
  cyan:   "#4ecdc4",
  amber:  "#ffd93d",
  red:    "#ff4d4d",
  text:   "#e8e0d0",
  muted:  "#5a5070",
  font:   "'DM Mono','Courier New',monospace",
  // tracking green palette
  tBg:        "#030a06",
  tPanel:     "rgba(0,255,80,0.03)",
  tBorder:    "rgba(0,255,80,0.12)",
  tBorderHi:  "rgba(0,255,80,0.35)",
  tGreen:     "#00ff50",
  tGreenDim:  "#00a832",
  tGreenFaint:"#004d18",
  tText:      "#b0ffcc",
  tMuted:     "#2a6640",
};

// ── shared sub-components ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = {
    Selesai: { bg: "rgba(78,205,196,0.1)",  border: "rgba(78,205,196,0.2)",  color: T.cyan  },
    Pending: { bg: "rgba(255,217,61,0.1)",  border: "rgba(255,217,61,0.2)",  color: T.amber },
    Refund:  { bg: "rgba(255,107,53,0.1)",  border: "rgba(255,107,53,0.2)",  color: T.accent },
    VIP:     { bg: "rgba(255,107,53,0.15)", border: "rgba(255,107,53,0.2)",  color: T.accent },
    Aktif:   { bg: "rgba(78,205,196,0.1)",  border: "rgba(78,205,196,0.2)",  color: T.cyan  },
    Baru:    { bg: "rgba(255,255,255,0.05)",border: "rgba(255,255,255,0.08)",color: T.muted },
    Draf:    { bg: "rgba(255,255,255,0.05)",border: "rgba(255,255,255,0.08)",color: T.muted },
  };
  const s = cfg[status] || cfg.Baru;
  return (
    <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, letterSpacing: 0.5, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {status}
    </span>
  );
};

const Input = ({ value, onChange, placeholder, style = {} }) => (
  <input
    value={value} onChange={onChange} placeholder={placeholder}
    style={{
      background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8,
      padding: "8px 14px", color: T.text, fontSize: 12, outline: "none",
      fontFamily: T.font, ...style,
    }}
    onFocus={e => e.target.style.borderColor = T.accent}
    onBlur={e => e.target.style.borderColor = T.border}
  />
);

// ── page: Dashboard ───────────────────────────────────────────────────────────
const PageDashboard = ({ dlLogs }) => {
  const totalRevenue = mockOrders.filter(o => o.status === "Selesai").reduce((s, o) => s + o.price, 0);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Jumlah Hasil",  value: `RM ${totalRevenue}`, sub: "Transaksi selesai", color: T.accent },
          { label: "Pesanan",       value: mockOrders.length,   sub: `${mockOrders.filter(o=>o.status==="Selesai").length} selesai`, color: T.cyan },
          { label: "Pelanggan",     value: mockCustomers.length,sub: `${mockCustomers.filter(c=>c.status==="VIP").length} VIP`, color: "#a8e6cf" },
          { label: "Download Hari Ini", value: dlLogs.filter(l => now()-l.ts < 86400000).length, sub: "24 jam lepas", color: T.amber },
        ].map(s => (
          <div key={s.label} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.5, marginBottom: 6 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: T.muted }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: T.muted, marginBottom: 16 }}>PESANAN TERKINI</div>
          {mockOrders.slice(0, 5).map(o => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontSize: 12, color: T.text }}>{o.customer}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{o.template}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>RM{o.price}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, color: T.muted, marginBottom: 16 }}>DOWNLOAD TERKINI</div>
          {dlLogs.length === 0 && <div style={{ fontSize: 11, color: T.muted, textAlign: "center", padding: 20 }}>Tiada aktiviti</div>}
          {dlLogs.slice(0, 6).map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff50", boxShadow: "0 0 6px #00ff50", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: T.text }}>{l.customer}</div>
                <div style={{ fontSize: 9, color: T.muted }}>{l.template.slice(0,24)}…</div>
              </div>
              <div style={{ fontSize: 9, color: T.muted }}>{fmt(l.ts)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── page: Pesanan ─────────────────────────────────────────────────────────────
const PagePesanan = () => {
  const [search, setSearch] = useState("");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pesanan..." style={{ flex: 1 }} />
        {["Semua","Selesai","Pending","Refund"].map(f => (
          <button key={f} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 11, background: T.panel, border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer" }}>{f}</button>
        ))}
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["ID","Pelanggan","Template","Harga","Tarikh","Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, letterSpacing: 1.5, color: T.muted }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockOrders.filter(o => !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.template.toLowerCase().includes(search.toLowerCase())).map(o => (
              <tr key={o.id}
                style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,53,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px", fontSize: 11, color: T.accent }}>{o.id}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: T.text }}>{o.customer}</td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: "#9a90b0" }}>{o.template}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: T.accent, fontWeight: 600 }}>RM{o.price}</td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: T.muted }}>{o.date}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── page: Pelanggan ───────────────────────────────────────────────────────────
const PagePelanggan = () => {
  const [search, setSearch] = useState("");
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pelanggan..." style={{ width: "100%", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {mockCustomers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
          <div key={c.id} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,107,53,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #ff6b35, #f7931e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{c.name[0]}</div>
              <div>
                <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{c.name}</div>
                <StatusBadge status={c.status} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>{c.email}</div>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>{c.phone}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>{c.orders}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>PESANAN</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 8, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: T.cyan, fontWeight: 700 }}>RM{c.spent}</div>
                <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>JUMLAH</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── page: Template ────────────────────────────────────────────────────────────
const PageTemplate = () => {
  const [search, setSearch] = useState("");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari template..." style={{ width: 280 }} />
        <button style={{ padding: "8px 18px", borderRadius: 8, fontSize: 11, background: "linear-gradient(135deg,#ff6b35,#f7931e)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, letterSpacing: 1, boxShadow: "0 0 16px rgba(255,107,53,0.3)" }}>
          + TEMPLATE BARU
        </button>
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Nama Template","Kategori","Harga","Terjual","Rating","Status","Tindakan"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, letterSpacing: 1.5, color: T.muted }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockTemplates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,53,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
                    <span style={{ fontSize: 12, color: T.text }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.muted }}>{t.category}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: T.accent, fontWeight: 600 }}>RM{t.price}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#9a90b0" }}>{t.sold} unit</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: T.amber }}>★ {t.rating}</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={t.status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, background: T.panel, border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer" }}>EDIT</button>
                    <button style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)", color: T.accent, cursor: "pointer" }}>PADAM</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── page: Tracking (green terminal) ──────────────────────────────────────────
const PageTracking = ({ links, setLinks, logs, setLogs, showToast }) => {
  const [subTab, setSubTab] = useState("live");
  const [form, setForm] = useState({ customer: "", email: "", template: TEMPLATE_NAMES[0] });
  const [tick, setTick] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // auto-simulate a random download every ~15s
  useEffect(() => {
    const simulate = () => {
      const pending = links.filter(l => !l.downloaded && msLeft(l.expiry) > 0);
      if (!pending.length) return;
      const link = rnd(pending);
      const extra = { downloaded: true, downloadedAt: now(), device: rnd(DEVICES), location: rnd(LOCATIONS), ip: rndIp() };
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, ...extra } : l));
      setLogs(prev => [{ id: uid(), customer: link.customer, template: link.template, ts: now(), device: extra.device, location: extra.location, ip: extra.ip }, ...prev]);
      showToast(`📥 ${link.customer} download ${link.template.slice(0,22)}…`);
    };
    const t = setTimeout(simulate, 12000 + Math.random() * 8000);
    return () => clearTimeout(t);
  }, [links, tick]);

  const generateLink = () => {
    if (!form.customer || !form.email) return showToast("⚠️ Isi nama & email");
    const link = { id: uid(), customer: form.customer, email: form.email, template: form.template, created: now(), expiry: now() + 24*3600000, downloaded: false, downloadedAt: null, device: null, location: null, ip: null };
    setLinks(prev => [link, ...prev]);
    setForm({ customer: "", email: "", template: TEMPLATE_NAMES[0] });
    showToast(`✅ Link dijana untuk ${link.customer}`);
    setSubTab("links");
  };

  const tDone    = links.filter(l => l.downloaded).length;
  const tPending = links.filter(l => !l.downloaded && msLeft(l.expiry) > 0).length;
  const tExpired = links.filter(l => !l.downloaded && msLeft(l.expiry) <= 0).length;

  const G = T; // alias for green tokens inside T

  return (
    <div style={{ background: T.tBg, borderRadius: 12, border: `1px solid ${T.tBorder}`, padding: 24, position: "relative", overflow: "hidden" }}>
      {/* scanlines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)", borderRadius: 12 }} />
      {/* glow */}
      <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 120, background: "radial-gradient(ellipse, rgba(0,255,80,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative" }}>
        {/* tracking header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${T.tBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.tGreen, boxShadow: `0 0 8px ${T.tGreen}` }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: T.tGreen, letterSpacing: 2, textShadow: `0 0 12px rgba(0,255,80,0.4)`, fontFamily: T.font }}>DOWNLOAD TRACKER</span>
            <span style={{ fontSize: 9, color: T.tMuted, letterSpacing: 2, fontFamily: T.font }}>MONITOR REAL-TIME</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ l:"SELESAI", v:tDone, c:"#00e5ff" },{ l:"MENUNGGU", v:tPending, c:T.amber },{ l:"EXPIRED", v:tExpired, c:T.red }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.c, fontFamily: T.font }}>{s.v}</div>
                <div style={{ fontSize: 8, color: T.tMuted, letterSpacing: 1, fontFamily: T.font }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sub-tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {[{ id:"live", label:"▶ LIVE FEED" },{ id:"links", label:"⬡ LINK AKTIF" },{ id:"generate", label:"+ JANA LINK" }].map(t => (
            <button key={t.id} onClick={() => setSubTab(t.id)} style={{
              padding: "6px 14px", fontSize: 9, letterSpacing: 1.5, fontFamily: T.font,
              background: subTab === t.id ? T.tGreenFaint : "transparent",
              border: `1px solid ${subTab === t.id ? T.tBorderHi : T.tBorder}`,
              borderRadius: 4, color: subTab === t.id ? T.tGreen : T.tMuted, cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>

        {/* LIVE FEED */}
        {subTab === "live" && (
          <div ref={logRef} style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 380, overflowY: "auto" }}>
            {logs.length === 0 && <div style={{ textAlign: "center", color: T.tMuted, fontSize: 12, padding: 40, fontFamily: T.font }}>Tiada aktiviti. Jana link dan tunggu customer.</div>}
            {logs.map((l, i) => (
              <div key={l.id} style={{
                background: i === 0 ? "rgba(0,255,80,0.06)" : T.tPanel,
                border: `1px solid ${i === 0 ? T.tBorderHi : T.tBorder}`,
                borderRadius: 6, padding: "10px 14px",
                display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px 80px",
                alignItems: "center", gap: 10,
              }}>
                <div style={{ fontFamily: T.font }}>
                  <div style={{ fontSize: 10, color: T.tGreen }}>{fmt(l.ts)}</div>
                  <div style={{ fontSize: 8, color: T.tMuted }}>{fmtDate(l.ts)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: T.tText, fontFamily: T.font }}>{l.customer}</div>
                  <div style={{ fontSize: 9, color: T.tMuted, fontFamily: T.font }}>{l.template.slice(0,26)}</div>
                </div>
                <div style={{ fontFamily: T.font }}>
                  <div style={{ fontSize: 10, color: T.tMuted }}>📱 {l.device}</div>
                  <div style={{ fontSize: 10, color: T.tMuted }}>📍 {l.location}</div>
                </div>
                <div style={{ fontSize: 9, color: T.tMuted, fontFamily: T.font }}>{l.ip}</div>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "rgba(0,255,80,0.1)", border: `1px solid rgba(0,255,80,0.25)`, color: T.tGreen, fontFamily: T.font, letterSpacing: 1 }}>✓ DOWNLOAD</span>
              </div>
            ))}
          </div>
        )}

        {/* LINK AKTIF */}
        {subTab === "links" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 380, overflowY: "auto" }}>
            {links.length === 0 && <div style={{ textAlign: "center", color: T.tMuted, fontSize: 12, padding: 40, fontFamily: T.font }}>Tiada link. Jana link baru.</div>}
            {links.map(l => {
              const expired = msLeft(l.expiry) <= 0;
              const ms = msLeft(l.expiry);
              const pct = Math.min(100, (ms / (24 * 3600000)) * 100);
              const sc = l.downloaded ? "#00e5ff" : expired ? T.red : T.amber;
              const sl = l.downloaded ? "SELESAI" : expired ? "EXPIRED" : "MENUNGGU";
              return (
                <div key={l.id} style={{ background: T.tPanel, border: `1px solid ${l.downloaded ? "rgba(0,229,255,0.12)" : expired ? "rgba(255,77,77,0.12)" : T.tBorder}`, borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: !l.downloaded ? 8 : 6 }}>
                    <div>
                      <span style={{ fontSize: 12, color: T.tText, fontFamily: T.font, fontWeight: 600 }}>{l.customer}</span>
                      <span style={{ fontSize: 10, color: T.tMuted, fontFamily: T.font, marginLeft: 10 }}>{l.template.slice(0,28)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: `${sc}18`, border: `1px solid ${sc}40`, color: sc, fontFamily: T.font, letterSpacing: 1 }}>{sl}</span>
                      <button onClick={() => setLinks(prev => prev.filter(x => x.id !== l.id))} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 4, background: "rgba(255,77,77,0.06)", border: "1px solid rgba(255,77,77,0.2)", color: T.red, cursor: "pointer", fontFamily: T.font }}>✕</button>
                    </div>
                  </div>
                  {!l.downloaded && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 8, color: T.tMuted, fontFamily: T.font, letterSpacing: 1 }}>MASA BAKI</span>
                        <span style={{ fontSize: 9, color: expired ? T.red : T.amber, fontFamily: T.font }}>{fmtCountdown(ms)}</span>
                      </div>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct > 50 ? T.tGreenDim : pct > 20 ? T.amber : T.red, borderRadius: 2, transition: "width 1s linear" }} />
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 9, color: T.tMuted, fontFamily: T.font }}>
                    {l.downloaded ? `📥 ${fmtDate(l.downloadedAt)} ${fmt(l.downloadedAt)} · 📱 ${l.device} · 📍 ${l.location}` : `Jana: ${fmtDate(l.created)} · lasercraft.vercel.app/dl/${l.id}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* JANA LINK */}
        {subTab === "generate" && (
          <div style={{ maxWidth: 400 }}>
            {[{ label:"NAMA PELANGGAN", key:"customer", placeholder:"cth: Amirah Zahra" },{ label:"EMAIL", key:"email", placeholder:"cth: amirah@gmail.com" }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 8, color: T.tMuted, letterSpacing: 2, display: "block", marginBottom: 5, fontFamily: T.font }}>{f.label}</label>
                <input
                  value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: T.tPanel, border: `1px solid ${T.tBorder}`, borderRadius: 6, padding: "9px 12px", color: T.tText, fontSize: 12, outline: "none", fontFamily: T.font, boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = T.tBorderHi}
                  onBlur={e => e.target.style.borderColor = T.tBorder}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 8, color: T.tMuted, letterSpacing: 2, display: "block", marginBottom: 5, fontFamily: T.font }}>TEMPLATE</label>
              <select value={form.template} onChange={e => setForm(p => ({ ...p, template: e.target.value }))}
                style={{ width: "100%", background: "#0a1f10", border: `1px solid ${T.tBorder}`, borderRadius: 6, padding: "9px 12px", color: T.tText, fontSize: 12, outline: "none", fontFamily: T.font, cursor: "pointer" }}>
                {TEMPLATE_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={generateLink} style={{
              width: "100%", padding: 11, fontSize: 11, background: "transparent",
              border: `1px solid ${T.tBorderHi}`, borderRadius: 6, color: T.tGreen,
              cursor: "pointer", fontFamily: T.font, letterSpacing: 2,
              textShadow: `0 0 6px ${T.tGreen}`,
            }}
              onMouseEnter={e => { e.target.style.background = T.tGreenFaint; e.target.style.boxShadow = "0 0 12px rgba(0,255,80,0.15)"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.boxShadow = "none"; }}>
              ⬡ JANA LINK SEKARANG (EXPIRE 24 JAM)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function LaserCRM() {
  const [active, setActive]     = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast]       = useState(null);
  const [dlLinks, setDlLinks]   = useState(() => seedLinks());
  const [dlLogs,  setDlLogs]    = useState(() => seedLogs(seedLinks()));
  const [notifCount, setNotifCount] = useState(0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // badge on tracking tab when new download
  const prevLogsLen = useRef(dlLogs.length);
  useEffect(() => {
    if (dlLogs.length > prevLogsLen.current && active !== "tracking") {
      setNotifCount(p => p + (dlLogs.length - prevLogsLen.current));
    }
    prevLogsLen.current = dlLogs.length;
  }, [dlLogs.length]);

  const handleTabClick = (id) => {
    setActive(id);
    if (id === "tracking") setNotifCount(0);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, color: T.text, fontFamily: T.font }}>

      {/* toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 999,
          background: "#0f0e1a", border: `1px solid rgba(255,107,53,0.4)`,
          borderRadius: 8, padding: "10px 16px", fontSize: 12, color: T.text,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}

      {/* sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64,
        background: "linear-gradient(180deg,#0f0e1a,#0a0a12)",
        borderRight: "1px solid #2a2040",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{ padding: "24px 16px 20px", borderBottom: "1px solid #1e1a2e", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#ff6b35,#f7931e)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 0 12px rgba(255,107,53,0.4)" }}>⬡</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.accent }}>LASERCRAFT</div>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2 }}>TEMPLATE STUDIO</div>
            </div>
          )}
        </div>

        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => handleTabClick(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginBottom: 2,
              background: active === n.id ? "rgba(255,107,53,0.12)" : "transparent",
              border: active === n.id ? "1px solid rgba(255,107,53,0.25)" : "1px solid transparent",
              borderRadius: 8, color: active === n.id ? T.accent : T.muted,
              cursor: "pointer", fontSize: 12, letterSpacing: 0.5,
              textAlign: "left", transition: "all 0.15s", whiteSpace: "nowrap", overflow: "hidden",
              position: "relative",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ flex: 1 }}>{n.label}</span>}
              {/* notification badge on tracking */}
              {n.id === "tracking" && notifCount > 0 && (
                <span style={{
                  position: sidebarOpen ? "static" : "absolute",
                  top: sidebarOpen ? undefined : 6, right: sidebarOpen ? undefined : 6,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: "#00ff50", color: "#000", fontSize: 9, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 4px", flexShrink: 0,
                }}>{notifCount}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(p => !p)} style={{
          margin: "12px 8px", padding: "8px 12px",
          background: "rgba(255,255,255,0.04)", border: "1px solid #1e1a2e",
          borderRadius: 6, color: T.muted, cursor: "pointer", fontSize: 11,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{sidebarOpen ? "◀" : "▶"}</button>
      </aside>

      {/* main */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>
        {/* topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: T.text, margin: 0 }}>
              {{ dashboard:"Dashboard", pesanan:"Pesanan", pelanggan:"Pelanggan", template:"Template", tracking:"Download Tracker" }[active]}
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: T.muted, letterSpacing: 1 }}>
              {new Date().toLocaleDateString("ms-MY",{ weekday:"long", year:"numeric", month:"long", day:"numeric" }).toUpperCase()}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {dlLinks.filter(l => !l.downloaded && msLeft(l.expiry) > 0).length > 0 && (
              <div style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: 20, padding: "5px 12px", fontSize: 10, color: T.amber }}>
                ⏳ {dlLinks.filter(l => !l.downloaded && msLeft(l.expiry) > 0).length} pending
              </div>
            )}
            <div style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", borderRadius: 20, padding: "6px 14px", fontSize: 11, color: T.accent }}>● LIVE</div>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ff6b35,#f7931e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 10px rgba(255,107,53,0.3)" }}>A</div>
          </div>
        </div>

        {active === "dashboard" && <PageDashboard dlLogs={dlLogs} />}
        {active === "pesanan"   && <PagePesanan />}
        {active === "pelanggan" && <PagePelanggan />}
        {active === "template"  && <PageTemplate />}
        {active === "tracking"  && <PageTracking links={dlLinks} setLinks={setDlLinks} logs={dlLogs} setLogs={setDlLogs} showToast={showToast} />}
      </main>
    </div>
  );
}