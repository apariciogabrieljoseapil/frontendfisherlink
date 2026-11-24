import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { MONTHS } from '../utils';
import Modal from './Modal.jsx';
import SenderDetailsModal from './SenderDetailsModal.jsx';

const YEARS = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i);
const toNum = (month, year, isStart) => {
  if (!year) return null;
  const m = month ? MONTHS.indexOf(month) + 1 : isStart ? 1 : 12;
  return Number(`${year}${String(m).padStart(2, '0')}`);
};

const TH = { color: '#fff' };

export default function SosReportModal({ isAdmin, onClose }) {
  const [bySender, setBySender] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ fy: '', fm: '', ty: '', tm: '' });
  const [details, setDetails] = useState(null); // { sender, month }

  useEffect(() => {
    api.get(bySender ? '/reports/sender' : '/reports/safe')
      .then((r) => setRows(r.report))
      .catch((e) => alert(`Error fetching report: ${e.message}`));
  }, [bySender]);

  const visible = useMemo(() => {
    const from = toNum(f.fm, f.fy, true);
    const to = toNum(f.tm, f.ty, false);
    return rows.filter((r) => {
      if (bySender && search && !r.sender.toLowerCase().includes(search.toLowerCase())) return false;
      if (!from && !to) return true;
      const [mn, yr] = r.month.split('-');
      const v = toNum(mn, yr, true);
      return v && (!from || v >= from) && (!to || v <= to);
    });
  }, [rows, f, search, bySender]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  function print() {
    const w = window.open('', '', 'width=800,height=600');
    w.document.write(`<html><head><title>Monthly SOS Report</title><style>
      body{font-family:Arial,sans-serif;text-align:center;padding:20px;color:#000}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #000;padding:5px;text-align:center;color:#000}
      th{background:#d3d3d3}tr:nth-child(even){background:#f2f2f2}
    </style></head><body><h2>FisherLink Monthly SOS Report</h2>`);
    w.document.write(document.querySelector('#safeReportModal .styled-table').outerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  }

  const range = (label, y, m) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <label style={{ color: '#DCDCDC' }}>{label}</label>
      <div className="filter-group">
        <select className="yearInput" value={f[y]} onChange={set(y)}>
          <option value="">All Years</option>
          {YEARS.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
        </select>
        <select className="dropdown" value={f[m]} onChange={set(m)}>
          <option value="">All Months</option>
          {MONTHS.map((mn) => <option key={mn}>{mn}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <Modal open id="safeReportModal" title="Monthly SOS Report" onClose={onClose}>
        <div className="div-box">
          <div className="div-box-sub">
            <div className="search-input">
              <input className="search" type="text" placeholder="Search Callsign..." value={search}
                onChange={(e) => setSearch(e.target.value)} />
              <img src="/assets/icons/search.png" alt="" width="15" height="15" />
            </div>
            <div className="button ShowDetail-Btn">
              <button onClick={() => { setBySender((b) => !b); setSearch(''); }}>
                {bySender ? 'Show by Month' : 'Show by Details'}
                <img src={bySender ? '/assets/icons/calendar.png' : '/assets/icons/details.png'} alt="" width="20" height="20" />
              </button>
            </div>
          </div>
          <div className="div-box-sub div-box-sub-SOS">
            {range('From:', 'fy', 'fm')}
            {range('To:', 'ty', 'tm')}
          </div>
        </div>

        <div className="scrollable-safe-report">
          <table className="styled-table">
            <thead id="safeReportHeader">
              <tr>
                <th style={{ ...TH, background: '#0047AB' }}>Month</th>
                {bySender && <th style={{ ...TH, background: '#0047AB' }}>Sender</th>}
                <th style={{ ...TH, background: '#b40000' }}>SOS Count</th>
                <th style={{ ...TH, background: '#006700' }}>Mark as Safe Count</th>
                <th style={{ ...TH, background: '#676767' }}>Not Found Count</th>
              </tr>
            </thead>
            <tbody id="safeReportTable">
              {visible.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No records found.</td></tr>
              )}
              {visible.map((r) => (
                <tr key={`${r.month}|${r.sender || ''}`}>
                  <td>{r.month}</td>
                  {bySender && (
                    <td>
                      <span className="clickable-callsign" onClick={() => setDetails({ sender: r.sender, month: r.month })}>{r.sender}</span>
                    </td>
                  )}
                  <td>{r.sos_count || 0}</td>
                  <td>{r.safe_count || 0}</td>
                  <td>{r.not_found_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="button print-Btn">
            <button onClick={print}>Print Report <img src="/assets/icons/printer.png" alt="" width="25" height="25" /></button>
          </div>
        )}
      </Modal>
      {details && <SenderDetailsModal {...details} onClose={() => setDetails(null)} />}
    </>
  );
}
