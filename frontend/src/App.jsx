import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./pages/Login";
import PatientLogin from "./pages/PatientLogin";
import PatientStudies from "./pages/PatientStudies";
import DashboardHome from "./pages/DashboardHome";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
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
      {/* Sidebar en desktop, responsive margen en mobile */}
      <div className="flex-1 ml-0 lg:ml-72 p-4 md:p-6 lg:p-8 overflow-y-auto min-h-screen">
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-studies" element={<PatientStudies />} />

        {/* Rutas protegidas dentro del Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute />}>
          <Route index element={<DashboardHome />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
