import { Link } from "react-router-dom";

export default function VisitorHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 flex flex-col items-center text-gray-800">

      {/* Hero principal */}
      <header className="w-full text-center py-24 px-6">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-800">
          Acompañamiento psicológico real.
        </h1>
        <p className="mt-4 text-xl max-w-2xl mx-auto text-slate-600">
          Emoción + evidencia clínica. Una plataforma diseñada para sanar, crecer y vivir con mayor claridad.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/Login" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md">
            Iniciar sesión
          </Link>
          <Link to="/PublicHome"
            className="px-8 py-3 border border-slate-700 hover:bg-slate-800 hover:text-white rounded-lg font-medium">
            Explorar contenido gratuito
          </Link>
        </div>
      </header>

      {/* Beneficios / Propuesta de valor */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-16">
        {[
          { title: "Apoyo humano y espiritual", desc: "Terapia con enfoque cognitivo, emocional y trascendente." },
          { title: "Planes y herramientas personalizadas", desc: "Tu sanación no se improvisa, se construye." },
          { title: "Acompañamiento continuo", desc: "No solo sesiones: recursos, guía y seguimiento." }
        ].map((b, i) => (
          <div key={i} className="bg-white shadow-lg p-8 rounded-xl border border-slate-200 hover:scale-[1.02] transition">
            <h3 className="text-xl font-bold text-slate-800">{b.title}</h3>
            <p className="mt-3 text-slate-600">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Sección emocional invitación */}
      <section className="text-center py-24 px-6 w-full bg-white border-t border-gray-200">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
          La vida no se cambia con inspiración, sino con acompañamiento.
        </h2>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-slate-600">
          Por eso esta plataforma existe: para sostenerte mientras avanzas.
        </p>

        <Link to="/Login"
          className="mt-8 inline-block px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold shadow-md">
          Comenzar mi proceso
        </Link>
      </section>
    </div>
  );
}
