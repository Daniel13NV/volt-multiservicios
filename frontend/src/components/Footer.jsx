// frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // <--- ¡LÍNEA AÑADIDA!
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Volt Multiservicios. Todos los derechos reservados.</p>
          <nav className="footer-nav">
            <Link to="/nosotros">Quiénes Somos</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/terminos">Términos y Condiciones</Link>
          </nav>
        </div>
        <div className="contact-info">
          {/* Basado en las imágenes de su tienda */}
          <p>📞 Teléfono: 962 239 2608</p>
          <p>📍 Dirección: (Ubicación de la tienda)</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;