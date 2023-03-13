import mongoose from "mongoose";
import { metronomeSchema } from "../userSchema.mjs";

const Metronome = mongoose.model("Metronome", metronomeSchema);

// CREATE************************************************************
const createMetronome = async (user, settings) => {
  try {
    const newMetronome = new Metronome(settings);
    user.metronomes.push(newMetronome);
    await user.save();
    return user.metronomes[user.metronomes.length - 1];
  } catch (err) {
    console.error(`Error creating metronome: ${err.message}`);
    throw new Error("There was an error creating the metronome.");
  }
};

// RETRIEVE**********************************************************

// Retrieve All
const retrieveMetronomes = async (user) => {
  return user.metronomes;
};

// Retrieve One
const retrieveMetronomeByID = async (user, metronome_id) => {
  try {
    const metronome = user.metronomes.id(metronome_id);
    if (!metronome) {
      throw new Error(`Metronome with ID ${metronome_id} not found.`);
    }
    return metronome;
  } catch (err) {
    console.error(`Error retrieving the metronome: ${err.message}`);
    throw new Error(`There was an error retrieving the metronome.`);
  }
};

// UPDATE************************************************************
const updateMetronome = async (user, metronome_id, settings) => {
  try {
    const metronome = user.metronomes.id(metronome_id);
    if (!metronome) {
      throw new Error(`Metronome with ID ${metronome_id} not found.`);
    }
    metronome.set(settings);
    await user.save();
    return metronome;
  } catch (err) {
    console.error(`Error updating the metronome: ${err.message}`);
    throw new Error(`There was an error updating the metronome.`);
  }
};

// DELETE************************************************************
const deleteMetronomeById = async (user, metronome_id) => {
  const toDelIdx = user.metronomes.findIndex((m) => m._id.equals(metronome_id));
  if (toDelIdx === -1) {
    throw new Error("The metronome was not found");
  }
  user.metronomes.splice(toDelIdx, 1);
  await user.save();
  return user;
};

export {
  createMetronome,
  retrieveMetronomes,
  retrieveMetronomeByID,
  updateMetronome,
  deleteMetronomeById,
};
