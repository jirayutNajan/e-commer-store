import mongoose from "mongoose";

export const connenctDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOURI);
    console.log(`mongoDB connented: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to mongoDB", error.message);
    process.exit(1);
  }
}