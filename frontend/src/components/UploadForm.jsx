import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Upload,
  X,
  User,
  Check,
  Calendar,
  FileType,
  AlertCircle,
  FolderUp,
  Trash2,
  RefreshCw,
} from "lucide-react";

// --- CONFIGURACIÓN DE TIPOS DE ESTUDIO ---
const STUDY_CATEGORIES = {
  Radiografía: {
    types: [
      "Panorámica",
      "Perfil",
      "Periapical",
      "Antero Posterior",
      "Postero Anterior",
      "Cefalometría",
      "Coronales",
      "Carpograma",
      "ATM",
      "Senos Maxilares",
    ],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  "Básico de Ortodoncia": {
    types: ["Paquete Básico"],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  "Plus de Ortodoncia": {
    types: ["Paquete Plus"],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  "Paquete Maxilofacial": {
    types: ["Estudio Completo"],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  "Paquete de Ortopedia": {
    types: ["Estudio Ortopédico"],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  "Paquete Diseño de Sonrisa": {
    types: ["Diseño Digital"],
    formats: [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
    accept: "image/jpeg, image/png, application/pdf, .doc, .docx",
    isFolder: false,
    helper: "Formatos: JPG, PNG, PDF, Word",
  },
  Scanner: {
    types: ["Escaneo Intraoral", "Escaneo Facial", "Modelo 3D"],
    formats: [".stl", ".ply"],
    accept: ".stl, .ply",
    isFolder: false,
    helper: "Solo formatos 3D: STL y PLY",
  },
  Tomografía: {
    types: [
      "Zona de diente",
      "Cuadrante",
      "Maxilar Superior",
      "Maxilar Inferior",
      "Bimaxilar",
      "Cara Completa",
      "Cráneo",
      "ATM",
      "Ramas Mandibulares",
      "Senos Paranasales",
      "Vías Aéreas",
      "Vértebras",
    ],
    formats: [],
    accept: "",
    isFolder: true,
    helper: "Debes subir la CARPETA completa del estudio",
  },
};

const UploadForm = ({ onSuccess, onClose }) => {
  // Estado de Estado de Subida
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Selectores
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStudyType, setSelectedStudyType] = useState("");

  const [formData, setFormData] = useState({
    patient_dni: "",
    patient_name: "",
    study_date: new Date().toISOString().split("T")[0],
    doctor_id: "",
  });

  // Buscador Doctor
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [doctorSelectedValid, setDoctorSelectedValid] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost/backend/get_doctors.php");
        setDoctorsList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [selectedCategory]);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;

    if (selectedFiles.length > 0) {
      const uploadedFile = selectedFiles[0];
      const fileName = uploadedFile.name.toLowerCase();
      const fileExt = "." + fileName.split(".").pop();

      // Seguridad Frontend
      if (
        fileName.endsWith(".php") ||
        fileName.endsWith(".exe") ||
        fileName.endsWith(".js")
      ) {
        setErrorMessage("⚠️ ARCHIVO PELIGROSO DETECTADO.");
        setUploadStatus("error");
        setFile(null);
        e.target.value = "";
        return;
      }

      // Validación Formato
      if (selectedCategory && !STUDY_CATEGORIES[selectedCategory].isFolder) {
        const allowed = STUDY_CATEGORIES[selectedCategory].formats;
        if (!allowed.includes(fileExt)) {
          setErrorMessage(
            `⚠️ Formato incorrecto. Solo se permite: ${allowed.join(", ")}`
          );
          setUploadStatus("error");
          setFile(null);
          e.target.value = "";
          return;
        }
      }

      setUploadStatus("idle");
      setFile(uploadedFile);

      if ([".jpg", ".jpeg", ".png"].includes(fileExt)) {
        setPreview(URL.createObjectURL(uploadedFile));
      } else {
        setPreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadProgress(0);
  };

  const filteredDoctors = doctorsList.filter((doc) =>
    doc.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleDoctorSearchChange = (e) => {
    setDoctorSearch(e.target.value);
    setShowSuggestions(true);
    setFormData({ ...formData, doctor_id: "" });
    setDoctorSelectedValid(false);
  };

  const selectDoctor = (doc) => {
    setFormData({ ...formData, doctor_id: doc.id });
    setDoctorSearch(doc.name);
    setDoctorSelectedValid(true);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !doctorSelectedValid) return;

    setUploadStatus("loading");
    setUploadProgress(0);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // PASO 1: Obtener URL firmada de subida (PHP)
      const presignRes = await axios.post(
        "http://localhost/backend/get_presigned_upload.php",
        {
          file_name: file.name,
          file_type: file.type,
          role: user.role,
        }
      );

      const { upload_url, file_key } = presignRes.data;

      // PASO 2: Subir el archivo DIRECTAMENTE a Wasabi
      await axios.put(upload_url, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // PASO 3: Registrar la subida en la BD (PHP)
      await axios.post("http://localhost/backend/register_study.php", {
        uploader_role: user.role,
        doctor_id: formData.doctor_id,
        patient_dni: formData.patient_dni,
        patient_name: formData.patient_name,
        study_name: `${selectedCategory} - ${selectedStudyType}`,
        study_date: formData.study_date,
        file_key: file_key,
        file_size: file.size,
        file_type_raw: file.type,
      });

      setUploadStatus("success");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      if (error.response?.status === 400) {
        setErrorMessage("Error: Archivo no permitido o datos inválidos.");
      } else {
        setErrorMessage("Error al subir. Verifica tu conexión.");
      }
    }
  };

  const currentConfig = STUDY_CATEGORIES[selectedCategory] || {};

  // --- PANTALLA DE ÉXITO ---
  if (uploadStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <Check size={40} className="text-green-600 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">¡Estudio Subido!</h3>
        <p className="text-gray-500 text-center">
          El archivo se ha guardado correctamente y el doctor ya puede
          visualizarlo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-gray-700 relative">
      {/* Botón Cerrar */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all z-10"
        >
          <X size={18} />
        </button>
      )}

      {/* --- MENSAJE DE ERROR --- */}
      {uploadStatus === "error" && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center justify-between border border-red-200 animate-pulse mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setUploadStatus("idle")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Datos del Paciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Documento Paciente
          </label>
          <input
            type="text"
            required
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            placeholder="Ej: 12345678"
            value={formData.patient_dni}
            onChange={(e) =>
              setFormData({ ...formData, patient_dni: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Nombre Paciente
          </label>
          <input
            type="text"
            required
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            placeholder="Nombre completo"
            value={formData.patient_name}
            onChange={(e) =>
              setFormData({ ...formData, patient_name: e.target.value })
            }
          />
        </div>
      </div>

      {/* 2. Asignar Doctor */}
      <div className="relative">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Asignar Doctor
          {doctorSelectedValid && (
            <span className="ml-2 text-green-500 text-xs font-normal">
              ✓ Seleccionado
            </span>
          )}
        </label>
        <div className="relative group">
          <User
            className={`absolute left-3 top-3 transition-colors ${
              doctorSelectedValid ? "text-green-500" : "text-gray-400"
            }`}
            size={18}
          />
          <input
            type="text"
            required
            className={`w-full pl-10 p-2.5 bg-gray-50 border rounded-lg focus:ring-2 outline-none transition-all ${
              doctorSelectedValid
                ? "border-green-400 bg-green-50 text-green-800 focus:ring-green-500"
                : "border-gray-200 focus:ring-blue-500"
            }`}
            placeholder="Escribe para buscar..."
            value={doctorSearch}
            onChange={handleDoctorSearchChange}
            onFocus={() => setShowSuggestions(true)}
          />
          {doctorSelectedValid && (
            <button
              type="button"
              onClick={() => {
                setDoctorSearch("");
                setFormData({ ...formData, doctor_id: "" });
                setDoctorSelectedValid(false);
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {showSuggestions && doctorSearch && !doctorSelectedValid && (
          <div className="absolute z-20 w-full bg-white mt-1 border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => selectDoctor(doc)}
                  className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                    {doc.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-700">{doc.name}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-400 text-sm text-center">
                No se encontraron doctores.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Categoría y Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Categoría
          </label>
          <div className="relative">
            <FileType
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
            <select
              className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedStudyType("");
              }}
              required
            >
              <option value="">Selecciona Categoría...</option>
              {Object.keys(STUDY_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Tipo de Estudio
          </label>
          <select
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
            value={selectedStudyType}
            onChange={(e) => setSelectedStudyType(e.target.value)}
            disabled={!selectedCategory}
            required
          >
            <option value="">
              {selectedCategory
                ? "Selecciona tipo..."
                : "Primero elige categoría"}
            </option>
            {selectedCategory &&
              STUDY_CATEGORIES[selectedCategory].types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* 4. Fecha */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Fecha del Estudio
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar
              className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
          </div>
          <input
            type="date"
            required
            className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-600 font-medium"
            value={formData.study_date}
            onChange={(e) =>
              setFormData({ ...formData, study_date: e.target.value })
            }
          />
        </div>
      </div>

      {/* 5. Zona de Archivo */}
      {!file ? (
        <div className="border-2 border-dashed rounded-xl p-8 text-center transition-all relative border-gray-300 hover:border-blue-400 hover:bg-blue-50">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            required
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept={currentConfig.accept}
            {...(currentConfig.isFolder
              ? { webkitdirectory: "", directory: "" }
              : {})}
          />

          <div className="text-gray-500">
            {currentConfig.isFolder ? (
              <FolderUp className="mx-auto mb-3 text-orange-400" size={40} />
            ) : (
              <Upload className="mx-auto mb-3 text-blue-400" size={40} />
            )}
            <p className="font-medium text-gray-700">
              {currentConfig.isFolder
                ? "Click para seleccionar CARPETA"
                : "Click para seleccionar archivo"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {currentConfig.helper || "Selecciona una categoría primero"}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl p-6">
          {/* Archivo seleccionado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileType size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={removeFile}
                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all"
                title="Eliminar archivo"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all"
                title="Cambiar archivo"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Preview de imagen */}
          {preview && (
            <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 mb-4">
              <img
                src={preview}
                alt="Preview"
                className="h-full object-contain"
              />
            </div>
          )}

          {/* Barra de progreso */}
          {uploadStatus === "loading" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">
                  Subiendo a la nube...
                </span>
                <span className="text-blue-700 font-bold">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-linear-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={uploadStatus === "loading" || !file || !doctorSelectedValid}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
      >
        {uploadStatus === "loading"
          ? "Subiendo..."
          : "Confirmar y Subir Estudio"}
      </button>
    </form>
  );
};

export default UploadForm;
