import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthuser] = useState(null);
  const [onlineUsers, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  // 🔐 Check Authenticated User
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthuser(data.user);
        connectSocket(data.user); // ✅ Connect socket on auth check
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔌 Connect to Socket Server
  const connectSocket = (userData) => {
    if (!userData) return;

    // 💡 Don't reconnect if already connected
    if (socket?.connected) {
      console.log("🟢 Socket already connected");
      return;
    }

    console.log("🔌 Connecting socket for:", userData.fullname);

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"], // ✅ Force WebSocket
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("📡 Online users updated:", userIds);
      setOnlineUser(userIds);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    setSocket(newSocket);
  };

  // 🔓 Login Handler
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthuser(data.userdata);
        connectSocket(data.userdata);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🚪 Logout Handler
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthuser(null);
    setOnlineUser([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    if (socket) socket.disconnect();
  };

  // ✏️ Profile Update
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthuser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Check auth & connect socket on page reload
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, []);

  const value = {
    authUser,
    setAuthuser,
    socket,
    onlineUsers,
    login,
    logout,
    updateProfile,
    connectSocket,
    axios,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
