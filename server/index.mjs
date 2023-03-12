import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import validateUid from "./middleware/validateUid.mjs";
import authenticate from "./middleware/authenticate.mjs";
import metronomeRouter from "./controllers/metronomeController.mjs";
import drumMachineRouter from "./controllers/drumMachineController.mjs";
import userRouter from "./controllers/userController.mjs";

const PORT = process.env.PORT;
const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.use(express.json()); // REST needs JSON MIME type.

app.use("/users", userRouter);
app.use(validateUid);
app.use("/users/:_id/metronomes", metronomeRouter);
app.use("/users/:_id/drum-machines", drumMachineRouter);

// Connect to mongodb
mongoose.connect(process.env.MONGODB_CONNECT_STRING, { useNewUrlParser: true });
const db = mongoose.connection;
// Confirm connection
db.once("open", (err) => {
  if (err) {
    res.status(500).json({ error: "500:Connection to the server failed." });
  } else {
    console.log("Successfully connected to MongoDB using Mongoose.");
  }
});

export { app };
