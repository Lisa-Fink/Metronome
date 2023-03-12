import mongoose from "mongoose";

/**********************************/
// Drum Machine Schema
/**********************************/
const instrumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  value: { type: Number, required: true },
});

const rhythmSequenceSchema = new mongoose.Schema({
  row: {
    type: [Number],
    required: true,
  },
});

const rhythmGridSchema = new mongoose.Schema({
  row: {
    type: [String],
    enum: ["first", "middle", "last"],
    required: true,
  },
});

const drumMachineSchema = mongoose.Schema({
  bpm: { type: Number, required: true },
  timeSignature: { type: Number, required: true },
  instruments: { type: [[instrumentSchema]], required: true },
  rhythmSequence: { type: [rhythmSequenceSchema], required: true },
  rhythmGrid: { type: [rhythmGridSchema], required: true },
  title: { type: String, required: true },
});

/**********************************/
// Metronome Schema
/**********************************/
const metronomeSchema = mongoose.Schema({
  bpm: {
    type: Number,
    required: true,
  },
  timeSignature: {
    type: Number,
    required: true,
  },
  downBeat: {
    type: Boolean,
    required: true,
  },
  subdivide: {
    type: Number,
    required: true,
  },
  mainBeat: {
    type: Boolean,
    required: true,
  },
  key: {
    type: Number,
    required: true,
  },
  tone: {
    type: String,
    required: true,
  },
  countIn: {
    type: Number,
    required: true,
  },
  numMeasures: {
    type: Number,
    required: true,
  },
  repeat: {
    type: Number,
    required: true,
  },
  tempoInc: {
    type: Number,
    required: true,
  },
  sectionPractice: {
    type: Boolean,
    required: true,
  },
  tempoPractice: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

/**********************************/
// User Schema
//    single collection holds all information for each user
/**********************************/
const userSchema = mongoose.Schema({
  userId: { type: String, required: true },
  drumMachines: { type: [drumMachineSchema], required: true },
  metronomes: { type: [metronomeSchema], required: true },
  lightSetting: { type: Boolean, required: true },
});

export default userSchema;
export { metronomeSchema, drumMachineSchema };
