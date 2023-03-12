import mongoose from "mongoose";
import userSchema, { metronomeSchema } from "../userSchema.mjs";

const Metronome = mongoose.model("Metronome", metronomeSchema);
const User = mongoose.model("User", userSchema, "users");

// CREATE************************************************************
const createMetronome = async (user, settings) => {
  try {
    const newMetronome = new Metronome(settings);
    user.metronomes.push(newMetronome);
    await user.save();
    return user.metronomes[user.metronomes.length - 1];
  } catch (err) {
    console.error(`1Error creating metronome: ${err.message}`);
    throw new Error("There was an error creating the metronome.");
  }
};

// RETRIEVE**********************************************************

// Retrieve All
const retrieveMetronomes = async (user) => {
  return user.metronomes;
  // TODO validate all metronomes
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
  try {
    user.metronomes.id(metronome_id).remove();
    await user.save();
    return user;
  } catch (err) {
    console.error(`Error deleting the metronome: ${err.message}`);
    throw new Error(`There was an error deleting the metronome.`);
  }
};

export {
  createMetronome,
  retrieveMetronomes,
  retrieveMetronomeByID,
  updateMetronome,
  deleteMetronomeById,
};
