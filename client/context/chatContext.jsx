import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./authContext";
import { toast } from "react-toastify";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ✅ Get all users
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      console.log("💬 Sidebar data:", data);
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) setMessages(data.messages);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ✅ Send a message
  const sendMessage = async (messageData) => {
    try {
      console.log("📤 Sending from context:", messageData);

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      console.log("📥 Response from sendMessage:", data);

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Send failed: " + err.message);
    }
  };

  // ✅ Listen for incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      if (selectedUser?._id === newMessage.senderId) {
        setMessages((prev) => [...prev, newMessage]);
        await axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser?._id]);

  // ✅ Listen for online users update via socket
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (onlineUserIds) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          online: onlineUserIds.includes(user._id),
        }))
      );
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    return () => socket.off("getOnlineUsers", handleOnlineUsers);
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
