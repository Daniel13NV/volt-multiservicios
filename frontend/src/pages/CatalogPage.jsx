// frontend/src/pages/CatalogPage.jsx (ACTUALIZADO con BÚSQUEDA y ENLACES)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom'; 

const CatalogPage = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); 
    const { addItemToCart } = useCart(); 

    // Función para obtener los materiales (ahora soporta búsqueda)
    const fetchMaterials = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
            // Construye la URL con o sin el parámetro 'q'
            const url = query ? `${API_ROUTES.MATERIALS}?q=${query}` : API_ROUTES.MATERIALS;
            
            const response = await axios.get(url);
            setMaterials(response.data);
        } catch (err) {
            console.error("Error al cargar materiales:", err);
            setError('Error al cargar el catálogo. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carga inicial sin query
        fetchMaterials(); 
    }, []);

    // Manejador para la búsqueda (se ejecuta al teclear para búsqueda instantánea)
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        // Búsqueda instantánea al teclear
        fetchMaterials(query); 
    };

    // Manejador para la búsqueda (ejecuta si se presiona Enter, aunque el onChange ya lo hace)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Si usamos onChange para la búsqueda instantánea, esta función es redundante
        // Pero la mantenemos para evitar el comportamiento por defecto del formulario.
    };

    // Componente de tarjeta de producto
    const ProductCard = ({ material }) => {
        
        const handleAddToCart = () => {
            if (material.stock > 0) {
                addItemToCart(material, 1);
                alert(`${material.nombre} añadido al carrito.`);
            } else {
                alert('Producto agotado.');
            }
        };

        return (
            <div className="product-card">
                {/* Enlace que lleva a la página de detalles del material */}
                <Link to={`/materiales/${material.id}`} className="product-card-link">
                    <img src={material.imagen_url || '/placeholder.png'} alt={material.nombre} className="product-image" />
                </Link>

                <div className="product-info">
                    <Link to={`/materiales/${material.id}`} className="product-title-link">
                        <h3>{material.nombre}</h3>
                    </Link>
                    <p className="product-category">{material.categoria}</p>
                    <p className="product-price">${parseFloat(material.precio_unitario).toFixed(2)}</p>
                </div>
                
                <div className="product-actions">
                    {material.stock > 0 ? (
                        <button onClick={handleAddToCart} className="btn btn-primary btn-small">
                            Añadir al Carrito
                        </button>
                    ) : (
                        <button disabled className="btn btn-disabled btn-small">Agotado</button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="catalog-page">
            <h1>Catálogo de Productos</h1>
            <p className="catalog-subtitle">Encuentra todos los materiales y equipos que necesitas, incluyendo productos Volteck.</p>

            {/* BARRA DE BÚSQUEDA */}
            <form onSubmit={handleSearchSubmit} className="search-bar">
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, categoría o especificación..." 
                    value={searchTerm}
                    onChange={handleSearch} 
                />
                <button type="submit" className="btn btn-secondary">Buscar</button>
            </form>

            {loading && <div className="loading-message">Cargando catálogo...</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="materials-list">
                {!loading && materials.length === 0 && (
                    <p>No se encontraron productos que coincidan con la búsqueda.</p>
                )}
                {materials.map(material => (
                    <ProductCard key={material.id} material={material} />
                ))}
            </div>
        </div>
    );
};

export default CatalogPage;