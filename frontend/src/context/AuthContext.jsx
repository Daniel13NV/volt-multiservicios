// frontend/src/context/AuthContext.jsx (CORREGIDO Y COMPLETO)

import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook personalizado
export const useAuth = () => useContext(AuthContext);

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    
    const readInitialState = () => {
        const token = localStorage.getItem('volt_token');
        const userName = localStorage.getItem('volt_userName');
        const clientId = localStorage.getItem('volt_clientId'); 

        if (token && userName && clientId) {
            return { 
                userName, 
                token, 
                // CORRECCIÓN CLAVE: Asegurar que clientId sea SIEMPRE un número
                clientId: parseInt(clientId) 
            };
        }
        return null;
    };
    
    const [user, setUser] = useState(readInitialState);
    const [loading, setLoading] = useState(false); 

    // Función de Login (Recibe { token, userName, clientId })
    const login = (userData) => {
        localStorage.setItem('volt_token', userData.token);
        localStorage.setItem('volt_userName', userData.userName);
        localStorage.setItem('volt_clientId', userData.clientId); 
        
        // Aseguramos que el estado interno también tenga el ID como número
        setUser({ ...userData, clientId: parseInt(userData.clientId) }); 
    };

    // Función de Logout (Limpieza Completa y Redirección)
    const logout = () => {
        localStorage.removeItem('volt_token');
        localStorage.removeItem('volt_userName');
        localStorage.removeItem('volt_clientId'); 
        localStorage.removeItem('volt_cart'); 
        
        setUser(null);
        // Forzar recarga inmediata para limpiar el Header sin depender del historial
        window.location.href = '/login'; 
    };

    const isLoggedIn = !!user; 

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};