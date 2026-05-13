import ExcelJS from './node_modules/exceljs/dist/es5/exceljs.nodejs.js';
import { readFileSync, existsSync } from 'fs';

const XLSX = 'TTV_Keyboard_Accessibility_Audit.xlsx';
const RESULTS = 'test-results.json';
const SHEET = 'Keyboard Shortcut Audit';
const CURRENT_BEHAVIOR_COL = 3;
const STATUS_COL = 5;
const LAST_TESTED_COL = 8;

export default async function globalTeardown() {
  if (!existsSync(RESULTS)) {
    console.log('No test-results.json found — skipping spreadsheet update.');
    return;
  }

  const results = JSON.parse(readFileSync(RESULTS, 'utf-8'));
  if (!results.length) return;

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(XLSX);
  const ws = wb.getWorksheet(SHEET);

  // Ensure "Last Tested" header exists in col 8
  const headerRow = ws.getRow(2);
  if (!headerRow.getCell(LAST_TESTED_COL).value) {
    headerRow.getCell(LAST_TESTED_COL).value = 'Last Tested';
    headerRow.getCell(LAST_TESTED_COL).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 10 };
    headerRow.getCell(LAST_TESTED_COL).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
    headerRow.getCell(LAST_TESTED_COL).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getColumn(LAST_TESTED_COL).width = 14;
  }

  let updated = 0;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber < 3) return;
    const cat = row.getCell(1).value?.toString().trim();
    const shortcut = row.getCell(2).value?.toString().trim();
    const match = results.find((r) => r.category === cat && r.shortcut === shortcut);
    if (!match) return;

    // TTV+ Current Behavior: prefer specific notes, fall back to generic text
    const behaviorText = match.notes
      ? match.notes
      : match.currentBehavior ?? null;

    if (behaviorText) {
      row.getCell(CURRENT_BEHAVIOR_COL).value = behaviorText;
      row.getCell(CURRENT_BEHAVIOR_COL).font = { name: 'Arial', size: 9 };
      row.getCell(CURRENT_BEHAVIOR_COL).alignment = { vertical: 'middle', wrapText: true };
    }

    // Update Status
    row.getCell(STATUS_COL).value = match.status;

    // Update Last Tested
    row.getCell(LAST_TESTED_COL).value = match.lastTested;
    row.getCell(LAST_TESTED_COL).font = { name: 'Arial', size: 9 };
    row.getCell(LAST_TESTED_COL).alignment = { horizontal: 'center', vertical: 'middle' };

    updated++;
  });

  await wb.xlsx.writeFile(XLSX);
  console.log(`\n✅ Spreadsheet updated — ${updated} rows written to ${XLSX}`);
}
