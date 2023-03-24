import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import validateUid from "./middleware/validateUid.mjs";
import metronomeRouter from "./controllers/metronomeController.mjs";
import drumMachineRouter from "./controllers/drumMachineController.mjs";
import userRouter from "./controllers/userController.mjs";

const PORT = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: ["http://localhost:8000"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/users", userRouter);
app.use(validateUid);
app.use("/users/metronomes", metronomeRouter);
app.use("/users/drum-machines", drumMachineRouter);

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

export { app };
