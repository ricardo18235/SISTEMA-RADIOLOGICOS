import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost/backend/login.php", {
        username: user,
        password: pass,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        navigate("/dashboard");
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            Centro Radiológico
          </h1>
          <p className="text-gray-500 mt-2">Acceso al portal seguro</p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario / Email / DNI
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="Ingresa tu usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              placeholder="••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md">
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Sistema de Gestión de Imágenes Médicas v1.0
        </p>
      </div>
    </div>
  );
}
