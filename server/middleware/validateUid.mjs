import "dotenv/config";
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
  }),
});

const validateUid = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      const { uid } = decodedToken;
      req.uid = uid;
      next();
    })
    .catch(() => {
      console.error("Unauthorized access");
      return res.status(401).json({ message: "Unauthorized access" });
    });
};

export default validateUid;
