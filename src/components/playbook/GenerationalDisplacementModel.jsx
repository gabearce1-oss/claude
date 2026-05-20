import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

// Documented Generation-6 cohort size per the family tree.
const GEN6_COUNT = 94;
// Generations from Aviana (Gen 2, c. 1878) to Gen 6 == 4 generational steps.
const GENERATIONS_FROM_AVIANA = 4;
// Years from the asserted 1907 Aviana property deeds to "now" (2026).
const YEARS_1907_TO_2026 = 119;

const fmtMoney = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)} M`
    : `$${Math.round(n).toLocaleString()}`;

export default function GenerationalDisplacementModel() {
  const [baseValue, setBaseValue] = useState(3000);

  const r0 = useMemo(
    () => Math.pow(GEN6_COUNT, 1 / GENERATIONS_FROM_AVIANA),
    []
  );

  const scenarios = useMemo(() => {
    const compound = (rate) =>
      baseValue * Math.exp(rate * YEARS_1907_TO_2026);
    return [
      {
        label: '3% — conservative',
        rate: 0.03,
        total: compound(0.03),
      },
      {
        label: '5% — productive land + mining',
        rate: 0.05,
        total: compound(0.05),
      },
    ].map((s) => ({ ...s, perDescendant: s.total / GEN6_COUNT }));
  }, [baseValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded my-6"
      style={{ backgroundColor: '#ffffff', border: '1px solid #d4cdb8' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4" style={{ color: '#1a1815' }} />
        <p
          className="text-xs uppercase tracking-wider"
          style={{
            color: '#6b6559',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.2em',
          }}
        >
          Live Generational Displacement Calculator
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div
          className="p-3 rounded"
          style={{ backgroundColor: '#f9f5ed', border: '1px solid #d4cdb8' }}
        >
          <p
            className="text-xs uppercase mb-1"
            style={{
              color: '#6b6559',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
            }}
          >
            R₀ — Net Replacement Rate
          </p>
          <p
            className="text-3xl font-light"
            style={{ color: '#1a1815', fontFamily: 'Cormorant Garamond', lineHeight: 1 }}
          >
            {r0.toFixed(2)}
          </p>
          <p className="text-xs mt-2" style={{ color: '#6b6559' }}>
            R₀ = ({GEN6_COUNT})^(1/{GENERATIONS_FROM_AVIANA}). The cohort
            reproduced at ≈ 3× replacement each generation. Biological
            capacity intact.
          </p>
        </div>

        <div
          className="p-3 rounded"
          style={{ backgroundColor: '#f9f5ed', border: '1px solid #d4cdb8' }}
        >
          <p
            className="text-xs uppercase mb-2"
            style={{
              color: '#6b6559',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.1em',
            }}
          >
            Base 1907 Asset Value (USD)
          </p>
          <input
            type="number"
            value={baseValue}
            onChange={(e) =>
              setBaseValue(Math.max(0, Number(e.target.value) || 0))
            }
            min={0}
            step={500}
            className="w-full px-2 py-1 rounded text-sm"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #d4cdb8',
              color: '#1a1815',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <p className="text-xs mt-2" style={{ color: '#6b6559' }}>
            Conservative starting point: $3,000 USD for the 1907 land,
            water rights, and mining-adjacent access asserted in Aviana's
            name. Adjust to test alternative valuations.
          </p>
        </div>
      </div>

      <table
        className="w-full text-sm border-collapse"
        style={{ border: '1px solid #d4cdb8' }}
      >
        <thead>
          <tr style={{ backgroundColor: '#ebe1ce' }}>
            <th
              className="text-left px-3 py-2"
              style={{ border: '1px solid #d4cdb8', color: '#1a1815' }}
            >
              Compound rate
            </th>
            <th
              className="text-right px-3 py-2"
              style={{ border: '1px solid #d4cdb8', color: '#1a1815' }}
            >
              Multiplier (e^{`{r·t}`})
            </th>
            <th
              className="text-right px-3 py-2"
              style={{ border: '1px solid #d4cdb8', color: '#1a1815' }}
            >
              Total 2026 value
            </th>
            <th
              className="text-right px-3 py-2"
              style={{ border: '1px solid #d4cdb8', color: '#1a1815' }}
            >
              Per Gen-6 descendant (n={GEN6_COUNT})
            </th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr key={s.label}>
              <td
                className="px-3 py-2"
                style={{ border: '1px solid #d4cdb8' }}
              >
                {s.label}
              </td>
              <td
                className="px-3 py-2 text-right"
                style={{
                  border: '1px solid #d4cdb8',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#1a1815',
                }}
              >
                ×{Math.exp(s.rate * YEARS_1907_TO_2026).toFixed(1)}
              </td>
              <td
                className="px-3 py-2 text-right"
                style={{
                  border: '1px solid #d4cdb8',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#1a1815',
                  fontWeight: 600,
                }}
              >
                {fmtMoney(s.total)}
              </td>
              <td
                className="px-3 py-2 text-right"
                style={{
                  border: '1px solid #d4cdb8',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#1a1815',
                }}
              >
                {fmtMoney(s.perDescendant)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs mt-3 italic" style={{ color: '#6b6559' }}>
        Model: N_t = N₀ × e^(r·t), per TSU B412 reference. Numbers are
        displacement quantification, not restitution figures. Methodology
        mirrors the Lloyd's of London 2020 acknowledgment and the
        IACHR <em>Tribu Yaqui v. Mexico</em> settlement framework.
      </p>
    </motion.div>
  );
}
