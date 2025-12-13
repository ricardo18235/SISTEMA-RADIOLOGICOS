import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import DashboardHome from "./pages/DashboardHome";
import Doctors from "./pages/Doctors";
import StudyList from "./components/StudyList"; // Usaremos esto para la vista de pacientes por ahora
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import axios from "axios";

// Layout Principal con Menú Lateral
// Solo cambia esta parte dentro de App.jsx
const DashboardLayout = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex bg-[#F4F7FE] min-h-screen font-sans">
      <Sidebar onLogout={logout} />
      {/* Ajustamos el margen para compensar el sidebar de 72px */}
      <div className="flex-1 ml-72 p-8 overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
};

// Protección de Rutas
const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  return token ? <DashboardLayout /> : <Navigate to="/" />;
};

function App() {
  // Estado para reutilizar la lista de estudios en la pestaña "Pacientes"
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    // Carga inicial simple si estamos logueados
    if (localStorage.getItem("token")) {
      axios
        .get("http://localhost/backend/get_studies.php")
        .then((res) => setStudies(res.data))
        .catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rutas protegidas dentro del Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<DashboardHome />} />
          <Route path="doctors" element={<Doctors />} />

          {/* Reutilizamos StudyList para la vista de Pacientes por simplicidad */}
          <Route
            path="patients"
            element={
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-slate-800">
                  Listado General de Pacientes y Estudios
                </h2>
                <StudyList
                  studies={studies}
                  role={localStorage.getItem("role")}
                />
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
