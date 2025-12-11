// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// El componente ahora acepta una prop 'adminOnly'
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
      // Mostrar un mensaje de carga mientras se verifica el token
      return <div style={{textAlign: 'center', padding: '50px'}}>Verificando autenticación...</div>; 
  }

  if (!isLoggedIn) {
    // 1. Redirigir si no está logueado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Comprobación de Rol (Solo si adminOnly es true)
  if (adminOnly) {
      // Nota: Asumimos que el ID del Administrador es 1 (Hardcoded por simplicidad)
      const isAdmin = user && user.clientId === 1; 

      if (!isAdmin) {
          // Si no es el administrador, negamos el acceso
          return <Navigate to="/perfil" replace />; 
      }
  }

  // Si está logueado y pasa la verificación de rol
  return children;
};

export default ProtectedRoute;