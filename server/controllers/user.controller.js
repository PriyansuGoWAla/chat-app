import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

//controller to sign up


// Controller to sign up
export const signup = async (req, res) => {
  const { fullname, email, password, bio } = req.body;
  console.log("▶ SIGNUP HIT:", req.body);

  try {
    if (!fullname || !email || !password || !bio) {
      console.log("❗ Missing details");
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const user = await User.findOne({ email });
    console.log("Found user:", user);

    if (user) {
      return res.status(409).json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ fullname, email, password: hashedPassword, bio });
    console.log("✅ New user created:", newUser);

    const token = generateToken(newUser._id);
    console.log("🔐 Generated token:", token);

    return res.status(201).json({
      success: true,
      message: "User registered",
      userdata: newUser,
      token,
    });
  } catch (error) {
    console.error("🔥 SIGNUP ERROR:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


//controller to login user
export const login = async(req,res)=>{
try {
  const {email, password} =req.body
  const userdata = await User.findOne({email})
  const isPasswordcorrect = await bcrypt.compare(password,userdata.password)

  if(!isPasswordcorrect){
    res.json({success:false,message:"Wrong credentials"})
    return;
  }
  const token =generateToken(userdata._id)

res.json({
    success: true,
    userdata,
    token,
    message: "Login successful"
  });
} catch (error) {
  console.log(error.message);
  res.json({
    success: false,
    message: error.message
  });
}
};

//controller to authecite user
export const checkAuth = (req, res)=>{
res. json({success: true, user: req.user} ) ;
}

//controller to update user profile detail
 

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    let updatedUser;

    if (!profilePic) {
      // Update without changing profile picture
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      // Upload new profile picture to Cloudinary
      const upload = await cloudinary.uploader.upload(profilePic);
 console.log("📤 Cloudinary upload result:", upload);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: upload.secure_url,
          bio,
          fullName
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
