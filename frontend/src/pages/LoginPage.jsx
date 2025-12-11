// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtener la función de login del contexto

  // Estados de formularios
  const [isLoginView, setIsLoginView] = useState(true); // Alterna entre Login y Registro
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nombre: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejadores de cambio
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE REGISTRO ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(API_ROUTES.CLIENTS + '/registro', registerForm);
      
      setMessage('✅ Registro exitoso. Ahora puedes iniciar sesión.');
      setRegisterForm({ nombre: '', email: '', password: '' }); // Limpiar formulario
      setIsLoginView(true); // Mueve al usuario a la vista de login

    } catch (err) {
      console.error("Error en registro:", err.response ? err.response.data : err.message);
      const errorMessage = err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Error al registrar. Inténtalo de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE LOGIN ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(API_ROUTES.CLIENTS + '/login', loginForm);
      
      // Obtener los datos incluyendo el ID del cliente
      const { token, userName, clientId } = response.data;
      
      // 1. Llamar a la función de contexto para actualizar el estado global
      // Esto guarda token, userName y clientId en el estado y en localStorage
      login({ token, userName, clientId }); 
      
      setMessage(`👋 ¡Bienvenido, ${userName}!`);
      setLoginForm({ email: '', password: '' }); // Limpiar formulario
      
      // 2. REDIRECCIÓN CONDICIONAL POR ROL
      // Asumimos que clientId === 1 es el Administrador
      if (clientId === 1) {
          navigate('/dashboard'); // Redirigir al Dashboard del Admin
      } else {
          navigate('/perfil'); // Redirigir al Perfil del Cliente
      }

    } catch (err) {
      console.error("Error en login:", err.response ? err.response.data : err.message);
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-form-container">
        
        {/* Mensajes de Éxito o Error */}
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Botón para alternar entre vistas */}
        <button 
            onClick={() => {
                setIsLoginView(!isLoginView);
                setMessage(''); // Limpiar mensajes al cambiar de vista
                setError('');
            }} 
            className="btn btn-switch"
            disabled={loading}
        >
            {isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
        </button>

        {/* --- FORMULARIO DE LOGIN --- */}
        {isLoginView ? (
          <form className="auth-form login" onSubmit={handleLoginSubmit}>
            <h2>Iniciar Sesión</h2>
            <input 
              type="email" 
              name="email" 
              placeholder="Correo Electrónico" 
              value={loginForm.email}
              onChange={handleLoginChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Contraseña" 
              value={loginForm.password}
              onChange={handleLoginChange}
              required 
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        ) : (
          /* --- FORMULARIO DE REGISTRO --- */
          <form className="auth-form register" onSubmit={handleRegisterSubmit}>
            <h2>Crear Nueva Cuenta</h2>
            <input 
              type="text" 
              name="nombre" 
              placeholder="Nombre Completo" 
              value={registerForm.nombre}
              onChange={handleRegisterChange}
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Correo Electrónico" 
              value={registerForm.email}
              onChange={handleRegisterChange}
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Contraseña" 
              value={registerForm.password}
              onChange={handleRegisterChange}
              required 
            />
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;