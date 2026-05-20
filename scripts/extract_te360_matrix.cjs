#!/usr/bin/env node
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'data', 'te360', 'TE360_Master_Matrix_v3_MERGED_6.xlsx');
const OUT_DIR = path.join(__dirname, '..', 'data', 'te360', 'extracted');
const JSON_OUT = path.join(__dirname, '..', 'src', 'data');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(JSON_OUT, { recursive: true });

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const wb = XLSX.readFile(SRC);
const bundle = {};

for (const sheetName of wb.SheetNames) {
  const sheet = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
  if (!aoa.length) continue;

  let headerIdx = 0;
  for (let i = 0; i < Math.min(aoa.length, 5); i++) {
    const nonEmpty = aoa[i].filter((c) => String(c).trim() !== '').length;
    if (nonEmpty >= 3) {
      headerIdx = i;
      break;
    }
  }
  const header = aoa[headerIdx].map((c, i) =>
    String(c).trim() || `col_${i}`
  );
  const rows = aoa
    .slice(headerIdx + 1)
    .filter((r) => r.some((c) => String(c).trim() !== ''))
    .map((r) => {
      const obj = {};
      for (let i = 0; i < header.length; i++) {
        obj[header[i]] = r[i] === undefined ? '' : r[i];
      }
      return obj;
    });

  const csv = XLSX.utils.sheet_to_csv(sheet);
  const csvPath = path.join(OUT_DIR, `${slug(sheetName)}.csv`);
  fs.writeFileSync(csvPath, csv);

  bundle[slug(sheetName)] = { sheet: sheetName, header, rows };
  console.log(`  ${sheetName}: ${rows.length} rows → ${path.basename(csvPath)}`);
}

const jsonPath = path.join(JSON_OUT, 'te360.json');
fs.writeFileSync(jsonPath, JSON.stringify(bundle, null, 2));
console.log(`\nBundle written: src/data/te360.json (${(fs.statSync(jsonPath).size / 1024).toFixed(1)} KB)`);
