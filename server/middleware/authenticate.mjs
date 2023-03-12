import userSchema from "../userSchema.mjs";
import mongoose from "mongoose";
const User = mongoose.model("User", userSchema, "users");

const authenticate = async (req, res, next) => {
  try {
    const user = await User.findById(req.params._id);
    if (user && user.userId === req.uid) {
      req.user = user;
      next();
    } else {
      throw new Error("Unauthorized access.");
    }
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export default authenticate;
