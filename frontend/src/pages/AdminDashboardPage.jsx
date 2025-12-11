// frontend/src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('orders'); // orders o services
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener el token del usuario logueado (necesario para las rutas protegidas del admin)
    const token = user ? user.token : null;

    useEffect(() => {
        if (!token) {
            setLoading(false);
            setError("No autorizado. Token no disponible.");
            return;
        }

        const fetchAdminData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Configuración de cabecera con el token de administrador simulado
                const config = {
                    headers: {
                        Authorization: token // El middleware del backend verificará si es admin
                    }
                };
                
                // 1. Obtener Pedidos (Ruta Pendiente de crear en el backend: /api/pedidos)
                // Usaremos una ruta base por ahora, asumiendo que el backend nos da todos los pedidos.
                const orderResponse = await axios.get(API_ROUTES.ORDERS, config); 
                setOrders(orderResponse.data);

                // 2. Obtener Solicitudes de Servicio (Leads)
                const serviceResponse = await axios.get(API_ROUTES.SERVICES + '/pendientes', config);
                setServices(serviceResponse.data);

            } catch (err) {
                console.error("Error al cargar datos de administración:", err);
                setError("Error al cargar datos. Verifique los permisos o el backend.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, [token]);


    if (loading) {
        return <div className="loading-message">Cargando Dashboard de Administración...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="admin-dashboard-page">
            <h1>Panel de Control Operativo - Volt Multiservicios</h1>
            <p className="admin-subtitle">Bienvenido, {user.userName}. Gestión de pedidos y leads.</p>

            <div className="tab-buttons">
                <button 
                    onClick={() => setActiveTab('orders')} 
                    className={`btn ${activeTab === 'orders' ? 'btn-secondary' : 'btn-default'}`}
                >
                    📦 Pedidos E-commerce ({orders.length})
                </button>
                <button 
                    onClick={() => setActiveTab('services')} 
                    className={`btn ${activeTab === 'services' ? 'btn-secondary' : 'btn-default'}`}
                >
                    🔧 Solicitudes de Servicio ({services.length})
                </button>
            </div>

            <div className="admin-content-area">
                {activeTab === 'orders' && (
                    <section className="admin-orders-table">
                        <h2>Pedidos Recientes</h2>
                        {orders.length === 0 ? (
                            <p>No hay pedidos pendientes.</p>
                        ) : (
                            // Renderizado de tabla de pedidos
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID Pedido</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{order.cliente_nombre || 'Invitado'}</td>
                                            <td>${order.total.toFixed(2)}</td>
                                            <td>{new Date(order.fecha_pedido).toLocaleDateString()}</td>
                                            <td>{order.estado}</td>
                                            <td><button className="btn btn-primary btn-small">Ver/Procesar</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}

                {activeTab === 'services' && (
                    <section className="admin-services-table">
                        <h2>Leads de Servicio Pendientes</h2>
                        {services.length === 0 ? (
                            <p>No hay solicitudes de servicio pendientes.</p>
                        ) : (
                            // Renderizado de tabla de servicios/leads
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Descripción</th>
                                        <th>Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map(service => (
                                        <tr key={service.id}>
                                            <td>{service.id}</td>
                                            <td>{service.tipo_servicio}</td>
                                            <td>{service.descripcion_problema.substring(0, 50)}...</td>
                                            <td>{service.cliente_nombre || 'Invitado'}</td>
                                            <td>{service.telefono || 'N/A'}</td>
                                            <td>{service.estado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPage;