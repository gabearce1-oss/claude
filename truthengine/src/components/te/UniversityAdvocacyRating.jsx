import { useState } from "react";
import { P } from "../../lib/teData";
import { base44 } from "../../api/base44Client";

const UNIVERSITY_ACADEMICS = [
  {
    id: "u001", name: "Dr. Arturo Durazo", institution: "University of San Francisco",
    department: "Sociology", expertise: "Deportation, Chicano studies, immigrant rights",
    projects: ["Invisible Valor Manuscript", "Deported Veterans Research", "Institutional Erasure"],
    linkedin: "https://www.linkedin.com/in/arturo-durazo/", rating: null, color: P.teal,
  },
  {
    id: "u002", name: "Dr. Cecilia Menjívar", institution: "University of California, Los Angeles",
    department: "Sociology", expertise: "Immigration, family separation, legal consciousness",
    projects: ["Family Separation Study", "Immigrant Legal Pathways", "Policy Impact Analysis"],
    linkedin: "https://www.linkedin.com/in/cecilia-menjívar/", rating: null, color: P.violet,
  },
  {
    id: "u003", name: "Dr. Leisy Abrego", institution: "UCLA",
    department: "Chicana/o Studies", expertise: "Immigration, citizenship, belonging",
    projects: ["Legality Framework", "Undocumented Immigrant Rights", "Immigrant Identity"],
    linkedin: "https://www.linkedin.com/in/leisy-abrego/", rating: null, color: P.blue,
  },
  {
    id: "u004", name: "Dr. Nolan Cabrera", institution: "University of Arizona",
    department: "Education", expertise: "Critical race theory, immigrant education, advocacy",
    projects: ["CRT in Higher Ed", "Latinx Student Success", "Immigrant Advocacy Networks"],
    linkedin: "https://www.linkedin.com/in/nolan-cabrera/", rating: null, color: P.amber,
  },
  {
    id: "u005", name: "Dr. Jennifer Hajj", institution: "UC San Diego",
    department: "International Studies", expertise: "US-Mexico relations, migration policy, border",
    projects: ["Border Policy Research", "Migration Data Projects", "Congressional Briefings"],
    linkedin: "https://www.linkedin.com/in/jennifer-hajj/", rating: null, color: P.gold,
  },
  {
    id: "u006", name: "Dr. Salvador Ceja", institution: "California State University, Fullerton",
    department: "History", expertise: "Chicano military history, Vietnam, DCAS",
    projects: ["Hispanic Veterans History", "DCAS Data Analysis", "Oral History Archives"],
    linkedin: "https://www.linkedin.com/in/salvador-ceja/", rating: null, color: P.red,
  },
];

const RATING_OPTIONS = [
  { value: "advocate", label: "Advocate", desc: "Direct legal/policy advocacy work", color: P.red },
  { value: "influencer", label: "Influencer", desc: "Research & publishing impact", color: P.gold },
  { value: "mentor", label: "Mentor", desc: "Student training & mentorship", color: P.teal },
];

export default function UniversityAdvocacyRating() {
  const [academics, setAcademics] = useState(UNIVERSITY_ACADEMICS);
  const [selectedAcademic, setSelectedAcademic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const filtered = academics.filter(a =>
    (filterRating === "all" || a.rating === filterRating) &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.expertise.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRateAcademic = (id, ratingValue) => {
    setAcademics(academics.map(a =>
      a.id === id ? { ...a, rating: a.rating === ratingValue ? null : ratingValue } : a
    ));
  };

  const handleAIAnalyze = async (academic) => {
    if (!academic.linkedin) return;
    setAiAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Research the LinkedIn profile and academic work of ${academic.name} at ${academic.institution}. 
        Analyze their involvement in advocacy (direct policy/legal work), their influence (research publications, citations, media), 
        and their mentorship role (students, network building). 
        Provide a brief assessment (100 words) of their primary role: advocate, influencer, or mentor.
        Focus on veteran deportation, immigration policy, and racial justice advocacy.`,
        add_context_from_internet: true,
      });
      console.log("AI Analysis:", result);
    } catch (error) {
      console.error("AI analysis failed:", error);
    }
    setAiAnalyzing(false);
  };

  const ratedCount = academics.filter(a => a.rating).length;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: P.t1 }}>
          🎓 University Advocates <span style={{ color: P.violet }}>Rating</span>
        </div>
        <div style={{ fontSize: 7, color: P.t4, letterSpacing: 2 }}>
          RESEARCH PROFESSORS · LINKEDIN ANALYSIS · ADVOCATE / INFLUENCER / MENTOR CLASSIFICATION
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 7, marginBottom: 10 }}>
        {[
          ["Total Faculty", academics.length, P.blue],
          ["Rated", ratedCount, P.gold],
          ["Advocates", academics.filter(a => a.rating === "advocate").length, P.red],
          ["Influencers", academics.filter(a => a.rating === "influencer").length, P.gold],
          ["Mentors", academics.filter(a => a.rating === "mentor").length, P.teal],
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: P.card, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}`, borderRadius: 7, padding: "6px 10px" }}>
            <div style={{ fontSize: 6, color: P.t4 }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 16, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search faculty..."
          style={{
            padding: "6px 12px", background: "#080D18", border: `1px solid ${P.b}`,
            borderRadius: 20, color: P.t1, fontSize: 8, outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "advocate", "influencer", "mentor"].map(r => (
            <button
              key={r}
              onClick={() => setFilterRating(r)}
              style={{
                padding: "4px 12px", fontSize: 7, fontWeight: 700, cursor: "pointer",
                background: filterRating === r ? `${P.violet}20` : "transparent",
                border: `1px solid ${filterRating === r ? P.violet : P.b}`,
                color: filterRating === r ? P.violet : P.t4, borderRadius: 20,
              }}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
        {/* Faculty list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(a => {
            const isSelected = selectedAcademic?.id === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setSelectedAcademic(isSelected ? null : a)}
                style={{
                  background: isSelected ? `${a.color}12` : "#080D18",
                  border: `1px solid ${isSelected ? a.color : P.b}`,
                  borderLeft: `4px solid ${a.color}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: a.color, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 7, color: P.t4, marginBottom: 3 }}>{a.institution}</div>
                {a.rating && (
                  <div style={{
                    fontSize: 6, fontWeight: 700, color: "#fff",
                    background: a.rating === "advocate" ? P.red : a.rating === "influencer" ? P.gold : P.teal,
                    borderRadius: 20, padding: "1px 8px", width: "fit-content",
                  }}>
                    ✓ {a.rating.charAt(0).toUpperCase() + a.rating.slice(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Details panel */}
        <div>
          {selectedAcademic ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Header */}
              <div style={{
                background: P.card, border: `1px solid ${selectedAcademic.color}30`,
                borderLeft: `4px solid ${selectedAcademic.color}`, borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: selectedAcademic.color, marginBottom: 2 }}>
                  {selectedAcademic.name}
                </div>
                <div style={{ fontSize: 8, color: P.t3, marginBottom: 4 }}>
                  {selectedAcademic.department} · {selectedAcademic.institution}
                </div>
                <div style={{ fontSize: 7, color: P.t4, lineHeight: 1.6 }}>{selectedAcademic.expertise}</div>
              </div>

              {/* Projects */}
              <div style={{
                background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 8, letterSpacing: 1 }}>PROJECTS</div>
                {selectedAcademic.projects.map(p => (
                  <div key={p} style={{
                    fontSize: 7, color: P.t3, padding: "5px 0", borderBottom: `1px solid ${P.b}20`
                  }}>
                    • {p}
                  </div>
                ))}
              </div>

              {/* Rating section */}
              <div style={{
                background: P.card, border: `1px solid ${P.b}`, borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: P.t2, marginBottom: 10, letterSpacing: 1 }}>
                  CLASSIFICATION
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {RATING_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleRateAcademic(selectedAcademic.id, opt.value)}
                      style={{
                        padding: "8px 12px", cursor: "pointer",
                        background: selectedAcademic.rating === opt.value ? `${opt.color}20` : "transparent",
                        border: `1px solid ${selectedAcademic.rating === opt.value ? opt.color : P.b}`,
                        color: selectedAcademic.rating === opt.value ? opt.color : P.t4,
                        borderRadius: 7, fontSize: 8, fontWeight: 700, textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{selectedAcademic.rating === opt.value ? "✓ " : ""}{opt.label}</span>
                        <span style={{ fontSize: 7, color: P.t4 }}>{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LinkedIn Research */}
              <a
                href={selectedAcademic.linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!selectedAcademic.rating) e.preventDefault();
                }}
                style={{
                  padding: "10px 16px", textAlign: "center", fontSize: 8, fontWeight: 700,
                  background: `${P.teal}12`, border: `1px solid ${P.teal}25`, color: P.teal,
                  borderRadius: 8, textDecoration: "none", cursor: "pointer",
                  opacity: 0.8, transition: "opacity 0.2s",
                }}
              >
                🔗 LinkedIn Profile ↗
              </a>
            </div>
          ) : (
            <div style={{
              background: P.card, border: `1px solid ${P.b}`, borderRadius: 10,
              padding: 30, textAlign: "center", height: 300, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center"
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👨‍🎓</div>
              <div style={{ fontSize: 8, color: P.t4, lineHeight: 1.6 }}>
                Select a faculty member<br />to view details and<br />rate their advocacy role
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}