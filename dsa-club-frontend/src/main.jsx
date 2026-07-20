import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';

const options = {
  "info": {
    "applicationID": import.meta.env.VITE_NEW_RELIC_APPLICATION_ID,
    "beacon": "bam.nr-data.net",
    "errorBeacon": "bam.nr-data.net",
    "licenseKey": import.meta.env.VITE_NEW_RELIC_LICENSE_KEY,
    "sa": 1
  },
  "init": {
    "ajax": {
      "deny_list": [
        "bam.nr-data.net"
      ]
    },
    "browser_consent_mode": {
      "enabled": false
    },
    "distributed_tracing": {
      "enabled": true
    },
    "performance": {
      "capture_detail": false,
      "capture_marks": false,
      "capture_measures": true
    },
    "privacy": {
      "cookies_enabled": true
    }
  },
  "loader_config": {
    "accountID": import.meta.env.VITE_NEW_RELIC_ACCOUNT_ID,
    "agentID": import.meta.env.VITE_NEW_RELIC_AGENT_ID,
    "applicationID": import.meta.env.VITE_NEW_RELIC_APPLICATION_ID,
    "licenseKey": import.meta.env.VITE_NEW_RELIC_LICENSE_KEY,
    "trustKey": import.meta.env.VITE_NEW_RELIC_TRUST_KEY
  }
};
new BrowserAgent(options);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);