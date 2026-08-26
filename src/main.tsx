import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

const container = document.getElementById('root');

if (container) {
  // The build prerenders the DOM into index.html (scripts/prerender.mjs), so in
  // production this hydrates. In dev the container is empty and it mounts.
  if (container.firstChild) {
    hydrateRoot(
      container,
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
