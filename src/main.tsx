import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/admin' ? <AdminDashboard /> : <App />}
  </StrictMode>,
);
