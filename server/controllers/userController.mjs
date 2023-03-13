import { Router } from "express";
import authenticate from "../middleware/authenticate.mjs";
import validateUid from "../middleware/validateUid.mjs";
import * as userModel from "../models/userModel.mjs";

const userRouter = Router();

// CREATE controller
userRouter.post("/", async (req, res) => {
  try {
    const user = await userModel.createUser(
      req.body.uid,
      req.body.lightSetting
    );
    res.status(201).json(user);
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// RETRIEVE One by UID controller
userRouter.get("/", validateUid, async (req, res) => {
  try {
    const user = await userModel.retrieveUserByUID(req.uid);
    if (user !== null) {
      res.json(user);
    } else {
      res.status(404).json({ Error: "User not found." });
    }
  } catch (error) {
    console.error(`Error retrieving user: ${error.message}`);
    res.status(400).json({ Error: "There was an error retrieving the user." });
  }
});

// UPDATE controller
userRouter.put("/:_id", validateUid, authenticate, async (req, res) => {
  try {
    const user = await userModel.updateUser(
      req.user,
      req.body.uid,
      req.body.drumMachines,
      req.body.metronomes,
      req.body.lightSetting
    );
    res.json(user);
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    res.status(400).json({ error: "There was an error updating the user." });
  }
});

// UPDATE light setting controller
userRouter.patch(
  "/:_id/light-setting",
  validateUid,
  authenticate,
  async (req, res) => {
    try {
      const user = await userModel.updateUserLightSetting(
        req.user,
        req.body.lightSetting
      );
      res.json(user);
    } catch (error) {
      console.error(
        `Error updating the user's light mode setting: ${error.message}`
      );
      res.status(400).json({
        error: "There was an error updating the user light mode setting.",
      });
    }
  }
);

// DELETE Controller
userRouter.delete("/:_id", validateUid, authenticate, async (req, res) => {
  try {
    const deleted = await userModel.deleteUserById(req.user);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ Error: "This user doesn't exist." });
    }
  } catch (error) {
    console.error(`Error deleting user: ${error.message}`);
    if (error.message === "Unauthorized") {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      res.status(400).json({ error: "There was an error deleting the user." });
    }
  }
});

export default userRouter;
