// frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="homepage">
      <section className="hero-section">
        <h1>Volt Multiservicios: Soluciones Eléctricas y Climatización a tu Alcance.</h1>
        <p>Encuentra los materiales que necesitas o agenda un servicio técnico profesional en un solo lugar.</p>
        
        <div className="cta-grid">
          {/* CTA 1: E-commerce (Monetización Directa) */}
          <div className="cta-card product-cta">
            <h2>🛒 Venta de Materiales</h2>
            <p>Explora nuestro catálogo completo de cables, equipos de A/C, paneles solares y más.</p>
            <Link to="/catalogo" className="btn btn-primary">Ir al Catálogo</Link>
          </div>

          {/* CTA 2: Servicios (Generación de Leads) */}
          <div className="cta-card service-cta">
            <h2>🔧 Solicitar Servicio Técnico</h2>
            <p>Agenda tu instalación, mantenimiento de A/C o revisión eléctrica con nuestros expertos certificados.</p>
            <Link to="/servicios" className="btn btn-secondary">Agenda tu Cita</Link>
          </div>
        </div>
      </section>
      
      {/* Sección de Confianza y Marcas (Volteck, Mirage, Jusa, etc. que se ven en tu tienda) */}
      <section className="brands-section">
          <h2>Trabajamos con las mejores marcas</h2>
          {/* Aquí irían logos de VOLTECK, MIRAGE, JUSA, etc. */}
      </section>
    </div>
  );
};

export default HomePage;    