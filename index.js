"use strict"
// Required Node Modules
import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session  from "express-session";

// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
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
        console.log("logged in")
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
        console.log("user added")
    } catch (e) {
        console.error("Error adding user: ", e);
        return null;
    }
}




// Define const
const app =express();
const port =8000;
const salt=5;

// Connect to pg client


// use Body-Parser
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(
    session(
        {
            secret:"palmbook",
            resave:false,
            saveUninitialized:true,
            cookie:{
                maxAge:1000*60*60*24,
            }
        }
    )
);
app.use(passport.initialize());
app.use(passport.session());



// gateways
app.get(
    "/",(req,res)=>{

        return res.render("index.ejs");
    }
);

app.get(
    "/home",checkAuthentication, (req,res)=>{
        // if(req.isAuthenticated()){
        // res.render("student.ejs");
        // }
        // else{
        //     console.log("I come here");
        //     res.redirect("/");
        // }

        res.render("student.ejs")
    }
);
app.get(
    "/services",checkAuthentication,  (req,res)=>{
        res.render("services.ejs");
       
    }
);
app.get(
    "/faculty",checkAuthentication, (req,res)=>{
        res.render("faculty.ejs");
        
    }
);
app.get(
    "/student",checkAuthentication, (req,res)=>{
        return res.render("student.ejs");
        
    });
app.get(
    "/shuttle",checkAuthentication, (req,res)=>{
        res.render("shuttle.ejs");
        
    });

app.get(
    "/other",checkAuthentication, (req,res)=>{
        res.render("other.ejs");
    }
);
app.get(
    "/register",checkAuthentication, (req,res)=>{

        const message = req.query.message || ""
        // res.render("register.ejs");
        res.render("register.ejs", { message });
        
    }
);
// app.post(
//     "/register",async (req,res)=>{
//         const name = await req.body.name;
//         const username=await req.body.username;
//         const password= await req.body.password;
//         const checkExisting=await db.query("SELECT * FROM login WHERE username=$1",[username]);

//         if(checkExisting.rows.length>0){
//             console.log("Email Already Exists");
//             res.redirect("/");
//         }
//         else{
//             bcrypt.hash(password,salt, async (err,hash)=>{
//                 await db.query("INSERT INTO login (name,username,password) VALUES($1,$2,$3)",[name,username,hash]);
//             })
//             res.redirect("/");
//         }
//     }
// );

app.post("/others", async (req, res) => {
    console.log(req.body)
    await addUser(db, req.body)

    res.redirect("/other")
})

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists in Firestore
        const snapshot = await getDoc(doc(db, "users", email))
        console.log(email)
        console.log(snapshot.data())

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
    }
)

app.get('*', function(req, res){
    console.log('404ing');
    res.redirect('/home');
  });
  

passport.use(
    new Strategy(async function verify(username,password,cb){
        try{
        const result=await db.query("SELECT * FROM login where username=$1",[username]);
            if( result.rows.length>0){
                const user=await result.rows[0];
                const storedPassword=await user.password;
                bcrypt.compare(password,storedPassword,(err,valid)=>{
                    if(err){
                        console.log("Error comparing passwords:",err);
                        return cb(err);
                    }
                    else{
                        if(valid){
                            return cb(null,user);
                        }
                        else{
                            return cb(null,false);
                        }
                    }
                });
            }
            else{
                return cb("User Not Found");
            }
        }
        catch(err){
            console.log(err);
        }
    })
);

passport.serializeUser((user,cb)=>{
        cb(null,user);
    });
passport.deserializeUser((user,cb)=>{
        cb(null,user);
});

app.listen(port,(err)=>{

    if(err){
        console.log(`Error in running the server: ${err}`);
    }
    else{
        console.log(`Server running on port: ${port}`);
    }
}
);