import mongoose from "mongoose";
import userSchema, { drumMachineSchema } from "../userSchema.mjs";

const DrumMachine = mongoose.model("DrumMachine", drumMachineSchema);
const User = mongoose.model("User", userSchema, "users");

// CREATE************************************************************
const createDrumMachine = async (settings, _id) => {
  try {
    const newDrumMachine = new DrumMachine(settings);
    const user = await User.findOneAndUpdate(
      { _id },
      { $push: { drumMachines: newDrumMachine } },
      { new: true }
    );
    return user.drumMachines[user.drumMachines.length - 1];
  } catch (err) {
    console.error(`Error creating drum machine: ${err.message}`);
    throw new Error("There was an error creating the drum machine.");
  }
};

// RETRIEVE**********************************************************

// Retrieve All
const retrieveDrumMachines = async (_id) => {
  try {
    const user = await User.findById(_id);
    if (!user) {
      throw new Error(`User was not found.`);
    }
    return user.drumMachines;
  } catch (err) {
    console.error(`Error retrieving the drum machines: ${err.message}`);
    throw new Error(`There was an error retrieving the drum machines.`);
  }
};

// Retrieve One
const retrieveDrumMachineByID = async (user_id, dm_id) => {
  try {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error(`User was not found.`);
    }
    const drumMachine = user.drumMachines.id(dm_id);
    if (!drumMachine) {
      throw new Error(`DrumMachine with ID ${dm_id} not found.`);
    }
    return drumMachine;
  } catch (err) {
    console.error(`Error retrieving the drum machine: ${err.message}`);
    throw new Error(`There was an error retrieving the drum machine.`);
  }
};

// UPDATE************************************************************
const updateDrumMachine = async (user_id, dm_id, settings) => {
  try {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error(`User was not found.`);
    }
    const drumMachine = user.drumMachines.id(dm_id);
    if (!drumMachine) {
      throw new Error(`DrumMachine with ID ${dm_id} not found.`);
    }
    drumMachine.set(settings);
    await user.save();
    return drumMachine;
  } catch (err) {
    console.error(`Error updating the drum machine: ${err.message}`);
    throw new Error(`There was an error updating the drum machine.`);
  }
};

// DELETE************************************************************
const deleteDrumMachineById = async (user_id, dm_id) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $pull: { drumMachines: { _id: dm_id } } },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error(`User was not found.`);
    }
    return updatedUser;
  } catch (err) {
    console.error(`Error deleting the drum machine: ${err.message}`);
    throw new Error(`There was an error deleting the drum machine.`);
  }
};

export {
  createDrumMachine,
  retrieveDrumMachines,
  retrieveDrumMachineByID,
  updateDrumMachine,
  deleteDrumMachineById,
};
