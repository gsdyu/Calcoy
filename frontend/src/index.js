import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Analytics } from '@vercel/analytics/react';


const root = ReactDOM.createRoot(document.getElementById('root'));
<Analytics />

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  


);
