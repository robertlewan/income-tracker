import { useData } from '../context/DataContext';
import {
  getMostRecentPayday, getPayPeriod, addDays,
  toDateStr, fromDateStr, fmtMoney, fmtDate, fmtDateFull, sumEntries,
} from '../utils/dateUtils';

export default function PaycheckScreen() {
  const { settings, getInRange } = useData();

  if (!settings.refPayday) {
    return (
      <div className="screen-content" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💸</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Set Up Your Payday</div>
        <div style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.65, maxWidth: 280, margin: '0 auto' }}>
          Go to the Settings tab and pick a reference payday to start seeing paycheck estimates.
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayStr = toDateStr(today);

  // Most recent payday ≤ today
  const lastPayday = getMostRecentPayday(settings.refPayday);

  // Next paycheck: earned period → [lastPayday-6, lastPayday+7], paid on lastPayday+14
  const nextPayday = addDays(lastPayday, 14);
  const nextPeriod = getPayPeriod(nextPayday);
  const nextEntries = getInRange(nextPeriod.startStr, nextPeriod.endStr);
  const nextTotals  = sumEntries(nextEntries);
  const nextLocked  = todayStr > nextPeriod.endStr;
  const nextDaysLeft = nextLocked ? 0
    : Math.max(0, Math.ceil((fromDateStr(nextPeriod.endStr) - today) / 86400000));
  const daysUntilPay = Math.max(0, Math.ceil((nextPayday - today) / 86400000));

  // Following paycheck: period → [lastPayday+8, lastPayday+21], paid on lastPayday+28
  const followingPayday  = addDays(lastPayday, 28);
  const followingPeriod  = getPayPeriod(followingPayday);
  const followingEntries = getInRange(followingPeriod.startStr, followingPeriod.endStr);
  const followingTotals  = sumEntries(followingEntries);
  const followingDaysLeft = Math.max(0, Math.ceil((fromDateStr(followingPeriod.endStr) - today) / 86400000));

  return (
    <div className="screen-content">

      {/* Next payday banner */}
      <div style={{
        background: 'var(--primary)', borderRadius: 20,
        padding: '24px 20px', marginBottom: 12, textAlign: 'center', color: '#fff',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          Next Payday
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
          {fmtDateFull(nextPayday)}
        </div>
        <div style={{ fontSize: 15, opacity: 0.9, marginTop: 4 }}>
          {daysUntilPay === 0
            ? '🎉 Payday!'
            : `${daysUntilPay} day${daysUntilPay !== 1 ? 's' : ''} away`}
        </div>
      </div>

      {/* Next paycheck card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>
            {nextLocked ? '✅ Locked In' : '⏳ Accumulating'}
          </div>
          <Badge
            label={nextLocked ? 'Processing' : `${nextDaysLeft}d left in period`}
            bg={nextLocked ? '#D1FAE5'     : '#FEF3C7'}
            color={nextLocked ? '#065F46'  : '#92400E'}
          />
        </div>

        <div className="big-amount">{fmtMoney(nextTotals.total)}</div>

        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
          Period: {fmtDate(fromDateStr(nextPeriod.startStr))} → {fmtDate(fromDateStr(nextPeriod.endStr))}
        </div>

        <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--tips)' }}>
            Tips {fmtMoney(nextTotals.tips)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--commission)' }}>
            Comm {fmtMoney(nextTotals.commission)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
          Paid on {fmtDateFull(nextPayday)}
        </div>
      </div>

      {/* Following paycheck card */}
      <div className="card" style={{ opacity: 0.88 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>🔮 After That</div>
          <Badge
            label={`${followingDaysLeft}d left`}
            bg="var(--primary-light)"
            color="var(--primary)"
          />
        </div>

        <div className="big-amount">{fmtMoney(followingTotals.total)}</div>

        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
          Period: {fmtDate(fromDateStr(followingPeriod.startStr))} → {fmtDate(fromDateStr(followingPeriod.endStr))}
        </div>

        <div style={{ display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--tips)' }}>
            Tips {fmtMoney(followingTotals.tips)}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--commission)' }}>
            Comm {fmtMoney(followingTotals.commission)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
          Paid on {fmtDateFull(followingPayday)}
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ background: '#F5F3FF' }}>
        <div className="card-label">How It Works</div>
        <div style={{ fontSize: 14, color: '#6D28D9', lineHeight: 1.65 }}>
          Your paycheck covers from the 2nd Monday before your payday week, to the Monday before your payday week.
          For example, payday Thursday Jun 25 → period Mon Jun 8 to Mon Jun 15.
        </div>
      </div>

    </div>
  );
}

function Badge({ label, bg, color }) {
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99,
    }}>
      {label}
    </span>
  );
}
