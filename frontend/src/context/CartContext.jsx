// frontend/src/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Crear el Contexto
const CartContext = createContext();

// 2. Hook personalizado para usar el contexto
export const useCart = () => useContext(CartContext);

// 3. Proveedor del Contexto
export const CartProvider = ({ children }) => {
  // Inicializamos el estado del carrito con lo que esté en localStorage (persistencia)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('volt_cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error("Error al cargar carrito de localStorage", e);
      return [];
    }
  });

  // Efecto para guardar el carrito en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem('volt_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Error al guardar carrito en localStorage", e);
    }
  }, [cartItems]);

  // Función de cálculo global
  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.precio_unitario * item.quantity), 0);
  };

  const total = calculateTotal(cartItems);

  // --- Funciones del CRUD del Carrito ---

  // Añadir/Incrementar un producto
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const exists = prevItems.find(item => item.id === product.id);

      if (exists) {
        // Si existe, incrementa la cantidad, asegurándose de no exceder el stock (aunque el backend lo verifica)
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        // Si no existe, añade el nuevo producto
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Eliminar completamente un producto
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Vaciar el carrito después de la compra
  const clearCart = () => {
    setCartItems([]);
  };

  // Exportar el valor del contexto
  const value = {
    cartItems,
    total,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};