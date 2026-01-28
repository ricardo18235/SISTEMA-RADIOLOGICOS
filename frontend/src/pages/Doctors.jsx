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
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";



export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Paginación y Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [notification, setNotification] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Obtener datos del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? JSON.parse(userStr)
    : { name: "Usuario", id: null, role: "guest" };
  const userName = user.name || "Administrador";

  const fetchDoctors = async (currentPage, search) => {
    try {
      setLoading(true);
      // Usamos el parametro 'limit' para activar el modo paginación en el backend
      const res = await axios.get(`http://localhost/backend/get_doctors.php?page=${currentPage}&limit=${limit}&search=${search}`);

      // El backend retorna { data: [...], pagination: {...} } en modo paginado
      setDoctors(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setPage(res.data.pagination.page);
    } catch (error) {
      console.error("Error cargando doctores:", error);
      showNotification("Error al cargar doctores", "error");
    } finally {
      setLoading(false);
    }
  };

  // Debounce para búsqueda
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchDoctors(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchDoctors(newPage, searchTerm);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        // Modo Edición
        await axios.post("http://localhost/backend/edit_doctor.php", {
          ...form,
          requester_role: user.role
        });
        showNotification("✅ Doctor actualizado correctamente", "success");
      } else {
        // Modo Creación
        await axios.post("http://localhost/backend/create_doctor.php", form);
        showNotification("✅ Doctor creado correctamente", "success");
      }
      setForm({ name: "", email: "", password: "" });
      fetchDoctors(page, searchTerm);
    } catch (error) {
      showNotification(
        "❌ Error: " + (error.response?.data?.error || "Desconocido"),
        "error"
      );
    }
  };

  const handleEdit = (doctor) => {
    setForm({
      id: doctor.id,
      name: doctor.name,
      email: doctor.email || "",
      password: ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setDoctorToDelete(id);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await axios.post("http://localhost/backend/delete_doctor.php", {
        id: doctorToDelete,
        requester_role: user.role
      });
      showNotification("🗑️ Doctor eliminado", "success");
      fetchDoctors(page, searchTerm);
    } catch (error) {
      showNotification("Error al eliminar", "error");
    } finally {
      setDoctorToDelete(null);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- FORMULARIO DE CREACIÓN MEJORADO --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {form.id ? <Edit className="text-blue-600" size={24} /> : <UserPlus className="text-blue-600" size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">
                {form.id ? "Editar Doctor" : "Nuevo Doctor"}
              </h3>
              <p className="text-sm text-gray-500">
                {form.id ? "Modificar datos del profesional" : "Registrar nuevo profesional"}
              </p>
            </div>
            {form.id && (
              <button
                onClick={() => setForm({ name: "", email: "", password: "" })}
                className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Cancelar Edición
              </button>
            )}
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
                placeholder={form.id ? "Nueva Contraseña (opcional)" : "Contraseña de Acceso"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required={!form.id}
              />
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              {form.id ? <Edit size={20} /> : <UserPlus size={20} />}
              {form.id ? "Guardar Cambios" : "Crear Doctor"}
            </button>
          </form>
        </div>

        {/* --- TABLA DE DOCTORES MEJORADA --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
          {/* Header de la tarjeta */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Doctores Registrados
                </h3>
                <p className="text-sm text-gray-500">
                  Gestiona los profesionales del sistema
                </p>
              </div>
            </div>
          </div>

          {/* Estado de Carga */}
          {loading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {doctors.length === 0 && !loading ? (
            <div className="p-12 text-center flex-1">
              <Users className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-gray-400 font-medium">
                {searchTerm
                  ? "No se encontraron doctores con esos criterios."
                  : "No hay doctores registrados."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto flex-1">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-600 text-sm border-b border-gray-100">
                      <th className="px-6 py-4 font-bold">DOCTOR</th>
                      <th className="px-6 py-4 font-bold">CORREO</th>
                      <th className="px-6 py-4 font-bold text-center">PACIENTES</th>
                      {(user.role === 'admin') && <th className="px-6 py-4 font-bold text-right">ACCIONES</th>}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {doctors.map((doc) => (
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
                                Dr. {doc.name.toUpperCase()}
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
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100">
                            {doc.patient_count || 0}
                          </span>
                        </td>
                        {(user.role === 'admin') && (
                          <td className="px-6 py-4 flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(doc)}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINACIÓN --- */}
              <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- MODAL CONFIRMACIÓN ELIMINAR --- */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                ¿Eliminar Doctor?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción eliminará permanentemente al doctor y le revocará el acceso al sistema. No se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDoctorToDelete(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
