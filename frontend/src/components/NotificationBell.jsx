import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, X, Eye, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchNotifications = async () => {
        if (!user.id) return;

        try {
            setLoading(true);
            const res = await axios.get(`http://localhost/backend/get_notifications.php?user_id=${user.id}`);
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Actualizar cada 5 segundos para notificaciones en "tiempo real"
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    // Cerrar panel al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        };

        if (showPanel) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPanel]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post("http://localhost/backend/mark_notification_read.php", {
                notification_id: notificationId
            });
            fetchNotifications();
        } catch (error) {
            console.error("Error marcando notificación:", error);
        }
    };

    const deleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await axios.post("http://localhost/backend/delete_notification.php", {
                notification_id: notificationId
            });
            fetchNotifications();
        } catch (error) {
            console.error("Error eliminando notificación:", error);
        }
    };

    const handleNotificationClick = async (notif) => {
        // Si es una notificación de nuevo estudio, navegar al historial del paciente
        if (notif.type === 'new_study' && notif.patient_dni) {
            // Navegamos pasando el DNI en el estado para que la página de pacientes sepa cuál abrir
            navigate('/dashboard/patients', { state: { openDni: notif.patient_dni } });
            setShowPanel(false);

            // Borrar la notificación del doctor después de hacer clic
            try {
                await axios.post("http://localhost/backend/delete_notification.php", {
                    notification_id: notif.id
                });
                fetchNotifications();
            } catch (error) {
                console.error("Error al borrar notificación tras clic:", error);
            }
        } else {
            // Para otros tipos de notificaciones, solo marcar como leída o borrar si prefieres
            if (!notif.is_read) {
                await markAsRead(notif.id);
            }
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_study':
                return <Clock size={16} className="text-blue-500" />;
            case 'study_viewed':
                return <Eye size={16} className="text-green-500" />;
            default:
                return <Bell size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="relative text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {showPanel && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Notificaciones</h3>
                            <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
                        </div>
                        <button
                            onClick={() => setShowPanel(false)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No hay notificaciones</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-blue-50/50' : ''
                                            }`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-8">
                                                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                    {notif.message}
                                                </p>
                                                {notif.patient_name && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Paciente: {notif.patient_name}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(notif.created_at).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>

                                            {/* Delete button for admin on study_viewed notifications */}
                                            {user.role === 'admin' && notif.type === 'study_viewed' && (
                                                <button
                                                    onClick={(e) => deleteNotification(notif.id, e)}
                                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-red-500"
                                                    title="Eliminar notificación"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}

                                            {!notif.is_read && (
                                                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
