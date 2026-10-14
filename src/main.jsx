import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/montserrat';
import '@fontsource/bebas-neue';
import './sistema/tokens.css';
import './sistema/base.css';
import './sistema/componentes.css';
import './sistema/graficos/graficos.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
