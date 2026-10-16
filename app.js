import { RAW_ORDERS, audit, prepare } from './core.js';

const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const audited = audit();
const tbody = $('raw-body');
for (const row of audited) {
  const tr = document.createElement('tr');
  for (const value of [row.id, row.date, row.region || '— blank —', row.channel, row.revenue]) {
    const td = document.createElement('td'); td.textContent = value; tr.append(td);
  }
  const flags = document.createElement('td');
  if (row.flags.length) row.flags.forEach(flag => { const tag = document.createElement('span'); tag.className = 'flag'; tag.textContent = flag; flags.append(tag); });
  else { flags.className = 'ok'; flags.textContent = 'No flag'; }
  tr.append(flags); tbody.append(tr);
}
$('issue-count').textContent = `${audited.filter(row => row.flags.length).length} flagged rows`;

function render() {
  const result = prepare(RAW_ORDERS, Object.fromEntries(['dedupe','invalidRevenue','missingRegion','channel'].map(id => [id, $(id).checked])));
  $('retained').textContent = result.kept.length;
  $('excluded').textContent = result.excluded.length;
  $('usable').textContent = result.usableCount;
  $('total').textContent = money(result.total);
  const all = result.selected.dedupe && result.selected.invalidRevenue && result.selected.missingRegion && result.selected.channel;
  $('result-note').textContent = all ? 'All four proposed treatments are applied. Review what was set aside and how your result is defined.' : 'This is a provisional chart. Any unchecked issue still needs a decision or a documented limitation.';
  $('interpretation').textContent = all
    ? `The cleaned example shows Store at ${money(result.byChannel.Store)} and Web at ${money(result.byChannel.Web)}. That is a revenue comparison—not profit or proof that one channel is better. Confirm the negative value with the data owner before a real decision.`
    : 'The chart is incomplete as an analytical conclusion: explain unchecked issues before recommending a channel. Valid positive values are charted; invalid values never enter the sum.';
  const bars = $('bars'); bars.replaceChildren();
  const max = Math.max(...Object.values(result.byChannel), 1);
  for (const [label,value] of Object.entries(result.byChannel).sort((a,b) => b[1]-a[1])) {
    const line = document.createElement('div'); line.className = 'barrow';
    const name = document.createElement('span'); name.textContent = label;
    const track = document.createElement('div'); track.className = 'bartrack';
    const fill = document.createElement('div'); fill.className = 'barfill'; fill.style.width = `${100*value/max}%`; track.append(fill);
    const amount = document.createElement('span'); amount.textContent = money(value); line.append(name,track,amount); bars.append(line);
  }
  bars.setAttribute('aria-label', `Revenue by channel: ${Object.entries(result.byChannel).map(([k,v]) => `${k} ${money(v)}`).join(', ')}`);
  const list = $('exclusions'); list.replaceChildren();
  if (!result.excluded.length) { const li = document.createElement('li'); li.textContent = 'None set aside yet.'; list.append(li); }
  else result.excluded.forEach(({row,reason}) => { const li = document.createElement('li'); li.textContent = `${row.id}: ${reason}`; list.append(li); });
}
$('apply').addEventListener('click', () => { render(); $('result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });
$('reset').addEventListener('click', () => { for (const id of ['dedupe','invalidRevenue','missingRegion','channel']) $(id).checked = false; render(); });
render();
