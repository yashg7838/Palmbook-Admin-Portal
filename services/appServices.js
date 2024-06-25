import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  signOut,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../db.js";

const checkAuthentication = (req, res, next) => {
  auth;
  if (auth.currentUser !== null) {
    const q = query(
      collection(db, "users"),
      where("email", "==", auth.currentUser.email),
      where("user", "==", "admin")
    );
    getDocs(q).then((snapshot) => {
      if (!snapshot.empty) {
        next();
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/login");
  }
};

const signIn = async (req, res) => {
  try {
    const email = req.body.username;
    const password = req.body.password;
    await signInWithEmailAndPassword(auth, email, password);
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      where("user", "==", "admin")
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      res.redirect("/home");
    } else {
      const qMess = query(
        collection(db, "users"),
        where("email", "==", email),
        where("user", "==", "mess")
      );
      const snapshot2 = await getDocs(qMess);

      if (!snapshot2.empty) {
        res.redirect("mess");
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
