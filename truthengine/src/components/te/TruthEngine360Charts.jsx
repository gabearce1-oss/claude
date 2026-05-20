import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { P } from "../../lib/teData";

const DEPORTATION_DATA = [
  { year: 2022, total: 5431, ptsd: 3859 },
  { year: 2023, total: 31395, ptsd: 22032 },
  { year: 2024, total: 35344, ptsd: 23527 },
  { year: 2025, total: 105573, ptsd: 42836 },
  { year: "2026 (Jan-Mar)", total: 25083, ptsd: 8293 },
];

const VIETNAM_ERA_DATA = [
  { year: 2022, apprehended: 42, ptsd: 10 },
  { year: 2023, apprehended: 79, ptsd: 24 },
  { year: 2024, apprehended: 113, ptsd: 35 },
  { year: 2025, apprehended: 322, ptsd: 166 },
  { year: "2026", apprehended: 82, ptsd: 28 },
];

export function DeportationTrendChart() {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DEPORTATION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P.red} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={P.red} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPTSD" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={P.teal} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={P.teal} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
          <XAxis dataKey="year" stroke={P.t4} style={{ fontSize: 11 }} />
          <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
            labelStyle={{ color: P.t1 }}
          />
          <Legend />
          <Area type="monotone" dataKey="total" stroke={P.red} fill="url(#colorTotal)" name="Total Deported" />
          <Area type="monotone" dataKey="ptsd" stroke={P.teal} fill="url(#colorPTSD)" name="PTSD-Probable" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VietnamEraChart() {
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={VIETNAM_ERA_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
          <XAxis dataKey="year" stroke={P.t4} style={{ fontSize: 11 }} />
          <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
            labelStyle={{ color: P.t1 }}
          />
          <Legend />
          <Bar dataKey="apprehended" fill={P.red} name="Apprehended" />
          <Bar dataKey="ptsd" fill={P.amber} name="PTSD-Probable" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeportationByEraChart() {
  const eraData = [
    { era: "2022 Biden", bidenTotal: 5431, bidenPTSD: 3859, trumpTotal: 0, trumpPTSD: 0 },
    { era: "2023", bidenTotal: 31395, bidenPTSD: 22032, trumpTotal: 0, trumpPTSD: 0 },
    { era: "2024", bidenTotal: 35344, bidenPTSD: 23527, trumpTotal: 0, trumpPTSD: 0 },
    { era: "2025 Trump", bidenTotal: 0, bidenPTSD: 0, trumpTotal: 105573, trumpPTSD: 42836 },
    { era: "2026 (partial)", bidenTotal: 0, bidenPTSD: 0, trumpTotal: 25083, trumpPTSD: 8293 },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={eraData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={P.b} />
          <XAxis dataKey="era" stroke={P.t4} style={{ fontSize: 11 }} />
          <YAxis stroke={P.t4} style={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{ background: P.card, border: `1px solid ${P.b}`, borderRadius: 6 }}
            labelStyle={{ color: P.t1 }}
          />
          <Legend />
          <Bar dataKey="bidenTotal" fill={P.blue} name="Biden Era (Total)" />
          <Bar dataKey="bidenPTSD" fill={`${P.blue}80` } name="Biden Era (PTSD)" />
          <Bar dataKey="trumpTotal" fill={P.red} name="Trump Era (Total)" />
          <Bar dataKey="trumpPTSD" fill={`${P.red}80`} name="Trump Era (PTSD)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}