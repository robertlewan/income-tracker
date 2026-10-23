import { useState } from 'react';
import { useData } from '../context/DataContext';
import { toDateStr, fromDateStr, fmtDateLong, fmtMoney, sumEntries } from '../utils/dateUtils';

export default function HomeScreen() {
  const { addEntry, deleteEntry, getByDate, settings } = useData();
  const [tips, setTips] = useState('');
  const [serviceCharged, setServiceCharged] = useState('');
  const [cashTips, setCashTips] = useState('');
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));

  const commissionPct = settings.commissionPct ?? 40;
  const calcCommission = (parseFloat(serviceCharged) || 0) * (commissionPct / 100);

  const todayStr = toDateStr(new Date());
  const isToday = selectedDate === todayStr;
  const entries = getByDate(selectedDate);
  const totals = sumEntries(entries);

  const handleAdd = () => {
    const t = parseFloat(tips) || 0;
    const sc = parseFloat(serviceCharged) || 0;
    const c = sc * (commissionPct / 100);
    const ct = parseFloat(cashTips) || 0;
    if (!t && !sc && !ct) {
      alert('Enter an amount first.');
      return;
    }
    addEntry({ date: selectedDate, tips: t, serviceCharged: sc, commission: c, cashTips: ct });
    setTips('');
    setServiceCharged('');
    setCashTips('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this entry?')) deleteEntry(id);
  };

  const displayDate = isToday ? 'Today' : fmtDateLong(fromDateStr(selectedDate));

  return (
    <div className="screen-content">

      {/* Date header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>{displayDate}</h1>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Today
            </button>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          max={todayStr}
          onChange={e => e.target.value && setSelectedDate(e.target.value)}
          style={{ fontSize: 13, color: 'var(--text3)', background: 'none', border: 'none', outline: 'none', cursor: 'pointer', padding: 0 }}
        />
      </div>

      {/* Earnings card */}
      <div className="card">
        <div className="card-label">Earnings</div>
        <div className="big-amount">{fmtMoney(totals.total)}</div>
        <div className="split-row">
          <div className="split-item">
            <div className="split-dot" style={{ background: 'var(--tips)' }} />
            <div className="split-label">Tips</div>
            <div className="split-amount" style={{ color: 'var(--tips)' }}>{fmtMoney(totals.tips)}</div>
          </div>
          <div className="split-divider" />
          <div className="split-item">
            <div className="split-dot" style={{ background: 'var(--commission)' }} />
            <div className="split-label">Commission</div>
            <div className="split-amount" style={{ color: 'var(--commission)' }}>{fmtMoney(totals.commission)}</div>
          </div>
        </div>
        {totals.cashTips > 0 && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--cash)' }} />
              <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>Cash Tips <span style={{ fontSize: 11, fontWeight: 400 }}>(not in total)</span></span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--cash)' }}>{fmtMoney(totals.cashTips)}</span>
          </div>
        )}
      </div>

      {/* Add income form */}
      <div className="card">
        <div className="card-label">Add Income</div>

        <div className="input-group">
          <label className="input-label">Service Charged</label>
          <div className="input-field">
            <span className="currency-sym">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={serviceCharged}
              onChange={e => setServiceCharged(e.target.value)}
            />
          </div>
          {parseFloat(serviceCharged) > 0 && (
            <div style={{ marginTop: 7, fontSize: 13, color: 'var(--commission)', fontWeight: 600, paddingLeft: 2 }}>
              → Commission ({commissionPct}%): {fmtMoney(calcCommission)}
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Tips</label>
          <div className="input-field">
            <span className="currency-sym">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={tips}
              onChange={e => setTips(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" style={{ color: 'var(--cash)' }}>Cash Tips <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)' }}>(not added to total)</span></label>
          <div className="input-field" style={{ borderColor: parseFloat(cashTips) > 0 ? 'var(--cash)' : undefined }}>
            <span className="currency-sym" style={{ color: parseFloat(cashTips) > 0 ? 'var(--cash)' : undefined }}>$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={cashTips}
              onChange={e => setCashTips(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleAdd}>
          + Add Entry
        </button>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="card">
          <div className="card-label">Entries ({entries.length})</div>
          {entries.map((entry, i) => (
            <div key={entry.id} className="entry-row">
              <span className="entry-idx">#{i + 1}</span>
              <div className="entry-breakdown">
                {entry.serviceCharged > 0 ? (
                  <span className="entry-type" style={{ color: 'var(--commission)' }}>
                    Service {fmtMoney(entry.serviceCharged)} → Comm {fmtMoney(entry.commission)}
                  </span>
                ) : entry.commission > 0 ? (
                  <span className="entry-type" style={{ color: 'var(--commission)' }}>
                    Commission {fmtMoney(entry.commission)}
                  </span>
                ) : null}
                {entry.tips > 0 && (
                  <span className="entry-type" style={{ color: 'var(--tips)' }}>
                    Tips {fmtMoney(entry.tips)}
                  </span>
                )}
                {entry.cashTips > 0 && (
                  <span className="entry-type" style={{ color: 'var(--cash)' }}>
                    Cash Tips {fmtMoney(entry.cashTips)}
                  </span>
                )}
              </div>
              <span className="entry-total">{fmtMoney(entry.tips + entry.commission)}</span>
              <button className="delete-btn" onClick={() => handleDelete(entry.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
