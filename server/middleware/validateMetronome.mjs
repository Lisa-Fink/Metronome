import { body } from "express-validator";
import { validationResult } from "express-validator";
import sanitize from "mongo-sanitize";

// Validate and sanitize the settings object
const validateSettings = [
  body("settings.bpm")
    .exists()
    .withMessage("BPM is required")
    .isInt({ min: 40, max: 260 })
    .withMessage("BPM must be between 40 and 260"),
  body("settings.timeSignature")
    .exists()
    .withMessage("Time signature is required")
    .isInt({ min: 1, max: 9 })
    .withMessage("Time signature must be between 1 and 9"),
  body("settings.downBeat")
    .exists()
    .withMessage("Down beat is required")
    .isBoolean()
    .withMessage("Down beat must be a boolean"),
  body("settings.subdivide")
    .exists()
    .withMessage("Subdivide is required")
    .isInt()
    .withMessage("Subdivide must be an integer"),
  body("settings.mainBeat")
    .exists()
    .withMessage("Main beat is required")
    .isBoolean()
    .withMessage("Main beat must be a boolean"),
  body("settings.key")
    .exists()
    .withMessage("Key is required")
    .isInt()
    .withMessage("Key must be an integer"),
  body("settings.tone")
    .exists()
    .withMessage("Tone is required")
    .isString()
    .withMessage("Tone must be a string"),
  body("settings.countIn")
    .exists()
    .withMessage("Count in is required")
    .isInt()
    .withMessage("Count in must be an integer"),
  body("settings.numMeasures")
    .exists()
    .withMessage("Number of measures is required")
    .isInt()
    .withMessage("Number of measures must be an integer"),
  body("settings.repeat")
    .exists()
    .withMessage("Repeat is required")
    .isInt()
    .withMessage("Repeat must be an integer"),
  body("settings.tempoInc")
    .exists()
    .withMessage("Tempo increment is required")
    .isInt({ min: 0, max: 99 })
    .withMessage("Tempo increment must be between 0 and 99"),
  body("settings.sectionPractice")
    .exists()
    .withMessage("Section practice is required")
    .isBoolean()
    .withMessage("Section practice must be a boolean"),
  body("settings.tempoPractice")
    .exists()
    .withMessage("Tempo practice is required")
    .isBoolean()
    .withMessage("Tempo practice must be a boolean"),
  body("settings.title")
    .exists()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),
];

const validate = (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  req.body = sanitize(req.body);
  next();
};

export { validateSettings, validate };
