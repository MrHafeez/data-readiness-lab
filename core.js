export const RAW_ORDERS = Object.freeze([
  { id: 'A101', date: '2026-04-02', region: 'Pune', channel: 'Web', revenue: '1200' },
  { id: 'A102', date: '2026-04-03', region: 'Mumbai', channel: 'Store', revenue: '900' },
  { id: 'A103', date: '2026-04-04', region: 'Pune', channel: ' web ', revenue: '700' },
  { id: 'A104', date: '2026-04-05', region: '', channel: 'Store', revenue: '650' },
  { id: 'A105', date: '2026-04-06', region: 'Mumbai', channel: 'WEB', revenue: 'N/A' },
  { id: 'A106', date: '2026-04-07', region: 'Pune', channel: 'Store', revenue: '1100' },
  { id: 'A107', date: '2026-04-08', region: 'Mumbai', channel: 'Web', revenue: '-40' },
  { id: 'A108', date: '2026-04-09', region: 'Pune', channel: 'Store', revenue: '800' },
  { id: 'A108', date: '2026-04-09', region: 'Pune', channel: 'Store', revenue: '800' },
  { id: 'A109', date: '2026-04-10', region: 'Mumbai', channel: 'Web', revenue: '500' },
  { id: 'A110', date: '2026-04-11', region: 'Pune', channel: 'Store', revenue: '450' },
  { id: 'A111', date: '2026-04-12', region: 'Mumbai', channel: 'Web', revenue: '1000' }
]);

const validRevenue = value => Number.isFinite(Number(value)) && String(value).trim() !== '' && Number(value) > 0;
const normalizeChannel = value => String(value).trim().toLowerCase() === 'web' ? 'Web' : String(value).trim();

export function audit(rows = RAW_ORDERS) {
  const seen = new Set();
  return rows.map((row, index) => {
    const flags = [];
    if (seen.has(row.id)) flags.push('Duplicate ID');
    seen.add(row.id);
    if (!row.region.trim()) flags.push('Missing region');
    if (!validRevenue(row.revenue)) flags.push('Invalid revenue');
    if (row.channel !== normalizeChannel(row.channel)) flags.push('Inconsistent channel');
    return { ...row, index, flags };
  });
}

export function prepare(rows = RAW_ORDERS, choices = {}) {
  const selected = {
    dedupe: Boolean(choices.dedupe),
    invalidRevenue: Boolean(choices.invalidRevenue),
    missingRegion: Boolean(choices.missingRegion),
    channel: Boolean(choices.channel)
  };
  const seen = new Set();
  const kept = [];
  const excluded = [];
  for (const original of rows) {
    const row = { ...original };
    if (selected.dedupe && seen.has(row.id)) { excluded.push({ row, reason: 'Duplicate ID' }); continue; }
    seen.add(row.id);
    if (selected.invalidRevenue && !validRevenue(row.revenue)) { excluded.push({ row, reason: 'Invalid revenue' }); continue; }
    if (selected.missingRegion && !row.region.trim()) row.region = 'Unknown';
    if (selected.channel) row.channel = normalizeChannel(row.channel);
    kept.push(row);
  }
  const usable = kept.filter(row => validRevenue(row.revenue));
  const total = usable.reduce((sum, row) => sum + Number(row.revenue), 0);
  const byChannel = usable.reduce((map, row) => {
    const key = row.channel || 'Unspecified';
    map[key] = (map[key] || 0) + Number(row.revenue);
    return map;
  }, {});
  return { kept, excluded, usableCount: usable.length, total, byChannel, selected };
}
