import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'opulse_saved_anomalies';

function loadInitial(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function useSavedAnomalies() {
  const [saved, setSaved] = useState<Set<string>>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
  }, [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  return { saved, isSaved, toggle };
}
