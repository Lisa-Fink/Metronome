import { body } from "express-validator";
import { validationResult } from "express-validator";
import sanitize from "mongo-sanitize";

const validateSettings = [
  body("settings.bpm")
    .isInt({ min: 40, max: 260 })
    .withMessage("BPM must be between 40 and 260"),
  body("settings.timeSignature")
    .isIn([1, 2, 3, 4, 5, 6, 7, 9])
    .withMessage("Time signature must be 1, 2, 3, 4, 5, 6, 7, or 9"),
  body("settings.instruments")
    .isArray({ min: 4, max: 4 })
    .withMessage("Instruments must contain 4 instruments.")
    .custom((instruments) => {
      instruments.forEach((instrument) => {
        if (instrument.length !== 3) {
          throw new Error(
            "All instruments must have a name, description, and value"
          );
        }
      });
      return true;
    }),
  body("settings.rhythmSequence")
    .isArray({ min: 4, max: 4 })
    .withMessage("Rhythm sequence must contain 4 sequences."),
  body("settings.rhythmGrid")
    .isArray({ min: 4, max: 4 })
    .withMessage("Rhythm grid must contain 4 grids."),
  body("settings.title").isString().withMessage("Title must be a string."),
  body("settings.measures")
    .isInt({ min: 1, max: 2 })
    .withMessage("Measures must be either 1 or 2."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  req.body = sanitize(req.body);
  next();
};

export { validateSettings, validate };
