"use strict";
import express from "express";
import session from "express-session";
import fileUpload from "express-fileupload";
import path from "path";
import cookieParser from "cookie-parser";
import viewsRouter from "./routes/viewsRoutes.js";
import actionRouter from "./routes/actionRoutes.js";

const app = express();
const port = process.env.PORT;
const __dirname = path.resolve();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(cookieParser());

app.use(
  session({
    secret: "palmbook",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      sameSite: "strict",
    },
  })
);
app.use("", viewsRouter);
app.use("", actionRouter);

app.get("*", function (req, res) {
  res.redirect("/home");
});

app.listen(port, (err) => {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  } else {
    console.log(`Server running on port: ${port}`);
  }
});

export default app;
