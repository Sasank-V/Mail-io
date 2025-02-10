import mongoose from "mongoose";

export const connect_DB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGO_DB_URL!);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
  }
};
