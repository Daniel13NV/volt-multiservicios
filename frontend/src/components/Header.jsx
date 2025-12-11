// frontend/src/components/Header.jsx (FINAL)

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

const Header = () => {
  // Obtenemos el estado de autenticación y los datos del usuario
  const { isLoggedIn, user, logout } = useAuth(); // Obtener la función logout
  const { cartItems } = useCart(); 

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Determina si mostrar el enlace de perfil o el enlace de login
  // Usamos isLoggedIn Y user?.userName para mayor seguridad
  const showProfileLinks = isLoggedIn && user && user.userName;

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
          {/* El acceso a Solicitud de Servicio ya está restringido por ProtectedRoute */}
          <Link to="/servicios" className="nav-link">Solicitar Servicio</Link> 
        </nav>

        <div className="auth-links">
          {showProfileLinks ? (
            // Mostrar enlace al perfil y logout si está logueado
            <>
              {/* Saludo y enlace al perfil */}
              <Link to="/perfil" className="nav-link user-profile-link">
                Hola, {user.userName}
              </Link>
              {/* El botón Cerrar Sesión usa la función logout del contexto 
                  que limpia localStorage y fuerza la redirección. */}
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