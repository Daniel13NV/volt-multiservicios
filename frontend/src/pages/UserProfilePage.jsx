// frontend/src/pages/UserProfilePage.jsx (COMPLETO y CORREGIDO con Historial)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../config/api';

const UserProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Estados para historial
    const [activeTab, setActiveTab] = useState('profile'); 
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState(null);

    // Redirigir si no hay usuario
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);


    // --- FETCH HISTORY DATA ---
    const fetchUserHistory = async () => {
        if (!user || !user.token) return;

        setLoadingHistory(true);
        setErrorHistory(null);
        try {
            const config = { headers: { Authorization: user.token } };
            
            // 1. Obtener Historial de Pedidos
            const ordersResponse = await axios.get(API_ROUTES.ORDERS + '/user', config); 
            // Ordenar por fecha o ID descendente para ver lo más reciente primero
            setOrders(ordersResponse.data.sort((a, b) => b.id - a.id));

            // 2. Obtener Historial de Servicios
            const servicesResponse = await axios.get(API_ROUTES.SERVICES + '/user', config);
            setServices(servicesResponse.data.sort((a, b) => b.id - a.id));

        } catch (err) {
            console.error("Error al cargar el historial del cliente:", err.response || err);
            setErrorHistory("Error al cargar el historial. Revise las rutas del backend o su token.");
        } finally {
            setLoadingHistory(false);
        }
    };

    // Cargar historial al montar el componente
    useEffect(() => {
        if (user) {
            fetchUserHistory();
        }
    }, [user]);

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    // Si no hay usuario, esperar la redirección
    if (!user) {
        return null; 
    }

    // --- RENDERIZAR CONTENIDO DE LAS PESTAÑAS ---
    const renderHistoryContent = () => {
        if (loadingHistory) {
            return <div className="loading-message">Cargando historial...</div>;
        }
        if (errorHistory) {
            return <div className="error-message">{errorHistory}</div>;
        }

        if (activeTab === 'orders') {
            return (
                <div className="history-section">
                    <h2>📦 Historial de Pedidos</h2>
                    {orders.length === 0 ? (
                        <p>Aún no has realizado ningún pedido en nuestra tienda.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Pedido</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{new Date(order.fecha_pedido).toLocaleDateString()}</td>
                                        <td>${parseFloat(order.total).toFixed(2)}</td> {/* Usar parseFloat por seguridad */}
                                        <td>{order.estado}</td>
                                        <td>
                                            {/* Aquí podrías añadir un botón para ver el detalle de los productos del pedido */}
                                            <button className="btn btn-default btn-small">Ver Productos</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }

        if (activeTab === 'services') {
            return (
                <div className="history-section">
                    <h2>🔧 Solicitudes de Servicio</h2>
                    {services.length === 0 ? (
                        <p>No tienes solicitudes de servicio registradas.</p>
                    ) : (
                         <table>
                            <thead>
                                <tr>
                                    <th>ID Solicitud</th>
                                    <th>Tipo de Servicio</th>
                                    <th>Descripción</th>
                                    <th>Estado</th>
                                    <th>Fecha Solicitud</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <tr key={service.id}>
                                        <td>{service.id}</td>
                                        <td>{service.tipo_servicio}</td>
                                        <td>{service.descripcion_problema.substring(0, 50)}...</td>
                                        <td>{service.estado}</td>
                                        <td>{new Date(service.fecha_solicitud).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
        }
        
        // Contenido de la pestaña Perfil (por defecto)
        return (
            <div className="profile-section">
                <h2>Información de la Cuenta</h2>
                <div className="user-data">
                    <p><strong>Nombre:</strong> {user.userName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
                {/* Futuros botones para editar perfil */}
            </div>
        );
    };

    return (
        <div className="profile-page">
            <h1>Hola, {user.userName}</h1>
            
            {/* Botones de Pestañas */}
            <div className="tab-buttons">
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`btn ${activeTab === 'profile' ? 'btn-secondary' : 'btn-default'}`}
                >
                    👤 Mi Perfil
                </button>
                <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`btn ${activeTab === 'orders' ? 'btn-secondary' : 'btn-default'}`}
                >
                    📦 Mis Pedidos ({orders.length})
                </button>
                <button 
                    onClick={() => setActiveTab('services')} 
                    className={`btn ${activeTab === 'services' ? 'btn-secondary' : 'btn-default'}`}
                >
                    🔧 Mis Servicios ({services.length})
                </button>
            </div>

            <div className="profile-content-area">
                {renderHistoryContent()}
            </div>

            <div className="profile-actions">
                <button onClick={handleLogout} className="btn btn-logout">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default UserProfilePage;