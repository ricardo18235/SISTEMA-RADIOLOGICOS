import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  UploadCloud,
  Users,
  FileImage,
  HardDrive,
  Calendar,
} from "lucide-react";
import UploadForm from "../components/UploadForm";
import PatientHistoryModal from "../components/PatientHistoryModal";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [chartReady, setChartReady] = useState(false);

  // Estado para el modal de subir archivo
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Estado para el modal de historial
  const [selectedPatientDni, setSelectedPatientDni] = useState(null);

  // Obtener datos del usuario
  const userStr = localStorage.getItem("user");
  const user = userStr
    ? JSON.parse(userStr)
    : { name: "Usuario", id: null, role: "guest" };
  const userName = user.name || "Doctor";

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost/backend/dashboard_stats.php?user_id=${user.id}&role=${user.role}`
      );
      setStats(res.data);
    } catch (e) {
      console.error("Error cargando dashboard:", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats) {
      // Pequeño retardo para asegurar que el DOM esté listo antes de renderizar gráficas
      const timer = setTimeout(() => setChartReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-600 font-medium animate-pulse">
        Cargando Panel de Control...
      </div>
    );
  }

  const COLORS = ["#4318FF", "#6AD2FF", "#EFF4FB", "#FF8042"];

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl sticky top-0 z-10 border border-white/20">
        <div>
          <p className="text-sm text-gray-500">Bienvenido de nuevo,</p>
          <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-blue-600/20">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {/* --- BOTÓN ADMIN (SOLO ADMIN) --- */}
      <div className="flex justify-end">
        {user.role === "admin" && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 font-medium transition-all transform hover:-translate-y-1"
          >
            <UploadCloud size={20} /> Subir Nuevo Estudio
          </button>
        )}
      </div>

      {/* MODAL DE SUBIDA */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl transition-colors"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Subir Estudio
            </h3>
            <UploadForm
              onSuccess={() => {
                setShowUploadModal(false);
                fetchStats();
              }}
            />
          </div>
        </div>
      )}

      {/* --- TARJETAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pacientes Totales"
          value={stats.counts.patients}
          icon={<Users size={24} className="text-blue-600" />}
          bgIcon="bg-blue-100"
          trend="+ Total Histórico"
        />
        <StatCard
          title="Estudios Realizados"
          value={stats.counts.studies}
          icon={<FileImage size={24} className="text-purple-600" />}
          bgIcon="bg-purple-100"
          trend="+ Total Histórico"
        />
        <StatCard
          title="Espacio Usado"
          value={`${stats.counts.space_gb} GB`}
          icon={<HardDrive size={24} className="text-orange-600" />}
          bgIcon="bg-orange-100"
          trend="Wasabi S3 Total"
        />
        <StatCard
          title="Este Mes"
          value={stats.counts.month_studies}
          icon={<Calendar size={24} className="text-green-600" />}
          bgIcon="bg-green-100"
          trend="Mes Actual"
        />
      </div>

      {/* --- GRÁFICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICA REAL SEMANAL */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">
              Actividad Semanal
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Semana Actual
            </span>
          </div>
          <div className="h-72 w-full">
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={300}>
                <AreaChart data={stats.weekly_activity}>
                  <defs>
                    <linearGradient
                      id="colorEstudios"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A3AED0", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#A3AED0", fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="estudios"
                    stroke="#4318FF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorEstudios)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICA TIPOS (DONUT) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg text-slate-800 mb-2">
            Categorías de Estudios
          </h3>
          <div className="h-60 relative w-full">
            {chartReady && (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={300}>
                <PieChart>
                  <Pie
                    data={stats.by_type}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {stats.by_type.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-400">Total</span>
              <span className="text-2xl font-bold text-slate-800">
                {stats.counts.studies}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4 max-h-32 overflow-y-auto">
            {stats.by_type.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  <span className="text-gray-500 capitalize">
                    {item.category || "Varios"}
                  </span>
                </div>
                <span className="font-bold text-slate-700">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- TABLA RECIENTES --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-slate-800 mb-4">
          Pacientes Recientes (Últimos 5)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                <th className="pb-4 font-medium pl-2">PACIENTE</th>
                <th className="pb-4 font-medium">DOCTOR</th>
                <th className="pb-4 font-medium">ESTUDIO</th>
                <th className="pb-4 font-medium">FECHA</th>
                <th className="pb-4 font-medium">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.recent_patients.length > 0 ? (
                stats.recent_patients.map((p, i) => (
                  <tr
                    key={i}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 pl-2">
                      <p className="font-bold text-slate-700">{p.name.toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{p.dni}</p>
                    </td>
                    <td className="py-4 text-gray-600">
                      {p.doctor_name ? `Dr. ${p.doctor_name}` : "N/A"}
                    </td>
                    <td className="py-4">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-100 uppercase">
                        {p.study_category || "General"}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-xs">{p.last_date}</td>
                    <td className="py-4">
                      {/* 3. BOTÓN CONECTADO AL ESTADO */}
                      <button
                        onClick={() => setSelectedPatientDni(p.dni)}
                        className="text-blue-600 font-medium hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-lg transition-colors text-xs"
                      >
                        Ver Historial
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400">
                    No hay actividad reciente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL DE HISTORIAL */}
      {selectedPatientDni && (
        <PatientHistoryModal
          dni={selectedPatientDni}
          onClose={() => setSelectedPatientDni(null)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgIcon, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${bgIcon}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mt-1 ">{value}</h4>
        <p className="text-xs text-green-500 font-medium mt-1">{trend}</p>
      </div>
    </div>
  );
}
