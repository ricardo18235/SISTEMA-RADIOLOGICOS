import { useState, useEffect } from "react";
import axios from "axios";
import { X, Save } from "lucide-react";

export default function EditStudyModal({ study, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        study_id: "",
        study_name: "",
        study_date: "",
        patient_id: "",
        patient_name: "",
        patient_dni: "",
        patient_email: "",
        patient_phone: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (study) {
            setFormData({
                study_id: study.id,
                study_name: study.study_name,
                study_date: study.study_date,
                patient_id: study.patient_id,
                patient_name: study.patient_name || "",
                patient_dni: study.patient_dni || "",
                patient_email: study.patient_email || "",
                patient_phone: study.patient_phone || "",
            });
        }
    }, [study]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            await axios.post("http://localhost/backend/edit_study.php", {
                ...formData,
                requester_role: user.role,
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Error al actualizar. Verifique permisos o conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Editar Estudio / Paciente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Datos del Estudio</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Estudio</label>
                                <input
                                    name="study_name"
                                    value={formData.study_name}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                                <input
                                    type="date"
                                    name="study_date"
                                    value={formData.study_date}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider">Datos del Paciente</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Completo</label>
                            <input
                                name="patient_name"
                                value={formData.patient_name}
                                onChange={handleChange}
                                className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">DNI</label>
                                <input
                                    name="patient_dni"
                                    value={formData.patient_dni}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                                <input
                                    name="patient_phone"
                                    value={formData.patient_phone}
                                    onChange={handleChange}
                                    className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                            <input
                                type="email"
                                name="patient_email"
                                value={formData.patient_email}
                                onChange={handleChange}
                                className="w-full p-2 bg-gray-50 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <Save size={18} /> Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
