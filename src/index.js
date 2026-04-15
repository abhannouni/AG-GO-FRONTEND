import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ── Global suppressor for mapbox-gl fetch-abort noise ───────────────────────
// When mapbox-gl is unmounted (e.g. React Strict Mode double-invoke, or route
// navigation), it calls map.remove() which cancels in-flight tile/style
// requests.  Chrome extensions that monkey-patch window.fetch often convert
// the resulting AbortError into a generic TypeError('Failed to fetch'), which
// surfaces as an unhandled rejection and triggers React's error overlay.
// We intercept those here — permanently — before React even mounts.
window.addEventListener('unhandledrejection', (e) => {
  const r = e.reason;
  if (r instanceof Error) {
    const isAbort =
      r.name === 'AbortError' ||
      r.message?.includes('aborted') ||
      r.message?.includes('signal');
    const isFetchFail =
      // Chrome / Edge
      r.message === 'Failed to fetch' ||
      // Safari
      r.message === 'Load failed' ||
      // Firefox
      r.message === 'NetworkError when attempting to fetch resource';
    if (isAbort || isFetchFail) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
