// frontend/src/pages/CartPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  // Asegúrate de que las funciones del CartContext se adapten si no implementaste la lógica de decremento
  // Asumiremos que el CartContext está completo como se definió.
  const { cartItems, total, addToCart, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth(); // Para verificar si redirigimos al checkout

  // Función para manejar el incremento de cantidad (usa addToCart)
  const handleIncrease = (item) => {
    // Añadir 1 ítem más. El CartContext se encarga de no exceder el stock.
    addToCart(item, 1);
  };

  // Función para manejar la disminución o eliminación
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      // Para decrementar, debemos modificar el CartContext con una función updateQuantity
      // Por ahora, solo permitimos eliminar el producto o alertamos si la cantidad es 1
      alert("Para disminuir la cantidad, se necesita una función 'updateQuantity' en CartContext. Por ahora, si es 1, se elimina.");
    } else {
      // Si solo queda 1, se elimina del carrito
      removeFromCart(item.id);
    }
  };

  // Si el carrito está vacío, mostramos un mensaje amigable
  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <h1>🛒 Tu Carrito Está Vacío</h1>
        <p>Parece que aún no has añadido ningún material de electricidad o climatización.</p>
        <Link to="/catalogo" className="btn btn-primary">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Cesta de Materiales (Mi Carrito)</h1>
      
      <div className="cart-layout">
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.imagen_url || '/placeholder.png'} alt={item.nombre} className="cart-item-image" />
              <div className="item-details">
                <h3>{item.nombre}</h3>
                <p>Categoría: {item.categoria}</p>
                <p>Precio Unitario: ${parseFloat(item.precio_unitario).toFixed(2)}</p>
                <p>Subtotal: ${(parseFloat(item.precio_unitario) * item.quantity).toFixed(2)}</p>
              </div>
              
              <div className="item-quantity-control">
                {/* Modificado para llamar a la función de decrementar */}
                <button onClick={() => handleDecrease(item)} className="btn btn-quantity">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleIncrease(item)} className="btn btn-quantity">+</button>
              </div>

              {/* Botón para eliminar el producto completo */}
              <button onClick={() => removeFromCart(item.id)} className="btn btn-remove">Eliminar</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Resumen del Pedido</h2>
          <div className="summary-row">
            <span>Artículos Totales:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="summary-row total">
            <strong>Total a Pagar:</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
          
          <Link 
            // Redirige al checkout si está logueado, si no, al login
            to={isLoggedIn ? "/checkout" : "/login"} 
            className="btn btn-primary btn-checkout"
          >
            {isLoggedIn ? 'Proceder al Checkout' : 'Inicia Sesión para Comprar'}
          </Link>

          <button onClick={clearCart} className="btn btn-clear-cart">Vaciar Carrito</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;