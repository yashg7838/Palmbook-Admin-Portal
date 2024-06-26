import { collection, doc, query, where, getDocs,setDoc } from "firebase/firestore";
import { auth, db } from "../db.js";
import admin from "firebase-admin";  
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
const serviceAccountKey=Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(serviceAccountKey)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const checkAuthenticationMess = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      where("user", "==", "mess")
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log("Error during token verification", error);
    res.redirect("/login");
  }
};

const addMessMenu = async (req, res) => {
  try {
    const date = req.body.date;
    await setDoc(doc(db, "mess", date), req.body);
    res.redirect("/mess?message=Menu Added");
  } catch (err) {
    console.log(err);
    res.redirect("/mess?message=Error adding Menu. Try Again Later");
  }
};

export { checkAuthenticationMess, addMessMenu };
