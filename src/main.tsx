import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Nota: Si tienes un archivo CSS global, descoméntalo:
// import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);