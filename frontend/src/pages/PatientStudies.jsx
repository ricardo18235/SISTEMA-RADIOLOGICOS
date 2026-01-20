import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Download, Eye } from "lucide-react";
import DicomViewerModal from "../components/DicomViewerModal";

const PatientStudies = () => {
  const [studies, setStudies] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const patient = localStorage.getItem("patientData");

    if (!token || !patient) {
      navigate("/patient-login");
      return;
    }

    setPatientData(JSON.parse(patient));
    fetchStudies(token);
  }, [navigate]);

  const fetchStudies = async (token) => {
    try {
      const response = await axios.get(
        "http://localhost/backend/patient_studies.php",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudies(response.data.studies);
      setError("");
    } catch (err) {
      setError("Error al cargar los estudios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("patientData");
    navigate("/patient-login");
  };

  const handleViewStudy = (study) => {
    setSelectedStudy(study);
    setShowViewer(true);
  };

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Mis Estudios Radiológicos
            </h1>
            {patientData && (
              <p className="text-gray-600">
                Bienvenido:{" "}
                <span className="font-semibold">{patientData.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {studies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              No tienes estudios disponibles aún.
            </p>
            <p className="text-gray-500 mt-2">
              Cuando tu médico cargue nuevos estudios, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <div
                key={study.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {study.study_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Tipo: {study.file_type}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  📅 {new Date(study.study_date).toLocaleDateString("es-ES")}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewStudy(study)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    Ver
                  </button>
                  <button
                    onClick={() => handleDownload(study.file_url)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Visor */}
      {showViewer && selectedStudy && (
        <DicomViewerModal
          study={selectedStudy}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
};

export default PatientStudies;
