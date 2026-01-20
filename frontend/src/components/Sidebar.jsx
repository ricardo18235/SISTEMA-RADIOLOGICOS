import {
  LayoutDashboard,
  Users,
  Stethoscope,
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Sidebar({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDoctorOrAdmin = user.role === "doctor" || user.role === "admin";

  // Clases para los enlaces
  const baseClass =
    "flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all duration-300 relative";
  const activeClass = "text-white bg-white/10 border-r-4 border-white"; // Efecto activo
  const inactiveClass = "text-blue-100 hover:bg-white/5 hover:text-white";

  return (
    <aside className="w-72 bg-blue-600 h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50 font-sans">
      {/* Logo Area */}
      <div className="p-8 pb-12">
        <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-2">
          Radiology<span className="font-light opacity-80">App</span>
        </h1>
      </div>

      {/* Menú Principal */}
      <nav className="flex-1 space-y-2">
        <p className="px-6 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 opacity-70">
          Menu
        </p>

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        <NavLink
          to="/dashboard/patients"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Users size={20} /> Pacientes
        </NavLink>

        <NavLink
          to="/dashboard/doctors"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <Stethoscope size={20} /> Doctores
        </NavLink>

        {/* Separador visual */}
        <div className="my-6"></div>

        <p className="px-6 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 opacity-70">
          General
        </p>

        <button className={`${baseClass} ${inactiveClass} w-full`}>
          <Settings size={20} /> Configuración
        </button>
        <button className={`${baseClass} ${inactiveClass} w-full`}>
          <HelpCircle size={20} /> Soporte
        </button>
      </nav>

      {/* Información del Usuario y Notificaciones */}
      <div className="border-t border-blue-500"></div>

      {/* Botón Salir */}
      <div className="p-6 border-t border-blue-500">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-blue-100 hover:text-white hover:bg-white/10 w-full px-4 py-3 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
