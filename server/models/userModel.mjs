import mongoose from "mongoose";
import userSchema from "../userSchema.mjs";

const User = mongoose.model("User", userSchema, "users");

// CREATE************************************************************
const createUser = async (uid, lightSetting) => {
  try {
    const newUser = new User({
      userId: uid,
      drumMachines: [],
      metronomes: [],
      lightSetting: lightSetting,
    });
    await newUser.save();
    return newUser;
  } catch (err) {
    console.error(`Error creating user: ${err.message}`);
    throw new Error("There was an error creating the user.");
  }
};

// RETRIEVE**********************************************************

// Retrieve One
const retrieveUserByUID = async (uid) => {
  try {
    const currentUser = await User.findOne({ userId: uid });
    if (!currentUser) {
      throw new Error(`User was not found.`);
    }
    return currentUser;
  } catch (err) {
    console.error(`Error retrieving the user: ${err.message}`);
    throw new Error(`There was an error retrieving the user.`);
  }
};

// UPDATE************************************************************
const updateUser = async (
  _id,
  userId,
  drumMachines,
  metronomes,
  lightSetting
) => {
  try {
    const currentUser = await User.findById(_id);
    if (!currentUser) {
      throw new Error(`User was not found.`);
    }
    currentUser.set({ userId, drumMachines, metronomes, lightSetting });
    await currentUser.save();
    return currentUser;
  } catch (err) {
    console.error(`Error updating user: ${err.message}`);
    throw new Error(`There was an error updating the user.`);
  }
};

const updateUserLightSetting = async (_id, lightSetting) => {
  try {
    const currentUser = await User.findById(_id);
    if (!currentUser) {
      throw new Error(`User was not found.`);
    }
    currentUser.set({ lightSetting });
    await currentUser.save();
    return currentUser;
  } catch (err) {
    console.error(
      `Error updating the user's light mode setting: ${err.message}`
    );
    throw new Error(
      `There was an error updating the user's light mode setting.`
    );
  }
};

// DELETE************************************************************
const deleteUserById = async (_id, uid) => {
  try {
    const currentUser = await User.findById(_id);
    if (!currentUser) {
      throw new Error(`User with ID ${_id} not found.`);
    }
    if (currentUser.uid !== uid) {
      throw new Error("Unauthorized");
    }
    await currentUser.remove();
  } catch (err) {
    console.error(`Error deleting the user: ${err.message}`);
    throw new Error(`There was an error deleting the user.`);
  }
};

export {
  createUser,
  retrieveUserByUID,
  updateUser,
  updateUserLightSetting,
  deleteUserById,
};
