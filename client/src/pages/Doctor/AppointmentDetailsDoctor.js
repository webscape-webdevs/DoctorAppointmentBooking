import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Button, Table } from "antd";
import moment from "moment";
import "./AppointmentDetailsDoctor.css";
import { Box, Modal, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertsSlice";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
const FormData = require("form-data");

export default function AppointmentDetailsDoctor() {
  const dispatch = useDispatch();
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [openPrescription, setOpenPrescription] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const { appointmentId } = useParams();
  const [form, setForm] = useState({
    care: "",
    medicines: "",
  });

  console.log(appointmentDetails);

  const handleOpenPrescription = (prescriptionID) => {
    let newPrescription = prescriptions.filter((e) => e._id.toString() === prescriptionID.toString());
    setCurrentPrescription(newPrescription[0]);
    setOpenPrescription(true);
  };
  const handleClosePrescription = () => setOpenPrescription(false);

  const style = {
    display: "flex",
    flexDirection: "column",
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

  console.log(form);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInput = (e) => {
    let newForm = form;
    newForm[e.target.name] = e.target.value;
    setForm(newForm);
  };

  const handleViewAppointment = async () => {
    await axios
      .get("/api/doctor/get-appointments-by-doctor-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(async ({ data }) => {
        let filteredAppointment = data.data.filter((e) => e._id.toString() === appointmentId.toString());
        setAppointmentDetails(filteredAppointment[0]);
        await axios
          .post(
            "/api/doctor/get-prescriptions",
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

  const handleSubmitPrescription = async () => {
    if (form.care === "" || form.medicines === "") {
      setError("Please Enter All Fields !!!");
    } else {
      setError("");
      try {
        dispatch(showLoading());
        const response = await axios.post(
          "/api/doctor/add-prescription",
          {
            appointmentId: appointmentDetails._id,
            care: form.care,
            medicines: form.medicines,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        dispatch(hideLoading());
        if (response.data.success) {
          toast.success(response.data.message);
          handleClose();
          handleViewAppointment();
        }
      } catch (error) {
        toast.error("Error booking appointment");
        dispatch(hideLoading());
      }
    }
  };

  const sendPdf = async () => {
    let doc = new jsPDF("p", "pt", "a4");

    doc.html(document.querySelector("#content"), {
      callback: async function (pdf) {
        const pdfData = doc.output("arraybuffer");

        const pdfBlob = new Blob([pdfData], { type: "application/pdf" });

        const formData = new FormData();
        formData.append("file", pdfBlob, "prescription.pdf");
        formData.append("email", appointmentDetails.userInfo.email);

        axios
          .post(`/api/doctor/send-mail-prescription`, formData, {
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            },
          })
          .then((response) => {
            console.log(response.data);
            toast.success(response.data.msg);
          })
          .catch((error) => {
            console.log(error);
            toast.error("Error Sending Mail");
          });
      },
    });
  };

  const savePdf = async () => {
    let doc = new jsPDF("p", "pt", "a4");

    doc.html(document.querySelector("#content"), {
      callback: async function (pdf) {
        pdf.save("prescription.pdf");
      },
    });
  };

  return (
    <>
      <Layout>
        <h1 className="page-title">Appointment Details and Prescriptions</h1>
        <hr />
        <div className="detailsContainer">
          <div className="detailsMain">
            <span className="prescriptionsTitle" style={{ marginBottom: "10px" }}>
              Patient Details
            </span>
            <span>Name: {appointmentDetails.userInfo?.name}</span>
            <span>Email: {appointmentDetails.userInfo?.email}</span>
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="prescriptionsTitle" style={{ flex: "1" }}>
            Prescriptions
          </span>
          <Button className="primary-button" onClick={handleOpen}>
            Add Prescriptions
          </Button>
        </div>

        <hr />
        <Table columns={columns} dataSource={prescriptions} />
      </Layout>

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h3" style={{ marginTop: "20px" }}>
            Add Prescription
          </Typography>
          <Box sx={{ width: "100%", height: "100%" }} className="stepMain">
            <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
              Care to be taken
            </Typography>
            <textarea rows="6" cols="50" name="care" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
            <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
              Medicines
            </Typography>
            <textarea rows="6" cols="50" name="medicines" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
            <span style={{ width: "100%", textAlign: "center", color: "red" }}>{error}</span>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Button className="primary-button" style={{ marginTop: "20px" }} onClick={handleSubmitPrescription}>
                Submit
              </Button>
            </div>
          </Box>
        </Box>
      </Modal>

      <Modal open={openPrescription} onClose={handleClosePrescription} aria-labelledby="modal-modal-title">
        <Box sx={style}>
          <div style={{ width: "100%", flex: "1", display: "flex", flexDirection: "column", padding: "20px" }} id="content">
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
              <div style={{ backgroundColor: "rgb(0, 0, 138)", width: "100%", height: "30px", marginTop: "30px" }}></div>
              <span style={{ marginTop: "20px" }}>Care to be taken</span>
              <span style={{ width: "100%", height: "120px", border: "1px solid black", marginTop: "10px", padding: "10px" }}>
                {currentPrescription.care}
              </span>
              <span style={{ marginTop: "20px" }}>Medicines</span>
              <span style={{ width: "100%", height: "120px", border: "1px solid black", marginTop: "10px", padding: "10px" }}>
                {currentPrescription.medicines}
              </span>
              <div style={{ backgroundColor: "rgb(0, 0, 138)", width: "100%", height: "30px", marginTop: "30px" }}></div>
            </div>

            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600" }}>
                Dr. {appointmentDetails.doctorInfo?.firstName} {appointmentDetails.doctorInfo?.lastName}
              </span>
            </div>
          </div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <span
              style={{
                width: "150px",
                height: "50px",
                borderRadius: "10px",
                backgroundColor: "blue",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                cursor: "pointer",
              }}
              onClick={savePdf}
            >
              Download PDF
            </span>
            <span
              style={{
                width: "150px",
                height: "50px",
                borderRadius: "10px",
                backgroundColor: "blue",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                cursor: "pointer",
                marginLeft: "20px",
              }}
              onClick={sendPdf}
            >
              Mail PDF to Patient
            </span>
          </div>
        </Box>
      </Modal>
    </>
  );
}
