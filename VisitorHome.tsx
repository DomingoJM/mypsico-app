// VisitorHome.tsx
import React from 'react';
import './VisitorHome.css'; // Creamos CSS separado para ligereza

const VisitorHome = () => {
  return (
    <main className="container">
      {/* Header */}
      <header className="header">
        <h1 className="logo">MyPsico</h1>
        <nav>
          <ul className="nav-list">
            <li><a href="#about">Sobre mí</a></li>
            <li><a href="#services">Servicios</a></li>
            <li><a href="#resources">Recursos</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Sanación integral basada en el Evangelio y la psicoterapia</h2>
        <p>Transforma tu vida con terapias online, recursos gratuitos y masterclasses para tu bienestar emocional y espiritual.</p>
        <a href="#resources" className="cta-button">Descarga tu libro digital</a>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <h3>Sobre mí</h3>
        <p>Soy psicoterapeuta especializado en integración espiritual y coaching personal. Mi misión es ayudarte a sanar emocional y espiritualmente, combinando la psicoterapia cognitiva con enseñanzas del Evangelio.</p>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <h3>Servicios</h3>
        <div className="cards">
          <div className="card">
            <h4>Terapia Individual</h4>
            <p>Sesiones personalizadas para tu bienestar emocional y espiritual.</p>
            <a href="#contact" className="card-link">Más info</a>
          </div>
          <div className="card">
            <h4>Masterclasses</h4>
            <p>Aprende técnicas de sanación y desarrollo personal desde tu casa.</p>
            <a href="#resources" className="card-link">Más info</a>
          </div>
          <div className="card">
            <h4>Recursos Gratuitos</h4>
            <p>Libros digitales, guías y ejercicios para tu crecimiento integral.</p>
            <a href="#resources" className="card-link">Descargar</a>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="section">
        <h3>Recursos Gratuitos</h3>
        <p>Accede a nuestro libro digital y masterclasses para empezar tu camino de sanación hoy mismo.</p>
        <a href="#" className="cta-button">Descarga Ahora</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 MyPsico. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
};

export default VisitorHome;
