import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M5 19c9 0 14-5 14-14-9 0-14 5-14 14z" />
      <path d="M5 19c3-6 6-9 12-12" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" strokeLinejoin="round" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="2" y="7" width="12" height="9" rx="1" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

const TRUST_ITEMS = [
  { icon: LeafIcon, label: "Premium\nFabrics" },
  { icon: SparkleIcon, label: "Timeless\nDesigns" },
  { icon: TruckIcon, label: "Fast & Safe\nDelivery" },
];

export default function Home() {
  const [banner, setBanner] = useState("");
  const [maxDiscount, setMaxDiscount] = useState(0);

  useEffect(() => {
    api.get("/config").then(({ data }) => setBanner(data.banner || ""));
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => {
      const highest = data.products.reduce((max, p) => Math.max(max, p.discountPercent || 0), 0);
      setMaxDiscount(highest);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-14 pb-24 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
      {/* Left column */}
      <div>
        <p className="text-xs tracking-[0.15em] text-neutral-500 mb-5 uppercase">
          Timeless Style <span className="mx-2">/</span> Everyday You
        </p>
        <h1
          className="text-6xl leading-[1.05] mb-6"
          style={{ color: "var(--color-ink)", fontWeight: 500 }}
        >
          Classic Looks
          <br />
          for a Modern
          <br />
          You
        </h1>
        <p className="text-neutral-600 max-w-xs mb-8 text-base">
          Heritage-inspired apparel for everyday moments.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm text-white font-medium"
          style={{ backgroundColor: "var(--color-clay)" }}
        >
          Shop Collection
          <span aria-hidden>→</span>
        </Link>

        <div className="flex items-center gap-6 mt-16">
          {TRUST_ITEMS.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="flex flex-col items-center text-center gap-2" style={{ color: "var(--color-ink)" }}>
                <Icon />
                <p className="text-xs text-neutral-600 whitespace-pre-line leading-tight">{label}</p>
              </div>
              {i < TRUST_ITEMS.length - 1 && <div className="w-px h-10 bg-[var(--color-line)]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Right column — image collage */}
      <div className="relative">
        <div className="relative aspect-[4/5] rounded-sm overflow-hidden border border-[var(--color-line)]">
          <img
            src={banner || "https://images.openai.com/static-rsc-4/9qGPKud_u1GdNSs6s9E0fPIrRoaKwiJouw3NmDKW3Eu96b1WGKfaeB8n97s3zCoLjnMsseuG3pMcol9VRGUPYxBMNa89ca7GC7OhwDUgAMBEPvGrYyNeyzrH6TEA4407KS5-oViiySW0uS_2epTHPFBasnn15egVU4rM0QKuL4x7UC7p5vKu0WCLvfp523OS?purpose=fullsize"}
            alt="Featured look"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Polaroid overlay */}
        <div className="absolute top-[26%] -left-10 hidden sm:block bg-white p-2 pb-6 shadow-md rotate-[-6deg] border border-[var(--color-line)]">
          <img
            src="https://images.openai.com/static-rsc-4/pq1_7GTsc8Pc8nb4UBQMwvppsA2vR2lXhVxt5adSDQujsb4Tbz1PqRIkPF-wrdAGZk_09a9HEcFBH8134Ds6YxGSn6pPF15WP-p3-gKZuWDTgYQO1QwxfkJtRfiXbYVkLcgyzZtFS1rKwx68Q_s5gm7Hwq4jMx8K-9hd7aVXxCNKe-HiHvRFo64zWpCfeY7P?purpose=fullsize"
            alt="Detail shot"
            className="w-40 h-44 object-cover"
          />
        </div>

        {/* Script caption */}
        <div
          className="absolute top-6 right-6 text-right hidden sm:block"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            color: "#f7f6f1",
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          <p className="text-lg leading-snug">
            Better
            <br />
            Basics
            <br />
            Bigger
            <br />
            Stories
          </p>
          <div className="w-10 h-px bg-[#f2f1e9] ml-auto mt-1" />
        </div>

        {/* Discount badge */}
        {maxDiscount > 0 && (
          <div
            className="absolute -right-6 top-[55%] w-24 h-24 rounded-full flex flex-col items-center justify-center text-white text-center shadow-md"
            style={{ backgroundColor: "var(--color-gold)" }}
          >
            <span className="text-[10px] tracking-wide">UP TO</span>
            <span className="text-xl font-semibold leading-none my-0.5">{maxDiscount}%</span>
            <span className="text-[10px] tracking-wide">OFF</span>
          </div>
        )}

        {/* New arrivals label */}
        <div className="flex items-center gap-3 mt-6">
          <p className="text-xs tracking-[0.15em] text-neutral-500 uppercase">New Arrivals</p>
          <div className="flex-1 h-px bg-[var(--color-line)]" />
        </div>
      </div>
    </div>
  );
}