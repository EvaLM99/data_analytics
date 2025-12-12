import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom'; // ✅ ajoute ceci
import { AuthProvider } from './context/AuthContext';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

reportWebVitals();
