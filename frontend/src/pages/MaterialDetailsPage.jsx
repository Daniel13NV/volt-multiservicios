// frontend/src/pages/MaterialDetailsPage.jsx (CORREGIDO para RUTA PÚBLICA)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useCart } from '../context/CartContext';

const MaterialDetailsPage = () => {
    const { id } = useParams();
    const { addItemToCart } = useCart();
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); 

    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                // CORRECCIÓN CLAVE: Usamos la nueva ruta pública /api/materiales/:id
                const url = `${API_ROUTES.MATERIALS}/${id}`;
                const response = await axios.get(url);
                
                setMaterial(response.data);

            } catch (err) {
                console.error("Error al obtener detalles del material:", err);
                // Si el servidor devuelve 404, mostramos un error más claro
                const errorMessage = err.response && err.response.status === 404 
                    ? 'Producto no encontrado o agotado.'
                    : 'Error al cargar la información del producto.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchMaterial();
    }, [id]);

    const handleAddToCart = () => {
        if (material) {
            addItemToCart(material, quantity);
            alert(`${quantity} ${material.nombre} añadido al carrito.`);
        }
    };

    if (loading) {
        return <div className="loading-message">Cargando detalles del material...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="material-details-page">
            <div className="product-card-details">
                {/* Muestra imagen o placeholder */}
                <img src={material.imagen_url || '/placeholder.png'} alt={material.nombre} className="product-image-details" />
                
                <div className="product-info-details">
                    <h1>{material.nombre}</h1>
                    <p className="product-category">Categoría: <strong>{material.categoria}</strong></p>
                    
                    <div className="product-price">
                        Precio: <span>${material.precio_unitario.toFixed(2)}</span>
                    </div>

                    <p className="product-stock">
                        Disponibilidad: {material.stock > 0 ? 
                            <span style={{color: 'green'}}>En Stock ({material.stock})</span> : 
                            <span style={{color: 'red'}}>Agotado</span>}
                    </p>

                    <div className="product-description-details">
                        <h3>Descripción y Especificaciones:</h3>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{material.descripcion || 'Sin descripción detallada.'}</p>
                    </div>

                    {material.stock > 0 && (
                        <div className="add-to-cart-controls">
                            <input 
                                type="number" 
                                min="1" 
                                max={material.stock}
                                value={quantity} 
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="quantity-input"
                            />
                            <button onClick={handleAddToCart} className="btn btn-primary">
                                Añadir al Carrito
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialDetailsPage;