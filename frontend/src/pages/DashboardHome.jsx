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
  Search,
  Bell,
  UploadCloud,
  Users,
  FileImage,
  HardDrive,
  Calendar,
} from "lucide-react";
import UploadForm from "../components/UploadForm";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const userName = localStorage.getItem("name") || "Usuario"; // Nombre del usuario logueado

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost/backend/dashboard_stats.php"
      );
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats)
    return <div className="p-10 text-gray-400">Cargando datos...</div>;

  // Datos simulados para la gráfica de curva (puedes conectarlo al backend luego)
  const activityData = [
    { name: "Lun", estudios: 4 },
    { name: "Mar", estudios: 7 },
    { name: "Mie", estudios: 5 },
    { name: "Jue", estudios: 10 },
    { name: "Vie", estudios: 6 },
    { name: "Sab", estudios: 3 },
  ];

  const COLORS = ["#4318FF", "#6AD2FF", "#EFF4FB", "#FF8042"]; // Azules modernos

  return (
    <div className="space-y-8">
      {/* --- HEADER SUPERIOR --- */}
      <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl sticky top-0 z-10">
        <div>
          <p className="text-sm text-gray-500">Bienvenido de nuevo,</p>
          <h2 className="text-2xl font-bold text-slate-800">{userName}</h2>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
          <div className="flex items-center gap-2 bg-[#F4F7FE] px-4 py-2 rounded-full text-gray-500">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-sm w-32 md:w-64"
            />
          </div>
          <button className="text-gray-400 hover:text-blue-600 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {userName.charAt(0)}
          </div>
        </div>
      </header>

      {/* --- BOTÓN FLOTANTE O DE ACCIÓN --- */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 font-medium transition-transform transform hover:-translate-y-1"
        >
          <UploadCloud size={20} /> Subir Nuevo Estudio
        </button>
      </div>

      {/* Modal de Subida */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-2xl w-full relative animate-fade-in-up">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-xl"
            >
              ×
            </button>
            <UploadForm
              onSuccess={() => {
                setShowUploadModal(false);
                fetchStats();
              }}
            />
          </div>
        </div>
      )}

      {/* --- TARJETAS DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pacientes Totales"
          value={stats.counts.patients}
          icon={<Users size={24} className="text-blue-600" />}
          bgIcon="bg-blue-100"
          trend="+12%"
        />
        <StatCard
          title="Estudios Realizados"
          value={stats.counts.studies}
          icon={<FileImage size={24} className="text-purple-600" />}
          bgIcon="bg-purple-100"
          trend="+5%"
        />
        <StatCard
          title="Espacio Usado"
          value={`${stats.counts.space_gb} GB`}
          icon={<HardDrive size={24} className="text-orange-600" />}
          bgIcon="bg-orange-100"
          trend="Wasabi S3"
        />
        <StatCard
          title="Este Mes"
          value={stats.counts.month_studies}
          icon={<Calendar size={24} className="text-green-600" />}
          bgIcon="bg-green-100"
          trend="+2 hoy"
        />
      </div>

      {/* --- GRÁFICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica Izquierda: Curva Suave (Simulando Revenue Growth) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">
              Actividad Semanal
            </h3>
            <button className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-medium">
              Semanal
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
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
          </div>
        </div>

        {/* Gráfica Derecha: Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-2">
            Tipos de Estudios
          </h3>
          <div className="h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
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
            {/* Texto central del Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-400">Total</span>
              <span className="text-2xl font-bold text-slate-800">
                {stats.counts.studies}
              </span>
            </div>
          </div>

          {/* Leyenda Personalizada */}
          <div className="space-y-2 mt-4">
            {stats.by_type.map((type, i) => (
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
                    {type.file_type}
                  </span>
                </div>
                <span className="font-bold text-slate-700">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- LISTA INFERIOR: ÚLTIMOS PACIENTES --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">
            Pacientes Recientes
          </h3>
          <span className="text-blue-600 text-sm cursor-pointer hover:underline">
            Ver todos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-100">
                <th className="pb-4 font-medium pl-2">NOMBRE</th>
                <th className="pb-4 font-medium">DNI</th>
                <th className="pb-4 font-medium">FECHA ÚLTIMO ESTUDIO</th>
                <th className="pb-4 font-medium">ESTADO</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats.recent_patients.map((p, i) => (
                <tr
                  key={i}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 pl-2 font-bold text-slate-700">
                    {p.name}
                  </td>
                  <td className="py-4 text-gray-500">{p.dni}</td>
                  <td className="py-4 text-gray-500">{p.last_date}</td>
                  <td className="py-4">
                    <button className="text-blue-600 font-medium hover:text-blue-800">
                      Ver Detalles
                    </button>
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

// Componente de Tarjeta Minimalista
function StatCard({ title, value, icon, bgIcon, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${bgIcon}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
        <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
          {trend}{" "}
          <span className="text-gray-300 font-normal">desde el mes pasado</span>
        </p>
      </div>
    </div>
  );
}
