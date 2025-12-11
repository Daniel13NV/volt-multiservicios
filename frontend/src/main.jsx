// frontend/src/main.jsx (ACTUALIZADO para CartProvider)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <--- NUEVA IMPORTACIÓN

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* <--- ENVOLVEMOS TODA LA APP CON EL CARRO */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);