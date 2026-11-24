import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

// Polls the API every 5s. (To go fully realtime later, subscribe to Supabase Realtime
// on `latest_stations` / `information` and call reload() in the callback.)
export function useStations(enabled, intervalMs = 5000) {
  const [data, setData] = useState({ stations: [], count: 0 });
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setData(await api.get('/stations/latest'));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    reload();
    const id = setInterval(reload, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, reload]);

  return { ...data, error, reload };
}
