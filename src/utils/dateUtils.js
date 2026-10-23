/** Format Date as YYYY-MM-DD in local time */
export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD to local midnight Date */
export function fromDateStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Add n days to a Date, return new Date */
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Monday of the week containing `date` */
export function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/** First day of the month */
export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Last day of the month */
export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Sum tips, commission, cashTips from entries. cashTips is NOT included in total. */
export function sumEntries(entries) {
  return entries.reduce(
    (acc, e) => ({
      tips: acc.tips + (e.tips || 0),
      commission: acc.commission + (e.commission || 0),
      cashTips: acc.cashTips + (e.cashTips || 0),
      total: acc.total + (e.tips || 0) + (e.commission || 0),
    }),
    { tips: 0, commission: 0, cashTips: 0, total: 0 }
  );
}

/** Format as dollar amount */
export function fmtMoney(n) {
  return '$' + n.toFixed(2);
}

/** "Jun 20" or "Jun 20, 2025" */
export function fmtDate(date, showYear = false) {
  const opts = { month: 'short', day: 'numeric' };
  if (showYear) opts.year = 'numeric';
  return date.toLocaleDateString('en-US', opts);
}

/** "Friday, June 20" */
export function fmtDateLong(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "Fri, Jun 20, 2026" */
export function fmtDateFull(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

/** Unique id */
export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Given a reference payday string, find the most recent payday ≤ today.
 * Paydays repeat every 14 days.
 */
export function getMostRecentPayday(refPaydayStr) {
  const ref = fromDateStr(refPaydayStr);
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayMidnight - ref) / 86400000);
  const cycles = Math.floor(diffDays / 14);
  return addDays(ref, cycles * 14);
}

/**
 * For a payday date, return the income period it covers.
 * Find the Monday of the payday's week, then period = [that Monday − 14, that Monday].
 * e.g. payday Thu Jun 25 → payWeekMonday Jun 22 → period Jun 8 to Jun 22
 */
export function getPayPeriod(paydayDate) {
  const day = paydayDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const payWeekMonday = addDays(paydayDate, -daysFromMonday);
  const start = addDays(payWeekMonday, -14);
  const end = payWeekMonday;
  return { start, end, startStr: toDateStr(start), endStr: toDateStr(end) };
}
