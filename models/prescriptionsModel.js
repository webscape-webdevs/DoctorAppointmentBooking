const mongoose = require("mongoose");
const { Schema } = mongoose;

const prescriptionModel = new Schema({
  appointmentId: { type: Schema.Types.ObjectId },
  care: { type: Schema.Types.String },
  medicines: { type: Schema.Types.String },
  createdAt: { type: Schema.Types.Date, default: Date.now },
});

const prescription = mongoose.model("prescription", prescriptionModel);

module.exports = prescription;
