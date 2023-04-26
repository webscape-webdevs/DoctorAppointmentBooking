const express = require("express");
const router = express.Router();
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const Prescription = require("../models/prescriptionsModel");
const nodemailer = require("nodemailer");
const multer = require("multer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const storage = multer.diskStorage({
  destination: "public/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({ message: "Error getting doctor info", success: false, error });
  }
});

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ userId: req.body.userId }, req.body);
    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).send({ message: "Error getting doctor info", success: false, error });
  }
});

router.get("/get-appointments-by-doctor-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    const appointments = await Appointment.find({ doctorId: doctor._id }).sort({ createdAt: -1 });
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });
  }
});

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
      status,
    });

    const user = await User.findOne({ _id: appointment.userId });
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status}`,
      onClickPath: "/appointments",
    });

    await user.save();

    res.status(200).send({
      message: "Appointment status updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing appointment status",
      success: false,
      error,
    });
  }
});

router.post("/add-prescription", authMiddleware, async (req, res) => {
  try {
    const newPrescription = await Prescription.create({ ...req.body });

    res.status(200).send({
      newPrescription,
      message: "Prescription Added successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
});

router.post("/get-prescriptions", authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ appointmentId: req.body.appointmentId }).sort({ createdAt: -1 });

    res.status(200).send({
      prescriptions,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
    });
  }
});

router.post("/send-mail-prescription", upload.single("file"), async (req, res) => {
  try {
    const { email } = req.body;

    let details = {
      from: process.env.EMAIL,
      to: email,
      subject: "Prescription PDF",
      html: `<p>Find the Prescripton PDF Below</p>`,
      attachments: [
        {
          filename: "Prescription.pdf",
          contentType: "application/pdf",
          content: "../public/prescription.pdf",
        },
      ],
    };

    mailTransporter.sendMail(details);

    res.status(200).json({
      ok: true,
      msg: "Email Sent Successfully",
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
