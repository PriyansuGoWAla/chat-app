import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext.jsx";
import { ChatContext } from "../../context/chatContext.jsx";

const Sidebar = () => {
  const chatCtx = useContext(ChatContext);
  const authCtx = useContext(AuthContext);

  if (!chatCtx || !authCtx) {
    return <div className="text-white p-5">Loading...</div>;
  }

  const {
    users = [],
    selectedUser,
    setSelectedUser,
    setUnseenMessages,
    unseenMessages = {},
    getUsers = () => {},
  } = chatCtx;

  const { logout = () => {}, onlineUsers = [], authUser } = authCtx;

  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const filteredUsers = (
    input
      ? users.filter((u) =>
          u.fullname?.toLowerCase().includes(input.toLowerCase())
        )
      : users
  )
    .filter((u) => u._id !== authUser?._id)
    .sort((a, b) => onlineUsers.includes(b._id) - onlineUsers.includes(a._id));

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-hidden text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Logo + Dropdown */}
      <div className="pb-5">
        <div className="flex justify-between items-center relative">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <img
            src={assets.menu_icon}
            alt="menu"
            onClick={() => setMenuOpen(!menuOpen)}
            className="max-h-5 cursor-pointer"
          />
          {menuOpen && (
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
              <p onClick={() => navigate("/profile")} className="cursor-pointer">
                Edit profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p onClick={logout} className="cursor-pointer text-sm">
                Log Out
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
        <img src={assets.search_icon} alt="Search" className="w-3" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
          placeholder="Search User..."
        />
      </div>

      {/* Users List */}
      <div className="flex flex-col">
        {filteredUsers.map((user) => (
          <div
           onClick={() => {
                     console.log("✅ User selected:", user.fullname);
                     setSelectedUser(user),  setUnseenMessages(prev => {
    const updated = { ...prev };
    delete updated[user._id];
    return updated;
  });
                    }}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
            }`}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt="profile"
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullname}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>

            {unseenMessages?.[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
