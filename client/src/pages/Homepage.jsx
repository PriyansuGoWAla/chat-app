import React, { useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbox from '../components/Chatbox';
import Rightsidebar from '../components/Rightsidebar';
import { AuthContext } from '../../context/authContext';
import { ChatContext } from '../../context/chatContext';

const Homepage = () => {
  const { onlineUsers } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`backdrop-blur-xl rounded-2xl border-2 border-gray-300 overflow-hidden h-full grid grid-cols-1 relative ${
          selectedUser
            ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
            : 'grid-cols-2'
        }`}
      >
        <Sidebar />
        <Chatbox />
        <Rightsidebar  />
      </div>
    </div>
  );
};

export default Homepage;
