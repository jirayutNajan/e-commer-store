import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt, { decode } from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });

  return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60); // 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent cross site scripting attack
    maxAge: 15*60*1000
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
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
  const {accessToken, refreshToken} = generateTokens(user._id);
  await storeRefreshToken(user._id, refreshToken);

  setCookies(res, accessToken, refreshToken);
  
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({ email }); // อย่าลืมใส่ await

    if(user && await user.comparePassword(password)) { // อยู่ในไฟล์ user model
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken) // store เข้าไปใน redis
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      })
    }
    else {
      res.status(401).json({ message: "Invalid email or password "});
    }

  } catch (error) {
    console.log(`Error in login controller ${error.message}`);
    res.status(500).json({ message: "Internal Server Error"});
  }
}

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET); //vertify ว่าเป็น token เดียวกันมั้ย 
      await redis.del(`refresh_token:${decoded.userId}`)
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({message: "Logged out succesfully"});

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message});  
  }
}

// this will recreate refresh token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
  
    if(!refreshToken) {
      return res.status(401).json({ message: "No refresh Token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`); // เอามาจาก redis โดยเอา userId มาจาก 
    // refreshToken ของเครื่อง

    if(storedToken !== refreshToken) { // เทียบว่า refresh token ที่อยู่ในเครื่องเรากับใน redis เหมือนกันมั้ย
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    // จาก if check หากมีผู้ใช้สองเครื่อง login user เดียวกัน จะตรวจสอบให้เครื่องเก่า token ไม่เหมือนกับ token อันใหม่ เพื่อป้องกัน

    const accessToken = jwt.sign({ userId: decode.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m'
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'strict',
      maxAge: 15*60*1000
    })

    res.json({ message: "Token refresh succesfully" });
  } catch (error) {
    console.log(`error in refreshToken controller ${error.message}`);
    res.status(500).json({ error: "Interal server error" });    
  }
}

// TODO implement getprofile
// export const getProfile = async (req, res) => {

// }