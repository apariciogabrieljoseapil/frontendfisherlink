import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import './css/main.css';
import './css/header.css';
import './css/sidebar.css';
import './css/Fisherman_History.css';
import './css/SOS_Report.css';
import './css/Fishermans_information.css';
import './css/modal.css';
import './css/table_design.css';
import './css/Search.css';
import './css/Buttons.css';
import './css/layout.css';
import './css/alerts.css';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
