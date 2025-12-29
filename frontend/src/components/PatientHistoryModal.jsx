import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  FileText,
  Calendar,
  User,
  Download,
  Eye,
  Activity,
  Loader2,
} from "lucide-react";

export default function PatientHistoryModal({ dni, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");

  // Estados para el visor interno
  const [viewingFile, setViewingFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // --- LÓGICA DE SEGURIDAD (Backend) ---

  const handlePreview = async (fileUrl, fileType) => {
    setLoadingFile(true);
    try {
      const response = await axios.post(
        "http://localhost/backend/get_signed_url.php",
        {
          file_key: fileUrl,
          action: "view",
        }
      );
      if (response.data?.url) {
        setViewingFile({ url: response.data.url, type: fileType });
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el archivo seguro.");
    } finally {
      setLoadingFile(false);
    }
  };

  const handleDownload = async (fileUrl) => {
    try {
      const response = await axios.post(
        "http://localhost/backend/get_signed_url.php",
        {
          file_key: fileUrl,
          action: "download",
        }
      );
      if (response.data?.url) {
        const link = document.createElement("a");
        link.href = response.data.url;
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      alert("Error al intentar descargar.");
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await axios.get(
          `http://localhost/backend/get_patient_history.php?dni=${dni}&user_id=${user.id}&role=${user.role}`
        );
        setHistory(res.data);
        if (res.data.length > 0) setPatientName(res.data[0].patient_name);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (dni) fetchHistory();
  }, [dni]);

  // Renderizado del archivo (PDF o Imagen)
  const renderFileContent = () => {
    if (!viewingFile) return null;
    const isPdf =
      viewingFile.type === "pdf" ||
      viewingFile.url.toLowerCase().includes(".pdf");

    if (isPdf) {
      return (
        <iframe
          src={viewingFile.url}
          className="w-full h-full rounded-lg bg-white"
          title="Documento"
        />
      );
    }
    return (
      <img
        src={viewingFile.url}
        alt="Estudio"
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
      />
    );
  };

  return (
    <>
      {/* --- MODAL PRINCIPAL (ESTILO RESTAURADO) --- */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header Azul (Idéntico a tu foto) */}
          <div className="bg-blue-600 p-6 flex justify-between items-center text-white relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-200" />
                Historial Clínico
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Paciente:{" "}
                <span className="font-bold text-white uppercase">
                  {patientName || "Cargando..."}
                </span>{" "}
                | DNI: {dni}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors relative z-10 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo con Scroll y Fondo Gris */}
          <div className="p-6 overflow-y-auto bg-gray-50 flex-1 relative">
            {/* Spinner de carga de archivo (Overlay) */}
            {loadingFile && (
              <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-black/80 text-white px-5 py-3 rounded-full flex items-center gap-3 shadow-xl">
                  <Loader2 className="animate-spin text-blue-400" size={20} />
                  <span className="font-medium">
                    Solicitando acceso seguro...
                  </span>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                <Loader2 className="animate-spin mb-2" size={32} />
                <span className="font-medium">Cargando historial...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-3 opacity-20" />
                <p>No hay estudios registrados para este paciente.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((study) => (
                  /* --- TARJETA DE ESTUDIO (Estilo Restaurado) --- */
                  <div
                    key={study.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Lado Izquierdo: Icono + Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 uppercase font-bold text-sm tracking-wide border border-blue-100">
                        {study.file_type || "IMG"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                          {study.study_name}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1.5">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded text-xs font-medium border border-gray-100">
                            <Calendar size={12} className="text-gray-400" />
                            {study.study_date}
                          </span>
                          <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                            <User size={12} />
                            Dr. {study.doctor_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Derecho: Botones */}
                    <div className="flex items-center gap-3">
                      {/* Botón Ver Estudio (Azul Sólido) */}
                      <button
                        onClick={() =>
                          handlePreview(study.file_url, study.file_type)
                        }
                        className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm"
                      >
                        <Eye size={18} /> Ver Estudio
                      </button>

                      {/* Botón Descargar (Cuadrado con borde) */}
                      <button
                        onClick={() => handleDownload(study.file_url)}
                        className="cursor-pointer w-10 h-10 flex items-center justify-center bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95 shadow-sm"
                        title="Descargar Original"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Simple */}
          <div className="bg-white p-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Mostrando {history.length} registro(s). Documentos confidenciales
              protegidos por HIPAA/GDPR.
            </p>
          </div>
        </div>
      </div>

      {/* --- VISOR OSCURO (OVERLAY) --- */}
      {viewingFile && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col animate-in fade-in duration-200">
          {/* Toolbar Superior */}
          <div className="flex justify-between items-center px-6 py-4 text-white bg-black/50 backdrop-blur-md absolute top-0 w-full z-10 border-b border-white/10">
            <h3 className="font-medium text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Conexión Segura Establecida
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleDownload(viewingFile.url)}
                className="hover:text-blue-400 hover:bg-white/10 px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm"
              >
                <Download size={18} /> Descargar
              </button>
              <button
                onClick={() => setViewingFile(null)}
                className="bg-white/10 hover:bg-red-500/80 hover:text-white px-3 py-1.5 rounded-md transition-all flex items-center gap-2 text-sm"
              >
                <X size={20} /> Cerrar
              </button>
            </div>
          </div>

          {/* Contenido Central */}
          <div className="flex-1 flex items-center justify-center p-4 pt-20 h-full w-full overflow-hidden">
            {renderFileContent()}
          </div>
        </div>
      )}
    </>
  );
}
