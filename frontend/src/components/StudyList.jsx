import { useState } from "react";
import axios from "axios";
import { Trash2, Edit, AlertTriangle } from "lucide-react";
import DicomViewerModal from "./DicomViewerModal";
import EditStudyModal from "./EditStudyModal";

export default function StudyList({ studies, role, onStudyUpdate }) {
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [editingStudy, setEditingStudy] = useState(null);

  // Para eliminar
  const handleDelete = async (studyId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este estudio de forma permanente?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await axios.post("http://localhost/backend/delete_study.php", {
        id: studyId,
        requester_role: user.role,
      });
      alert("Estudio eliminado correctamente.");
      if (onStudyUpdate) onStudyUpdate();
      else window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el estudio.");
    }
  };

  const openViewer = (study) => {
    if (study.file_type === "dicom") {
      // Si es DICOM, abrimos el modal
      setSelectedStudy(study);
    } else {
      // Si es STL, PDF o Imagen, simplemente abrimos el archivo en una nueva pestaña
      window.open(study.file_url, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Modal Visor DICOM */}
      {selectedStudy && (
        <DicomViewerModal
          study={selectedStudy}
          onClose={() => setSelectedStudy(null)}
        />
      )}

      {/* Modal Edición */}
      {editingStudy && (
        <EditStudyModal
          study={editingStudy}
          onClose={() => setEditingStudy(null)}
          onSuccess={() => {
            if (onStudyUpdate) onStudyUpdate();
            else window.location.reload();
          }}
        />
      )}

      <table className="w-full text-left border-collapse">
        <thead className="bg-[#F8FAFC] border-b border-gray-100">
          <tr>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estudio</th>
            {role !== "patient" && <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paciente</th>}
            {role === "patient" && <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Doctor</th>}
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {studies.length === 0 && (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle size={24} className="opacity-20" />
                  <span>No hay estudios disponibles.</span>
                </div>
              </td>
            </tr>
          )}

          {studies.map((study) => (
            <tr key={study.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{study.study_date}</td>
              <td className="p-4 text-sm font-medium text-gray-800">{study.study_name}</td>
              {role !== "patient" && (
                <td className="p-4 text-sm text-gray-600">
                  <div className="font-medium text-gray-800">{study.patient_name}</div>
                  <div className="text-xs text-gray-400">{study.patient_dni}</div>
                </td>
              )}
              {role === "patient" && (
                <td className="p-4 text-sm text-gray-600">{study.doctor_name}</td>
              )}
              <td className="p-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
                  {study.file_type}
                </span>
              </td>
              <td className="p-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => openViewer(study)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  {study.file_type === "dicom" ? "Ver Visor" : "Ver / Descargar"}
                </button>

                {role === 'admin' && (
                  <>
                    <button
                      onClick={() => setEditingStudy(study)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Estudio"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(study.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar Estudio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
