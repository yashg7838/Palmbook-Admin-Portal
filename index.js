"use strict"
// Required Node Modules
import express, { json } from "express";
import { Parser } from "json2csv";
import session from "express-session";
import "dotenv/config";
import fs from "fs";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import path from 'path';
import csv from "csv-parser";
import cors from "cors";
dotenv.config();
// Required Firebase functions
import * as firebase from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, doc, query, where, getDocs, setDoc, addDoc, getDoc, snapshotEqual } from "firebase/firestore";



// const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();
// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.apikey,
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp);

auth.setPersistence("none");
function checkAuthentication(req, res, next) {
    auth
    // Check if the currentUser is not null in your authentication system
    if (auth.currentUser !== null) {
        const q = query(collection(db, "users"),
            where("email", "==", auth.currentUser.email),
            where("user", "==", "admin")

        );
        getDocs(q).then(
            snapshot => {
                if (!snapshot.empty) {

                    next();
                } else {
                    res.redirect("/login");

                }
            }
        )
        // If the user is authenticated, proceed to the next middleware
    } else {
        // If the user is not authenticated, redirect to the home page
        res.redirect("/login");
    }
}
function checkAuthenticationMess(req, res, next) {
    auth
    // Check if the currentUser is not null in your authentication system
    if (auth.currentUser !== null) {
        const q = query(collection(db, "users"),
            where("email", "==", auth.currentUser.email),
            where("user", "==", "mess")

        );
        getDocs(q).then(
            snapshot => {
                if (!snapshot.empty) {

                    next();
                } else {
                    res.redirect("/login");

                }
            }
        )
        // If the user is authenticated, proceed to the next middleware
    } else {
        // If the user is not authenticated, redirect to the home page
        res.redirect("/login");
    }
}

export async function addUser(db, data) {
    try {
        const email = data.email;
        const password = "123456";
        const userRecord = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userRecord.user.uid;
        data.uid = uid;
        const docRef = await setDoc(doc(db, "users", uid), data);
    } catch (err) {
        console.log(err);
        return null;
    }

}




// Define const
const app = express();
const port = process.env.PORT;


// use Body-Parser
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(
    session({
        secret: "palmbook",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === 'production',  // Ensure secure cookies in production
            sameSite: 'none',
        }
    })
);
// app.use(cors());

// gateways
app.get(
    "/", checkAuthentication, (req, res) => {
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
        res.render("other.ejs", { message });
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

    req.body.SCEC = "no";
    req.body.Campus = "In";
    req.body.CLub_Post = "member";
    req.body['User Type'] = "student";
    await addUser(db, req.body)


    res.redirect("/student?message=Student Added");
})

app.get(
    "/samplecsv", (req, res) => {
        const fields = ['Name', 'Phone_Number', 'gender', 'email', 'course', 'club', 'Hostel', 'RegistrationNumber', 'batch', 'EnrollmentNumber'];
        const sampledata = {};

        const json2csvParser = new Parser({ fields, header: true });
        const csv = json2csvParser.parse(sampledata);
        res.setHeader('Content-disposition', 'attachment; filename=sample.csv');
        res.set('Content-Type', 'text/csv');
        res.send(csv);

    }
)

app.get(
    "/samplecsvOther", (req, res) => {
        const fields = ['Name', 'PhoneNumber', 'Gender', 'email', 'User Type', 'Date Of Joining'];
        const sampledata = {};

        const json2csvParser = new Parser({ fields, header: true });
        const csv = json2csvParser.parse(sampledata);
        res.setHeader('Content-disposition', 'attachment; filename=sample.csv');
        res.set('Content-Type', 'text/csv');
        res.send(csv);

    }
)

app.get(
    "/mess", checkAuthenticationMess, (req, res) => {
        res.render("messuser.ejs");
    });


app.post(
    "/mess", checkAuthenticationMess, async (req, res) => {
        try {
            const date = req.body.date;
            // console.log(date);
            // console.log(req.body);
            await setDoc(doc(db, "mess", date), req.body);
        }
        catch (err) {
            console.log(err);
        }
        res.redirect("/mess");
    }
)

app.post(
    "/uploadcsv", async (req, res) => {


        if (!req.files || Object.keys(req.files).length === 0) {
            res.redirect("/home?message=No Files or Empty file was uplaoded");
        }
        const uploadFile = req.files.file;

        const FilePath = "./temp.csv";
        await uploadFile.mv(FilePath);


        const results = [];

        fs.createReadStream(FilePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on("end", async () => {
                for (const row of results) {
                    try {
                        row.SCEC = "no";
                        row.Campus = "In";
                        row.Club_Post = "member";
                        row['User Type'] = "student";
                        await addUser(db, row);

                    }
                    catch (error) {
                        res.redirect("/other?message=Error Uploading File");
                        console.log(error);
                    }
                }
                res.redirect("/student?message=Upload Successful");
            });





    }
)
app.post("/others", checkAuthentication, async (req, res) => {
    try {
        await addUser(db, req.body);
        res.redirect("/other")
    } catch (err) {
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
    "/login", (req, res) => {

        signInWithEmailAndPassword(auth, req.body.username, req.body.password).then(
            user => {
                const q = query(collection(db, "users"),
                    where("email", "==", req.body.username),
                    where("user", "==", "admin")

                );
                const qMess = query(collection(db, "users"),
                    where("email", "==", req.body.username),
                    where("user", "==", "mess")

                );


                getDocs(q).then(
                    snapshot => {
                        if (!snapshot.empty) {
                            res.redirect("/home")
                        }
                        else {

                            getDocs(qMess).then(
                                snapshot2 => {
                                    if (!snapshot2.empty) {
                                        res.redirect("/mess");
                                    } else {
                                        return res.redirect("/login?message=You Don't Have Access To the Website. Kindly Use App");
                                    }
                                }
                            )

                        }
                    }
                )




            }
        )
            .catch(
                err => {
                    res.redirect("/login?message=Incorrect email or password");
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

export default app;