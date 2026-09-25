import { useState, useEffect, useRef } from "react";
import { notificationAPI } from "../../services/api";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import toast from "react-hot-toast";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const {
    unreadCount,
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(); 

  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      fetchNotifications({ limit: 10 });
    }
  }, [showDropdown]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      //await markAsRead(notification._id); //for the backend built on node.js and Express.js
      await markAsRead(notification.id); //for the backend built on Spring boot
      setShowDropdown(false);

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      } else {
        navigate("/notifications");
      }
    } catch (error) {
      console.error("Notification click error:", error);
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationAPI.clearRead();
      fetchNotifications({ limit: 10 });
    } catch (error) {
      console.error("Clear read error:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      job_approved: "✅",
      job_rejected: "❌",
      new_job_posted: "🎯",
      application_received: "📝",
      application_shortlisted: "🎉",
      application_pending: "📋",
      application_rejected: "📋",
      application_selected: "🎊",
      application_status: "📬",
      recruiter_approved: "✅",
      recruiter_rejected: "❌",
      alumni_approved: "✅",
      alumni_rejected: "❌",
      extension_request: "📝",
      extension_approved: "✅",
      extension_rejected: "❌",
      placement_offer: "🎉",
      new_post: "📝",
      new_post_admin: "📝",
      new_recruiter_registration: "🏢",
      new_alumni_registration: "🎓",
      new_referral_pending: "📌",
      referral_approved: "🎉",
      referral_rejected: "❌",
      new_referral_posted: "🎯",
    };
    //return icons[type] || "🔔"; //for the backend built on node.js and express.js
    return icons[type?.toLowerCase()] || "🔔"; //for the backend built on spring boot
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 border-red-300",
      medium: "bg-blue-100 border-blue-300",
      low: "bg-gray-100 border-gray-300",
    };
    //return colors[priority] || colors.medium; //for the backend built on node.js and express.js
    return colors[priority?.toLowerCase()] || colors.medium; //for the backend built on spring boot
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl">🔔</span>
                <p className="mt-2 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    //key={notification._id}
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getPriorityColor(notification.priority)}`}
                      >
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p
                            className={`text-sm ${!notification.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={handleClearRead}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Clear read
              </button>
              <button
                onClick={() => {
                  navigate("/notifications");
                  setShowDropdown(false);
                }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
