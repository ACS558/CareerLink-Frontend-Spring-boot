import { useState, useEffect } from "react";
import { notificationAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import toast from "react-hot-toast";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === "unread") params.isRead = false;
      if (filter === "read") params.isRead = true;

      const res = await notificationAPI.getNotifications(params);
      const page = res.data.data; 
      setNotifications(page.content || page);
      //setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification.id);
        //await notificationAPI.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
           // n._id === notification._id ? { ...n, isRead: true } : n,
            n.id === notification.id ? { ...n, isRead: true } : n,
          ),
        );
      }

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationAPI.clearRead();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      toast.success("Read notifications cleared");
    } catch (error) {
      console.error("Clear read error:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this notification?")) return;

    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      //setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      job_approved: "✅",
      job_rejected: "❌",
      application_received: "📝",
      application_shortlisted: "🎉",
      application_rejected: "📋",
      application_selected: "🎊",
      recruiter_approved: "✅",
      recruiter_rejected: "❌",
      alumni_approved: "✅",
      alumni_rejected: "❌",
    };
    //return icons[type] || "🔔";
    return icons[type?.toLowerCase()] || "🔔";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 border-red-300",
      medium: "bg-blue-100 border-blue-300",
      low: "bg-gray-100 border-gray-300",
    };
    //return colors[priority] || colors.medium;
    return colors[priority?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications 🔔
            </h1>
            <p className="text-gray-600">
              Stay updated with all your activities
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === "read"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Read
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark all read
                </button>
                <button
                  onClick={handleClearRead}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear read
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <span className="text-5xl">🔔</span>
              <p className="text-gray-500 mt-3 text-lg">No notifications</p>
              <p className="text-gray-400 text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition-all ${
                    !notification.isRead ? "border-l-4 border-primary-600" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${getPriorityColor(notification.priority)}`}
                    >
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`text-base ${!notification.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                        >
                          {notification.title}
                        </h3>
                        <button
                          onClick={(e) => handleDelete(notification._id, e)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true },
                          )}
                        </span>
                        {!notification.isRead && (
                          <span className="flex items-center space-x-1 text-blue-600">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            <span>New</span>
                          </span>
                        )}
                        {notification.priority === "high" && (
                          <span className="text-red-600 font-semibold">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
