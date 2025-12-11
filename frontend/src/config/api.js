// frontend/src/config/api.js

// URL base de tu backend de Express (puerto 3001)
export const API_BASE_URL = 'http://localhost:3001/api';

// Rutas de los recursos
export const API_ROUTES = {
    MATERIALS: `${API_BASE_URL}/materiales`,
    CLIENTS: `${API_BASE_URL}/clientes`,
    ORDERS: `${API_BASE_URL}/pedidos`,
    SERVICES: `${API_BASE_URL}/servicios`,
};