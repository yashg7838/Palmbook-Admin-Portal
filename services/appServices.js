import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  signOut,
} from "firebase/auth";
import admin from "firebase-admin";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
const serviceAccountKey = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  "base64"
).toString("utf-8");

const serviceAccount = JSON.parse(serviceAccountKey);
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../db.js";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const checkAuthentication = async (req, res, next) => {
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
      where("user", "==", "admin")
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
const signIn = async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCredential.user.getIdToken();

    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      where("user", "==", "admin")
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      res.cookie("token", idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      res.redirect("/home");
    } else {
      const qMess = query(
        collection(db, "users"),
        where("email", "==", email),
        where("user", "==", "mess")
      );
      const snapshot2 = await getDocs(qMess);

      if (!snapshot2.empty) {
        res.cookie("token", idToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        });
        res.redirect("/mess");
      } else {
        res.redirect("login?message=You Dont have access to this Website");
      }
    }
  } catch (err) {
    console.log("Error during sign-in", err);
    res.redirect("login?message=Incorrect email or password");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const resp = await sendPasswordResetEmail(auth, req.body.email);
    res.redirect("/login?message=Password Reset Link Sent");
  } catch (error) {
    console.log(error);
    if (error.code == "auth/missing-email") {
      res.redirect("/login?message=Email Don't Exist in Database");
    }
    res.redirect("/login?message=Error sending password reset email");
  }
};
const changePassword = async (req, res) => {
  const user = auth.currentUser;
  const CurrentPassword = req.body.CurrentPassword;
  const NewPassword = req.body.NewPassword;
  if (user !== null) {
    const email = user.email;
    const credential = EmailAuthProvider.credential(email, CurrentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      try {
        updatePassword(user, NewPassword);
        res.redirect("/home?message=Password changed");
      } catch (err) {
        console.log(err);
        res.redirect("/home?message=Error in resetting the password");
      }
    } catch (err) {
      res.redirect("/?message=Incorrect password");
      console.log(err);
    }
  }
};
const signOutFunc = async (req, res) => {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      res.clearCookie("token");
      res.redirect("/");
    })
    .catch((error) => {
      res.redirect("/home?message=Error Signing Out. Please Try Again");
    });
};
export {
  checkAuthentication,
  signIn,
  forgotPassword,
  changePassword,
  signOutFunc,
};
