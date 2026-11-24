import { getTiming } from '../utils';

export function SosAlerts({ stations }) {
  const items = stations
    .map((s) => {
      const sos = s.sos_status === 1;
      const help = s.help_status === 1;
      const notFound = s.not_found_status === 1;
      if (sos && !help) return { sender: s.sender, label: 'SOS', bg: '#8b0000' };
      if (help) return { sender: s.sender, label: 'Help on the Way', bg: '#28a745' };
      if (notFound) return { sender: s.sender, label: 'Not Found', bg: '#555' };
      return null;
    })
    .filter(Boolean);

  if (!items.length) return null;
  return (
    <div id="sosAlertContainer" className="sos-container">
      {items.map((i) => (
        <div key={i.sender} className="sosAlert" style={{ background: i.bg }}>
          {i.label}: <strong>{i.sender}</strong>
        </div>
      ))}
    </div>
  );
}

export function DelayWarnings({ stations, now }) {
  const phone = window.innerWidth <= 600;
  const startTop = phone ? 72 : 90;
  const step = phone ? 54 : 64;

  const delayed = stations
    .map((s) => ({ sender: s.sender, ...getTiming(s, now) }))
    .filter((t) => t.isDelayed);

  return delayed.map((t, index) => (
    <div key={t.sender} className="delay-alert" style={{ top: index * step + startTop }}>
      {phone
        ? <>Delay: <strong>{t.sender}</strong> inactive {Math.floor(t.timeGapMinutes)} min</>
        : <>Delay: <strong>{t.sender}</strong> has been inactive for {Math.floor(t.timeGapMinutes)} minutes!</>}
    </div>
  ));
}
