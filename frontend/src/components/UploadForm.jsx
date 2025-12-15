import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, X, User, Search, Check } from "lucide-react";

const UploadForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Datos del Formulario
  const [formData, setFormData] = useState({
    patient_dni: "",
    patient_name: "",
    study_name: "",
    study_date: new Date().toISOString().split("T")[0],
    doctor_id: "", // Aquí guardaremos el ID, no el nombre
  });

  // Estado para el buscador de doctores
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Cargar lista de doctores al iniciar
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost/backend/get_doctors.php");
        setDoctorsList(res.data);
      } catch (err) {
        console.error("Error cargando doctores", err);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Manejo de archivos
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
    }
  };

  // 3. Lógica de selección de doctor
  const filteredDoctors = doctorsList.filter((doc) =>
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const selectDoctor = (doc) => {
    setFormData({ ...formData, doctor_id: doc.id });
    setDoctorSearch(doc.name); // Mostramos el nombre en el input
    setShowSuggestions(false);
  };

  // 4. Enviar Formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar Rol Admin (Doble seguridad frontend)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      setError("No tienes permisos para subir archivos.");
      setLoading(false);
      return;
    }

    if (!formData.doctor_id) {
      setError("Por favor selecciona un doctor de la lista.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("patient_dni", formData.patient_dni);
    data.append("patient_name", formData.patient_name);
    data.append("study_name", formData.study_name);
    data.append("study_date", formData.study_date);
    data.append("doctor_id", formData.doctor_id);
    data.append("uploader_role", user.role); // Enviamos rol para validación backend

    try {
      await axios.post("http://localhost/backend/upload.php", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess(); // Cerrar modal y recargar
    } catch (err) {
      setError(err.response?.data?.error || "Error al subir estudio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Paciente DNI */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documento Paciente
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: 12345678"
            value={formData.patient_dni}
            onChange={(e) =>
              setFormData({ ...formData, patient_dni: e.target.value })
            }
          />
        </div>

        {/* Input Paciente Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Paciente
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nombre completo"
            value={formData.patient_name}
            onChange={(e) =>
              setFormData({ ...formData, patient_name: e.target.value })
            }
          />
        </div>
      </div>

      {/* --- BUSCADOR DE DOCTOR (AUTOCOMPLETE) --- */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asignar Doctor
        </label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Escribe para buscar doctor..."
            value={doctorSearch}
            onChange={(e) => {
              setDoctorSearch(e.target.value);
              setFormData({ ...formData, doctor_id: "" }); // Reset ID si edita texto
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
        </div>

        {/* Lista de Sugerencias Flotante */}
        {showSuggestions && doctorSearch && (
          <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => selectDoctor(doc)}
                  className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-sm text-gray-700"
                >
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600 font-bold">
                    {doc.name.charAt(0)}
                  </div>
                  {doc.name}
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-400">
                No se encontraron doctores
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Estudio
          </label>
          <input
            type="text"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ej: Radiografía Tórax"
            value={formData.study_name}
            onChange={(e) =>
              setFormData({ ...formData, study_name: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            required
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.study_date}
            onChange={(e) =>
              setFormData({ ...formData, study_date: e.target.value })
            }
          />
        </div>
      </div>

      {/* Zona de Archivo */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
        <input
          type="file"
          onChange={handleFileChange}
          required
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check size={20} />
            <span className="font-medium truncate max-w-xs">{file.name}</span>
          </div>
        ) : (
          <div className="text-gray-500">
            <Upload className="mx-auto mb-2 text-gray-400" size={24} />
            <p className="text-sm">
              Click para subir archivo (Imagen, DICOM, PDF)
            </p>
          </div>
        )}
      </div>

      {/* Previsualización pequeña */}
      {preview && (
        <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <img src={preview} alt="Preview" className="h-full object-contain" />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "Subiendo..." : "Confirmar Subida"}
      </button>
    </form>
  );
};

export default UploadForm;
