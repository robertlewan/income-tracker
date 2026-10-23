import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadEntries, saveEntries, loadSettings, saveSettings } from '../utils/storage';
import { genId } from '../utils/dateUtils';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [entries, setEntries] = useState(() => loadEntries());
  const [settings, setSettings] = useState(() => loadSettings() ?? { refPayday: null, commissionPct: 40 });

  useEffect(() => { saveEntries(entries); }, [entries]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const addEntry = useCallback(({ date, tips, serviceCharged, commission, cashTips }) => {
    setEntries(prev => [...prev, { id: genId(), date, tips, serviceCharged: serviceCharged || 0, commission, cashTips: cashTips || 0 }]);
  }, []);

  const importData = useCallback(({ entries: importedEntries, settings: importedSettings }) => {
    if (Array.isArray(importedEntries)) setEntries(importedEntries);
    if (importedSettings && typeof importedSettings === 'object') {
      setSettings(prev => ({ ...prev, ...importedSettings }));
    }
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getByDate = useCallback((dateStr) =>
    entries.filter(e => e.date === dateStr), [entries]);

  const getInRange = useCallback((startStr, endStr) =>
    entries.filter(e => e.date >= startStr && e.date <= endStr), [entries]);

  const updateSettings = useCallback((patch) =>
    setSettings(prev => ({ ...prev, ...patch })), []);

  return (
    <DataContext.Provider value={{
      entries, settings,
      addEntry, deleteEntry,
      getByDate, getInRange,
      updateSettings, importData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
