import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Table } from "antd";
import moment from "moment";
import "./AppointmentDetails.css";
import { Box, Modal, Typography } from "@mui/material";

export default function AppointmentDetails() {
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [openPrescription, setOpenPrescription] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState("");
  const { appointmentId } = useParams();

  console.log(appointmentDetails);

  const handleOpenPrescription = (prescriptionID) => {
    let newPrescription = prescriptions.filter((e) => e._id.toString() === prescriptionID.toString());
    setCurrentPrescription(newPrescription[0]);
    setOpenPrescription(true);
  };
  const handleClosePrescription = () => setOpenPrescription(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    height: 700,
    bgcolor: "background.paper",
    border: "none",
    borderRadius: "20px",
    boxShadow: 24,
    p: 4,
  };

  const handleViewAppointment = async () => {
    await axios
      .get("/api/user/get-appointments-by-user-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(async ({ data }) => {
        let filteredAppointment = data.data.filter((e) => e._id.toString() === appointmentId.toString());
        setAppointmentDetails(filteredAppointment[0]);
        await axios
          .post(
            "/api/user/get-prescriptions",
            { appointmentId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(({ data }) => {
            setPrescriptions(data.prescriptions);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  };

  useEffect(() => {
    handleViewAppointment();
  }, []);

  const columns = [
    {
      title: "Care To Be Taken",
      dataIndex: "care",
    },
    {
      title: "Medicines",
      dataIndex: "medicines",
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} {moment(record.time).format("HH:mm")}
        </span>
      ),
    },

    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          <div className="d-flex">
            <h1 className="anchor px-2" onClick={() => handleOpenPrescription(record._id)}>
              View
            </h1>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1 className="page-title">Appointment Details and Prescriptions</h1>
      <hr />
      <div className="detailsContainer">
        <div className="detailsMain">
          <span className="prescriptionsTitle" style={{ marginBottom: "10px" }}>
            Doctor Details
          </span>
          <span>
            Name: {appointmentDetails.doctorInfo?.firstName} {appointmentDetails.doctorInfo?.lastName}
          </span>
          <span>Contact: {appointmentDetails.doctorInfo?.phoneNumber}</span>
          <span>Specialization: {appointmentDetails.doctorInfo?.specialization}</span>
          <span>Experience : {appointmentDetails.doctorInfo?.experience} Years</span>
        </div>
        <div className="detailsMain">
          <span className="prescriptionsTitle" style={{ marginBottom: "10px" }}>
            Medical Details Submitted
          </span>
          <span>Current Illness: {appointmentDetails.currentIllness}</span>
          <span>Recent Surgery Details: {appointmentDetails.recentSurgery}</span>
          <span>Family Medical History: {appointmentDetails.familyMedicalHistory}</span>
          <span>Allergies: {appointmentDetails.allergies}</span>
          <span>Others: {appointmentDetails.others}</span>
          <span>Diabetic: {appointmentDetails.diabetic ? "Yes" : "No"}</span>
        </div>
      </div>

      <hr />
      <span className="prescriptionsTitle">Prescriptions</span>
      <hr />
      <Table columns={columns} dataSource={prescriptions} />

      <Modal open={openPrescription} onClose={handleClosePrescription} aria-labelledby="modal-modal-title">
        <Box sx={style}>
          <Box sx={{ width: "100%", height: "100%" }} className="prescription">
            <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
              <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>
                    Dr. {appointmentDetails.doctorInfo?.firstName} {appointmentDetails.doctorInfo?.lastName}
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>Address: {appointmentDetails.doctorInfo?.address}</span>
                </div>
                <div>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>
                    Date: {moment(currentPrescription.createdAt?.date).format("DD-MM-YYYY")}
                  </span>
                </div>
              </div>
              <div className="blueBar"></div>
              <Typography id="modal-modal-title" variant="h7" component="h6" style={{ marginTop: "20px" }}>
                Care to be taken
              </Typography>
              <span className="prescriptionContnet">{currentPrescription.care}</span>
              <Typography id="modal-modal-title" variant="h7" component="h6" style={{ marginTop: "20px" }}>
                Medicines
              </Typography>
              <span className="prescriptionContnet">{currentPrescription.medicines}</span>
              <div className="blueBar"></div>
            </div>

            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>
                Dr. {appointmentDetails.doctorInfo?.firstName} {appointmentDetails.doctorInfo?.lastName}
              </span>
            </div>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
}
