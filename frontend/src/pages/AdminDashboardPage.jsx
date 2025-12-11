// frontend/src/pages/AdminDashboardPage.jsx (ACTUALIZADO CON MODAL DE EDICIÓN DE MATERIALES)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('materials'); 
    const [orders, setOrders] = useState([]);
    const [services, setServices] = useState([]);
    const [materials, setMaterials] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Creación y Edición
    const [newMaterial, setNewMaterial] = useState({
        nombre: '', descripcion: '', precio_unitario: '', stock: '', categoria: '', imagen_url: ''
    });
    const [editingItem, setEditingItem] = useState(null);       // Para edición de ESTADO (Pedido/Servicio)
    const [newStatus, setNewStatus] = useState('');      
    const [editingMaterial, setEditingMaterial] = useState(null); // Para edición de MATERIAL

    const token = user ? user.token : null;

    // --- FETCH DATA ---
    const fetchAdminData = async () => {
        if (!token) {
            setLoading(false);
            setError("No autorizado. Token no disponible.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const config = { headers: { Authorization: token } };
            
            // 1. Obtener Pedidos
            const orderResponse = await axios.get(API_ROUTES.ORDERS, config); 
            setOrders(orderResponse.data);

            // 2. Obtener Solicitudes de Servicio
            const serviceResponse = await axios.get(API_ROUTES.SERVICES + '/pendientes', config);
            setServices(serviceResponse.data);

            // 3. Obtener TODOS los Materiales
            const materialsResponse = await axios.get(API_ROUTES.MATERIALS + '/admin', config);
            setMaterials(materialsResponse.data);

        } catch (err) {
            console.error("Error al cargar datos de administración:", err);
            setError("Error al cargar datos. Verifique los permisos o el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [token]);

    // --- MANEJO DE FORMULARIO DE CREACIÓN DE MATERIAL ---

    const handleMaterialChange = (e) => {
        setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
    };

    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        
        try {
            const config = { headers: { Authorization: user.token } };
            
            await axios.post(API_ROUTES.MATERIALS + '/admin', newMaterial, config);
            
            alert(`Material '${newMaterial.nombre}' agregado exitosamente.`);
            
            // Limpiar formulario y recargar datos
            setNewMaterial({
                nombre: '', descripcion: '', precio_unitario: '', stock: '', categoria: '', imagen_url: ''
            });
            fetchAdminData(); 

        } catch (error) {
            console.error('Error al crear material:', error.response || error);
            alert('Fallo al agregar el material. Revise que los campos sean válidos.');
        }
    };


    // --- MANEJO DE MODAL DE EDICIÓN DE ESTADO (EXISTENTE) ---
    const openEditModal = (item) => { 
        setEditingItem(item);
        setNewStatus(item.estado);
    };

    const closeEditModal = () => { 
        setEditingItem(null);
        setNewStatus('');
    };

    const handleSaveStatus = async () => { 
        if (!editingItem || !newStatus) return;

        const isOrder = editingItem.total !== undefined; 
        const endpoint = isOrder ? API_ROUTES.ORDERS : API_ROUTES.SERVICES;
        
        const url = `${endpoint}/${editingItem.id}/estado`;

        try {
            const config = { headers: { Authorization: user.token } };
            
            await axios.put(url, { estado: newStatus }, config);
            
            alert(`Estado de ${isOrder ? 'Pedido' : 'Servicio'} ID ${editingItem.id} actualizado a: ${newStatus}`);
            
            closeEditModal(); 
            fetchAdminData(); 
            
        } catch (error) {
            console.error('Error al guardar estado:', error.response || error);
            alert('Fallo al actualizar el estado. Revise la consola del navegador.');
        }
    };


    // --- NUEVAS FUNCIONES: EDICIÓN DE MATERIALES ---
    
    const openMaterialEditModal = (material) => {
        // Aseguramos que los números sean strings para el input (lo pide React)
        setEditingMaterial({ 
            ...material,
            precio_unitario: String(material.precio_unitario),
            stock: String(material.stock)
        });
    };

    const closeMaterialEditModal = () => {
        setEditingMaterial(null);
    };

    const handleMaterialEditChange = (e) => {
        setEditingMaterial({ ...editingMaterial, [e.target.name]: e.target.value });
    };

    const handleUpdateMaterial = async (e) => {
        e.preventDefault();

        // Creamos un objeto limpio sin el ID y con números convertidos
        const { id, ...updatedData } = editingMaterial;
        
        // Convertir de nuevo a número para el backend
        updatedData.precio_unitario = parseFloat(updatedData.precio_unitario);
        updatedData.stock = parseInt(updatedData.stock);

        try {
            const config = { headers: { Authorization: user.token } };
            
            // Llama a la nueva ruta PUT /api/materiales/admin/:id
            await axios.put(`${API_ROUTES.MATERIALS}/admin/${id}`, updatedData, config);
            
            alert(`Material '${updatedData.nombre}' actualizado exitosamente.`);
            
            closeMaterialEditModal();
            fetchAdminData(); // Recarga la lista
            
        } catch (error) {
            console.error('Error al actualizar material:', error.response || error);
            alert('Fallo al actualizar el material. Revise la consola del navegador.');
        }
    };


    if (loading) {
        return <div className="loading-message">Cargando Dashboard de Administración...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }
    
    // Opciones de estado dinámicas para el modal
    const statusOptions = editingItem?.cliente_nombre 
        ? ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado']
        : ['Pendiente', 'Cotizando', 'En Proceso', 'Completado', 'Cancelado'];


    return (
        <div className="admin-dashboard-page">
            <h1>Panel de Control Operativo - Volt Multiservicios</h1>
            <p className="admin-subtitle">Bienvenido, {user.userName}. Gestión de inventario, pedidos y leads.</p>

            <div className="tab-buttons">
                <button 
                    onClick={() => setActiveTab('materials')} 
                    className={`btn ${activeTab === 'materials' ? 'btn-secondary' : 'btn-default'}`}
                >
                    🔧 Gestión de Materiales ({materials.length})
                </button>
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
                
                {/* --- CONTENIDO PESTAÑA: GESTIÓN DE MATERIALES --- */}
                {activeTab === 'materials' && (
                    <section className="admin-materials-management">
                        <h2>Añadir Nuevo Material al Inventario</h2>
                        
                        <form onSubmit={handleCreateMaterial} className="material-form-grid">
                            <input type="text" name="nombre" placeholder="Nombre (Ej: Mini Split 1 Ton)" value={newMaterial.nombre} onChange={handleMaterialChange} required />
                            <input type="text" name="categoria" placeholder="Categoría (Ej: Climatización)" value={newMaterial.categoria} onChange={handleMaterialChange} required />
                            <input type="number" name="precio_unitario" placeholder="Precio ($)" value={newMaterial.precio_unitario} onChange={handleMaterialChange} required />
                            <input type="number" name="stock" placeholder="Stock Inicial" value={newMaterial.stock} onChange={handleMaterialChange} required />
                            <input type="text" name="imagen_url" placeholder="URL de Imagen (Opcional)" value={newMaterial.imagen_url} onChange={handleMaterialChange} />
                            <textarea name="descripcion" placeholder="Descripción detallada" value={newMaterial.descripcion} onChange={handleMaterialChange} />
                            
                            <button type="submit" className="btn btn-primary btn-full-width">Añadir Material</button>
                        </form>

                        <h2>Inventario Actual (Total: {materials.length})</h2>
                        {materials.length === 0 ? (
                            <p>No hay materiales registrados.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Stock</th>
                                        <th>Precio</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map(mat => (
                                        <tr key={mat.id}>
                                            <td>{mat.id}</td>
                                            <td>{mat.nombre}</td>
                                            <td>{mat.categoria}</td>
                                            <td style={{ fontWeight: mat.stock <= 0 ? 'bold' : 'normal', color: mat.stock <= 0 ? 'red' : 'green' }}>{mat.stock}</td>
                                            <td>${parseFloat(mat.precio_unitario).toFixed(2)}</td>
                                            <td>
                                                <button 
                                                    onClick={() => openMaterialEditModal(mat)} 
                                                    className="btn btn-default btn-small"
                                                >
                                                    Editar
                                                </button> 
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}
                
                {/* --- CONTENIDO PESTAÑA: PEDIDOS E-COMMERCE --- */}
                {activeTab === 'orders' && (
                    <section className="admin-orders-table">
                        {/* ... (Tu código de tabla de pedidos aquí) ... */}
                    </section>
                )}

                {/* --- CONTENIDO PESTAÑA: SOLICITUDES DE SERVICIO --- */}
                {activeTab === 'services' && (
                    <section className="admin-services-table">
                        {/* ... (Tu código de tabla de servicios aquí) ... */}
                    </section>
                )}
            </div>

            {/* --- MODAL DE EDICIÓN DE ESTADO (EXISTENTE) --- */}
            {editingItem && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Actualizar Estado - ID: {editingItem.id}</h3>
                        <p>Cliente: {editingItem.cliente_nombre || 'Invitado'}</p>
                        <p>Tipo: <strong>{editingItem.tipo_servicio || 'Pedido'}</strong></p>
                        <p>Estado Actual: <strong>{editingItem.estado}</strong></p>
                        
                        <select 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="form-select"
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        <div className="modal-actions">
                            <button onClick={handleSaveStatus} className="btn btn-primary">Guardar Cambios</button>
                            <button onClick={closeEditModal} className="btn btn-default">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NUEVO: MODAL DE EDICIÓN DE MATERIALES (EDICIÓN DE REGISTRO) --- */}
            {editingMaterial && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleUpdateMaterial}>
                        <h3>Editar Material - ID: {editingMaterial.id}</h3>
                        
                        <label>Nombre:</label>
                        <input type="text" name="nombre" value={editingMaterial.nombre} onChange={handleMaterialEditChange} required />
                        
                        <label>Categoría:</label>
                        <input type="text" name="categoria" value={editingMaterial.categoria} onChange={handleMaterialEditChange} required />

                        <label>Precio Unitario ($):</label>
                        <input type="number" name="precio_unitario" value={editingMaterial.precio_unitario} onChange={handleMaterialEditChange} required />
                        
                        <label>Stock:</label>
                        <input type="number" name="stock" value={editingMaterial.stock} onChange={handleMaterialEditChange} required />
                        
                        <label>URL de Imagen:</label>
                        <input type="text" name="imagen_url" value={editingMaterial.imagen_url || ''} onChange={handleMaterialEditChange} />

                        <label>Descripción:</label>
                        <textarea name="descripcion" value={editingMaterial.descripcion} onChange={handleMaterialEditChange} />

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                            <button type="button" onClick={closeMaterialEditModal} className="btn btn-default">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;