import { useState } from "react";
import { P, N8N_WORKFLOWS, CALENDAR_EVENTS, DRIVE_DOCS } from "../../lib/teData";
import DatabasesPanel from "./DatabasesPanel";

const CHC_DAYS = Math.ceil((new Date("2026-05-18") - new Date()) / 86400000);

const Code = ({ children }) => (
  <pre style={{ background:"#020406", border:`1px solid ${P.b}`, borderRadius:7,
    padding:"10px 12px", fontSize:8, color:"#B8CCE8", overflowX:"auto",
    fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8, margin:"6px 0" }}>
    {children}
  </pre>
);

const Step = ({ n, title, color=P.blue, children }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:6 }}>
      <div style={{ background:`${color}18`, border:`1px solid ${color}40`, borderRadius:"50%",
        width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:800, color, flexShrink:0 }}>
        {n}
      </div>
      <div style={{ fontSize:11, fontWeight:700, color:P.t1, paddingTop:3 }}>{title}</div>
    </div>
    <div style={{ marginLeft:36 }}>{children}</div>
  </div>
);

const SubTab = ({ id, label, active, onClick, badge }) => (
  <button onClick={onClick}
    style={{ padding:"5px 12px", background:"transparent", border:"none",
      borderBottom: active ? `2px solid ${P.gold}` : "2px solid transparent",
      color: active ? P.t1 : P.t4, fontSize:9, fontWeight: active ? 700 : 400,
      cursor:"pointer", whiteSpace:"nowrap", position:"relative",
      fontFamily:"'IBM Plex Mono',monospace" }}>
    {label}
    {badge && (
      <span style={{ marginLeft:5, background:P.red, color:"#fff", borderRadius:20,
        padding:"0 4px", fontSize:7, fontWeight:800 }}>{badge}</span>
    )}
  </button>
);

// ── STATUS TAB ──────────────────────────────────────────────────
function StatusPanel() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

      {/* n8n */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(90deg,${P.teal}12,transparent)`, borderBottom:`1px solid ${P.b}`, padding:"9px 14px", display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>⚙️ n8n Workflows</span>
          <a href="https://qt360.app.n8n.cloud" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:7, color:P.teal, textDecoration:"none" }}>qt360.app.n8n.cloud ↗</a>
        </div>
        <div style={{ padding:"10px 14px" }}>
          {N8N_WORKFLOWS.map((wf,i) => (
            <div key={i} style={{ padding:"6px 0", borderBottom:`1px solid ${P.b}20` }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:9, fontWeight:700, color:wf.color }}>{wf.id}: {wf.name}</span>
                <span style={{ fontSize:7, background:`${P.teal}18`, border:`1px solid ${P.teal}30`, color:P.teal, borderRadius:20, padding:"1px 6px" }}>{wf.status}</span>
              </div>
              <div style={{ fontSize:7, color:P.t4 }}>{wf.cron} · last: {wf.lastRun} · next: {wf.nextRun}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HubSpot */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(90deg,${P.orange}12,transparent)`, borderBottom:`1px solid ${P.b}`, padding:"9px 14px" }}>
          <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>🔗 HubSpot CRM — Hub 46948033</span>
        </div>
        <div style={{ padding:"10px 14px" }}>
          <div style={{ background:"#FF5C5C08", border:`1px solid ${P.red}25`, borderRadius:6, padding:"8px 10px", marginBottom:8 }}>
            <div style={{ fontSize:9, color:P.red, fontWeight:800 }}>⚠ WRITE ACCESS: NEEDS REAUTH</div>
            <div style={{ fontSize:7, color:P.t3, marginTop:2, lineHeight:1.5 }}>
              Claude.ai → Settings → Connected Tools → HubSpot → Disconnect → Reconnect with READ + WRITE
            </div>
          </div>
          {[["Hub ID","46948033",P.orange],["Contacts","2,065 (read NOW)",P.teal],["Companies","791",P.blue],
            ["Read","AVAILABLE",P.teal],["Write","REAUTH NEEDED",P.red]].map(([k,v,c],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"3px 0", borderBottom:`1px solid ${P.b}15` }}>
              <span style={{ color:P.t4 }}>{k}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:c, fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(90deg,${P.violet}12,transparent)`, borderBottom:`1px solid ${P.b}`, padding:"9px 14px" }}>
          <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>🐙 GitHub Evidence Ledger</span>
        </div>
        <div style={{ padding:"10px 14px" }}>
          {[["Repo","gabearce1-oss/TruthEngine360",P.violet],["Branch","main",P.blue],
            ["Cases Logged","6 (SHA-256 certified)",P.teal],["CI/CD","github_claude_integration.yml · ACTIVE",P.teal],
            ["Auto-sync","docs/** and analysis/** on push",P.t3]].map(([k,v,c],i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:8, padding:"4px 0", borderBottom:`1px solid ${P.b}15`, flexWrap:"wrap", gap:4 }}>
              <span style={{ color:P.t4, flexShrink:0 }}>{k}</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", color:c, textAlign:"right" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHC countdown */}
      <div style={{ background:`linear-gradient(135deg,${P.gold}12,${P.amber}08)`, border:`1px solid ${P.gold}30`, borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:6 }}>
        <div style={{ fontSize:8, color:P.gold, letterSpacing:4, fontWeight:700 }}>CHC BRIEFING</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:48, fontWeight:800, color:P.gold, lineHeight:1 }}>{CHC_DAYS}</div>
        <div style={{ fontSize:9, color:P.t3 }}>days · May 18, 2026</div>
        <div style={{ fontSize:8, color:P.t4, textAlign:"center", lineHeight:1.5 }}>6 CB-HSIVF cases · DCAS 349 brief · NERO scores</div>
      </div>

      {/* Critical blockers */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:12, overflow:"hidden", gridColumn:"1 / -1" }}>
        <div style={{ background:`linear-gradient(90deg,${P.red}12,transparent)`, borderBottom:`1px solid ${P.b}`, padding:"9px 14px" }}>
          <span style={{ fontSize:10, fontWeight:700, color:P.t1 }}>🔴 3 Actions Required RIGHT NOW</span>
        </div>
        <div style={{ padding:"10px 14px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:8 }}>
          {[
            { n:1, label:"Reconnect HubSpot", desc:"Claude Settings → Connected Tools → HubSpot → Disconnect → Reconnect (read + write). Unlocks auto-contact creation from n8n.", c:P.red },
            { n:2, label:"Email foia.ice@dhs.gov TODAY", desc:"DHS ENFORCE FOIA overdue. Calendar: Apr 20. CHC inquiry is fastest lever for a response. Subject: FOIA Request [ID] — Congressional Escalation.", c:P.red },
            { n:3, label:"Add HTTP Request node to n8n DCAS Crawler", desc:"Open DCAS Crawler workflow → after scoring step → add HTTP Request node → POST to Base44 /api/ingest. This makes the search engine live.", c:P.amber },
          ].map((a,i) => (
            <div key={i} style={{ background:"#080D18", border:`1px solid ${a.c}25`, borderLeft:`3px solid ${a.c}`, borderRadius:7, padding:"9px 11px" }}>
              <div style={{ display:"flex", gap:7, marginBottom:4 }}>
                <span style={{ background:`${a.c}20`, border:`1px solid ${a.c}40`, color:a.c, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, flexShrink:0 }}>{a.n}</span>
                <span style={{ fontSize:10, fontWeight:700, color:a.c }}>{a.label}</span>
              </div>
              <div style={{ fontSize:8, color:P.t3, lineHeight:1.6 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── N8N CONNECT TAB ──────────────────────────────────────────────
function N8NConnectPanel() {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const copy = (text, idx) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div>
      <div style={{ background:`${P.teal}08`, border:`1px solid ${P.teal}25`, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
        <div style={{ fontSize:9, fontWeight:700, color:P.teal, marginBottom:3 }}>n8n Instance: qt360.app.n8n.cloud · Owner: gtarce@usc.edu</div>
        <div style={{ fontSize:8, color:P.t3 }}>4 active workflows · 30 crawlers · 6hr cycle. Follow these steps to wire n8n ↔ Base44.</div>
      </div>

      <Step n="1" title="Access Your n8n Instance" color={P.blue}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:6 }}>Log in with AUMER Foundation credentials. You will see 4 active workflows in the Workflow Manager.</div>
        <div style={{ display:"flex", gap:6 }}>
          <a href="https://qt360.app.n8n.cloud" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:8, background:`${P.blue}18`, border:`1px solid ${P.blue}30`, color:P.blue,
              borderRadius:5, padding:"4px 10px", textDecoration:"none" }}>
            Open n8n ↗
          </a>
        </div>
      </Step>

      <Step n="2" title="Get Webhook URLs — Copy from Each Workflow" color={P.violet}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:7 }}>In n8n: open each workflow → click the Webhook node → copy Production URL.</div>
        {N8N_WORKFLOWS.map((wf,i) => (
          <div key={i} style={{ background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, padding:"7px 10px", marginBottom:5, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
            <div>
              <div style={{ fontSize:8, fontWeight:700, color:wf.color, marginBottom:1 }}>{wf.id}: {wf.name}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.t3 }}>
                https://qt360.app.n8n.cloud{wf.webhookPath}
              </div>
            </div>
            <button onClick={() => copy(`https://qt360.app.n8n.cloud${wf.webhookPath}`, i)}
              style={{ padding:"3px 8px", background:`${wf.color}15`, border:`1px solid ${wf.color}30`,
                color:wf.color, borderRadius:4, fontSize:7, cursor:"pointer", flexShrink:0 }}>
              {copiedIdx === i ? "✓ Copied" : "Copy"}
            </button>
          </div>
        ))}
      </Step>

      <Step n="3A" title="n8n → Base44 Push: DCAS Crawler" color={P.teal}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:5 }}>In DCAS Crawler workflow, after the scoring step, add an HTTP Request node:</div>
        <Code>{`Node Type:   HTTP Request
Method:      POST
URL:         https://app.base44.com/api/ingest
Headers:
  Authorization: Bearer [Base44 API key]
  Content-Type: application/json

Body:
${N8N_WORKFLOWS[0].pushBody}`}</Code>
      </Step>

      <Step n="3B" title="n8n → Base44 Push: FOIA Alert Tracker" color={P.amber}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:5 }}>In FOIA Alert Tracker workflow, add:</div>
        <Code>{`Node Type:   HTTP Request
Method:      POST
URL:         https://app.base44.com/api/foia-update

Body:
${N8N_WORKFLOWS[1].pushBody}`}</Code>
      </Step>

      <Step n="3C" title="Base44 → n8n Pull (Search Query)" color={P.blue}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:5 }}>Add this fetch inside the Base44 Search component to query live data:</div>
        <Code>{`const results = await fetch(
  'https://qt360.app.n8n.cloud/webhook/litcentral-data',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_N8N_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);
const data = await results.json();`}</Code>
      </Step>

      <Step n="4" title="WebSocket — Live Feed Wire" color={P.pink}>
        <div style={{ fontSize:9, color:P.t2, marginBottom:5 }}>Add to Base44 Crawlers tab component (Sprint 2):</div>
        <Code>{`const ws = new WebSocket(
  'wss://qt360.app.n8n.cloud/webhook/live-alerts'
);
ws.onmessage = (event) => {
  const alert = JSON.parse(event.data);
  setAlerts(prev => [alert, ...prev.slice(0, 49)]);
};

// Alert types: CRAWL · MATCH · ALERT · FOIA
//              SHELTER · MEDIA · HASH`}</Code>
      </Step>

      <Step n="5" title="GitHub Evidence Push (in n8n)" color={P.violet}>
        <Code>{`Node Type:    GitHub
Operation:    Create File / Update File
Repository:   gabearce1-oss/TruthEngine360
Branch:       main
File Path:    /evidence/[case-id]-[sha256].json
Content:      {{$json.evidence_block}}
Commit Msg:   "Evidence: [case-id] — CB-HSIVF [tier]"`}</Code>
      </Step>
    </div>
  );
}

// ── DRIVE DOCS TAB ──────────────────────────────────────────────
function DrivePanel() {
  return (
    <div>
      <div style={{ background:`${P.blue}08`, border:`1px solid ${P.blue}25`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <div style={{ fontSize:9, fontWeight:700, color:P.blue, marginBottom:2 }}>Google Drive — 4 Confirmed Documents</div>
        <div style={{ fontSize:8, color:P.t3 }}>
          Drive sweep commands: <span style={{ color:P.teal }}>"Search my Drive for [topic]"</span> · <span style={{ color:P.teal }}>"Drive sweep: [topic] — full synthesis"</span>
        </div>
      </div>

      {DRIVE_DOCS.map((doc,i) => (
        <div key={i} style={{ background:P.card, border:`1px solid ${P.b}`, borderLeft:`4px solid ${P.blue}`,
          borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:6 }}>
            <div>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.t4 }}>{doc.id}</span>
                <span style={{ fontSize:7, color:P.t4 }}>Modified: {doc.modified}</span>
                {doc.modified.includes("Mar 30") && <span style={{ fontSize:7, background:`${P.teal}18`, border:`1px solid ${P.teal}30`, color:P.teal, borderRadius:3, padding:"1px 4px" }}>MOST CURRENT</span>}
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:P.t1, marginBottom:3 }}>{doc.title}</div>
              <div style={{ fontSize:9, color:P.t3, lineHeight:1.6 }}>{doc.desc}</div>
            </div>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:800, color:P.teal, flexShrink:0 }}>{doc.relevance}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {doc.tags.map(t => (
                <span key={t} style={{ fontSize:7, background:`${P.blue}12`, border:`1px solid ${P.blue}20`, color:P.blue, borderRadius:3, padding:"1px 5px" }}>#{t}</span>
              ))}
            </div>
            <a href={doc.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize:8, background:`${P.blue}15`, border:`1px solid ${P.blue}30`, color:P.blue,
                borderRadius:5, padding:"4px 10px", textDecoration:"none", flexShrink:0 }}>
              Open in Drive ↗
            </a>
          </div>
        </div>
      ))}

      {/* Search commands */}
      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:8, color:P.t4, letterSpacing:2, marginBottom:8 }}>DRIVE SEARCH COMMANDS</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {[
            ["Find everything about DCAS in my Drive","DCAS sweep"],
            ["Search Drive for deported veterans analysis","Veterans sweep"],
            ["What Drive files mention BISG?","BISG sweep"],
            ["Drive sweep: BISG methodology — extract scoring formula","Full analysis"],
            ["Drive sweep: CHC briefing — all prep materials","Briefing prep"],
            ["Find documents modified after February 15","Date filter"],
          ].map(([cmd, label]) => (
            <div key={cmd} style={{ background:"#080D18", border:`1px solid ${P.b}`, borderRadius:6, padding:"7px 9px" }}>
              <div style={{ fontSize:7, color:P.t4, marginBottom:2 }}>{label}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.teal }}>"{cmd}"</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR TAB ──────────────────────────────────────────────
function CalendarPanel() {
  return (
    <div>
      <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <div style={{ fontSize:9, fontWeight:700, color:P.gold, marginBottom:2 }}>Calendar — Confirmed Live Events</div>
        <div style={{ fontSize:8, color:P.t3 }}>4 confirmed events · 2 FOIA deadlines · 1 CHC briefing · 1 manuscript deadline</div>
      </div>

      {CALENDAR_EVENTS.map((ev,i) => (
        <div key={i} style={{ background: ev.urgent ? `${ev.color}08` : P.card,
          border:`1px solid ${ev.color}${ev.urgent ? "50" : "25"}`,
          borderLeft:`5px solid ${ev.color}`, borderRadius:10, padding:"12px 16px", marginBottom:8,
          boxShadow: ev.urgent ? `0 0 16px ${ev.color}15` : "none" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
            <div>
              <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3, flexWrap:"wrap" }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:800, color:ev.color }}>{ev.date}</span>
                <span style={{ fontSize:7, color:P.t4 }}>{ev.time}</span>
                <span style={{ fontSize:7, background:`${ev.color}18`, border:`1px solid ${ev.color}30`, color:ev.color, borderRadius:20, padding:"1px 7px", fontWeight:700 }}>{ev.status}</span>
                {ev.urgent && <span style={{ fontSize:7, background:`${P.red}18`, border:`1px solid ${P.red}30`, color:P.red, borderRadius:3, padding:"1px 5px", fontWeight:800 }}>🔴 URGENT</span>}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color: ev.urgent ? ev.color : P.t1 }}>{ev.label}</div>
              {ev.action && (
                <div style={{ marginTop:5, fontSize:8, color:P.t3 }}>
                  Action: <span style={{ color:ev.color, fontWeight:700 }}>{ev.action}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:8, color:P.t4, letterSpacing:2, marginBottom:6 }}>CALENDAR SEARCH COMMANDS</div>
        {["What's on my calendar this month?",
          "Find my calendar entry for the CHC briefing",
          "Show me all FOIA deadlines on the calendar",
          "What events do I have before May 18?"].map(cmd => (
          <div key={cmd} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:P.teal,
            padding:"3px 0", borderBottom:`1px solid ${P.b}20` }}>
            "{cmd}"
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CHEAT SHEET TAB ──────────────────────────────────────────────
function CheatSheetPanel() {
  const sections = [
    { title:"n8n", color:P.teal, items:[
      ["Instance","qt360.app.n8n.cloud"],["Owner","gtarce@usc.edu"],
      ["Workflows","4 active"],["Crawlers","30 active (6hr cycle)"],
      ["Fix needed","Add HTTP Request nodes + YouTube crawler"],
    ]},
    { title:"HubSpot", color:P.orange, items:[
      ["Hub ID","46948033"],["Contacts","2,065 (read NOW)"],
      ["Companies","791"],["Read","AVAILABLE NOW"],
      ["Write","DISCONNECT + RECONNECT to fix"],
      ["URL","app.hubspot.com/contacts/46948033"],
    ]},
    { title:"GitHub", color:P.violet, items:[
      ["Repo","gabearce1-oss/TruthEngine360"],
      ["CI/CD","github_claude_integration.yml"],
      ["Evidence","SHA-256 certified, 6 cases"],
      ["Auto-sync","docs/** + analysis/** on push"],
    ]},
    { title:"Calendar", color:P.gold, items:[
      ["Apr 10","Property Advantage interview 11am PST"],
      ["Apr 20","DHS FOIA action required — foia.ice@dhs.gov"],
      ["Apr 30","USCIS follow-up — foiarequest@uscis.dhs.gov"],
      ["May 18","CHC briefing ("+CHC_DAYS+" days)"],
      ["May 31","Publication deadline"],
    ]},
    { title:"Base44 Endpoints", color:P.blue, items:[
      ["Receive from n8n","POST /api/ingest"],
      ["FOIA updates","POST /api/foia-update"],
      ["Query n8n","GET qt360.app.n8n.cloud/webhook/litcentral-data"],
      ["Live alerts","WSS qt360.app.n8n.cloud/webhook/live-alerts"],
    ]},
    { title:"Drive Search Commands", color:P.pink, items:[
      ["By topic",'"Search my Drive for [topic]"'],
      ["Full sweep",'"Drive sweep: [topic] — full synthesis"'],
      ["By date",'"Find documents modified after Feb 15"'],
      ["Cross-ref",'"Cross-reference DCAS anomaly with BISG analysis"'],
    ]},
  ];

  return (
    <div>
      <div style={{ background:`#080D18`, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 14px", marginBottom:12 }}>
        <div style={{ fontSize:8, color:P.gold, letterSpacing:3, fontWeight:700, marginBottom:2 }}>⚡ QUICK REFERENCE — All systems at a glance</div>
        <div style={{ fontSize:8, color:P.t4 }}>Bookmark this tab for instant reference during builds and briefings.</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:10 }}>
        {sections.map((sec,si) => (
          <div key={si} style={{ background:P.card, border:`1px solid ${sec.color}20`, borderLeft:`4px solid ${sec.color}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"7px 12px", borderBottom:`1px solid ${P.b}`, background:`${sec.color}08` }}>
              <span style={{ fontSize:9, fontWeight:800, color:sec.color }}>{sec.title}</span>
            </div>
            <div style={{ padding:"8px 12px" }}>
              {sec.items.map(([k,v],i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:`1px solid ${P.b}15`, gap:8 }}>
                  <span style={{ fontSize:7, color:P.t4, flexShrink:0 }}>{k}</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:sec.color, textAlign:"right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function PlatformTab() {
  const [sub, setSub] = useState("status");
  return (
    <div style={{ height:"calc(100vh - 118px)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Sub-tab bar */}
      <div style={{ background:"#050810", borderBottom:`1px solid ${P.b}`, padding:"0 20px", display:"flex", flexShrink:0 }}>
        <SubTab id="status"   label="📊 Status"       active={sub==="status"}   onClick={() => setSub("status")} />
        <SubTab id="n8n"      label="⚙️ Connect n8n"   active={sub==="n8n"}      onClick={() => setSub("n8n")} />
        <SubTab id="drive"    label="📁 Drive Docs"    active={sub==="drive"}    onClick={() => setSub("drive")} />
        <SubTab id="calendar" label="📅 Calendar"      active={sub==="calendar"} onClick={() => setSub("calendar")} badge="2" />
        <SubTab id="databases" label="🗄️ 1,500+ DBs"   active={sub==="databases"} onClick={() => setSub("databases")} />
        <SubTab id="cheat"    label="⚡ Cheat Sheet"   active={sub==="cheat"}    onClick={() => setSub("cheat")} />
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px" }}>
        {sub === "status"    && <StatusPanel />}
        {sub === "n8n"       && <N8NConnectPanel />}
        {sub === "drive"     && <DrivePanel />}
        {sub === "calendar"  && <CalendarPanel />}
        {sub === "databases" && <DatabasesPanel />}
        {sub === "cheat"     && <CheatSheetPanel />}
      </div>
    </div>
  );
}