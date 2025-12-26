import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Bell, Users, FileImage, Calendar } from "lucide-react";
import PatientHistoryModal from "../components/PatientHistoryModal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientDni, setSelectedPatientDni] = useState(null);

  // Obtener datos del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? JSON.parse(userStr)
    : { name: "Usuario", id: null, role: "guest" };
  const userName = user.name || "Doctor";

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost/backend/get_studies.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Agrupar estudios por paciente (usando patient_dni como clave única)
      const patientsMap = {};

      res.data.forEach((study) => {
        const patientDni = study.patient_dni;

        if (patientDni && !patientsMap[patientDni]) {
          patientsMap[patientDni] = {
            dni: patientDni,
            name: study.patient_name || "Paciente",
            studies_count: 0,
            last_study_date: null,
            doctor_name: study.doctor_name || "N/A",
          };
        }

        if (patientDni) {
          patientsMap[patientDni].studies_count += 1;
          if (
            !patientsMap[patientDni].last_study_date ||
            new Date(study.study_date) >
              new Date(patientsMap[patientDni].last_study_date)
          ) {
            patientsMap[patientDni].last_study_date = study.study_date;
          }
        }
      });

      const patientsList = Object.values(patientsMap);

      setPatients(patientsList);
      setFilteredPatients(patientsList);
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
          patient.dni.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

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
                  <th className="px-6 py-4 font-bold text-center">ACCIÓN</th>
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
                            {patient.name}
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
                      >
                        Ver Historial
                      </button>
                    </td>
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
            {patients.reduce((sum, p) => sum + p.studies_count, 0)}
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
    </div>
  );
}
