import { useContext } from "react";
import { AuthContext } from "../../../App";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  if (!user) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">

      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <span className="font-semibold">Panel Administrador</span>
        <button
          onClick={logout}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
          Cerrar sesión
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">

        <h1 className="text-2xl font-semibold">Bienvenido, Admin</h1>
        <p className="text-gray-500">Aquí podrás gestionar todo el sistema.</p>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {[
            { name: "Gestión de Usuarios", route: "/admin/users" },
            { name: "Pacientes", route: "/admin/patients" },
            { name: "Contenido y Recursos", route: "/admin/content" },
            { name: "Reportes", route: "/admin/reports" },
            { name: "Configuración General", route: "/admin/settings" }
          ].map((i) => (
            <Link
              key={i.route}
              to={i.route}
              className="border p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition text-center"
            >
              {i.name}
            </Link>
          ))}

        </div>
      </main>
    </div>
  );
}
