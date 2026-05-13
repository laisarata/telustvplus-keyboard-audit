import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export type Status = 'Implemented' | 'Missing' | 'Partial' | 'To Be Audited';

const RESULTS_FILE = join(process.cwd(), 'test-results.json');

export function writeResult(
  category: string,
  shortcut: string,
  status: Status,
  notes: string = ''
) {
  const results: any[] = existsSync(RESULTS_FILE)
    ? JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'))
    : [];

  const currentBehavior =
    status === 'Implemented' ? 'Works as expected' :
    status === 'Missing'     ? 'Not implemented' :
    null; // Partial and To Be Audited keep their existing text

  const idx = results.findIndex(r => r.category === category && r.shortcut === shortcut);
  const entry = {
    category,
    shortcut,
    status,
    currentBehavior,
    notes,
    lastTested: new Date().toISOString().split('T')[0],
  };

  if (idx >= 0) results[idx] = entry;
  else results.push(entry);

  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  console.log(`  [${status}] ${category} → ${shortcut}${notes ? ` (${notes})` : ''}`);
}
