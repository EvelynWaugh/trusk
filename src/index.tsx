import * as TruskReact from 'trusk-react';
import { createRoot } from 'trusk-react-dom/client';
import AdminTruskavetsk from './AdminTruskavetsk';

const React = TruskReact;

// Initialize the React app when DOM and WordPress are ready
function initializeApp() {
  const container = document.getElementById('hotel-metabox-root');

  if (!container) {
    console.error('Hotel metabox root element not found');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(<AdminTruskavetsk />);
    console.log('Hotel metabox React app initialized successfully');
  } catch (error) {
    console.error('Error initializing hotel metabox app:', error);
  }
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else if (document.readyState === 'interactive') {
  // DOM is ready but resources may still be loading
  setTimeout(initializeApp, 0);
} else {
  // DOM and resources are fully loaded
  initializeApp();
}
