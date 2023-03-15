import mongoose from "mongoose";

/**********************************/
// Drum Machine Schema
/**********************************/
const drumMachineSchema = mongoose.Schema({
  bpm: { type: Number, required: true, min: 40, max: 260 },
  timeSignature: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 9],
  },
  instruments: {
    type: Array,
    required: true,
  },
  rhythmSequence: {
    type: Array,
    required: true,
  },
  rhythmGrid: {
    type: Array,
    required: true,
  },
  title: { type: String, required: true },
  measures: { type: Number, min: 1, max: 2 },
});

/**********************************/
// Metronome Schema
/**********************************/
const metronomeSchema = mongoose.Schema({
  bpm: {
    type: Number,
    required: true,
    min: 40,
    max: 260,
  },
  timeSignature: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 9],
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
    min: 0,
    max: 99,
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
