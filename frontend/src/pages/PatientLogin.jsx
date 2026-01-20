import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientLogin = () => {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/backend/patient_login.php",
        {
          dni,
          password,
        }
      );

      // Guardar token y datos del paciente
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("userType", "patient");
      localStorage.setItem(
        "patientData",
        JSON.stringify(response.data.patient)
      );

      // Redirigir a estudios del paciente
      navigate("/patient-studies");
    } catch (err) {
      setError(err.response?.data?.error || "Error en el login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Portal del Paciente
          </h1>
          <p className="text-gray-600 mt-2">
            Accede a tus estudios radiológicos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              DNI / Cédula
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 12345678"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Nota: Por defecto, tu contraseña es tu DNI
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Eres médico?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;
