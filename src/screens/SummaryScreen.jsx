import { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  toDateStr, fromDateStr, addDays,
  startOfWeek, startOfMonth, endOfMonth,
  getMostRecentPayday, getPayPeriod,
  sumEntries, fmtMoney, fmtDate,
} from '../utils/dateUtils';

const PERIODS = ['Week', 'Pay Period', 'Month'];

export default function SummaryScreen() {
  const { getInRange, settings } = useData();
  const [period, setPeriod] = useState('Week');
  const [offset, setOffset] = useState(0);

  const today = new Date();

  function getBounds() {
    if (period === 'Week') {
      const s = addDays(startOfWeek(today), offset * 7);
      return { start: s, end: addDays(s, 6) };
    }
    if (period === 'Pay Period') {
      if (!settings.refPayday) return null;
      const lastPayday = getMostRecentPayday(settings.refPayday);
      const nextPayday = addDays(lastPayday, 14);
      // offset 0 = current accumulation period, -1 = previous, +1 = next, etc.
      const effectivePayday = addDays(nextPayday, offset * 14);
      const pp = getPayPeriod(effectivePayday);
      return { start: pp.start, end: pp.end };
    }
    // Month
    const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return { start: startOfMonth(base), end: endOfMonth(base) };
  }

  const bounds = getBounds();

  function periodLabel() {
    if (!bounds) return 'Set payday in Settings';
    const { start, end } = bounds;
    if (period === 'Month') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `${fmtDate(start)} – ${fmtDate(end)}`;
  }

  // No payday configured for Pay Period view
  if (period === 'Pay Period' && !settings.refPayday) {
    return (
      <div className="screen-content">
        <div className="toggle-group" style={{ marginBottom: 14 }}>
          {PERIODS.map(p => (
            <button key={p} className={`toggle-btn ${period === p ? 'active' : ''}`}
              onClick={() => { setPeriod(p); setOffset(0); }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)', fontSize: 15 }}>
          Set up your payday in the Settings tab to use Pay Period view.
        </div>
      </div>
    );
  }

  const { start, end } = bounds;
  const startStr = toDateStr(start);
  const endStr = toDateStr(end);
  const entries = getInRange(startStr, endStr);
  const totals = sumEntries(entries);

  const byDate = {};
  entries.forEach(e => {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  });
  const dates = Object.keys(byDate).sort().reverse();

  const tipsPct = totals.total > 0 ? (totals.tips / totals.total) * 100 : 0;
  const commPct = totals.total > 0 ? (totals.commission / totals.total) * 100 : 0;

  return (
    <div className="screen-content">

      {/* Period toggle */}
      <div className="toggle-group" style={{ marginBottom: 14 }}>
        {PERIODS.map(p => (
          <button
            key={p}
            className={`toggle-btn ${period === p ? 'active' : ''}`}
            onClick={() => { setPeriod(p); setOffset(0); }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <button className="nav-btn" onClick={() => setOffset(o => o - 1)}>‹ Prev</button>
        <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'center', flex: 1 }}>{periodLabel()}</span>
        <button className="nav-btn" onClick={() => setOffset(o => o + 1)}>Next ›</button>
      </div>

      {/* Summary card */}
      <div className="card">
        <div className="card-label">Total Earned</div>
        <div className="big-amount">{fmtMoney(totals.total)}</div>

        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <StatCol label="Tips"       value={fmtMoney(totals.tips)}      color="var(--tips)" />
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          <StatCol label="Commission" value={fmtMoney(totals.commission)} color="var(--commission)" />
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          <StatCol label="Days"       value={String(dates.length)}        color="var(--text)" />
        </div>

        {dates.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            Avg / day worked: {fmtMoney(totals.total / dates.length)}
          </div>
        )}
      </div>

      {/* Cash Tips card (separate — not in total) */}
      {totals.cashTips > 0 && (
        <div className="card" style={{ background: 'var(--cash-light)', borderLeft: '4px solid var(--cash)' }}>
          <div className="card-label" style={{ color: 'var(--cash)' }}>Cash Tips <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text3)', textTransform: 'none', letterSpacing: 0 }}>· not included in total above</span></div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--cash)', letterSpacing: -1 }}>{fmtMoney(totals.cashTips)}</div>
        </div>
      )}

      {/* Breakdown bar */}
      {totals.total > 0 && (
        <div className="card">
          <div className="card-label">Breakdown</div>
          <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: `${tipsPct}%`, background: 'var(--tips)', transition: 'width 0.3s' }} />
            <div style={{ width: `${commPct}%`, background: 'var(--commission)', transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Legend color="var(--tips)"       label={`Tips ${tipsPct.toFixed(0)}%`} />
            <Legend color="var(--commission)" label={`Commission ${commPct.toFixed(0)}%`} />
          </div>
        </div>
      )}

      {/* Day-by-day */}
      {dates.length > 0 ? (
        <div className="card">
          <div className="card-label">Day by Day</div>
          {dates.map((date, i) => {
            const d = fromDateStr(date);
            const dt = sumEntries(byDate[date]);
            return (
              <div key={date} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 11, paddingBottom: 11,
                borderBottom: i < dates.length - 1 ? '1px solid #F2F2F7' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    Tips {fmtMoney(dt.tips)} · Comm {fmtMoney(dt.commission)}
                    {dt.cashTips > 0 && <span style={{ color: 'var(--cash)' }}> · Cash {fmtMoney(dt.cashTips)}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(dt.total)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 15 }}>
          No entries this period
        </div>
      )}

    </div>
  );
}

function StatCol({ label, value, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--text3)' }}>{label}</span>
    </div>
  );
}
