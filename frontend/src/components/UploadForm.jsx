import { useState, useEffect } from "react";
import axios from "axios";

export default function UploadForm({ onSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor_id: "",
    patient_dni: "",
    patient_name: "",
    study_name: "",
    study_date: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/backend/get_doctors.php")
      .then((res) => setDoctors(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    try {
      await axios.post("http://localhost/backend/upload.php", formData);
      alert("Estudio subido");
      onSuccess();
      setForm({
        ...form,
        patient_dni: "",
        patient_name: "",
        study_name: "",
        file: null,
      });
    } catch (error) {
      alert("Error subiendo estudio");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-bold mb-4">Subir Nuevo Estudio</h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <select
          className="border p-2 rounded"
          required
          onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
        >
          <option value="">Seleccionar Doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <input
          className="border p-2 rounded"
          placeholder="DNI Paciente"
          required
          onChange={(e) => setForm({ ...form, patient_dni: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Nombre Paciente"
          required
          onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          placeholder="Nombre del Estudio"
          required
          onChange={(e) => setForm({ ...form, study_name: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded"
          required
          onChange={(e) => setForm({ ...form, study_date: e.target.value })}
        />
        <input
          type="file"
          className="border p-2 rounded"
          required
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
        />
        <button
          disabled={loading}
          className="col-span-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {loading ? "Subiendo..." : "Cargar Estudio"}
        </button>
      </form>
    </div>
  );
}
