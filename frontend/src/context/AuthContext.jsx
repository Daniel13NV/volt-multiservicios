// frontend/src/context/AuthContext.jsx (CORREGIDO Y COMPLETO)

import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook personalizado
export const useAuth = () => useContext(AuthContext);

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    
    // Función para leer el estado inicial (para evitar duplicación)
    const readInitialState = () => {
        const token = localStorage.getItem('volt_token');
        const userName = localStorage.getItem('volt_userName');
        const clientId = localStorage.getItem('volt_clientId'); 

        if (token && userName && clientId) {
            return { 
                userName, 
                token, 
                clientId: parseInt(clientId)
            };
        }
        return null;
    };
    
    const [user, setUser] = useState(readInitialState);
    const [loading, setLoading] = useState(false); // Asumimos que la lectura es rápida

    // Función de Login (Recibe { token, userName, clientId })
    const login = (userData) => {
        localStorage.setItem('volt_token', userData.token);
        localStorage.setItem('volt_userName', userData.userName);
        localStorage.setItem('volt_clientId', userData.clientId); 
        setUser(userData);
    };

    // Función de Logout (CORRECCIÓN CLAVE: LIMPIEZA TOTAL)
    const logout = () => {
        // Limpia toda la información de autenticación
        localStorage.removeItem('volt_token');
        localStorage.removeItem('volt_userName');
        localStorage.removeItem('volt_clientId'); 
        
        // Limpia la información del carrito para evitar persistencia entre usuarios
        localStorage.removeItem('volt_cart'); 
        
        setUser(null);
    };

    const isLoggedIn = !!user; 

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};