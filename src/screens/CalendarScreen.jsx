import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { toDateStr, fromDateStr, fmtMoney, fmtDateLong, sumEntries } from '../utils/dateUtils';

export default function CalendarScreen() {
  const { getByDate, getInRange, entries, addEntry, deleteEntry, settings } = useData();
  const commissionPct = settings.commissionPct ?? 40;

  const today = new Date();
  const todayStr = toDateStr(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tips, setTips] = useState('');
  const [serviceCharged, setServiceCharged] = useState('');
  const [cashTips, setCashTips] = useState('');

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);

  // Grid starts on Sunday of first week
  const gridStart = new Date(firstDay);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  // Grid ends on Saturday of last week
  const gridEnd = new Date(lastDay);
  const endDow = gridEnd.getDay();
  if (endDow < 6) gridEnd.setDate(gridEnd.getDate() + (6 - endDow));

  const gridDates = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    gridDates.push(toDateStr(new Date(cur)));
    cur.setDate(cur.getDate() + 1);
  }

  // Pre-compute month entry map once
  const monthStart = toDateStr(firstDay);
  const monthEnd = toDateStr(lastDay);
  const monthEntries = useMemo(
    () => getInRange(monthStart, monthEnd),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, monthStart, monthEnd]
  );
  const monthByDate = useMemo(() => {
    const map = {};
    monthEntries.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [monthEntries]);

  const monthTotals = sumEntries(monthEntries);
  const monthDays = Object.keys(monthByDate).length;

  // YTD
  const ytdStart = toDateStr(new Date(today.getFullYear(), 0, 1));
  const ytdEntries = useMemo(
    () => getInRange(ytdStart, todayStr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, ytdStart, todayStr]
  );
  const ytdTotals = sumEntries(ytdEntries);

  // Selected day
  const selectedEntries = selectedDate ? (getByDate(selectedDate) || []) : [];
  const selectedTotals = sumEntries(selectedEntries);
  const calcCommission = (parseFloat(serviceCharged) || 0) * (commissionPct / 100);

  const handleAdd = () => {
    if (!selectedDate) return;
    const t = parseFloat(tips) || 0;
    const sc = parseFloat(serviceCharged) || 0;
    const ct = parseFloat(cashTips) || 0;
    if (!t && !sc && !ct) return;
    addEntry({ date: selectedDate, tips: t, serviceCharged: sc, commission: sc * (commissionPct / 100), cashTips: ct });
    setTips('');
    setServiceCharged('');
    setCashTips('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this entry?')) deleteEntry(id);
  };

  const closeSheet = () => {
    setSelectedDate(null);
    setTips('');
    setServiceCharged('');
    setCashTips('');
  };

  const openDay = (dateStr) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
    setTips('');
    setServiceCharged('');
    setCashTips('');
  };

  return (
    <div className="screen-content">

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="nav-btn" style={{ fontSize: 22, padding: '4px 8px' }} onClick={prevMonth}>‹</button>
        <span style={{ fontSize: 17, fontWeight: 700 }}>
          {firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button className="nav-btn" style={{ fontSize: 22, padding: '4px 8px' }} onClick={nextMonth}>›</button>
      </div>

      {/* Monthly stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: '#F0FDF4', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
            Month Total
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#15803D' }}>{fmtMoney(monthTotals.total)}</div>
        </div>
        <div style={{ width: 100, background: 'var(--card)', borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
            Days Worked
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{monthDays}</div>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ background: 'var(--card)', borderRadius: 18, overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 10px rgba(0,0,0,0.04)' }}>
        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '8px 0', fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: 0.3 }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {gridDates.map((dateStr, i) => {
            const date = fromDateStr(dateStr);
            const isCurrentMonth = date.getMonth() === viewMonth;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayEntryList = isCurrentMonth ? (monthByDate[dateStr] || []) : [];
            const dayTotals = sumEntries(dayEntryList);
            const hasData = dayTotals.total > 0;
            const col = i % 7;

            return (
              <div
                key={dateStr}
                onClick={() => isCurrentMonth && openDay(dateStr)}
                style={{
                  minHeight: 62,
                  padding: '5px 4px',
                  borderRight: col < 6 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < gridDates.length - 7 ? '1px solid var(--border)' : 'none',
                  background: isSelected
                    ? '#EDE9FE'
                    : hasData
                    ? '#F0FDF4'
                    : 'transparent',
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  transition: 'background 0.12s',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Date number */}
                <div style={{
                  fontSize: 12,
                  fontWeight: isToday ? 800 : 500,
                  color: isToday ? '#fff'
                    : !isCurrentMonth ? 'var(--border)'
                    : isSelected ? 'var(--primary)'
                    : 'var(--text)',
                  width: 20, height: 20, borderRadius: 10,
                  background: isToday ? 'var(--primary)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 3,
                }}>
                  {date.getDate()}
                </div>

                {/* Earnings */}
                {hasData && (
                  <>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#15803D', lineHeight: 1.2 }}>
                      {fmtMoney(dayTotals.total)}
                    </div>
                    {dayTotals.cashTips > 0 && (
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--cash)', lineHeight: 1.2, marginTop: 1 }}>
                        +{fmtMoney(dayTotals.cashTips)} cash
                      </div>
                    )}
                    <div style={{ fontSize: 9.5, color: '#86EFAC', marginTop: 1 }}>
                      {dayEntryList.length} {dayEntryList.length === 1 ? 'entry' : 'entries'}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* YTD summary */}
      <div className="card">
        <div className="card-label">Year to Date — {today.getFullYear()}</div>
        <div className="big-amount">{fmtMoney(ytdTotals.total)}</div>

        {ytdTotals.total > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 8 }}>
            <PieChart tips={ytdTotals.tips} commission={ytdTotals.commission} total={ytdTotals.total} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <LegendItem
                color="var(--tips)"
                label="Tips"
                amount={fmtMoney(ytdTotals.tips)}
                pct={((ytdTotals.tips / ytdTotals.total) * 100).toFixed(1)}
              />
              <LegendItem
                color="var(--commission)"
                label="Commission"
                amount={fmtMoney(ytdTotals.commission)}
                pct={((ytdTotals.commission / ytdTotals.total) * 100).toFixed(1)}
              />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14, paddingTop: 8 }}>
            No entries yet this year
          </div>
        )}
      </div>

      {/* Day detail bottom sheet */}
      {selectedDate && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={closeSheet}
        >
          <div
            style={{
              background: 'var(--card)',
              width: '100%',
              borderRadius: '24px 24px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{fmtDateLong(fromDateStr(selectedDate))}</div>
                {selectedTotals.total > 0 && (
                  <div style={{ fontSize: 13, color: '#16A34A', fontWeight: 600, marginTop: 3 }}>
                    {fmtMoney(selectedTotals.total)} · Tips {fmtMoney(selectedTotals.tips)} · Comm {fmtMoney(selectedTotals.commission)}
                    {selectedTotals.cashTips > 0 && (
                      <span style={{ color: 'var(--cash)' }}> · Cash {fmtMoney(selectedTotals.cashTips)}</span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={closeSheet} style={{ width: 28, height: 28, borderRadius: 14, background: '#E5E5EA', border: 'none', fontSize: 13, fontWeight: 700, color: 'var(--text2)', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>✕</button>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 20px' }}>

              {/* Existing entries */}
              {selectedEntries.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>Entries</div>
                  {selectedEntries.map((entry, i) => (
                    <div key={entry.id} className="entry-row">
                      <span className="entry-idx">#{i + 1}</span>
                      <div className="entry-breakdown">
                        {entry.serviceCharged > 0 ? (
                          <span className="entry-type" style={{ color: 'var(--commission)' }}>
                            Service {fmtMoney(entry.serviceCharged)} → Comm {fmtMoney(entry.commission)}
                          </span>
                        ) : entry.commission > 0 ? (
                          <span className="entry-type" style={{ color: 'var(--commission)' }}>Commission {fmtMoney(entry.commission)}</span>
                        ) : null}
                        {entry.tips > 0 && (
                          <span className="entry-type" style={{ color: 'var(--tips)' }}>Tips {fmtMoney(entry.tips)}</span>
                        )}
                        {entry.cashTips > 0 && (
                          <span className="entry-type" style={{ color: 'var(--cash)' }}>Cash Tips {fmtMoney(entry.cashTips)}</span>
                        )}
                      </div>
                      <span className="entry-total">{fmtMoney(entry.tips + entry.commission)}</span>
                      <button className="delete-btn" onClick={() => handleDelete(entry.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add entry */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>Add Entry</div>

                <div className="input-group">
                  <label className="input-label">Service Charged</label>
                  <div className="input-field">
                    <span className="currency-sym">$</span>
                    <input
                      type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
                      value={serviceCharged}
                      onChange={e => setServiceCharged(e.target.value)}
                    />
                  </div>
                  {parseFloat(serviceCharged) > 0 && (
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--commission)', fontWeight: 600, paddingLeft: 2 }}>
                      → Commission ({commissionPct}%): {fmtMoney(calcCommission)}
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Tips</label>
                  <div className="input-field">
                    <span className="currency-sym">$</span>
                    <input
                      type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
                      value={tips}
                      onChange={e => setTips(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" style={{ color: 'var(--cash)' }}>Cash Tips <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>(not in total)</span></label>
                  <div className="input-field" style={{ borderColor: parseFloat(cashTips) > 0 ? 'var(--cash)' : undefined }}>
                    <span className="currency-sym" style={{ color: parseFloat(cashTips) > 0 ? 'var(--cash)' : undefined }}>$</span>
                    <input
                      type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00"
                      value={cashTips}
                      onChange={e => setCashTips(e.target.value)}
                    />
                  </div>
                </div>

                <button className="btn-primary" onClick={handleAdd}>+ Add Entry</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function PieChart({ tips, commission, total }) {
  const tipsPct = (tips / total) * 100;
  return (
    <div style={{
      width: 100, height: 100, borderRadius: '50%', flexShrink: 0,
      background: `conic-gradient(var(--tips) 0% ${tipsPct}%, var(--commission) ${tipsPct}% 100%)`,
    }} />
  );
}

function LegendItem({ color, label, amount, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, paddingLeft: 16 }}>{amount}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', paddingLeft: 16 }}>{pct}%</div>
    </div>
  );
}
