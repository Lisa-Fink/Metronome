import mongoose from "mongoose";
import { drumMachineSchema } from "../userSchema.mjs";

const DrumMachine = mongoose.model("DrumMachine", drumMachineSchema);

// CREATE************************************************************
const createDrumMachine = async (user, settings) => {
  try {
    const newDrumMachine = new DrumMachine(settings);
    user.drumMachines.push(newDrumMachine);
    await user.save();
    return user.drumMachines[user.drumMachines.length - 1];
  } catch (err) {
    console.error(`Error creating drum machine: ${err.message}`);
    throw new Error("There was an error creating the drum machine.");
  }
};

// RETRIEVE**********************************************************

// Retrieve All
const retrieveDrumMachines = async (user) => {
  return user.drumMachines;
};

// Retrieve One
const retrieveDrumMachineByID = async (user, dm_id) => {
  const drumMachine = user.drumMachines.id(dm_id);
  if (!drumMachine) {
    throw new Error(`DrumMachine with ID ${dm_id} not found.`);
  }
  return drumMachine;
};

// UPDATE************************************************************
const updateDrumMachine = async (user, dm_id, settings) => {
  const drumMachine = user.drumMachines.id(dm_id);
  if (!drumMachine) {
    throw new Error(`DrumMachine with ID ${dm_id} not found.`);
  }
  drumMachine.set(settings);
  await user.save();
  return drumMachine;
};

// DELETE************************************************************
const deleteDrumMachineById = async (user, dm_id) => {
  const drumMachineIndex = user.drumMachines.findIndex((dm) =>
    dm._id.equals(dm_id)
  );
  if (drumMachineIndex === -1) {
    throw new Error("Drum machine not found");
  }
  user.drumMachines.splice(drumMachineIndex, 1);
  await user.save();
  return user;
};

export {
  createDrumMachine,
  retrieveDrumMachines,
  retrieveDrumMachineByID,
  updateDrumMachine,
  deleteDrumMachineById,
};
