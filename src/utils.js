export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getTiming(station, now = Date.now()) {
  const last = typeof station.last_packet_time === 'number' ? station.last_packet_time : now;
  const timeGapMinutes = Math.max(0, (now - last) / 60000);
  return { timeGapMinutes, isDelayed: timeGapMinutes > 20, isVeryStale: timeGapMinutes > 24 * 60 };
}

export function markerOpacity(t) {
  if (t.isVeryStale) return { main: 0.3, boat: 0.22 };
  if (t.isDelayed) return { main: 0.58, boat: 0.45 };
  return { main: 1, boat: 1 };
}

// Server sends "dd-mm-yyyy hh:mm:ss" in Manila time. Parse it as +08:00 so filters work in any browser timezone.
export function parseLegacyDate(str) {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(str || '');
  return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}+08:00`) : null;
}

export const formatManila = (date) =>
  date ? date.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : 'Invalid Date';

export const withSeconds = (t, fallback) => (t ? (t.length === 5 ? `${t}:00` : t) : fallback);
