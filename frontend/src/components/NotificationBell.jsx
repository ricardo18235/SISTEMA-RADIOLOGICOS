import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, X, CheckCircle, Clock } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Cargar notificaciones
  const fetchNotifications = async () => {
    if (!user.id) {
      console.warn("No user.id found in localStorage:", user);
      return;
    }

    console.log("Fetching notifications for user:", user.id);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost/backend/get_notifications.php?doctor_id=${user.id}&limit=10`
      );
      console.log("Notifications response:", response.data);
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  };

  // Cargar notificaciones al montar y cada 30 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      await axios.post("http://localhost/backend/mark_notification_read.php", {
        notification_id: notificationId,
        doctor_id: user.id,
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Botón de Campana */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificaciones */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="bg-gradient-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">Notificaciones</h3>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications()}
                className="hover:bg-blue-800 p-1 rounded text-xs"
                title="Actualizar"
              >
                🔄
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="hover:bg-blue-800 p-1 rounded"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notif.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icono */}
                    <div className="flex-initial pt-1">
                      {notif.is_read ? (
                        <CheckCircle size={20} className="text-gray-400" />
                      ) : (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {notif.patient_name}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {notif.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        {notif.study_name} • {notif.study_date}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.created_at).toLocaleString("es-ES")}
                      </p>
                    </div>

                    {/* Botón Marcar como Leído */}
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="flex-initial text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Marcar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 text-center text-sm text-gray-600 border-t border-gray-100 rounded-b-lg">
              {unreadCount > 0 ? (
                <p>{unreadCount} notificaciones sin leer</p>
              ) : (
                <p>Todas las notificaciones han sido leídas</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
