// frontend/src/pages/UserProfilePage.jsx (handleLogout SIMPLIFICADO)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useAuth } from '../context/AuthContext'; 

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth(); 

  useEffect(() => {
    const fetchProfile = async () => {
      setError('');
      
      if (!user || !user.token) {
          setLoading(false);
          return;
      }

      try {
        const response = await axios.get(API_ROUTES.CLIENTS + '/perfil', {
          headers: {
            Authorization: user.token, 
          },
        });
        if (response.data) {
            setProfile(response.data);
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError('No se pudo cargar el perfil. Puede que la sesión haya expirado.');
        if (err.response && err.response.status === 401) {
            logout(); // Esto forzará el logout y la redirección
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
        fetchProfile();
    }
  }, [user, logout]); 

  // FUNCIÓN SIMPLIFICADA
  const handleLogout = () => {
    // Solo necesitamos llamar a logout, AuthContext se encarga de la limpieza y redirección a /login
    logout(); 
  };

  if (loading) {
    return <div className="loading-message">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
      return <div className="error-message">Error: No se encontró la información del perfil.</div>;
  }

  return (
    <div className="profile-page">
      <h1>👋 Bienvenid@, {profile.nombre}</h1>
      <p className="profile-subtitle">Aquí puedes gestionar tus datos y revisar tu actividad.</p>

      <section className="profile-section user-data">
        <h2>Datos Personales</h2>
        <p><strong>Nombre completo:</strong> {profile.nombre} {profile.apellido || 'No especificado'}</p>
        <p><strong>Correo electrónico:</strong> {profile.email}</p>
        <p><strong>Teléfono:</strong> {profile.telefono || 'Añadir teléfono'}</p>
        <p><strong>Dirección:</strong> {profile.direccion_envio || 'Añadir dirección de envío'}</p>
        <div className="profile-actions">
            <button className="btn btn-primary btn-small">Editar Datos</button>
            <button className="btn btn-secondary btn-small">Cambiar Contraseña</button>
        </div>
      </section>

      <section className="profile-section history-data">
        <h2>Historial de Compras y Servicios</h2>
        <div className="history-tabs">
            <p>Implementación pendiente: Mostrar Pedidos (E-commerce) y Solicitudes de Servicio (Leads).</p>
        </div>
      </section>
      
      <button onClick={handleLogout} className="btn btn-logout">Cerrar Sesión</button>
    </div>
  );
};

export default UserProfilePage;