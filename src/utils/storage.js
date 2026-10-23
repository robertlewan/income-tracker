const KEYS = {
  ENTRIES: 'income_entries',
  SETTINGS: 'income_settings',
};

export function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ENTRIES) || '[]');
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || 'null');
  } catch {
    return null;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
