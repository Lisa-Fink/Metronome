import userSchema from "../userSchema.mjs";
import mongoose from "mongoose";
const User = mongoose.model("User", userSchema, "users");

const uidToUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.uid });
    if (user) {
      req.user = user;
      next();
    } else {
      throw new Error("Unauthorized access.");
    }
  } catch (error) {
    console.error("Invalid userId with token ", error);
    return res.status(401).json({ message: "Unauthorized user id" });
  }
};

export default uidToUser;
