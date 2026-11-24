import { useLayoutEffect, useRef, useState } from 'react';

export default function Header({ onSearchSender, onPlotCoords, onToggleSidebar }) {
  const ref = useRef(null);
  const [callsign, setCallsign] = useState('');
  const [coords, setCoords] = useState('');

  // Keep the sidebar just below the header (replaces syncSidebarOffset in app-bootstrap.js)
  useLayoutEffect(() => {
    const sync = () => {
      const bottom = ref.current ? ref.current.getBoundingClientRect().bottom : 0;
      document.documentElement.style.setProperty('--sidebar-top', `${Math.max(0, Math.ceil(bottom))}px`);
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  function submitCoords() {
    const value = coords.trim();
    if (!value) return onPlotCoords(null);
    const m = value.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (!m) return alert("Invalid format! Please enter coordinates in 'latitude, longitude' format.");
    return onPlotCoords({ lat: parseFloat(m[1]), lng: parseFloat(m[3]) });
  }

  return (
    <div id="controls" ref={ref}>
      <div className="search-container-main">
        <div className="search-container-sub header">
          <div className="search-input">
            <input type="text" placeholder="Enter Callsign" className="search" value={callsign}
              onChange={(e) => { setCallsign(e.target.value); if (!e.target.value.trim()) onSearchSender(''); }}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSender(callsign.trim())} />
            <img src="/assets/icons/search.png" alt="" id="searchIcon" width="15" height="15"
              style={{ cursor: 'pointer' }} onClick={() => onSearchSender(callsign.trim())} />
          </div>
          <div className="search-input">
            <input type="text" placeholder="Enter Coordinates" className="search" value={coords}
              onChange={(e) => { setCoords(e.target.value); if (!e.target.value.trim()) onPlotCoords(null); }}
              onKeyDown={(e) => e.key === 'Enter' && submitCoords()} />
            <img src="/assets/markers/plot-black.png" alt="" width="15" height="15"
              style={{ cursor: 'pointer' }} onClick={submitCoords} />
          </div>
        </div>
        <div className="button View-Btn">
          <img src="/assets/icons/sidebar.png" alt="View All" className="btn-icon" onClick={onToggleSidebar} />
          <button id="viewAllFishermen" onClick={onToggleSidebar}>View All Fishermen</button>
        </div>
      </div>
      <div className="top-right-text">
        <img src="/assets/logos/fisherlink.png" alt="logo" width="300" height="auto" />
      </div>
    </div>
  );
}
