import React, { useRef, useEffect, useState, useContext } from "react";
import assets from "../assets/assets.js";
import { Formatmessagetime } from "../lib/utils.js";
import { ChatContext } from "../../context/chatContext.jsx";
import { AuthContext } from "../../context/authContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const Chatbox = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollend = useRef();
  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim(), senderId: authUser._id });
    setInput("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      axios
        .put(`/api/messages/mark/${selectedUser._id}`)
        .catch((err) => console.error(err));
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollend.current && messages) {
      scrollend.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  return (
    <div className="h-full backdrop-blur-lg relative overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-6 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="text-white flex-1 text-lg flex items-center gap-2">
          {selectedUser.fullname}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="w-4 cursor-pointer"
        />
        <img src={assets.help_icon} alt="Help" className="max-md:hidden w-6" />
      </div>

      {/* Chat area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll no-scrollbar scroll-smooth p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 my-2 ${
              msg.senderId === authUser._id ? "justify-end" : "justify-start"
            }`}
          >
            {/* Avatar on left for received messages */}
            {msg.senderId !== authUser._id && (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-6 rounded-full"
                />
                <p className="text-gray-500 text-[9px]">
                  {Formatmessagetime(msg.createdAt)}
                </p>
              </div>
            )}

            {/* Message bubble */}
            <div>
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="sent"
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all bg-violet-500/30 text-white ${
                    msg.senderId !== authUser._id
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </p>
              )}
            </div>

            {/* Avatar on right for my messages */}
            {msg.senderId === authUser._id && (
              <div className="flex flex-col items-center gap-1">
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-6 rounded-full"
                />
                <p className="text-gray-500 text-[9px]">
                  {Formatmessagetime(msg.createdAt)}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={scrollend}></div>
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Chatbox;
