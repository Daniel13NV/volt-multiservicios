// frontend/src/pages/UserProfilePage.jsx (ACTUALIZADO con Historial de Pedidos y Servicios)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useAuth } from '../context/AuthContext'; 

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);      // Estado para pedidos
  const [services, setServices] = useState([]);  // Estado para servicios
  const [activeTab, setActiveTab] = useState('orders'); // Pestaña inicial del historial
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth(); 
  
  const token = user?.token;

  useEffect(() => {
    const fetchUserData = async () => {
      setError('');
      setLoading(true);
      
      if (!token) {
          setLoading(false);
          return;
      }

      try {
        const config = { headers: { Authorization: token } };

        // 1. Obtener Perfil
        const profileResponse = await axios.get(API_ROUTES.CLIENTS + '/perfil', config);
        setProfile(profileResponse.data);

        // 2. Obtener Historial de Pedidos
        const ordersResponse = await axios.get(API_ROUTES.ORDERS + '/mi-historial', config);
        setOrders(ordersResponse.data);

        // 3. Obtener Historial de Servicios
        const servicesResponse = await axios.get(API_ROUTES.SERVICES + '/mi-historial', config);
        setServices(servicesResponse.data);

      } catch (err) {
        console.error("Error al cargar datos del usuario:", err);
        setError('No se pudo cargar el perfil o el historial. Inicia sesión de nuevo.');
        if (err.response && err.response.status === 401) {
            logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, logout]); 

  const handleLogout = () => {
    logout(); 
  };
  
  // Función para renderizar el contenido de las tablas
  const renderHistoryContent = () => {
      if (activeTab === 'orders') {
          if (orders.length === 0) return <p>Aún no tienes pedidos registrados.</p>;
          return (
              <table>
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Fecha</th>
                          <th>Total</th>
                          <th>Estado</th>
                      </tr>
                  </thead>
                  <tbody>
                      {orders.map(order => (
                          <tr key={order.id}>
                              <td>{order.id}</td>
                              <td>{new Date(order.fecha_pedido).toLocaleDateString()}</td>
                              <td>${order.total.toFixed(2)}</td>
                              <td>{order.estado}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          );
      } else if (activeTab === 'services') {
          if (services.length === 0) return <p>Aún no tienes solicitudes de servicio.</p>;
          return (
              <table>
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Servicio</th>
                          <th>Descripción</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                      </tr>
                  </thead>
                  <tbody>
                      {services.map(service => (
                          <tr key={service.id}>
                              <td>{service.id}</td>
                              <td>{service.tipo_servicio}</td>
                              <td>{service.descripcion_problema.substring(0, 50)}...</td>
                              <td>{new Date(service.fecha_solicitud).toLocaleDateString()}</td>
                              <td>{service.estado}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          );
      }
      return null;
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

      {/* --- SECCIÓN PRINCIPAL: DATOS DEL PERFIL --- */}
      <section className="profile-section user-data">
        <h2>Datos Personales</h2>
        <p><strong>Nombre completo:</strong> {profile.nombre} {profile.apellido || 'No especificado'}</p>
        <p><strong>Correo electrónico:</strong> {profile.email}</p>
        <p><strong>Teléfono:</strong> {profile.telefono || 'Añadir teléfono'}</p>
        <p><strong>Dirección:</strong> {profile.direccion_envio || 'Añadir dirección de envío'}</p>
        <div className="profile-actions">
            {/* Aquí puedes añadir lógica para editar el perfil si lo deseas */}
            <button className="btn btn-primary btn-small">Editar Datos</button> 
        </div>
      </section>

      {/* --- SECCIÓN DE HISTORIAL --- */}
      <section className="profile-section history-data">
        <h2>Historial de Actividad</h2>
        
        <div className="tab-buttons">
            <button 
                onClick={() => setActiveTab('orders')} 
                className={`btn ${activeTab === 'orders' ? 'btn-secondary' : 'btn-default'}`}
            >
                Compras ({orders.length})
            </button>
            <button 
                onClick={() => setActiveTab('services')} 
                className={`btn ${activeTab === 'services' ? 'btn-secondary' : 'btn-default'}`}
            >
                Servicios ({services.length})
            </button>
        </div>

        <div className="history-content">
            {renderHistoryContent()}
        </div>
      </section>
      
      <button onClick={handleLogout} className="btn btn-logout">Cerrar Sesión</button>
    </div>
  );
};

export default UserProfilePage;