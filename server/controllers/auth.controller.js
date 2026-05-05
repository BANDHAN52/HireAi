import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email and password are required." });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email already registered. Please login." });
    if (role && !["seeker", "company"].includes(role)) return res.status(400).json({ success: false, message: "Role must be seeker or company." });
    const userData = { name, email, password, role: role || "seeker" };
    if (role === "company") {
      if (!companyName) return res.status(400).json({ success: false, message: "Company name is required for company registration." });
      userData.companyName = companyName;
    }
    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyName: user.companyName,
        skills: user.skills,
        location: user.location,
        bio: user.bio,
        experience: user.experience,
        education: user.education,
        resumeUrl: user.resumeUrl,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        companyDescription: user.companyDescription,
        companyWebsite: user.companyWebsite,
      },
    });
  } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive) return res.status(401).json({ success: false, message: "Your account has been deactivated." });
    const token = generateToken(user._id, user.role);
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyName: user.companyName,
        skills: user.skills,
        location: user.location,
        bio: user.bio,
        experience: user.experience,
        education: user.education,
        resumeUrl: user.resumeUrl,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        companyDescription: user.companyDescription,
        companyWebsite: user.companyWebsite,
      },
    });
  } catch (error) { next(error); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) { next(error); }
};
