export default function PublicHome() {
  return (
    <div className="min-h-screen bg-white text-gray-700 flex flex-col justify-between">

      {/* Header minimal */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <img src="/MyPsico.png" alt="MyPsico" className="h-8 opacity-90" />

        <a href="/Login"
          className="text-sm font-medium hover:text-gray-900 transition">
          Iniciar sesión
        </a>
      </header>

      {/* Hero principal */}
      <section className="flex flex-col items-center text-center px-6 py-20 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Un espacio para sanar en silencio
        </h1>

        <p className="max-w-lg text-gray-500 leading-relaxed">
          Psicoterapia, neurociencia y espiritualidad.  
          Sin ruido. Sin prisa. A tu ritmo.
        </p>

        <a
          href="/Login"
          className="px-6 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-50 transition">
          Entrar al proceso
        </a>
      </section>

      {/* 3 pilares muy ligeros */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-16 max-w-4xl mx-auto text-center">
        {[
          "Respira • Presencia",
          "Conócete • Integra",
          "Cura • Crece"
        ].map((text, i) => (
          <div key={i} className="p-6 border rounded-lg text-sm tracking-wide text-gray-600">
            {text}
          </div>
        ))}
      </section>

      {/* Footer mínimo */}
      <footer className="text-center text-xs py-6 text-gray-400">
        © {new Date().getFullYear()} MyPsico — Camino interior.
      </footer>

    </div>
  );
}
