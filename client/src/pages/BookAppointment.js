import "./BookAppointment.css";
import { Button, Col, DatePicker, Form, Input, Row, TimePicker, Typography } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import DoctorForm from "../components/DoctorForm";
import moment from "moment";
import { Box, Modal, Step, StepLabel, Stepper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom";

const steps = ["Step 1", "Step 2", "Payment"];

function BookAppointment() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [diabetic, setDiabetic] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");
  const params = useParams();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [form, setForm] = useState({
    currentIllness: "",
    recentSurgery: "",
    familyMedicalHistory: "",
    allergies: "",
    others: "",
  });

  console.log(form);

  const handleInput = (e) => {
    let newForm = form;
    newForm[e.target.name] = e.target.value;
    setForm(newForm);
  };

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

  const handleNext = () => {
    if (activeStep === 0 && (form.currentIllness === "" || form.recentSurgery === "")) {
      setError("Please Enter All Fields !!!");
    } else {
      setError("");
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/get-doctor-info-by-id",
        {
          doctorId: params.doctorId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        setDoctor(response.data.data);
      }
    } catch (error) {
      console.log(error);
      dispatch(hideLoading());
    }
  };
  const checkAvailability = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-avilability",
        {
          doctorId: params.doctorId,
          date: date,
          time: time,
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
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };
  const bookNow = async (paymentId) => {
    setIsAvailable(false);
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date,
          time: time,
          currentIllness: form.currentIllness,
          recentSurgery: form.recentSurgery,
          familyMedicalHistory: form.familyMedicalHistory,
          allergies: form.allergies,
          others: form.others,
          diabetic: diabetic,
          paymentId: paymentId,
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
        setActiveStep((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Error booking appointment");
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  const proceedToPayment = () => {
    if (form.familyMedicalHistory === "" || form.allergies === "") {
      setError("Please Enter All Fields !!!");
    } else {
      setError("");
      var options = {
        key: "rzp_test_gCphCjeMVJqmLd",
        amount: parseInt(doctor.feePerCunsultation) * 100,

        name: "Appointment Booking",
        description: "Test Transaction",
        image: "",

        handler: function (response) {
          bookNow(response.razorpay_payment_id);
        },

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#3399cc",
        },
      };
      var rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on("payment.failed", function (response) {
        alert(response.error.code);
        alert.error("There's some issue while processing payment ");
      });
    }
  };

  return (
    <Layout>
      {doctor && (
        <div>
          <h1 className="page-title">
            {doctor.firstName} {doctor.lastName}
          </h1>
          <hr />
          <Row gutter={20} className="mt-5" align="middle">
            <Col span={8} sm={24} xs={24} lg={8}>
              <img
                src="https://thumbs.dreamstime.com/b/finger-press-book-now-button-booking-reservation-icon-online-149789867.jpg"
                alt=""
                width="100%"
                height="400"
              />
            </Col>
            <Col span={8} sm={24} xs={24} lg={8}>
              <h1 className="normal-text">
                <b>Timings :</b> {doctor.timings[0]} - {doctor.timings[1]}
              </h1>
              <p>
                <b>Phone Number : </b>
                {doctor.phoneNumber}
              </p>
              <p>
                <b>Address : </b>
                {doctor.address}
              </p>
              <p>
                <b>Fee per Visit : </b>
                {doctor.feePerCunsultation}
              </p>
              <p>
                <b>Website : </b>
                {doctor.website}
              </p>
              <div className="d-flex flex-column pt-2 mt-2">
                <DatePicker
                  format="DD-MM-YYYY"
                  onChange={(value) => {
                    setDate(moment(value).format("DD-MM-YYYY"));
                    setIsAvailable(false);
                  }}
                />
                <TimePicker
                  format="HH:mm"
                  className="mt-3"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(moment(value).format("HH:mm"));
                  }}
                />
                {!isAvailable && (
                  <Button className="primary-button mt-3 full-width-button" onClick={checkAvailability}>
                    Check Availability
                  </Button>
                )}

                {isAvailable && (
                  <Button className="primary-button mt-3 full-width-button" onClick={handleOpen}>
                    Book Now
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Box sx={{ width: "100%", height: "100%" }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <div className="stepContainer">
              {activeStep === 0 && (
                <div className="stepMain">
                  <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
                    Current Illness History
                  </Typography>
                  <textarea name="currentIllness" rows="6" cols="50" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
                  <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
                    Recent surgery (Time span to be mentioned)
                  </Typography>
                  <textarea name="recentSurgery" rows="6" cols="50" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
                </div>
              )}

              {activeStep === 1 && (
                <div className="stepMain">
                  <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
                    Family medical history
                  </Typography>
                  <textarea name="familyMedicalHistory" rows="2" cols="50" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
                  <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
                    Any Allergies
                  </Typography>
                  <textarea name="allergies" rows="2" cols="50" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
                  <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px" }}>
                    Others
                  </Typography>
                  <textarea name="others" rows="2" cols="50" className="booking-textArea" onChange={(e) => handleInput(e)}></textarea>
                  <div className="diabetic">
                    <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px", marginRight: "20px" }}>
                      Diabetic
                    </Typography>
                    <input type="radio" className="booking-radio" checked={diabetic} onClick={() => setDiabetic(true)}></input>
                    <Typography id="modal-modal-title" variant="h6" component="h5" style={{ marginTop: "20px", marginRight: "20px" }}>
                      Non-Diabetic
                    </Typography>
                    <input type="radio" className="booking-radio" checked={!diabetic} onClick={() => setDiabetic(false)}></input>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="stepMain">
                  <div className="orderSuccess">
                    <CheckCircleIcon />

                    <Typography>Your Appointment has Been Booked Successfully !!!</Typography>

                    <Link to="/appointments">View Appointment</Link>
                  </div>
                </div>
              )}

              <span style={{ width: "100%", textAlign: "center", color: "red" }}>{error}</span>

              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                {activeStep !== 2 && (
                  <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                )}

                <Box sx={{ flex: "1 1 auto" }} />

                {activeStep === 0 && <Button onClick={handleNext}>Next</Button>}
                {activeStep === 1 && <Button onClick={proceedToPayment}>Payment</Button>}
              </Box>
            </div>
          </Box>
        </Box>
      </Modal>
    </Layout>
  );
}

export default BookAppointment;
