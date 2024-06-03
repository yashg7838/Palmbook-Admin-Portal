"use strict"
// Required Node Modules
import express from "express";
import session from "express-session";

// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getAuth, signInWithEmailAndPassword,sendPasswordResetEmail, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, getDoc, doc, setDoc } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCK-HqFytwwiW87ey9TOJXVRXpvjpQq20E",
    authDomain: "palmbook-admin.firebaseapp.com",
    databaseURL: "https://palmbook-admin-default-rtdb.firebaseio.com",
    projectId: "palmbook-admin",
    storageBucket: "palmbook-admin.appspot.com",
    messagingSenderId: "495472528955",
    appId: "1:495472528955:web:8e9a89dd915fe31de7961e"
};

// Initialize Firebase
const firebaesApp = firebase.initializeApp(firebaseConfig);
const db = getFirestore(firebaesApp)
const auth = getAuth(firebaesApp);

auth.setPersistence("none");
function checkAuthentication(req, res, next) {
    auth
    // Check if the currentUser is not null in your authentication system (e.g., Firebase Authentication)
    if (auth.currentUser !== null) {
        // If the user is authenticated, proceed to the next middleware or route handler
        next();
    } else {
        // If the user is not authenticated, redirect to the home page (or any other page)
        res.redirect("/");
    }
}

export async function addUser(db, data) {
    try {

        // const docRef = await addDoc(collection(db, "users"), data);
        await setDoc(doc(db, "users", data.email), data)
    } catch (e) {
        console.error("Error adding user: ", e);
        return null;
    }
}




// Define const
const app = express();
const port = 3000;

// Connect to pg client


// use Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session(
        {
            secret: "palmbook",
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
            }
        }
    )
);


// gateways
app.get(
    "/", (req, res) => {
        const message = req.query.message || ""
        return res.render("index.ejs",{message});
    }
);

app.get(
    "/home", checkAuthentication, (req, res) => {
        res.render("student.ejs")
    }
);
app.get(
    "/services", checkAuthentication, (req, res) => {
        res.render("services.ejs");

    }
);
app.get(
    "/faculty", checkAuthentication, (req, res) => {
        res.render("faculty.ejs");

    }
);
app.get(
    "/student", checkAuthentication, (req, res) => {
        return res.render("student.ejs");

    });
app.get(
    "/shuttle", checkAuthentication, (req, res) => {
        res.render("shuttle.ejs");

    });

app.get(
    "/other", checkAuthentication, (req, res) => {
        res.render("other.ejs");
    }
);
app.get(
    "/register", checkAuthentication, (req, res) => {

        const message = req.query.message || ""
        res.render("register.ejs", { message });

    }
);
app.get(
    "/forgotpassword", (req, res) => {
        res.render("forgot.ejs")
    }
);
app.post("/others", async (req, res) => {
    await addUser(db, req.body)

    res.redirect("/other")
})
app.get(
    "/logout", (req, res) => {
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
            res.redirect("/");
        }).catch((error) => {
            // An error happened.
        });
    }
)
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists in Firestore
        const snapshot = await getDoc(doc(db, "users", email))


        if (snapshot.data() === undefined) {
            return res.redirect("/other?message=Email does not exist");
        }

        // If email doesn't exist, create user with Firebase Authentication
        const userRecord = await createUserWithEmailAndPassword(auth, email, password);

        res.redirect("/register?message=Registration Successful")
    } catch (error) {
        console.error("Error registering person: ", error);
        res.redirect("/register?message=Registration failed")
    }
});

app.post(
    "/", (req, res) => {

        signInWithEmailAndPassword(auth, req.body.username, req.body.password).then(
            user => {
                res.redirect("/home")
            }
        )
        .catch(
            err=>{
                res.redirect("/?message=Incorrect email or password");
            }
        )
    }
)
app.post(
    "/reset-password", (req,res)=>{

        const email =req.body.email;
        sendPasswordResetEmail(auth, email)
        .then(() => {
            res.redirect("/?message=Password Reset Link Sent");
        })
        .catch((error) => {
            if(error.code=="auth/missing-email"){
                res.redirect("/?message=Email Don't Exist in Database");    
            }
            res.redirect("/?message=Error sending password reset email");
        });
    }
);

app.get('*', function (req, res) {
    res.redirect('/home');
});

app.listen(port, (err) => {

    if (err) {
        console.log(`Error in running the server: ${err}`);
    }
    else {
        console.log(`Server running on port: ${port}`);
    }
}
);