import { collection, doc, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../db.js";

const checkAuthenticationMess = (req, res, next) => {
  auth;
  if (auth.currentUser !== null) {
    const q = query(
      collection(db, "users"),
      where("email", "==", auth.currentUser.email),
      where("user", "==", "mess")
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
