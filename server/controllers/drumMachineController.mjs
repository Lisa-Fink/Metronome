import { Router } from "express";
import * as drumMachineModel from "../models/drumMachineModel.mjs";
import authenticate from "../middleware/authenticate.mjs";

const drumMachineRouter = Router({ mergeParams: true });
drumMachineRouter.use(authenticate);

// CREATE controller ************************************************
drumMachineRouter.post("/", async (req, res) => {
  try {
    const drumMachine = await drumMachineModel.createDrumMachine(
      req.user,
      req.body.settings
    );
    res.status(201).json(drumMachine);
  } catch (error) {
    console.error(`Error creating the drum machine: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// RETRIEVE controller **********************************************
drumMachineRouter.get("/", async (req, res) => {
  try {
    const drumMachines = await drumMachineModel.retrieveDrumMachines(req.user);
    res.json(drumMachines);
  } catch (error) {
    console.error(`Error retrieving the drum machines: ${error.message}`);
    res.status(404).json({ error: error.message });
  }
});

// RETRIEVE by ID controller
drumMachineRouter.get("/:dm_id", async (req, res) => {
  try {
    const drumMachine = await drumMachineModel.retrieveDrumMachineByID(
      req.user,
      req.params.dm_id
    );
    if (drumMachine !== null) {
      res.json(drumMachine);
    } else {
      res.status(404).json({ Error: "Drum machine not found." });
    }
  } catch (error) {
    console.error(`Error retrieving the drum machine: ${error.message}`);
    res
      .status(400)
      .json({ Error: "There was an error retrieving the drum machine." });
  }
});

// UPDATE controller ************************************************
drumMachineRouter.put("/:dm_id", async (req, res) => {
  try {
    const drumMachine = await drumMachineModel.updateDrumMachine(
      req.user,
      req.params.dm_id,
      req.body.settings
    );
    res.json(drumMachine);
  } catch (error) {
    console.error(`Error updating the drum machine: ${error.message}`);
    res
      .status(400)
      .json({ error: "There was an error updating the drum machine." });
  }
});

// DELETE Controller ************************************************
drumMachineRouter.delete("/:dm_id", async (req, res) => {
  try {
    const deletedDrumMachine = await drumMachineModel.deleteDrumMachineById(
      req.user,
      req.params.dm_id
    );
    if (deletedDrumMachine) {
      res.status(204).send();
    } else {
      res.status(404).json({ Error: "This drum machine doesn't exist." });
    }
  } catch (error) {
    console.error(`Error deleting the drum machine: ${error.message}`);
    res
      .status(400)
      .json({ error: "There was an error deleting the drum machine." });
  }
});

export default drumMachineRouter;
