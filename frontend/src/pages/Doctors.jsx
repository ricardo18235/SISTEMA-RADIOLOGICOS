import { useState, useEffect } from "react";
import axios from "axios";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const fetchDoctors = async () => {
    const res = await axios.get("http://localhost/backend/get_doctors.php");
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost/backend/create_doctor.php", form);
      alert("Doctor creado correctamente");
      setForm({ name: "", email: "", password: "" });
      fetchDoctors();
    } catch (error) {
      alert(
        "Error al crear doctor: " +
          (error.response?.data?.error || "Desconocido")
      );
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">
        Gestión de Doctores
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Creación */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-4 text-gray-700">
            Agregar Nuevo Doctor
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              className="w-full border p-2 rounded"
              placeholder="Nombre Completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="w-full border p-2 rounded"
              type="email"
              placeholder="Correo Electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              className="w-full border p-2 rounded"
              type="password"
              placeholder="Contraseña de Acceso"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold">
              Crear Doctor
            </button>
          </form>
        </div>

        {/* Lista de Doctores */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-700">
            Doctores Registrados
          </h3>
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{doc.name}</td>
                  <td className="p-3 text-gray-500">
                    {doc.email || "Sin correo visible"}
                  </td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
