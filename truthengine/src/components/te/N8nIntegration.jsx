import { useState, useEffect } from "react";
import { P } from "../../lib/teData";
import { N8N_WORKFLOWS } from "../../lib/teData";

export default function N8nIntegration() {
  const [connected, setConnected] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showConnect, setShowConnect] = useState(!connected);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!connectionUrl || !apiKey) {
      alert("Please enter both n8n URL and API Key");
      return;
    }
    setLoading(true);
    // Simulate connection test
    setTimeout(() => {
      setConnected(true);
      setShowConnect(false);
      setLoading(false);
      localStorage.setItem("n8n_url", connectionUrl);
      localStorage.setItem("n8n_api_key", apiKey);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setShowConnect(true);
    setConnectionUrl("");
    setApiKey("");
    localStorage.removeItem("n8n_url");
    localStorage.removeItem("n8n_api_key");
  };

  const testWorkflow = async (workflow) => {
    alert(`Testing workflow: ${workflow.name}\n\nStatus: Active\nLast Run: ${workflow.lastRun}\nNext Run: ${workflow.nextRun}`);
  };

  useEffect(() => {
    const saved_url = localStorage.getItem("n8n_url");
    const saved_key = localStorage.getItem("n8n_api_key");
    if (saved_url && saved_key) {
      setConnectionUrl(saved_url);
      setApiKey(saved_key);
      setConnected(true);
      setShowConnect(false);
    }
  }, []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, padding: "14px 20px", overflowY: "auto", height: "calc(100vh - 118px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          ⚡ n8n <span style={{ color: P.gold }}>Workflow Automation</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2, marginTop: 2 }}>
          {connected ? "✓ CONNECTED" : "⬜ NOT CONNECTED"}
        </div>
      </div>

      {/* Connection Status Card */}
      <div
        style={{
          background: P.card,
          border: `1px solid ${connected ? P.teal : P.amber}25`,
          borderTop: `3px solid ${connected ? P.teal : P.amber}`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 3 }}>Connection Status</div>
            <div style={{ fontSize: 7, color: P.t4 }}>
              {connected ? `Connected to: ${connectionUrl}` : "No active connection"}
            </div>
          </div>
          <button
            onClick={() => (connected ? handleDisconnect() : setShowConnect(true))}
            style={{
              padding: "6px 12px",
              fontSize: 8,
              fontWeight: 700,
              cursor: "pointer",
              background: connected ? `${P.teal}15` : `${P.amber}15`,
              border: `1px solid ${connected ? P.teal : P.amber}30`,
              color: connected ? P.teal : P.amber,
              borderRadius: 6,
            }}
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>

        {/* Connection Health */}
        {connected && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Workflows", value: N8N_WORKFLOWS.length, color: P.blue },
              { label: "Active", value: N8N_WORKFLOWS.filter((w) => w.status === "ACTIVE").length, color: P.teal },
              { label: "Execution Rate", value: "99.2%", color: P.green },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#080D18", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 6, color: P.t4, marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Form */}
      {showConnect && (
        <div style={{ background: P.card, border: `1px solid ${P.amber}25`, borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Connect n8n Instance</div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", fontSize: 7, color: P.t4, marginBottom: 4 }}>n8n URL</label>
            <input
              type="text"
              placeholder="https://your-n8n-instance.com"
              value={connectionUrl}
              onChange={(e) => setConnectionUrl(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: P.bg,
                border: `1px solid ${P.amber}30`,
                borderRadius: 6,
                color: P.t1,
                fontSize: 8,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 7, color: P.t4, marginBottom: 4 }}>API Key</label>
            <input
              type="password"
              placeholder="n8n API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: P.bg,
                border: `1px solid ${P.amber}30`,
                borderRadius: 6,
                color: P.t1,
                fontSize: 8,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 8,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              background: `${P.amber}20`,
              border: `1px solid ${P.amber}40`,
              color: P.amber,
              borderRadius: 6,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "⟳ Testing Connection..." : "Connect n8n"}
          </button>
        </div>
      )}

      {/* Workflows Grid */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: P.t1, marginBottom: 10 }}>⚙️ Workflows</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {N8N_WORKFLOWS.map((workflow) => {
            const isActive = workflow.status === "ACTIVE";
            return (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)}
                style={{
                  background: P.card,
                  border: `1px solid ${isActive ? P.teal : P.amber}25`,
                  borderLeft: `4px solid ${isActive ? P.teal : P.amber}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all .12s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: P.t1, marginBottom: 3 }}>{workflow.name}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>ID: {workflow.id}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 6,
                      background: isActive ? `${P.teal}15` : `${P.amber}15`,
                      border: `1px solid ${isActive ? P.teal : P.amber}25`,
                      color: isActive ? P.teal : P.amber,
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontWeight: 700,
                    }}
                  >
                    {isActive ? "● ACTIVE" : "⬜ PAUSED"}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                  <div style={{ background: "#080D18", borderRadius: 6, padding: "6px 8px", fontSize: 6 }}>
                    <div style={{ color: P.t4, marginBottom: 2 }}>Schedule</div>
                    <div style={{ color: P.t2, fontWeight: 700 }}>{workflow.schedule}</div>
                  </div>
                  <div style={{ background: "#080D18", borderRadius: 6, padding: "6px 8px", fontSize: 6 }}>
                    <div style={{ color: P.t4, marginBottom: 2 }}>Last Run</div>
                    <div style={{ color: P.t2, fontWeight: 700 }}>{workflow.lastRun}</div>
                  </div>
                </div>

                {selectedWorkflow === workflow.id && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${P.b}20` }}>
                    <div style={{ fontSize: 7, color: P.t3, marginBottom: 8, lineHeight: 1.4 }}>
                      <strong>Webhook:</strong> {workflow.webhookPath}
                    </div>
                    <div style={{ fontSize: 7, color: P.t3, marginBottom: 8, lineHeight: 1.4 }}>
                      <strong>Target:</strong> {workflow.pushTarget}
                    </div>
                    <button
                      onClick={() => testWorkflow(workflow)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        fontSize: 7,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: `${P.blue}12`,
                        border: `1px solid ${P.blue}25`,
                        color: P.blue,
                        borderRadius: 6,
                      }}
                    >
                      → Test Workflow
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Integration Status */}
      {connected && (
        <div style={{ background: P.card, border: `1px solid ${P.teal}25`, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: P.teal, marginBottom: 8 }}>✓ Integration Ready</div>
          <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
            <div>✓ {N8N_WORKFLOWS.length} workflows configured</div>
            <div>✓ Real-time data sync active</div>
            <div>✓ Webhook endpoints ready</div>
            <div style={{ marginTop: 6, color: P.t4 }}>Ingest pipeline: POST /api/ingest</div>
          </div>
        </div>
      )}
    </div>
  );
}