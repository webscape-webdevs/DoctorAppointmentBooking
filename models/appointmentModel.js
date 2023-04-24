const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    currentIllness: {
      type: String,
      required: true,
    },
    recentSurgery: {
      type: String,
      required: true,
    },
    familyMedicalHistory: {
      type: String,
      required: true,
    },
    allergies: {
      type: String,
      required: true,
    },
    others: {
      type: String,
    },
    diabetic: {
      type: Boolean,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const appointmentModel = mongoose.model("appointmenst", appointmentSchema);
module.exports = appointmentModel;
