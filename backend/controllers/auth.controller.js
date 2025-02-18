import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });

  return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token: ${userId}`, refreshToken, "EX", 7*24*60*60); // 7 days
}

const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV !== "production",
    sameSite: "strict", // prevent cross site scripting attack
    maxAge: 15*60*60*1000
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV !== "production",
    sameSite: "strict", // prevent cross site scripting attack
    maxAge: 15*60*60*1000
  })
}

export const signup = async (req, res) => {
  const {email, password, name} = req.body;
  const userExist = await User.findOne({ email });

  if(userExist) {
    return res.status(400).json({ message: "User already exists"});
  }
  const user = await User.create({ name, email, password })

   // authenticate user
   // HERE
  const {accessToken, refreshToken} = generateToken(user._id);
  await storeRefreshToken(user._id, refreshToken);

  setCookie(res, accessToken, refreshToken);
  
  res.status(201).json({ user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }, message: "User created succesfully "});
}

export const login = async (req, res) => {
  res.send("login route called");
}

export const logout = async (req, res) => {
  res.send("logout route called");
}