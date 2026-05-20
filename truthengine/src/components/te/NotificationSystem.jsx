import { useState, useEffect } from "react";
import { P } from "../../lib/teData";

export default function NotificationSystem({ notifications = [], onDismiss }) {
  const [visible, setVisible] = useState(notifications);

  useEffect(() => {
    setVisible(notifications);
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        if (notifications[0]) {
          onDismiss?.(notifications[0].id);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications, onDismiss]);

  if (visible.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 80,
      right: 20,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      maxWidth: 320,
    }}>
      {visible.map((notif) => {
        const colors = {
          critical: { bg: `${P.red}15`, border: P.red, icon: "⚠️" },
          warning: { bg: `${P.amber}15`, border: P.amber, icon: "⏱️" },
          success: { bg: `${P.teal}15`, border: P.teal, icon: "✓" },
          info: { bg: `${P.blue}15`, border: P.blue, icon: "ℹ️" },
        };
        const style = colors[notif.type] || colors.info;

        return (
          <div
            key={notif.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}30`,
              borderLeft: `4px solid ${style.border}`,
              borderRadius: 8,
              padding: "10px 14px",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{style.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: style.border, marginBottom: 2 }}>
                  {notif.title}
                </div>
                <div style={{ fontSize: 7, color: P.t3, lineHeight: 1.4 }}>
                  {notif.message}
                </div>
              </div>
              <button
                onClick={() => onDismiss?.(notif.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: P.t4,
                  cursor: "pointer",
                  fontSize: 12,
                  padding: 0,
                  marginTop: -2,
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}