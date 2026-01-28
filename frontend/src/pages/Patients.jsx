import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Bell, Users, FileImage, Calendar, Edit, Trash2, AlertTriangle } from "lucide-react";
import PatientHistoryModal from "../components/PatientHistoryModal";
import EditPatientModal from "../components/EditPatientModal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientDni, setSelectedPatientDni] = useState(null);

  // Estados para Edición/Eliminación
  const [editingPatient, setEditingPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Obtener datos del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? JSON.parse(userStr)
    : { name: "Usuario", id: null, role: "guest" };
  const userName = user.name || "Doctor";

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost/backend/get_patients.php");
      setPatients(res.data);
      setFilteredPatients(res.data);
    } catch (error) {
      console.error("Error cargando pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filtrar pacientes según búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.doctor_name && patient.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleDelete = (id) => {
    setPatientToDelete(id);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await axios.post("http://localhost/backend/delete_patient.php", {
        id: patientToDelete,
        requester_role: user.role
      });
      fetchPatients();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar paciente. Es posible que tenga estudios asociados.");
    } finally {
      setPatientToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-600 font-medium animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span>Cargando Pacientes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER CON BÚSQUEDA --- */}
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl sticky top-0 z-10 border border-white/20">
        <div>
          <p className="text-sm text-gray-500">Pacientes</p>
          <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
          <div className="flex items-center gap-2 bg-[#F4F7FE] px-4 py-2 rounded-full text-gray-500">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
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

      {/* --- TABLA DE PACIENTES --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-gray-400 font-medium">
              {searchTerm
                ? "No se encontraron pacientes con esos criterios."
                : "No hay pacientes disponibles."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">PACIENTE</th>
                  <th className="px-6 py-4 font-bold">DNI</th>
                  <th className="px-6 py-4 font-bold">ESTUDIOS</th>
                  <th className="px-6 py-4 font-bold">ÚLTIMO ESTUDIO</th>
                  <th className="px-6 py-4 font-bold text-center">HISTORIAL</th>
                  {user.role === 'admin' && <th className="px-6 py-4 font-bold text-right">ACCIONES</th>}
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPatients.map((patient, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            {patient.name.toUpperCase()}
                          </p>
                          {patient.doctor_name && (
                            <p className="text-xs text-gray-500">
                              Dr. {patient.doctor_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {patient.dni}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                        <FileImage size={14} />
                        {patient.studies_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-50 px-3 py-1 rounded border border-gray-200">
                        <Calendar size={12} />
                        {patient.last_study_date || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPatientDni(patient.dni)}
                        className="text-blue-600 hover:underline text-xs font-semibold"
                      >
                        Ver Historial
                      </button>
                    </td>
                    {user.role === 'admin' && (
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingPatient(patient)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar Paciente"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar Paciente"
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
        )}
      </div>

      {/* --- ESTADÍSTICAS RÁPIDAS --- */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-sm font-medium">Total Pacientes</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            {patients.length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-sm font-medium">Resultados</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-2">
            {filteredPatients.length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-sm font-medium">Total Estudios</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">
            {patients.reduce((sum, p) => sum + parseInt(p.studies_count || 0), 0)}
          </h3>
        </div>
      </div>

      {/* MODAL DE HISTORIAL */}
      {selectedPatientDni && (
        <PatientHistoryModal
          dni={selectedPatientDni}
          onClose={() => setSelectedPatientDni(null)}
        />
      )}

      {/* MODAL DE EDICIÓN */}
      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={fetchPatients}
        />
      )}

      {/* CONFIRMACIÓN ELIMINAR */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fade-in-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                ¿Eliminar Paciente?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción eliminará al paciente permanentemente. Comprueba si tiene estudios asociados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPatientToDelete(null)}
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
