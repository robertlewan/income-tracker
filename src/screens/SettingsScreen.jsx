import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { useData } from '../context/DataContext';
import { fromDateStr, fmtDateFull, toDateStr } from '../utils/dateUtils';

export default function SettingsScreen() {
  const { settings, updateSettings, entries, importData } = useData();
  const [importStatus, setImportStatus] = useState(null);
  const commissionPct = settings.commissionPct ?? 40;

  return (
    <div className="screen-content">

      {/* Commission rate */}
      <div className="card">
        <div className="card-label">Commission Rate</div>
        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65, marginBottom: 16 }}>
          The percentage of service charge that counts as your commission.
        </p>

        <label className="input-label">Your Commission %</label>
        <div className="input-field">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="1"
            value={commissionPct}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 100) {
                updateSettings({ commissionPct: val });
              }
            }}
            style={{ fontSize: 20, fontWeight: 700, flex: 1, border: 'none', background: 'none', outline: 'none' }}
          />
          <span style={{ fontSize: 20, color: 'var(--text3)', fontWeight: 600, marginLeft: 2 }}>%</span>
        </div>

        <div style={{ marginTop: 10, background: '#F0FDF4', borderRadius: 10, padding: '10px 14px' }}>
          <span style={{ fontSize: 13, color: 'var(--commission)', fontWeight: 500 }}>
            Example: $100 service charge → {fmtCommission(100, commissionPct)} commission
          </span>
        </div>
      </div>

      {/* Pay schedule */}
      <div className="card">
        <div className="card-label">Pay Schedule</div>
        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65, marginBottom: 16 }}>
          Enter any date that was (or will be) a payday. The app calculates all paydays
          automatically as every 2 weeks from that date.
        </p>

        <label className="input-label">Reference Payday</label>
        <div className="input-field">
          <input
            type="date"
            value={settings.refPayday || ''}
            onChange={e => e.target.value && updateSettings({ refPayday: e.target.value })}
            style={{ fontSize: 15, fontWeight: 500, flex: 1, border: 'none', background: 'none', outline: 'none' }}
          />
        </div>

        {settings.refPayday && (
          <div style={{ marginTop: 12, background: '#F5F3FF', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
              ✓ {fmtDateFull(fromDateStr(settings.refPayday))}
            </div>
            <div style={{ fontSize: 12, color: '#8B5CF6', marginTop: 3 }}>
              Biweekly · period is the 2 Mondays before payday week
            </div>
          </div>
        )}
      </div>

      {/* Export / Import */}
      <div className="card">
        <div className="card-label">Backup & Restore</div>
        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.65, marginBottom: 16 }}>
          Export all your data to a file, then import it on a new device to restore everything.
        </p>

        <button
          onClick={async () => {
            const backup = { entries, settings, exportedAt: new Date().toISOString(), version: 1 };
            const json = JSON.stringify(backup, null, 2);
            const filename = `income-backup-${toDateStr(new Date())}.json`;

            if (Capacitor.isNativePlatform()) {
              try {
                const { uri } = await Filesystem.writeFile({
                  path: filename,
                  data: json,
                  directory: Directory.Cache,
                  encoding: Encoding.UTF8,
                });
                await Share.share({ title: 'Income Tracker Backup', files: [uri] });
              } catch (err) {
                if (!String(err?.message).toLowerCase().includes('cancel')) {
                  setImportStatus('✕ Export failed');
                  setTimeout(() => setImportStatus(null), 4000);
                }
              }
              return;
            }

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 14, background: 'var(--primary-light)', border: '1.5px solid var(--primary)', color: 'var(--primary)', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
        >
          ↓ Export Backup ({entries.length} entries)
        </button>

        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const data = JSON.parse(ev.target.result);
                  if (!Array.isArray(data.entries)) throw new Error('Invalid format');
                  if (window.confirm(`Import ${data.entries.length} entries? This will merge with your existing data.`)) {
                    importData({ entries: data.entries, settings: data.settings });
                    setImportStatus(`✓ Imported ${data.entries.length} entries`);
                    setTimeout(() => setImportStatus(null), 4000);
                  }
                } catch {
                  setImportStatus('✕ Invalid backup file');
                  setTimeout(() => setImportStatus(null), 4000);
                }
              };
              reader.readAsText(file);
            };
            input.click();
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 14, background: 'var(--bg)', border: '1.5px solid var(--border)', color: 'var(--text2)', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
        >
          ↑ Import from Backup
        </button>

        {importStatus && (
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 14, fontWeight: 600, color: importStatus.startsWith('✓') ? 'var(--commission)' : 'var(--danger)' }}>
            {importStatus}
          </div>
        )}
      </div>

      {/* About */}
      <div className="card">
        <div className="card-label">About</div>
        <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7 }}>
          Income Tracker saves your tips and commissions directly on this device.
          Your data never leaves your phone — no account, no server, no internet required after install.
        </p>
      </div>

    </div>
  );
}

function fmtCommission(serviceAmt, pct) {
  return '$' + (serviceAmt * (pct / 100)).toFixed(2);
}
