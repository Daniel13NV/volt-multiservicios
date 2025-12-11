// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer'; 
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage'; 
import CatalogPage from './pages/CatalogPage'; 
import ServiceRequestPage from './pages/ServiceRequestPage'; // <--- PAGINA DE SERVICIOS
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            
            {/* RUTA DE SERVICIOS AHORA PROTEGIDA */}
            <Route 
                path="/servicios" 
                element={
                    <ProtectedRoute>
                        <ServiceRequestPage />
                    </ProtectedRoute>
                } 
            /> {/* <--- CORRECCIÓN APLICADA */}
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/carrito" element={<CartPage />} />
            
            {/* RUTAS PROTEGIDAS PARA EL CLIENTE REGULAR */}
            <Route 
                path="/perfil" 
                element={
                    <ProtectedRoute>
                        <UserProfilePage />
                    </ProtectedRoute>
                } 
            />
            
            <Route 
                path="/checkout" 
                element={
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                } 
            />

            {/* RUTA PROTEGIDA PARA ADMINISTRADORES */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute adminOnly={true}> 
                        <AdminDashboardPage />
                    </ProtectedRoute>
                } 
            />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;