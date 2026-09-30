/**
 * DealFlow Saved Loot (Favorites / Bookmarks) Utility
 * Persists saved deal IDs to localStorage with cross-component reactivity
 */

const STORAGE_KEY = 'dealflow_saved_deals_v1';
const EVENT_NAME = 'dealflow_saved_deals_changed';

export function getSavedDealIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDealId(id: string): string[] {
  if (typeof window === 'undefined' || !id) return [];
  try {
    const current = getSavedDealIds();
    if (!current.includes(id)) {
      const next = [id, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
      return next;
    }
    return current;
  } catch {
    return [];
  }
}

export function removeSavedDealId(id: string): string[] {
  if (typeof window === 'undefined' || !id) return [];
  try {
    const current = getSavedDealIds();
    const next = current.filter((item) => item !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    return next;
  } catch {
    return [];
  }
}

export function toggleSavedDealId(id: string): { isSaved: boolean; list: string[] } {
  const current = getSavedDealIds();
  const exists = current.includes(id);
  if (exists) {
    const next = removeSavedDealId(id);
    return { isSaved: false, list: next };
  } else {
    const next = saveDealId(id);
    return { isSaved: true, list: next };
  }
}

export function isDealSaved(id: string): boolean {
  return getSavedDealIds().includes(id);
}

export function subscribeSavedDeals(callback: (ids: string[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<string[]>;
    callback(custom.detail || getSavedDealIds());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSavedDealIds());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
