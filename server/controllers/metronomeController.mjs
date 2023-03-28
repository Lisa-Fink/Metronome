import { Router } from "express";
import * as metronomeModel from "../models/metronomeModel.mjs";
import uidToUser from "../middleware/uidToUser.mjs";
import {
  validate,
  validateSettings,
} from "../middleware/validateMetronome.mjs";

const metronomeRouter = Router();
metronomeRouter.use(uidToUser);

// CREATE controller
metronomeRouter.post("/", validateSettings, validate, async (req, res) => {
  try {
    const metronome = await metronomeModel.createMetronome(
      req.user,
      req.body.settings
    );
    res.status(201).json(metronome);
  } catch (error) {
    console.error(`Error creating the metronome: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// RETRIEVE controller
metronomeRouter.get("/", async (req, res) => {
  try {
    const metronomes = await metronomeModel.retrieveMetronomes(req.user);
    res.json(metronomes);
  } catch (error) {
    console.error(`Error retrieving the metronomes: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
});

// RETRIEVE by ID controller
metronomeRouter.get("/:metronome_id", async (req, res) => {
  try {
    const metronome = await metronomeModel.retrieveMetronomeByID(
      req.user,
      req.params.metronome_id
    );
    if (metronome !== null) {
      res.json(metronome);
    } else {
      res.status(404).json({ Error: "Metronome not found." });
    }
  } catch (error) {
    console.error(`Error retrieving the metronome: ${error.message}`);
    res
      .status(400)
      .json({ Error: "There was an error retrieving the metronome." });
  }
});

// UPDATE controller
metronomeRouter.put(
  "/:metronome_id",
  validateSettings,
  validate,
  async (req, res) => {
    try {
      const metronome = await metronomeModel.updateMetronome(
        req.user,
        req.params.metronome_id,
        req.body.settings
      );
      if (metronome) {
        res.json(metronome);
      } else {
        res.status(404).json({ Error: "Metronome not found." });
      }
    } catch (error) {
      console.error(`Error updating the metronome: ${error.message}`);
      res
        .status(400)
        .json({ error: "There was an error updating the metronome." });
    }
  }
);

// DELETE Controller
metronomeRouter.delete("/:metronome_id", async (req, res) => {
  try {
    const deletedMetronome = await metronomeModel.deleteMetronomeById(
      req.user,
      req.params.metronome_id
    );
    if (deletedMetronome) {
      res.status(204).send();
    } else {
      res.status(404).json({ Error: "This metronome doesn't exist." });
    }
  } catch (error) {
    console.error(`Error deleting metronome: ${error.message}`);
    res
      .status(400)
      .json({ error: "There was an error deleting the metronome." });
  }
});

export default metronomeRouter;
