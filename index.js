"use strict"
// Required Node Modules
import express, { json } from "express";
import {Parser} from"json2csv";
import session from "express-session";
import "dotenv/config";
import fs from "fs";
import fileUpload from "express-fileupload";
import csv from "csv-parser";

// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, doc, query, where, getDocs, setDoc, addDoc } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.appId
};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp);

auth.setPersistence("none");
function checkAuthentication(req, res, next) {
    auth
    // Check if the currentUser is not null in your authentication system (e.g., Firebase Authentication)
    if (auth.currentUser !== null) {
        // If the user is authenticated, proceed to the next middleware or route handler
        next();
    } else {
        // If the user is not authenticated, redirect to the home page (or any other page)
        res.redirect("/login");
    }
}

export async function addUser(db, data) {
        try{
        const email = data.email;
        const password = "123456";
        const userRecord = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userRecord.user.uid;
        data.uid=uid;
        const docRef = await setDoc(doc(db, "users", uid), data);
        }catch(err){
            console.log(err);
            return null;
        }
    
}




// Define const
const app = express();
const port = process.env.PORT;

// Connect to pg client


// use Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

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
    "/",checkAuthentication, (req, res) => {
        return res.redirect("/home");
    }
);

app.get(
    "/login", (req, res) => {
        const message = req.query.message || ""
        return res.render("index.ejs", { message });
    }
);

app.get(
    "/home", checkAuthentication, (req, res) => {
        const message = req.query.message || ""
        res.render("home.ejs", { message });
    }
);
app.get(
    "/services", checkAuthentication, (req, res) => {
        res.render("services.ejs");

    }
);
app.get(
    "/student", checkAuthentication, (req, res) => {

        const message = req.query.message || ""
        return res.render("student.ejs", { message });

    });
app.get(
    "/shuttle", checkAuthentication, (req, res) => {
        res.render("shuttle.ejs");

    });

app.get(
    "/other", checkAuthentication, (req, res) => {
        const message = req.query.message || ""
        res.render("other.ejs",{message});
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
app.get(
    "/changepswd", checkAuthentication, (req, res) => {
        res.render("changepswd.ejs")
    }
)
app.post("/student", checkAuthentication, async (req, res) => {

    req.body.SCEC="no";
    req.body.Campus="In";
    req.body.post="member";
    await addUser(db, req.body) 

    res.redirect("/student?message=Student Added");
})

app.get(
    "/samplecsv", (req, res) => {
        const fields = ['Name','email', 'batch', 'course', 'Hostel', 'RegistrationNumber', 'EnrollmentNumber', 'club'];
        const sampledata = {};
        
        const json2csvParser =new Parser({fields,header:true});
        const csv = json2csvParser.parse(sampledata);
           res.setHeader('Content-disposition', 'attachment; filename=sample.csv');
            res.set('Content-Type', 'text/csv');
            res.send(csv);
        
    }
)
app.get(
    "/samplecsvOther", (req, res) => {
        const fields = ['Name','PhoneNumber', 'Gender', 'email', 'User Type', 'Date Of Joining'];
        const sampledata = {};
        
        const json2csvParser =new Parser({fields,header:true});
        const csv = json2csvParser.parse(sampledata);
           res.setHeader('Content-disposition', 'attachment; filename=sample.csv');
            res.set('Content-Type', 'text/csv');
            res.send(csv);
        
    }
)

app.post(
    "/uploadcsv",async (req,res)=>{


        if(!req.files || Object.keys(req.files).length === 0){
            res.redirect("/home?message=No Files or Empty file was uplaoded");
        }
        const uploadFile=req.files.file;

        const FilePath ="./temp.csv";
        await uploadFile.mv(FilePath);


        const results=[];

        fs.createReadStream(FilePath)
        .pipe(csv())
        .on('data',(data)=>{
            results.push(data);
        })
        .on("end",async()=>{
            for(const row of results){
                try{
                    row.SCEC="no";
                    row.Campus="In";
                    row.post="member";
                    await addUser(db,row);
                    
                }
                catch(error){
                    res.redirect("/other?message=Error Uploading File");
                    console.log(error);
                }
            }
            res.redirect("/student?message=Upload Successful");
        });





    }
)
app.post("/others", checkAuthentication, async (req, res) => {
    try{
    await addUser(db, req.body)
    res.redirect("/other")
    }catch(err){
        res.redirect("/other?message=Error Registering User");
        console.log(err);
    }
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

app.post(
    "/", (req, res) => {

        signInWithEmailAndPassword(auth, req.body.username, req.body.password).then(
            user => {
                res.redirect("/home")
            }
        )
            .catch(
                err => {
                    res.redirect("/?message=Incorrect email or password");
                }
            )
    }
)
app.post("/register", checkAuthentication, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists in Firestore
        const q = query(collection(db, "users"),
            where("email", "==", email),
            where("user", "==", "admin")
        );

        const snapshot = await getDocs(q);


        if (snapshot.empty) {
            return res.redirect("/other?message=Email does not exist");
        }

        // If email exists, create user with Firebase Authentication
        const userRecord = await createUserWithEmailAndPassword(auth, email, password);
        console.log(userRecord.user.uid);

        res.redirect("/register?message=Registration Successful")
    } catch (error) {
        res.redirect("/register?message=Registration failed")
        console.error("Error registering person: ", error);
    }
});

app.post(
    "/changepswd", (req, res) => {
        const user = auth.currentUser;

        const CurrentPassword = req.body.CurrentPassword;
        const NewPassword = req.body.NewPassword;
        if (user !== null) {
            const email = user.email;
            const credential = EmailAuthProvider.credential(email, CurrentPassword);
            reauthenticateWithCredential(user, credential).then(() => {
                updatePassword(user, NewPassword).then(() => {
                    res.redirect("/home?message=Password changed");
                }).catch((err) => {
                    console.log(err);
                    res.redirect("/home?message=Error in resetting the password");
                }
                )
            }
            )
                .catch(
                    err => {
                        res.redirect("/?message=Incorrect password");
                        console.log(err);
                    }
                )
        }
    }
);


app.post(
    "/reset-password", (req, res) => {

        const email = req.body.email;
        sendPasswordResetEmail(auth, email)
            .then(() => {
                res.redirect("/?message=Password Reset Link Sent");
            })
            .catch((error) => {
                if (error.code == "auth/missing-email") {
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