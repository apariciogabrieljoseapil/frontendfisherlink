import { Fragment, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, ZoomControl, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getTiming, markerOpacity } from '../utils';

const mkIcon = (url, size, anchor, popup, className) =>
  L.icon({ iconUrl: url, iconSize: size, iconAnchor: anchor, popupAnchor: popup, className });
const boat = (file, cls) => mkIcon(`/assets/markers/${file}`, [20, 20], [9, -2], [0, -10], cls);
const pin = (color) => mkIcon(`/assets/markers/mark-${color}.png`, [50, 50], [26, 46], [1, -34]);

const BOAT_ICONS = {
  Butuan: boat('sail-boat.png', 'boat-icon-red'),
  Surigao: boat('sail-surigao-boat.png', 'boat-icon-blue'),
  Nasipit: boat('sail-nasipit-boat.png', 'boat-icon-green'),
  Cabadbaran: boat('sail-cabadbaran-boat.png', 'boat-icon-green'),
  Unknown: boat('sail-Unknown-boat.png', 'boat-icon-gray')
};
const PINS = { normal: pin('blue'), sos: pin('red'), help: pin('green'), notFound: pin('gray') };
const BOAT_LEGEND = { Green: 'Surigao City', Blue: 'Cabadbaran City', Pink: 'Butuan City', Yellow: 'Nasipit', Gray: 'Unknown' };

function BoatLegend() {
  const map = useMap();
  useEffect(() => {
    const control = L.control({ position: 'bottomleft' });
    control.onAdd = () => {
      const box = L.DomUtil.create('div', 'leaflet-control leaflet-boat-legend');
      const toggle = L.DomUtil.create('a', 'leaflet-boat-legend-toggle', box);
      toggle.title = 'Boat Color Legend';
      const content = L.DomUtil.create('div', 'leaflet-boat-legend-content', box);
      content.style.display = 'none';
      content.innerHTML = '<h4>Boat Color Legend</h4>' + Object.entries(BOAT_LEGEND).map(([c, l]) =>
        `<div style="display:flex;align-items:center;margin-bottom:4px"><div style="width:16px;height:16px;background-color:${c.toLowerCase()};border:1px solid #444;margin-right:6px;border-radius:3px"></div><span>${l}</span></div>`
      ).join('');
      L.DomEvent.on(toggle, 'click', (e) => {
        L.DomEvent.stop(e);
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
      });
      return box;
    };
    control.addTo(map);
    return () => control.remove();
  }, [map]);
  return null;
}

// Reacts to sidebar clicks, coordinate search and trail plotting
function MapController({ focus, markerRefs, manualPoint, trail }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const marker = markerRefs.current[focus.sender];
    if (marker) { map.setView(marker.getLatLng(), 15); marker.openPopup(); }
    else alert('Location not found for this sender.');
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (manualPoint) map.setView([manualPoint.lat, manualPoint.lng], 12); }, [manualPoint]); // eslint-disable-line

  useEffect(() => {
    if (trail?.locations?.length) {
      map.fitBounds(L.latLngBounds(trail.locations.map((l) => [l.latitude, l.longitude])), { maxZoom: 14, padding: [40, 40] });
    }
  }, [trail]); // eslint-disable-line
  return null;
}

export default function MapView({ stations, now, isAdmin, focus, manualPoint, trail, onAction }) {
  const markerRefs = useRef({});
  const cartoKey = import.meta.env.VITE_CARTO_KEY;
  const darkUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`;
  const google = (lyr) => `https://mt1.google.com/vt/lyrs=${lyr}&x={x}&y={y}&z={z}`;

  return (
    <MapContainer id="map" center={[9.1, 125.5]} zoom={8} zoomControl={false} scrollWheelZoom>
      <ZoomControl position="bottomleft" />
      <LayersControl position="bottomleft" collapsed>
        <LayersControl.BaseLayer name="Road Map"><TileLayer url={google('m')} attribution="&copy; Google Road" /></LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite"><TileLayer url={google('s')} attribution="&copy; Google Satellite" /></LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Hybrid"><TileLayer url={google('y')} attribution="&copy; Google Hybrid" /></LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain"><TileLayer url={google('p')} attribution="&copy; Google Terrain" /></LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Dark Mode">
          <TileLayer url={darkUrl} subdomains="abcd" maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>' />
        </LayersControl.BaseLayer>
      </LayersControl>
      <BoatLegend />
      <MapController focus={focus} markerRefs={markerRefs} manualPoint={manualPoint} trail={trail} />

      {stations.map((s) => {
        const lat = parseFloat(s.latitude);
        const lng = parseFloat(s.longitude);
        const timing = getTiming(s, now);
        const op = markerOpacity(timing);
        const place = (s.place || 'Unknown').trim();
        const sos = s.sos_status === 1;
        const help = s.help_status === 1;
        const notFound = s.not_found_status === 1;
        const icon = notFound && !sos ? PINS.notFound : sos ? PINS.sos : help ? PINS.help : PINS.normal;

        return (
          <Fragment key={s.sender}>
            <Marker position={[lat + 0.00005, lng]} icon={BOAT_ICONS[place] || BOAT_ICONS.Unknown}
              opacity={op.boat} zIndexOffset={1000}>
              <Popup><strong>{s.sender}</strong><br />Place: {place}</Popup>
            </Marker>
            <Marker position={[lat, lng]} icon={icon} opacity={op.main} title={s.sender}
              ref={(m) => { if (m) markerRefs.current[s.sender] = m; else delete markerRefs.current[s.sender]; }}>
              <Popup>
                <div className="station-popup">
                  <h3>{s.sender}</h3>
                  <p><strong>Last Update:</strong> {s.time_received}</p>
                  <p><strong>Latitude:</strong> {lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {lng.toFixed(6)}</p>
                  <p><strong>Message:</strong> <span className="message-text">{s.message}</span></p>
                  {s.battery_percentage !== null && <p><strong>Battery:</strong> {s.battery_percentage}%</p>}
                  <p><strong>Inactive For:</strong> {Math.floor(timing.timeGapMinutes)} minute(s)</p>
                  {isAdmin && sos && !help && (
                    <button className="popup-btn help-btn" onClick={() => onAction('help', s.sender)}>Help on the Way</button>
                  )}
                  {isAdmin && (sos || help || notFound) && (
                    <button className="popup-btn safe-btn" onClick={() => onAction('safe', s.sender)}>Mark as Safe</button>
                  )}
                  {isAdmin && help && !notFound && (
                    <button className="popup-btn notfound-btn" onClick={() => onAction('notfound', s.sender)}>Not Found</button>
                  )}
                </div>
              </Popup>
            </Marker>
          </Fragment>
        );
      })}

      {manualPoint && (
        <Marker position={[manualPoint.lat, manualPoint.lng]} icon={PINS.normal}>
          <Popup><strong>Manual Plot</strong><br />Latitude: {manualPoint.lat}<br />Longitude: {manualPoint.lng}</Popup>
        </Marker>
      )}

      {trail && trail.locations.length > 0 && (
        <>
          <Polyline positions={trail.locations.map((l) => [l.latitude, l.longitude])} pathOptions={{ color: 'orange', weight: 1 }} />
          {trail.locations.map((l, i) => i === 0 ? (
            <Marker key={i} position={[l.latitude, l.longitude]} icon={PINS.normal}>
              <Popup><strong>{trail.sender}</strong><br />Timestamp: {l.time_received}<br />Message: {l.message}</Popup>
            </Marker>
          ) : (
            <Circle key={i} center={[l.latitude, l.longitude]} radius={100}
              pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2 }}>
              <Popup><strong>{trail.sender}</strong><br />Timestamp: {l.time_received}</Popup>
            </Circle>
          ))}
        </>
      )}
    </MapContainer>
  );
}
