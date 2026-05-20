import { useState, useEffect } from "react";
import { P } from "../../lib/teData";

const SERVICES = [
  { name: "PostgreSQL", icon: "🗄️", endpoint: "/health/postgres", color: P.blue },
  { name: "API (FastAPI)", icon: "⚡", endpoint: "/health/api", color: P.gold },
  { name: "Redis", icon: "💾", endpoint: "/health/redis", color: P.teal },
  { name: "Federal Register Crawler", icon: "🕷️", endpoint: "/health/crawler/federal-register", color: P.amber },
  { name: "Congressional Bills", icon: "🏛️", endpoint: "/health/crawler/congress", color: P.violet },
  { name: "VA Lighthouse", icon: "🏥", endpoint: "/health/crawler/va", color: P.cyan },
];

const SERVICE_STATUS = {
  healthy: { label: "Healthy", color: "#2DD4BF", icon: "✓" },
  degraded: { label: "Degraded", color: P.amber, icon: "⚠" },
  offline: { label: "Offline", color: P.red, icon: "✗" },
  checking: { label: "Checking...", color: P.t4, icon: "⏳" },
};

export default function DeploymentStatus() {
  const [statuses, setStatuses] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Check service health
  const checkServices = async () => {
    const newStatuses = {};
    
    for (const service of SERVICES) {
      try {
        const response = await fetch(`http://localhost:8000${service.endpoint}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        
        if (response.ok) {
          newStatuses[service.name] = "healthy";
        } else if (response.status >= 500) {
          newStatuses[service.name] = "offline";
        } else {
          newStatuses[service.name] = "degraded";
        }
      } catch (error) {
        newStatuses[service.name] = "offline";
      }
    }
    
    setStatuses(newStatuses);
    setLastUpdated(new Date());
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      // Silently fail if API not available yet
    }
  };

  // Auto-refresh
  useEffect(() => {
    checkServices();
    fetchMetrics();
    
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      checkServices();
      fetchMetrics();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const healthyCount = Object.values(statuses).filter(s => s === "healthy").length;
  const offlineCount = Object.values(statuses).filter(s => s === "offline").length;
  const overallHealth = offlineCount === 0 ? "healthy" : offlineCount > 2 ? "offline" : "degraded";

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, minHeight: "100vh", background: P.bg, padding: "20px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(90deg,${P.card},#0D1525)`, border: `2px solid ${SERVICE_STATUS[overallHealth].color}40`, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, color: SERVICE_STATUS[overallHealth].color, letterSpacing: 2, fontWeight: 800, marginBottom: 4 }}>
              🚀 DEPLOYMENT STATUS
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: P.t1 }}>
              Service Health: {SERVICE_STATUS[overallHealth].label}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#2DD4BF" }}>{healthyCount}/{SERVICES.length}</div>
              <div style={{ fontSize: 7, color: P.t4 }}>Services Healthy</div>
            </div>
            <label style={{ fontSize: 8, display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Auto-refresh (15s)
            </label>
          </div>
        </div>
        {lastUpdated && (
          <div style={{ fontSize: 7, color: P.t4 }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 20 }}>
        {SERVICES.map((service) => {
          const status = statuses[service.name] || "checking";
          const statusConfig = SERVICE_STATUS[status];
          
          return (
            <div
              key={service.name}
              style={{
                background: P.card,
                border: `2px solid ${statusConfig.color}${status === "healthy" ? "" : "40"}`,
                borderRadius: 10,
                padding: "14px 16px",
                boxShadow: status === "healthy" ? `0 0 12px ${statusConfig.color}20` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{service.icon}</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: P.t1 }}>{service.name}</div>
                    <div style={{ fontSize: 7, color: P.t4 }}>{service.endpoint}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, color: statusConfig.color }}>{statusConfig.icon}</div>
                  <div style={{ fontSize: 7, color: statusConfig.color, fontWeight: 700, marginTop: 2 }}>
                    {statusConfig.label}
                  </div>
                </div>
              </div>
              
              {/* Status bar */}
              <div style={{ height: 4, background: "#080D18", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: statusConfig.color,
                    width: status === "healthy" ? "100%" : status === "degraded" ? "50%" : "0%",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      {metrics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, marginBottom: 8, fontWeight: 800 }}>📊 CASES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.gold }}>{metrics.cases?.total || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Total</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#2DD4BF" }}>{metrics.cases?.tier_1 || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Tier 1</div>
              </div>
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, marginBottom: 8, fontWeight: 800 }}>📋 FOIA</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.blue }}>{metrics.foia?.total_requests || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Requests</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#2DD4BF" }}>{metrics.foia?.received || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Received</div>
              </div>
            </div>
          </div>

          <div style={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 8, color: P.t4, marginBottom: 8, fontWeight: 800 }}>🕷️ CRAWLERS (24h)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.amber }}>{metrics.crawlers?.jobs_run_24h || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Jobs</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: P.violet }}>{metrics.crawlers?.records_found_24h || 0}</div>
                <div style={{ fontSize: 6, color: P.t4, marginTop: 2 }}>Records</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ background: `${P.gold}08`, border: `1px solid ${P.gold}25`, borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ fontSize: 8, color: P.gold, fontWeight: 800, marginBottom: 8 }}>⚙️ QUICK ACTIONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 6 }}>
          <button
            onClick={() => window.open("http://localhost:3000", "_blank")}
            style={{
              padding: "8px 12px",
              background: `${P.gold}18`,
              border: `1px solid ${P.gold}`,
              color: P.gold,
              borderRadius: 6,
              fontSize: 7,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            📊 Open Dashboard
          </button>
          <button
            onClick={() => window.open("http://localhost:8000/docs", "_blank")}
            style={{
              padding: "8px 12px",
              background: `${P.blue}18`,
              border: `1px solid ${P.blue}`,
              color: P.blue,
              borderRadius: 6,
              fontSize: 7,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            📚 API Docs
          </button>
          <button
            onClick={checkServices}
            style={{
              padding: "8px 12px",
              background: `${P.teal}18`,
              border: `1px solid ${P.teal}`,
              color: P.teal,
              borderRadius: 6,
              fontSize: 7,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}