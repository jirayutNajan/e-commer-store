import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const {email, password, name} = req.body;
  const userExist = await User.findOne({ email });

  if(userExist) {
    return res.status(400).json({ message: "User already exists"});
  }
  const user = await User.create({ name, email, password })

   // authenticate user
   

  res.status(201).json({ user, message: "User created succesfully "});
}

export const login = async (req, res) => {
  res.send("login route called");
}

export const logout = async (req, res) => {
  res.send("logout route called");
}