import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => { // next for the next functon in route file
  try {
    const accessToken = req.cookies.accessToken;
    
    if(!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token provided"});
    }
    
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // สี่งที่เก็บไว้ใน access, refresh token คือ userId
      const user = await User.findById(decoded.userId).select("-password");
      
      if(!user) {
        return res.status(401).json({ message: "User not found"});
      }

      req.user = user;

      next();
    } catch (error) {
      if(error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthorized - Access token expired" });
      }
      throw err; // ส่ง error ไปที่ catch ข้างล่างอีกที
    }

  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid access Token" });
  }
}

export const adminRoute = async (req, res, next) => {
  if(req.user && req.user.role === "admin") {
    next();
  }
  else {
    return res.status(403).json({ message: "Access denied - Admin only" });
  }
}