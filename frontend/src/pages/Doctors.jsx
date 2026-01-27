import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Bell,
  UserPlus,
  Mail,
  Lock,
  User,
  Users,
  Shield,
  Activity,
  CheckCircle,
  Calendar,
} from "lucide-react";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Obtener datos del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? JSON.parse(userStr)
    : { name: "Usuario", id: null, role: "guest" };
  const userName = user.name || "Administrador";

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost/backend/get_doctors.php");
      setDoctors(res.data);
      setFilteredDoctors(res.data);
    } catch (error) {
      console.error("Error cargando doctores:", error);
      showNotification("Error al cargar doctores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filtrar doctores según búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.email &&
            doctor.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost/backend/create_doctor.php", form);
      showNotification("✅ Doctor creado correctamente", "success");
      setForm({ name: "", email: "", password: "" });
      fetchDoctors();
    } catch (error) {
      showNotification(
        "❌ Error: " + (error.response?.data?.error || "Desconocido"),
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-600 font-medium animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span>Cargando Doctores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- NOTIFICACIÓN TOAST --- */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl animate-fade-in-up ${notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* --- HEADER CON BÚSQUEDA --- */}
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl sticky top-0 z-10 border border-white/20">
        <div>
          <p className="text-sm text-gray-500">Gestión de Personal</p>
          <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
          <div className="flex items-center gap-2 bg-[#F4F7FE] px-4 py-2 rounded-full text-gray-500">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-64"
            />
          </div>
          <button className="text-gray-400 hover:text-blue-600 relative p-1">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-blue-600/20">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {/* --- ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="text-blue-600" size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Doctores</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {doctors.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Activos</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {doctors.length}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Activity className="text-purple-600" size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Resultados</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-2">
            {filteredDoctors.length}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- FORMULARIO DE CREACIÓN MEJORADO --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Nuevo Doctor
              </h3>
              <p className="text-sm text-gray-500">
                Registrar nuevo profesional
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Input Nombre */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nombre Completo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Input Email */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail size={18} />
              </div>
              <input
                className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                type="email"
                placeholder="Correo Electrónico"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </div>
              <input
                className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                type="password"
                placeholder="Contraseña de Acceso"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <UserPlus size={20} />
              Crear Doctor
            </button>
          </form>
        </div>

        {/* --- TABLA DE DOCTORES MEJORADA --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Doctores Registrados
              </h3>
              <p className="text-sm text-gray-500">
                {filteredDoctors.length} profesionales en el sistema
              </p>
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-gray-400 font-medium">
                {searchTerm
                  ? "No se encontraron doctores con esos criterios."
                  : "No hay doctores registrados."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600 text-sm border-b border-gray-100">
                    <th className="px-6 py-4 font-bold">DOCTOR</th>
                    <th className="px-6 py-4 font-bold">CORREO</th>
                    <th className="px-6 py-4 font-bold">ESTADO</th>
                    <th className="px-6 py-4 font-bold">REGISTRO</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredDoctors.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                            {doc.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              Dr. {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {doc.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {doc.email || "Sin correo"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                          <CheckCircle size={12} />
                          Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar size={12} />
                          {doc.created_at
                            ? new Date(doc.created_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
