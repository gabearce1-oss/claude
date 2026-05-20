import { useState } from "react";
import { P } from "../../lib/teData";

export default function FOIAEmailConfig() {
  const [emailList, setEmailList] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [notificationTypes, setNotificationTypes] = useState({
    filed: true,
    in_progress: true,
    received: true,
    denied: true,
  });
  const [saved, setSaved] = useState(false);

  const addEmail = () => {
    if (newEmail && !emailList.includes(newEmail)) {
      setEmailList([...emailList, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (email) => {
    setEmailList(emailList.filter(e => e !== email));
  };

  const toggleNotification = (type) => {
    setNotificationTypes({
      ...notificationTypes,
      [type]: !notificationTypes[type]
    });
  };

  const saveConfig = async () => {
    // In production, this would save to a configuration table
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, background: P.card, borderRadius: 12, border: `1px solid ${P.b}`, padding: "16px 20px" }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: P.blue, marginBottom: 12 }}>
        📧 FOIA Status Email Configuration
      </div>

      {/* Email Recipients */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: P.t2, marginBottom: 8 }}>Veteran Email Recipients</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="veteran@example.com"
            style={{
              flex: 1,
              padding: "6px 10px",
              background: "#080D18",
              border: `1px solid ${P.b}`,
              borderRadius: 6,
              color: P.t1,
              fontSize: 8,
              outline: "none",
              fontFamily: "inherit"
            }}
            onKeyPress={(e) => e.key === "Enter" && addEmail()}
          />
          <button
            onClick={addEmail}
            style={{
              padding: "6px 12px",
              background: `${P.gold}18`,
              border: `1px solid ${P.gold}`,
              color: P.gold,
              borderRadius: 6,
              fontSize: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit"
            }}
          >
            Add
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {emailList.map((email, i) => (
            <div
              key={i}
              style={{
                background: `${P.teal}15`,
                border: `1px solid ${P.teal}30`,
                borderRadius: 20,
                padding: "4px 10px",
                display: "flex",
                gap: 6,
                alignItems: "center",
                fontSize: 7
              }}
            >
              {email}
              <button
                onClick={() => removeEmail(email)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: P.red,
                  cursor: "pointer",
                  fontSize: 10,
                  padding: 0,
                  fontFamily: "inherit"
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: P.t2, marginBottom: 8 }}>Send Notifications For:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          {[
            { key: 'filed', label: '📋 Request Filed' },
            { key: 'in_progress', label: '⏳ In Progress' },
            { key: 'received', label: '✓ Records Received' },
            { key: 'denied', label: '⚠️ Request Denied' }
          ].map(item => (
            <label
              key={item.key}
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                padding: "6px 10px",
                background: notificationTypes[item.key] ? `${P.gold}12` : "#080D18",
                border: `1px solid ${notificationTypes[item.key] ? P.gold : P.b}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 8
              }}
            >
              <input
                type="checkbox"
                checked={notificationTypes[item.key]}
                onChange={() => toggleNotification(item.key)}
                style={{ cursor: "pointer" }}
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveConfig}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: `${P.gold}18`,
          border: `1px solid ${P.gold}`,
          color: P.gold,
          borderRadius: 8,
          fontSize: 8,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all .2s"
        }}
      >
        {saved ? "✓ Configuration Saved" : "Save Configuration"}
      </button>

      {/* Info */}
      <div style={{ marginTop: 12, padding: "8px 10px", background: `${P.blue}10`, border: `1px solid ${P.blue}25`, borderRadius: 6, fontSize: 7, color: P.t3, lineHeight: 1.6 }}>
        <strong style={{ color: P.blue }}>ℹ️ How it works:</strong> When a FOIA request status changes, an automated email will be sent to all veterans on this list. Customize which status changes trigger notifications.
      </div>
    </div>
  );
}