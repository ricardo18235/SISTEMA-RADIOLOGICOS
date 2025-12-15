import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, Activity } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost/backend/login.php", {
        username: formData.username,
        password: formData.password,
      });

      // --- AQUÍ ESTABA EL PROBLEMA, AHORA LO CORREGIMOS ---

      const { token, user } = response.data;

      // 1. Guardar Token
      localStorage.setItem("token", token);

      // 2. Guardar el objeto Usuario COMPLETO (Esto es lo que busca el Dashboard)
      // Convertimos el objeto a texto (JSON.stringify) porque LocalStorage solo guarda texto
      localStorage.setItem("user", JSON.stringify(user));

      // 3. Redirigir
      navigate("/dashboard");
      window.location.reload(); // Recarga forzada para asegurar que el Dashboard lea los datos nuevos
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas o error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl animate-fade-in-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-gray-500 text-sm">
            Sistema de Gestión Radiológica
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                placeholder="Email o DNI"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 flex justify-center items-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">
          ¿Problemas de acceso? Contacta al administrador.
        </p>
      </div>
    </div>
  );
};

export default Login;
