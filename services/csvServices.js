import { Parser } from "json2csv";
import fs from "fs";
import csv from "csv-parser";
import { addUser } from "./userServices.js";

const downloadStudentCSV = (req, res) => {
  const fields = [
    "Name",
    "Phone_Number",
    "gender",
    "email",
    "course",
    "club",
    "Hostel",
    "RegistrationNumber",
    "batch",
    "EnrollmentNumber",
  ];
  const sampledata = {};

  const json2csvParser = new Parser({ fields, header: true });
  const csv = json2csvParser.parse(sampledata);
  res.setHeader("Content-disposition", "attachment; filename=sample.csv");
  res.set("Content-Type", "text/csv");
  res.send(csv);
};

const downloadUsersCSV = (req, res) => {
  const fields = [
    "Name",
    "PhoneNumber",
    "Gender",
    "email",
    "User Type",
    "Date Of Joining",
  ];
  const sampledata = {};

  const json2csvParser = new Parser({ fields, header: true });
  const csv = json2csvParser.parse(sampledata);
  res.setHeader("Content-disposition", "attachment; filename=sample.csv");
  res.set("Content-Type", "text/csv");
  res.send(csv);
};

const uploadCSV = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.redirect("/home?message=No Files or Empty file was uplaoded");
  }
  const uploadFile = req.files.file;

  const FilePath = "./temp.csv";
  await uploadFile.mv(FilePath);

  const results = [];

  fs.createReadStream(FilePath)
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      for (const row of results) {
        try {
          row.SCEC = "no";
          row.Campus = "In";
          row.Club_Post = "member";
          row["User Type"] = "student";
          await addUser(db, row);
        } catch (error) {
          res.redirect("/other?message=Error Uploading File");
          console.log(error);
        }
      }
      res.redirect("/student?message=Upload Successful");
    });
};

export { downloadStudentCSV, downloadUsersCSV, uploadCSV };
