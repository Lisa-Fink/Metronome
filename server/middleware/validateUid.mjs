import "dotenv/config";
import admin from "firebase-admin";

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const validateUid = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  if (token === "69") {
    // Testing only
    const uid = "abc123";
    req.uid = uid; // attach uid to the request object
    next();
    return;
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      const { uid } = decodedToken;
      req.uid = uid; // attach uid to the request object
      next();
    })
    .catch(() => {
      return res.status(401).json({ message: "Unauthorized access" });
    });
};

export default validateUid;
