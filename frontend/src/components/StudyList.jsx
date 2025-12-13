import { useState } from "react";
import DicomViewerModal from "./DicomViewerModal";

export default function StudyList({ studies, role }) {
  const [selectedStudy, setSelectedStudy] = useState(null);

  const openViewer = (study) => {
    if (study.file_type === "dicom") {
      // Si es DICOM, abrimos el modal que intentamos configurar antes
      setSelectedStudy(study);
    } else {
      // Si es STL, PDF o Imagen, simplemente abrimos el archivo en una nueva pestaña
      // El navegador se encargará de mostrar la imagen/PDF o descargar el STL
      window.open(study.file_url, "_blank");
    }
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      {/* Renderizamos el Modal solo si hay un estudio DICOM seleccionado */}
      {selectedStudy && (
        <DicomViewerModal
          study={selectedStudy}
          onClose={() => setSelectedStudy(null)}
        />
      )}

      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Fecha</th>
            <th className="p-3">Estudio</th>
            {role !== "patient" && <th className="p-3">Paciente</th>}
            {role === "patient" && <th className="p-3">Doctor</th>}
            <th className="p-3">Tipo</th>
            <th className="p-3">Acción</th>
          </tr>
        </thead>
        <tbody>
          {/* Si no hay estudios, mostramos un mensaje */}
          {studies.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No hay estudios disponibles.
              </td>
            </tr>
          )}

          {studies.map((study) => (
            <tr key={study.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{study.study_date}</td>
              <td className="p-3">{study.study_name}</td>
              {role !== "patient" && (
                <td className="p-3">
                  {study.patient_name}{" "}
                  <span className="text-xs text-gray-500">
                    ({study.patient_dni})
                  </span>
                </td>
              )}
              {role === "patient" && (
                <td className="p-3">{study.doctor_name}</td>
              )}
              <td className="p-3 uppercase text-xs font-bold text-gray-600">
                {study.file_type}
              </td>
              <td className="p-3">
                <button
                  onClick={() => openViewer(study)}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                >
                  {study.file_type === "dicom" ? "Ver Visor" : "Descargar/Ver"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
