import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../db.js";

const addUser = async (data) => {
  try {
    const email = data.email;
    const password = "123456";
    const userRecord = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userRecord.user.uid;
    data.uid = uid;
    await setDoc(doc(db, "users", uid), data);
  } catch (err) {
    console.log("error adding student",err);
    return null;
  }
};

const uploadStudentData = async (req, res) => {
  req.body.SCEC = "no";
  req.body.Campus = "In";
  req.body.CLub_Post = "member";
  req.body["User Type"] = "student";
  await addUser(req.body);

  res.redirect("/student?message=Student Added");
};

const uploadUserData = async (req, res) => {
  try {
    await addUser(req.body);
    res.redirect("/other");
  } catch (err) {
    res.redirect("/other?message=Error Registering User");
    console.log(err);
  }
};

export { addUser, uploadStudentData, uploadUserData };

// app.post("/register", checkAuthentication, async (req, res) => {
//     try {
//       const { name, email, password } = req.body;

//       // Check if email already exists in Firestore
//       const q = query(
//         collection(db, "users"),
//         where("email", "==", email),
//         where("user", "==", "admin")
//       );

//       const snapshot = await getDocs(q);

//       if (snapshot.empty) {
//         return res.redirect("/other?message=Email does not exist");
//       }

//       // If email exists, create user with Firebase Authentication
//       const userRecord = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       console.log(userRecord.user.uid);

//       res.redirect("/register?message=Registration Successful");
//     } catch (error) {
//       res.redirect("/register?message=Registration failed");
//       console.error("Error registering person: ", error);
//     }
//   });
