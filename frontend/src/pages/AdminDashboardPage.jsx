// frontend/src/pages/AdminDashboardPage.jsx (COMPLETO y CORREGIDO con subida de imagen)

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
        nombre: '', descripcion: '', precio_unitario: '', stock: '', categoria: '', 
        imagen: null // <--- CAMBIO CLAVE: Ahora guarda el objeto File
    });
    const [editingItem, setEditingItem] = useState(null);     
    const [newStatus, setNewStatus] = useState('');      
    const [editingMaterial, setEditingMaterial] = useState(null); 

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

            // 3. Obtener TODOS los Materiales (incluidos inactivos)
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
        const { name, value, files } = e.target;
        
        if (name === 'imagen' && files) {
            // Si el campo es la imagen, guardamos el objeto File (files[0])
            setNewMaterial({ ...newMaterial, imagen: files[0] });
        } else {
            // Para el resto de campos (texto, números)
            setNewMaterial({ ...newMaterial, [name]: value });
        }
    };

    const handleCreateMaterial = async (e) => {
        e.preventDefault();
        
        // --- CAMBIO CLAVE: Usar FormData para enviar archivos ---
        const formData = new FormData();
        formData.append('nombre', newMaterial.nombre);
        formData.append('descripcion', newMaterial.descripcion);
        formData.append('precio_unitario', newMaterial.precio_unitario);
        formData.append('stock', newMaterial.stock);
        formData.append('categoria', newMaterial.categoria);
        
        // Añadir el archivo de imagen si existe (campo 'imagen' debe coincidir con Multer)
        if (newMaterial.imagen) {
            formData.append('imagen', newMaterial.imagen); 
        } else {
            // Si no se selecciona imagen, enviamos un valor vacío para que el controlador lo ignore
            formData.append('imagen', ''); 
        }

        try {
            // No especificamos Content-Type, FormData y axios lo manejan
            const config = { headers: { Authorization: user.token } };
            
            await axios.post(API_ROUTES.MATERIALS + '/admin', formData, config);
            
            alert(`Material '${newMaterial.nombre}' agregado exitosamente.`);
            
            // Limpiar formulario y recargar datos
            setNewMaterial({
                nombre: '', descripcion: '', precio_unitario: '', stock: '', categoria: '', imagen: null // Reiniciar imagen a null
            });
            fetchAdminData(); 

        } catch (error) {
            console.error('Error al crear material:', error.response || error);
            alert('Fallo al agregar el material. Revise que los campos sean válidos y el tamaño de la imagen.');
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


    // --- MANEJO DE MODAL DE EDICIÓN DE MATERIALES (EXISTENTE) ---
    const openMaterialEditModal = (material) => {
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

        const { id, ...updatedData } = editingMaterial;
        
        updatedData.precio_unitario = parseFloat(updatedData.precio_unitario);
        updatedData.stock = parseInt(updatedData.stock);

        try {
            const config = { headers: { Authorization: user.token } };
            
            await axios.put(`${API_ROUTES.MATERIALS}/admin/${id}`, updatedData, config);
            
            alert(`Material '${updatedData.nombre}' actualizado exitosamente.`);
            
            closeMaterialEditModal();
            fetchAdminData(); 
            
        } catch (error) {
            console.error('Error al actualizar material:', error.response || error);
            alert('Fallo al actualizar el material. Revise la consola del navegador.');
        }
    };

    // --- FUNCIÓN: INACTIVAR/ACTIVAR MATERIAL (Soft Delete) ---
    const handleToggleActive = async (materialId, materialNombre, currentMaterial) => {
        const currentActiveStatus = currentMaterial.activo; 
        const newState = currentActiveStatus === 1 ? 0 : 1;
        const action = newState === 0 ? 'inactivar' : 'activar';
        
        if (!window.confirm(`¿Estás seguro de que deseas ${action} el material: ${materialNombre} (ID: ${materialId})? Esto afectará su visibilidad en el catálogo.`)) {
            return;
        }

        try {
            const config = { headers: { Authorization: user.token } };
            
            if (newState === 0) {
                // Para INACTIVAR, usamos el endpoint DELETE (Soft Delete)
                await axios.delete(`${API_ROUTES.MATERIALS}/admin/${materialId}`, config);
            } else {
                // Para ACTIVAR, usamos el endpoint PUT/Actualización
                const updatedData = { 
                    ...currentMaterial,
                    activo: 1, 
                };
                
                await axios.put(`${API_ROUTES.MATERIALS}/admin/${materialId}`, updatedData, config);
            }
            
            alert(`Material '${materialNombre}' ${action} exitosamente.`);
            
            fetchAdminData(); 

        } catch (error) {
            console.error('Error al cambiar estado del material:', error.response || error);
            const errorMessage = error.response?.data?.message || `Fallo al ${action} el material.`;
            alert(errorMessage);
        }
    };


    if (loading) {
        return <div className="loading-message">Cargando Dashboard de Administración...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }
    
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
                        
                        {/* FORMULARIO DE CREACIÓN (MODIFICADO) */}
                        <form onSubmit={handleCreateMaterial} className="material-form-grid">
                            
                            {/* Campos de texto */}
                            <input type="text" name="nombre" placeholder="Nombre (Ej: Mini Split 1 Ton)" value={newMaterial.nombre} onChange={handleMaterialChange} required />
                            <input type="text" name="categoria" placeholder="Categoría (Ej: Climatización)" value={newMaterial.categoria} onChange={handleMaterialChange} required />
                            <input type="number" name="precio_unitario" placeholder="Precio ($)" value={newMaterial.precio_unitario} onChange={handleMaterialChange} required />
                            <input type="number" name="stock" placeholder="Stock Inicial" value={newMaterial.stock} onChange={handleMaterialChange} required />
                            
                            {/* --- CAMBIO CLAVE: INPUT FILE --- */}
                            <div style={{ gridColumn: 'span 2' }}> 
                                <label htmlFor="imagen" style={{ display: 'block', marginBottom: '5px' }}>Subir Imagen del Producto (Máx 5MB):</label>
                                <input 
                                    type="file" 
                                    id="imagen" 
                                    name="imagen" 
                                    accept="image/*" 
                                    onChange={handleMaterialChange} 
                                    className="input-file-custom" // Puedes añadir un estilo si quieres personalizar el input file
                                />
                                {newMaterial.imagen && <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>Archivo seleccionado: **{newMaterial.imagen.name}**</p>}
                            </div>
                            {/* ----------------------------------- */}

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
                                        <th>Estado</th> 
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
                                                <span style={{ color: mat.activo === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {mat.activo === 1 ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>

                                            <td>
                                                <button 
                                                    onClick={() => openMaterialEditModal(mat)} 
                                                    className="btn btn-default btn-small"
                                                    style={{ marginRight: '10px' }}
                                                >
                                                    Editar
                                                </button> 
                                                
                                                <button
                                                    onClick={() => handleToggleActive(mat.id, mat.nombre, mat)}
                                                    className={`btn btn-small ${mat.activo === 1 ? 'btn-delete' : 'btn-primary'}`}
                                                >
                                                    {mat.activo === 1 ? 'Inactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}
                
                {/* --- CONTENIDO PESTAÑA: PEDIDOS E-COMMERCE (REINSERTADO) --- */}
                {activeTab === 'orders' && (
                    <section className="admin-orders-table">
                        <h2>Pedidos Recientes</h2>
                        {orders.length === 0 ? (
                            <p>No hay pedidos pendientes.</p>
                        ) : (
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
                                            <td>
                                                <button 
                                                    onClick={() => openEditModal(order)} 
                                                    className="btn btn-primary btn-small"
                                                >
                                                    Ver/Procesar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}

                {/* --- CONTENIDO PESTAÑA: SOLICITUDES DE SERVICIO (REINSERTADO) --- */}
                {activeTab === 'services' && (
                    <section className="admin-services-table">
                        <h2>Leads de Servicio Pendientes</h2>
                        {services.length === 0 ? (
                            <p>No hay solicitudes de servicio pendientes.</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Servicio</th>
                                        <th>Descripción</th>
                                        <th>Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
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
                                            <td>
                                                <button 
                                                    onClick={() => openEditModal(service)} 
                                                    className="btn btn-primary btn-small"
                                                >
                                                    Actualizar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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

            {/* --- MODAL DE EDICIÓN DE MATERIALES (CORREGIDO CON CUADRÍCULA) --- */}
            {editingMaterial && (
                <div className="modal-overlay">
                    <form className="modal-content" onSubmit={handleUpdateMaterial}>
                        <h3>Editar Material - ID: {editingMaterial.id}</h3>
                        
                        <div className="modal-form-grid"> 

                            {/* Fila 1: Nombre */}
                            <div className="full-span">
                                <label htmlFor="nombre">Nombre (Ej: Mini Split 1 Ton):</label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    value={editingMaterial.nombre}
                                    onChange={handleMaterialEditChange}
                                    required
                                />
                            </div>
                            
                            {/* Fila 2: Categoría y Precio Unitario */}
                            <div>
                                <label htmlFor="categoria">Categoría:</label>
                                <input
                                    id="categoria"
                                    name="categoria"
                                    type="text"
                                    value={editingMaterial.categoria}
                                    onChange={handleMaterialEditChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="precio_unitario">Precio Unitario ($):</label>
                                <input
                                    id="precio_unitario"
                                    name="precio_unitario"
                                    type="number"
                                    step="0.01"
                                    value={editingMaterial.precio_unitario}
                                    onChange={handleMaterialEditChange}
                                    required
                                />
                            </div>

                            {/* Fila 3: Stock */}
                            <div className="full-span">
                                <label htmlFor="stock">Stock Inicial:</label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={editingMaterial.stock}
                                    onChange={handleMaterialEditChange}
                                    required
                                />
                            </div>

                            {/* Fila 4: URL de Imagen (Ocupa todo el ancho) */}
                            {/* NOTA: Mantendremos la edición por URL simple aquí, la subida de archivos es más compleja de integrar en la edición PUT */}
                            <div className="full-span">
                                <label htmlFor="imagen_url">URL de Imagen (Opcional):</label>
                                <input
                                    id="imagen_url"
                                    name="imagen_url"
                                    type="text"
                                    value={editingMaterial.imagen_url || ''}
                                    onChange={handleMaterialEditChange}
                                />
                            </div>

                            {/* Fila 5: Descripción Detallada (Textarea ancho) */}
                            <div className="full-span">
                                <label htmlFor="descripcion">Descripción detallada (Medidas, Especificaciones):</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={editingMaterial.descripcion || ''}
                                    onChange={handleMaterialEditChange}
                                />
                            </div>

                        </div>

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