//get all user accept logged in user
import User from "../models/user.models.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io , userSocketMap } from "../server.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("✅ Sidebar API called by user ID:", userId);

    // Fetch all users except the current user
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
    console.log("🔍 Filtered users (excluding current):", filteredUsers.length);

    // Object to store unseen message count for each user
    const unseenMessages = {};

    // Loop through users and count unseen messages
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      console.log(`📨 Unseen messages from ${user.fullname} (${user._id}):`, messages.length);

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    // Wait for all message checks to finish
    await Promise.all(promises);

    console.log("✅ Returning users and unseenMessages:", {
      usersCount: filteredUsers.length,
      unseenMessages,
    });

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });

  } catch (error) {
    console.log("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};





//get all messages for selsected user


export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // ID of the other user in the chat
    const myId = req.user._id; // Logged-in user ID

    // ✅ Correct field names: senderId and receiver
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    })

    // ✅ Also correct field names here
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

//api to mark meassage seen using msg id.
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    // Update message's read status
    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({
      success: true,
      message: "Message marked as read"
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

//send messages to selected user


export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    let imageUrl;

    // If image is sent, upload it to Cloudinary
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Use correct field names
    const newMessage = await Message.create({
      senderId,
      receiverId, 
      text,
      image: imageUrl,
    });

    // Emit to receiver socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};


