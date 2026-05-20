import { useState, useRef, useEffect } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const NAVIGATION_SUGGESTIONS = {
  veteran: ["vetdash", "border", "detentionhub"],
  foia: ["foiamanager", "foiatrack"],
  research: ["scholar", "knowledgebase"],
  analysis: ["dcas", "analytics", "network"],
  export: ["caseexport", "forensicexp", "chcreport"],
  military: ["milnat", "militarydbs"],
  deported: ["vetdash", "border", "detentionhub"],
};

export default function NavigationChatbox({ onNavigate, visible }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your TE360 Navigator. What would you like to explore? Try asking about veterans, FOIA, research, analysis, or case exports." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful navigator for TruthEngine360, a forensic civic intelligence platform. The user asked: "${input}"

Identify what they're looking for (veteran data, FOIA tracking, research, analysis, exports, military naturalization, deported cases) and suggest 1-2 relevant tabs.

Categories:
- Veteran data: VET DATA, BORDER SEARCH, DETENTION HUB
- FOIA: FOIA MGR, FOIA TRACK
- Research: SCHOLAR DB, KNOWLEDGE BASE
- Analysis: DCAS, ANALYTICS, NETWORK
- Exports: CASE EXPORT, FORENSIC EXP, CHC REPORT
- Military: MIL NAT STATS, MIL RECORDS

Respond conversationally and suggest specific tabs to visit.`,
        model: "gpt_5_mini",
      });

      const assistantMsg = { role: "assistant", text: res };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg = { role: "assistant", text: "Sorry, I couldn't process that. Try asking about specific features like 'Show me veteran data' or 'Where's FOIA tracking?'" };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      width: 350,
      height: 450,
      background: P.card,
      border: `1px solid ${P.b}`,
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1000,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <div style={{ background: `linear-gradient(135deg,${P.teal},${P.blue})`, padding: "12px 16px", color: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 800 }}>🤖 TE360 Navigator</div>
        <div style={{ fontSize: 7, opacity: 0.9 }}>Ask me anything about the platform</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%",
              padding: "8px 12px",
              borderRadius: 8,
              background: msg.role === "user" ? P.teal : "#080D18",
              color: msg.role === "user" ? "#000" : P.t2,
              fontSize: 8,
              lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 8, color: P.t4, fontStyle: "italic" }}>⟳ Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${P.b}`, display: "flex", gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSend()}
          placeholder="Ask me..."
          style={{
            flex: 1,
            padding: "7px 10px",
            background: "#080D18",
            border: `1px solid ${P.b}`,
            borderRadius: 6,
            color: P.t1,
            fontSize: 7,
            outline: "none",
          }}
        />
        <button onClick={handleSend} disabled={loading}
          style={{
            padding: "7px 10px",
            background: P.teal,
            border: "none",
            borderRadius: 6,
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 7,
          }}>
          →
        </button>
      </div>
    </div>
  );
}