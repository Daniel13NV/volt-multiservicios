// frontend/src/components/ProductCard.jsx

import React from 'react';
import { useCart } from '../context/CartContext'; 

const ProductCard = ({ material }) => {
  const { addToCart } = useCart(); // Obtener la función de añadir al carrito

  const handleAddToCart = () => {
    // La lógica de añadir al carrito usa el objeto 'material' completo
    addToCart(material);
    alert(`Se ha añadido ${material.nombre} al carrito.`);
  };

  // --- CORRECCIÓN DE ERROR ---
  // 1. Convertir el precio a número flotante para asegurar que .toFixed funcione.
  const numericPrice = parseFloat(material.precio_unitario);

  // 2. Determinar el precio a mostrar (si falla la conversión, mostrar 0.00)
  const displayPrice = isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  
  // Determinar si el producto está agotado
  const isOutOfStock = material.stock <= 0;

  return (
    <div className="product-card">
      <img 
        src={material.imagen_url || '/placeholder.png'} 
        alt={material.nombre} 
        className="product-image" 
      />
      <div className="card-body">
        <h3 className="product-name">{material.nombre}</h3>
        <p className="product-category">Categoría: {material.categoria}</p>
        <p className="product-description">{material.descripcion.substring(0, 80)}...</p>
        
        <div className="price-stock-info">
          <span className="product-price">
            ${displayPrice} {/* <--- Usamos el precio formateado correctamente */}
          </span>
          <span className={`product-stock ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
            {isOutOfStock ? 'Agotado' : `En Stock: ${material.stock}`}
          </span>
        </div>

        <button 
          onClick={handleAddToCart} 
          className={`btn ${isOutOfStock ? 'btn-disabled' : 'btn-add-to-cart'}`}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Notificarme' : 'Añadir al Carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;