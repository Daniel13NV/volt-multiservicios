// frontend/src/pages/CatalogPage.jsx (FINALIZADO con LÓGICA DE FETCH)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { API_ROUTES } from '../config/api';

const CatalogPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener los datos de la API
    const fetchMaterials = async () => {
      try {
        // Llama al endpoint GET /api/materiales
        const response = await axios.get(API_ROUTES.MATERIALS);
        setMaterials(response.data);
        setLoading(false);
      } catch (err) {
        // En caso de que el backend no esté activo o haya un error
        console.error("Error al cargar el catálogo:", err);
        setError("Error al cargar el catálogo. Verifique que el servidor backend esté activo en puerto 3001.");
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  if (loading) {
    return <div className="loading-message">Cargando catálogo de Volt Multiservicios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (materials.length === 0) {
      return (
          <div className="empty-catalog">
              <h1>Catálogo Temporalmente Vacío</h1>
              <p>No se encontraron materiales. Agregue productos a la tabla 'Materiales' desde su backend para verlos aquí.</p>
          </div>
      );
  }

  return (
    <div className="catalog-page">
      <h1>Catálogo de Materiales Eléctricos y Climatización</h1>
      
      {/* Sección de Filtros (Simple) */}
      <div className="filters-bar">
        <span>Total de Productos: {materials.length}</span>
        {/* Aquí iría la lógica de filtros y búsqueda */}
      </div>

      {/* Grid de Productos - Mapeo del Array 'materials' */}
      <div className="product-grid">
        {materials.map(material => (
          <ProductCard key={material.id} material={material} />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;