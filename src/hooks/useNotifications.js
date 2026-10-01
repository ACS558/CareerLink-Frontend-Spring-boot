//Below is the code for useNotifications.js which is a custom React hook for managing notifications in a React application. It provides functionality to fetch notifications, mark them as read, and listen for real-time updates via WebSocket. It also handles playing notification sounds and displaying browser notifications.

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationAPI } from "../services/api";
import socket from "../socket/socketClient";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  //const soundRef = useRef(new Audio("/sounds/notification.mp3"));
  const isInitialLoad = useRef(true);
  const shownNotificationsRef = useRef(new Set());

  useEffect(() => {
    const init = async () => {
      await fetchNotifications({ limit: 10 });
      await fetchUnreadCount();
      isInitialLoad.current = false;
    };

    init();
  }, []);

  useEffect(() => {
    const socketInstance = socket.getSocket();

    if (!socketInstance) {
      console.log("❌ Socket not initialized");
      return;
    }

    const handleNewNotification = (data) => {
      console.log("🔔 NEW NOTIFICATION:", data);

      const notificationId = data.notification.id; // numeric Long, not Mongo's _id

      if (shownNotificationsRef.current.has(notificationId)) {
        console.log("⏭️ Skipping duplicate notification:", notificationId);
        return;
      }

      // const notificationAge = Date.now() - new Date(data.notification.createdAt).getTime();
      // const isReallyNew = notificationAge < 10000;

      shownNotificationsRef.current.add(notificationId);

      setUnreadCount(data.unreadCount);
      setNotifications((prev) => [data.notification, ...prev]);

      // if (!isInitialLoad.current && isReallyNew) {
      //   soundRef.current.currentTime = 0;
      //   soundRef.current.play().catch(() => {
      //     console.log("Sound blocked by browser");
      //   });

      //   if (Notification.permission === "granted") {
      //     new Notification(data.notification.title || "CareerLink", {
      //       body: data.notification.message,
      //       icon: "/logo.png",
      //     });
      //   }
      // }
    };

    console.log("✅ Attaching notification listener");

    socketInstance.on("new_notification", handleNewNotification);

    return () => {
      socketInstance.off("new_notification", handleNewNotification);
    };
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(params);
      const page = response.data.data;
      setNotifications(page.content || page);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.data);
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};

//Below code is commented out because it was used for the backend built on node.js and Express.js. The backend has been switched to Spring boot, so this code is no longer needed. But it is kept for reference in case we need to switch back to the previous backend or for understanding the structure of API calls.

/* import { useState, useEffect, useCallback, useRef } from "react";
import { notificationAPI } from "../services/api";
import socket from "../socket/socketClient";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef(new Audio("/sounds/notification.mp3"));
  const isInitialLoad = useRef(true);
  const shownNotificationsRef = useRef(new Set()); //Track shown notifications

  // Fetch initial data
  useEffect(() => {
    const init = async () => {
      await fetchNotifications({ limit: 10 });
      await fetchUnreadCount();
      isInitialLoad.current = false;
    };

    init();
  }, []);

  // ✅ Listen for real-time updates with duplicate prevention
  useEffect(() => {
    const socketInstance = socket.getSocket();

    if (!socketInstance) {
      console.log("❌ Socket not initialized");
      return;
    }

    const handleNewNotification = (data) => {
      console.log("🔔 NEW NOTIFICATION:", data);

      const notificationId = data.notification._id;

      // ✅ Skip if we've already shown this notification
      if (shownNotificationsRef.current.has(notificationId)) {
        console.log("⏭️ Skipping duplicate notification:", notificationId);
        return;
      }

      // ✅ Check if notification is ACTUALLY NEW (created in last 10 seconds)
      const notificationAge =
        Date.now() - new Date(data.notification.createdAt).getTime();
      const isReallyNew = notificationAge < 10000; // 10 seconds

      // Mark as shown
      shownNotificationsRef.current.add(notificationId);

      // Update state
      setUnreadCount(data.unreadCount);
      setNotifications((prev) => [data.notification, ...prev]);

      // 🔊 Only play sound and show popup for ACTUALLY NEW notifications
      if (!isInitialLoad.current && isReallyNew) {
        // Play sound
        soundRef.current.currentTime = 0;
        soundRef.current.play().catch(() => {
          console.log("Sound blocked by browser");
        });

        // Show browser notification
        if (Notification.permission === "granted") {
          new Notification(data.notification.title || "CareerLink", {
            body: data.notification.message,
            icon: "/logo.png",
          });
        }
      }
    };

    console.log("✅ Attaching notification listener");

    socketInstance.on("new_notification", handleNewNotification);

    return () => {
      socketInstance.off("new_notification", handleNewNotification);
    };
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Fetch unread count error:", error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    setNotifications,
    setUnreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
 */