import { Router } from "express";
import {
  checkAuthentication,
  GatepassStatus,
  StudentCampusStatus,
} from "../services/appServices.js";
import { checkAuthenticationMess } from "../services/messServices.js";
const router = Router();
router.get("/", checkAuthentication, (req, res) => {
  return res.redirect("/home");
});

router.get("/login", (req, res) => {
  const message = req.query.message || "";
  return res.render("index.ejs", { message });
});

router.get("/home", checkAuthentication, async (req, res) => {
  const message = req.query.message || "";

  const chartData1 = await StudentCampusStatus();
  const chartData2 = await GatepassStatus();
  res.render("home.ejs", { message, chartData1, chartData2 });
});
router.get("/services", checkAuthentication, (req, res) => {
  res.render("services.ejs");
});
router.get("/student", checkAuthentication, (req, res) => {
  const message = req.query.message || "";
  return res.render("student.ejs", { message });
});
router.get("/shuttle", checkAuthentication, (req, res) => {
  res.render("shuttle.ejs");
});

router.get("/other", checkAuthentication, (req, res) => {
  const message = req.query.message || "";
  res.render("other.ejs", { message });
});
// router.get("/register", checkAuthentication, (req, res) => {
//   const message = req.query.message || "";
//   res.render("register.ejs", { message });
// });
router.get("/forgotpassword", (req, res) => {
  res.render("forgot.ejs");
});
router.get("/changepswd", checkAuthentication, (req, res) => {
  res.render("changepswd.ejs");
});
router.get("/mess", checkAuthenticationMess, (req, res) => {
  const message = req.query.message || "";

  res.render("messuser.ejs", { message });
});

export default router;
