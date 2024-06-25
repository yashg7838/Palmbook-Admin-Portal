import { Router } from "express";
import { uploadStudentData, uploadUserData } from "../services/userServices.js";
import {
  checkAuthentication,
  signIn,
  changePassword,
  signOutFunc,
  forgotPassword,
} from "../services/appServices.js";
import {
  addMessMenu,
  checkAuthenticationMess,
} from "../services/messServices.js";
import {
  downloadStudentCSV,
  downloadUsersCSV,
  uploadCSV,
} from "../services/csvservices.js";

const router = Router();
router.get("/samplecsv", checkAuthentication, downloadStudentCSV);
router.get("/samplecsvOther", checkAuthentication, downloadUsersCSV);
router.get("/logout", signOutFunc);

router.post("/student", checkAuthentication, uploadStudentData);
router.post("/mess", checkAuthenticationMess, addMessMenu);
router.post("/uploadcsv", checkAuthentication, uploadCSV);
router.post("/others", checkAuthentication, uploadUserData);
router.post("/login", signIn);
router.post("/changepswd", changePassword);
router.post("/reset-password", forgotPassword);

export default router;
