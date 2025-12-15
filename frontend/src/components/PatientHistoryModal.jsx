import { useEffect, useState } from "react";
import axios from "axios";
import { X, FileText, Calendar, User, Download, Eye, Activity } from "lucide-react";

export default function PatientHistoryModal({ dni, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientName, setPatientName] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const res = await axios.get(
                    `http://localhost/backend/get_patient_history.php?dni=${dni}&user_id=${user.id}&role=${user.role}`
                );
                setHistory(res.data);
                if (res.data.length > 0) {
                    setPatientName(res.data[0].patient_name);
                }
            } catch (error) {
                console.error("Error cargando historial", error);
            } finally {
                setLoading(false);
            }
        };

        if (dni) fetchHistory();
    }, [dni]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-blue-200" />
                            Historial Clínico
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                            Paciente: <span className="font-bold text-white uppercase">{patientName || "Cargando..."}</span> | DNI: {dni}
                        </p>
                    </div>
                    <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* BODY (SCROLLABLE) */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    {loading ? (
                        <div className="flex justify-center py-10 text-blue-600 font-medium">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <FileText size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No se encontraron estudios para este paciente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((study) => (
                                <div
                                    key={study.id}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    {/* Info Izquierda */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            {study.file_type === 'dicom' ? 'DCM' :
                                                study.file_type === 'pdf' ? 'PDF' :
                                                    study.file_type === '3d_scan' ? '3D' : 'IMG'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{study.study_name}</h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> {study.study_date}
                                                </span>
                                                <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    <User size={14} /> Dr. {study.doctor_name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones Derecha */}
                                    <div className="flex gap-2">
                                        <a
                                            href={study.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm"
                                        >
                                            <Eye size={16} /> Ver Estudio
                                        </a>
                                        <a
                                            href={study.file_url}
                                            download
                                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="bg-white p-4 border-t border-gray-100 text-center text-xs text-gray-400">
                    Mostrando {history.length} registro(s). Documentos confidenciales.
                </div>
            </div>
        </div>
    );
}