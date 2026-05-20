import { useState } from "react";

const GOLD  = "#F5C842";
const NAVY  = "#0B1A2E";
const STEEL = "#2A4A6B";
const WHITE = "#F0F4FF";
const MUTED = "#8BA8C8";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName]   = useState("");
  const [done, setDone]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setLoading(true);
    // Simulate submission
    setTimeout(() => { setLoading(false); setDone(true); }, 800);
  };

  return (
    <section style={{
      padding: "70px 48px",
      background: `linear-gradient(135deg, #070f1f, #0d1e38, #070f1f)`,
      borderTop: `1px solid ${GOLD}15`,
      borderBottom: `1px solid ${GOLD}15`,
    }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>

        <div style={{ fontSize: 28, marginBottom: 12 }}>📬</div>
        <div style={{ fontSize: 9, color: GOLD, letterSpacing: 4, fontWeight: 700, marginBottom: 10 }}>STAY INFORMED</div>
        <h2 style={{ fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, color: WHITE, marginBottom: 10, lineHeight: 1.2 }}>
          Subscribe to the <span style={{ color: GOLD }}>EXILE Patriot Newsletter</span>
        </h2>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.8, marginBottom: 32, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 300, maxWidth: 520, margin: "0 auto 32px" }}>
          Receive forensic updates, case developments, congressional briefings, and stories from deported veterans and their families — directly to your inbox.
        </p>

        {done ? (
          <div style={{
            padding: "32px 40px",
            background: `#0a2a1a`,
            border: `1.5px solid #4ADE8050`,
            borderRadius: 16,
            display: "inline-block",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#4ADE80", marginBottom: 8 }}>You're Subscribed!</div>
            <div style={{ fontSize: 11, color: MUTED, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              Thank you, <strong style={{ color: WHITE }}>{name}</strong>. Updates will arrive at <strong style={{ color: WHITE }}>{email}</strong>.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: `linear-gradient(160deg, ${STEEL}40, ${NAVY})`,
            border: `1.5px solid ${GOLD}30`,
            borderRadius: 16,
            padding: "36px 40px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { key: "name",  label: "Full Name",     type: "text",  placeholder: "Your full name", val: name,  set: setName },
                { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com", val: email, set: setEmail },
              ].map(f => (
                <div key={f.key} style={{ textAlign: "left" }}>
                  <label style={{ display: "block", fontSize: 8, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 5 }}>{f.label}</label>
                  <input
                    type={f.type} required
                    placeholder={f.placeholder}
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px",
                      background: `${NAVY}cc`, border: `1px solid ${GOLD}25`, borderRadius: 8,
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: WHITE, outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = `${GOLD}25`}
                  />
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px",
              background: `linear-gradient(135deg,${GOLD},#e8a800)`,
              border: "none", borderRadius: 10, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 800, fontSize: 13, color: "#000", cursor: loading ? "not-allowed" : "pointer",
              transition: "all .25s", opacity: loading ? 0.7 : 1,
              boxShadow: `0 4px 20px ${GOLD}30`,
            }}>
              {loading ? "Subscribing…" : "📬 Subscribe to Newsletter"}
            </button>

            <div style={{ marginTop: 14, fontSize: 8, color: `${MUTED}80`, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              🔒 No spam. Unsubscribe anytime. Your information stays private.
            </div>
          </form>
        )}

        {/* Topics preview */}
        <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {["📊 Forensic Reports", "⚖️ Legal Updates", "🏛️ CHC Briefings", "🎖️ Veteran Stories", "📋 FOIA Wins"].map(t => (
            <span key={t} style={{
              fontSize: 8, padding: "4px 12px",
              background: `${GOLD}10`, border: `1px solid ${GOLD}20`,
              borderRadius: 20, color: MUTED,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}