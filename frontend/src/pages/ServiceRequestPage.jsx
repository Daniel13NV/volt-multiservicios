// frontend/src/pages/ServiceRequestPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { API_ROUTES } from '../config/api';
import { useAuth } from '../context/AuthContext'; // Necesario para obtener el token

const ServiceRequestPage = () => {
  const { user } = useAuth(); // Obtener el usuario (para el token)
    
  const [formData, setFormData] = useState({
    tipo_servicio: 'Mantenimiento de A/C', // Valor por defecto
    descripcion_problema: '',
    // Nota: cliente_id se obtiene del backend via token
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      // El cliente_id ya no es necesario aquí, el backend lo obtiene de req.user.id
      const payload = {
        ...formData,
        // fecha_programada se podría añadir aquí
      };
      
      // Llama al endpoint POST /api/servicios
      // Aseguramos que el token se envíe en la cabecera
      const response = await axios.post(API_ROUTES.SERVICES, payload, {
          headers: {
              Authorization: user.token, // Usamos el token del usuario logueado
          },
      });
      
      setMessage('✅ ¡Solicitud enviada! Nos comunicaremos contigo en breve para coordinar el servicio.');
      setFormData({ // Resetear formulario
        tipo_servicio: 'Mantenimiento de A/C',
        descripcion_problema: '',
      });

    } catch (err) {
      console.error("Error al enviar solicitud de servicio:", err.response ? err.response.data : err.message);
      setError('Error al registrar la solicitud. Por favor, verifica tu conexión o intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-page">
      <h1>Solicitar Instalación o Mantenimiento Técnico</h1>
      <p>Cuéntanos qué necesitas para que podamos asignarte un técnico especializado.</p>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* MENSAJE OPCIONAL para verificar que el ID está asociado */}
      {user && (
          <div className="warning-message">
              Enviando solicitud como: <strong>{user.userName}</strong> (ID: {user.clientId}).
          </div>
      )}

      <form className="service-form" onSubmit={handleSubmit}>
        
        <label htmlFor="tipo_servicio">Tipo de Servicio Requerido:</label>
        <select 
          id="tipo_servicio" 
          name="tipo_servicio" 
          value={formData.tipo_servicio} 
          onChange={handleChange}
          required
        >
          <option value="Mantenimiento de A/C">Mantenimiento de A/C</option>
          <option value="Instalación de A/C">Instalación de A/C</option>
          <option value="Reparación Eléctrica">Reparación Eléctrica (Baja Tensión)</option>
          <option value="Instalación Eléctrica">Instalación Eléctrica Completa</option>
          <option value="Paneles Solares">Cotización de Paneles Solares</option>
          <option value="Otro">Otro servicio</option>
        </select>
        
        <label htmlFor="descripcion_problema">Describe tu Solicitud o Problema:</label>
        <textarea
          id="descripcion_problema"
          name="descripcion_problema"
          rows="6"
          placeholder="Ej: Necesito mantenimiento preventivo para dos mini splits de 1 tonelada. O: Hay un cortocircuito en el circuito de la cocina."
          value={formData.descripcion_problema}
          onChange={handleChange}
          required
        ></textarea>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </form>
    </div>
  );
};

export default ServiceRequestPage;