import { useContext } from "react";
import { AuthContext } from "../../../App";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  if (!user) return <p className="text-center mt-10">Cargando...</p>;

  const menuItems = [
    { name: "Gestión de Usuarios", route: "/admin/users", icon: "👥", color: "from-blue-500 to-cyan-500", description: "Administra usuarios del sistema" },
    { name: "Pacientes", route: "/admin/patients", icon: "🏥", color: "from-purple-500 to-pink-500", description: "Gestiona pacientes y sus terapias" },
    { name: "Contenido y Recursos", route: "/admin/content", icon: "📚", color: "from-green-500 to-emerald-500", description: "Crea y edita contenido terapéutico" },
    { name: "Reportes", route: "/admin/reports", icon: "📊", color: "from-orange-500 to-amber-500", description: "Visualiza estadísticas y métricas" },
    { name: "Configuración General", route: "/admin/settings", icon: "⚙️", color: "from-gray-500 to-slate-500", description: "Ajustes del sistema" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
        .hover-scale {
          transition: all 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/MyPsico.png" alt="MyPsico" className="h-10" />
            <div>
              <span className="font-serif text-2xl text-gray-800">MyPsico</span>
              <p className="text-sm text-purple-600 font-medium">Panel Administrador</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full font-medium shadow-md transition-all hover:shadow-lg"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">

        <div className="slide-in mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-3">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Admin</span>
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Aquí podrás gestionar todo el sistema
          </p>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {menuItems.map((item, index) => (
            <Link
              key={item.route}
              to={item.route}
              className="block bg-white rounded-2xl p-8 shadow-lg hover-scale border border-gray-100 slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {item.name}
              </h3>
              <p className="text-gray-600 text-sm">
                {item.description}
              </p>
              <div className="mt-4 flex items-center text-purple-600 font-medium text-sm">
                Acceder <span className="ml-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Usuarios Totales", value: "124", icon: "👥", color: "text-blue-600" },
            { label: "Pacientes Activos", value: "89", icon: "🏥", color: "text-purple-600" },
            { label: "Contenidos", value: "256", icon: "📚", color: "text-green-600" },
            { label: "Sesiones Hoy", value: "12", icon: "📅", color: "text-orange-600" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 slide-in hover-scale"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
