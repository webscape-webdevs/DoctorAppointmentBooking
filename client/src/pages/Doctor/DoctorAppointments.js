import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "../../components/Layout";
import { showLoading, hideLoading } from "../../redux/alertsSlice";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Table } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleViewAppointment = async (appointmentId) => {
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
        setPrescriptions(data);
        let filteredAppointment = appointments.filter((e) => e._id.toString() === appointmentId.toString());
        setAppointmentDetails(filteredAppointment[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());
      const resposne = await axios.get("/api/doctor/get-appointments-by-doctor-id", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (resposne.data.success) {
        setAppointments(resposne.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  const changeAppointmentStatus = async (record, status) => {
    try {
      dispatch(showLoading());
      const resposne = await axios.post(
        "/api/doctor/change-appointment-status",
        { appointmentId: record._id, status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (resposne.data.success) {
        toast.success(resposne.data.message);
        getAppointmentsData();
      }
    } catch (error) {
      toast.error("Error changing doctor account status");
      dispatch(hideLoading());
    }
  };
  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Patient",
      dataIndex: "name",
      render: (text, record) => <span>{record.userInfo.name}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      render: (text, record) => <span>{record.doctorInfo.phoneNumber}</span>,
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
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" ? (
            <div className="d-flex">
              <h1 className="anchor px-2" onClick={() => changeAppointmentStatus(record, "approved")}>
                Approve
              </h1>
              <h1 className="anchor" onClick={() => changeAppointmentStatus(record, "rejected")}>
                Reject
              </h1>
            </div>
          ) : (
            <div className="d-flex">
              <h1 className="anchor px-2" onClick={() => navigate(`/doctor/appointmentDetails/${record._id}`)}>
                View
              </h1>
            </div>
          )}
        </div>
      ),
    },
  ];
  useEffect(() => {
    getAppointmentsData();
  }, []);
  return (
    <Layout>
      <h1 className="page-header">Appointments</h1>
      <hr />
      <Table columns={columns} dataSource={appointments} />
    </Layout>
  );
}

export default DoctorAppointments;
