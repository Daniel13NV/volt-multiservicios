// frontend/src/pages/CheckoutPage.jsx (CORREGIDO Y COMPLETO)

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <--- CORRECCIÓN AQUÍ: Importar Link
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Importar axios para la lógica real
import { API_ROUTES } from '../config/api'; // Importar API_ROUTES

const CheckoutPage = () => {
  const { cartItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirige al carrito si está vacío para evitar un checkout sin productos
  useEffect(() => {
    if (cartItems.length === 0) {
      alert("No puedes proceder al checkout con el carrito vacío.");
      navigate('/carrito');
    }
  }, [cartItems, navigate]);

  const handleConfirmOrder = async () => {
    // Verificar que el usuario y el carrito sean válidos antes de enviar la API
    if (cartItems.length === 0 || !user || !user.clientId) {
        alert("Error: El carrito está vacío o el ID de usuario no está disponible.");
        return;
    }

    // Preparar el payload para el backend
    const orderPayload = {
        cliente_id: user.clientId, // Obtenido del contexto de autenticación
        total: total,
        // En un proyecto real, la dirección se obtendría de un formulario en esta página
        direccion_envio: user.direccion_envio || "Dirección pendiente de definir en perfil", 
        items: cartItems.map(item => ({ 
            material_id: item.id, 
            cantidad: item.quantity, 
            precio_venta: parseFloat(item.precio_unitario) // Usar el precio unitario del contexto
        })),
    };

    if (!window.confirm(`¿Confirmar el pedido por un total de $${total.toFixed(2)}?`)) {
        return;
    }

    try {
        // --- LLAMADA REAL AL BACKEND (POST /api/pedidos) ---
        const response = await axios.post(API_ROUTES.ORDERS, orderPayload, {
            headers: {
                Authorization: user.token // Requiere autenticación para el pedido
            }
        });
        
        // Simulación de éxito
        alert(`✅ ¡Pedido N° ${response.data.pedidoId} confirmado!\nEl stock ha sido descontado.`);
        
        // Limpiar el carrito después del éxito
        clearCart();
        
        // Redirigir al perfil del usuario
        navigate('/perfil');

    } catch (error) {
        console.error("Error al procesar el pedido:", error.response || error);
        
        let errorMessage = "Error desconocido al procesar la compra.";
        if (error.response && error.response.status === 400) {
            errorMessage = error.response.data.message || "Error de datos: verifica el stock o el ID del cliente.";
        }
        
        alert(`❌ Error al completar el pedido:\n${errorMessage}`);
    }
  };
  
  // Asumimos que el usuario.id está disponible del contexto (user.clientId)
  const displayUserName = user?.userName || 'Cliente';
  const displayEmail = user?.email || 'No disponible';
  
  if (cartItems.length === 0) {
      // El useEffect ya redirige, pero para evitar un flash:
      return null;
  }

  return (
    <div className="checkout-page">
      <h1>Finalizar Pedido</h1>
      
      <div className="checkout-layout">
        
        {/* Columna 1: Información del Cliente y Envío */}
        <div className="checkout-section">
          <h2>1. Datos de Envío</h2>
          <div className="user-info-box">
            <p><strong>Cliente:</strong> {displayUserName} {user?.apellido || 'No especificado'}</p>
            <p><strong>Email:</strong> {displayEmail}</p>
            <p><strong>Teléfono:</strong> {user?.telefono || "Añadir teléfono"}</p>
            <p>
                <strong>Dirección de Envío:</strong> 
                {user?.direccion_envio || "Por favor, añada una dirección en su perfil."}
            </p>
          </div>
          <p className="checkout-note">
             * Para cambiar la dirección, edite su <Link to="/perfil">perfil de usuario</Link>.
          </p>
          
          <h2>2. Método de Pago</h2>
          <div className="payment-options">
            <label className="payment-option selected">
                <input type="radio" name="payment" value="transferencia" defaultChecked />
                Transferencia Bancaria (Pago al recibir factura)
            </label>
            <label className="payment-option disabled">
                <input type="radio" name="payment" value="tarjeta" disabled />
                Tarjeta de Crédito / Débito (Integración pendiente)
            </label>
          </div>
        </div>

        {/* Columna 2: Resumen del Pedido */}
        <div className="checkout-summary-container">
          <h2>3. Resumen Final</h2>
          <div className="order-summary-box">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.quantity} x {item.nombre}</span>
                <span>${(parseFloat(item.precio_unitario) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div className="summary-details">
                <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span>Costo de Envío:</span>
                    <span>$0.00</span>
                </div>
                <div className="summary-row total-final">
                    <strong>Total a Pagar:</strong>
                    <strong>${total.toFixed(2)}</strong>
                </div>
            </div>

            <button 
              onClick={handleConfirmOrder} 
              className="btn btn-primary btn-full-width"
            >
              Confirmar Pedido y Pagar
            </button>
            <Link to="/carrito" className="btn btn-secondary btn-full-width-link">
              Volver al Carrito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;