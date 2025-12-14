// frontend/src/components/Header.jsx (CORREGIDO PARA NAVEGACIÓN DE ADMIN)

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

const Header = () => {
  // Obtenemos el estado de autenticación y los datos del usuario
  const { isLoggedIn, user, logout } = useAuth();
  const { cartItems } = useCart(); 

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Determina si mostrar el enlace de perfil o el enlace de login
  const showProfileLinks = isLoggedIn && user && user.userName;

  // CORRECCIÓN CLAVE: Determinar la ruta y el nombre del enlace
  const profileRoute = user && user.clientId === 1 ? '/dashboard' : '/perfil';
  const profileLinkText = user && user.clientId === 1 ? 'Dashboard' : 'Perfil';

  // Renderizamos el Header
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo-link">
          <img src={Logo} alt="Volt Multiservicios Logo" className="logo" /> 
        </Link>
        
        <nav className="main-nav">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/catalogo" className="nav-link">Tienda / Catálogo</Link>
          <Link to="/servicios" className="nav-link">Solicitar Servicio</Link>
        </nav>

        <div className="auth-links">
          {showProfileLinks ? (
            // Mostrar enlace al perfil/Dashboard y logout si está logueado
            <>
              {/* Saludo y enlace dinámico */}
              <Link to={profileRoute} className="nav-link user-profile-link">
                Hola, {user.userName} ({profileLinkText}) {/* <--- Cambia "Perfil" por "Dashboard" */}
              </Link>
              {/* El botón Cerrar Sesión usa la función logout del contexto */}
              <button onClick={logout} className="nav-link auth-logout logout-btn-text">
                Cerrar Sesión
              </button>
            </>
          ) : (
            // Mostrar iniciar sesión si no está logueado
            <Link to="/login" className="nav-link auth-login">
              Iniciar Sesión
            </Link>
          )}
          
          <Link to="/carrito" className="nav-link cart-icon-link">
             🛒 {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;