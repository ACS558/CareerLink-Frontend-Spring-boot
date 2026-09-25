//below is the code for socketClient.js which is used for connecting to the backend built on Spring boot using STOMP over WebSocket.

import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class SocketClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = {}; // event name -> Set of callbacks (mimics Socket.IO's on/off/emit)
    this.shownNotifications = new Set();
  }

  connect(token) {
    if (this.connected) {
      console.log("✅ STOMP already connected");
      return this.client;
    }
    if (!token) {
      console.error("❌ No token provided for socket connection");
      return null;
    }

    const API_URL = import.meta.env.VITE_API_URL;
    const WS_URL = API_URL.replace(/\/api\/?$/, "") + "/ws";

    console.log("🔌 Connecting to STOMP...", WS_URL);

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 1000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("✅ STOMP connected!");
        this.connected = true;

        this.client.subscribe("/user/queue/notifications", (message) => {
          const notification = JSON.parse(message.body);
          this._handleIncomingNotification(notification);
          this._emitLocal("new_notification", { notification, unreadCount: notification.unreadCount });
        });
      },

      onDisconnect: () => {
        console.log("❌ STOMP disconnected");
        this.connected = false;
      },

      onStompError: (frame) => {
        console.error("🔴 STOMP error:", frame.headers?.message);
      },
    });

    this.client.activate();
    return this.client;
  }

  _handleIncomingNotification(notification) {
    const notificationId = notification.id; // numeric Long, not Mongo's _id

    if (this.shownNotifications.has(notificationId)) return;

    const notificationAge = Date.now() - new Date(notification.createdAt).getTime();
    if (notificationAge >= 10000) return;

    this.shownNotifications.add(notificationId);

    const audio = new Audio("/sounds/notification.mp3");
    audio.play().catch(() => console.log("🔇 Sound blocked by browser"));

    if (Notification.permission === "granted") {
      const browserNotif = new Notification(notification.title || "CareerLink", {
        body: notification.message || "You have a new notification",
        icon: "/logo.png",
        badge: "/logo.png",
        tag: String(notificationId),
      });
      browserNotif.onclick = () => { window.focus(); browserNotif.close(); };
    }
  }

  disconnect() {
    if (this.client) {
      console.log("🔌 Disconnecting STOMP...");
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.shownNotifications.clear();
      this.listeners = {};
    }
  }

  getSocket() {
    //return this.client;
    return this;
  }

  // Mimics Socket.IO's on/off/emit for existing consumers (useNotifications.js, NotificationBell.jsx)
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(callback);
  }

  off(event, callback) {
    this.listeners[event]?.delete(callback);
  }

  _emitLocal(event, data) {
    this.listeners[event]?.forEach((cb) => cb(data));
  }

  emit(event, data) {
    // No client-to-server events currently needed; kept for interface parity.
    console.warn("⚠️ socketClient.emit() called but no STOMP outbound mapping defined for:", event);
  }
}

const socketClient = new SocketClient();

if (typeof window !== "undefined") {
  window.socketClient = socketClient;
}

export default socketClient;



//Below code is commented out because it was used for the backend built on node.js and Express.js. The backend has been switched to Spring boot, so this code is no longer needed. But it is kept for reference in case we need to switch back to the previous backend or for understanding the structure of API calls.
/* import { io } from "socket.io-client";

class SocketClient {
  constructor() {
    this.socket = null;
    this.shownNotifications = new Set(); // Track shown notifications
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected:", this.socket.id);
      return this.socket;
    }

    if (!token) {
      console.error("❌ No token provided for socket connection");
      return null;
    }

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    console.log("🔌 Connecting to Socket.IO...", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected!");
      console.log("📍 Socket ID:", this.socket.id);
    });

    // ✅ Handle browser notifications here (separate from UI updates)
    this.socket.on("new_notification", (data) => {
      console.log("🔔 New notification received:", data);

      // Get notification data (handle both structures)
      const notification = data.notification || data;
      const notificationId = notification._id;

      // Skip if already shown
      if (this.shownNotifications.has(notificationId)) {
        console.log("⏭️ Already shown this notification");
        return;
      }

      // Check if notification is new (created within last 10 seconds)
      const notificationAge =
        Date.now() - new Date(notification.createdAt).getTime();
      const isNew = notificationAge < 10000; // 10 seconds

      console.log("📊 Notification age:", notificationAge, "ms");

      if (!isNew) {
        console.log("⏭️ Notification too old, skipping browser popup");
        return;
      }

      // Mark as shown
      this.shownNotifications.add(notificationId);

      // Play sound
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {
        console.log("🔇 Sound blocked by browser");
      });

      // Show browser notification
      if (Notification.permission === "granted") {
        const title = notification.title || "CareerLink";
        const body = notification.message || "You have a new notification";

        console.log("📢 Showing browser notification:", { title, body });

        const browserNotif = new Notification(title, {
          body: body,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: notificationId,
        });

        browserNotif.onclick = () => {
          window.focus();
          browserNotif.close();
        };
      } else {
        console.log("❌ Notification permission:", Notification.permission);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.shownNotifications.clear(); // Clear tracking
    }
  }

  getSocket() {
    return this.socket;
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn("⚠️ Socket not connected, cannot listen to event:", event);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketClient = new SocketClient();

if (typeof window !== "undefined") {
  window.socketClient = socketClient;
}

export default socketClient;
 */