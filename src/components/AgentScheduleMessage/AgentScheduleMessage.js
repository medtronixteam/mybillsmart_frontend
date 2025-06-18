import React, { useState } from "react";
import "./AgentScheduleMessage.css";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import config from "../../config";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const AgentScheduleMessage = () => {
  const [formData, setFormData] = useState({
    phone_number: "",
    body: "",
    date_send: "",
    time_send: "",
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format time to include seconds
      const formattedTime = formData.time_send
        ? `${formData.time_send}:00`
        : "";

      const response = await fetch(`${config.BASE_URL}/api/auto-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to_number: formData.phone_number,
          message: formData.body,
          time_send: formattedTime,
          date_send: formData.date_send,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to schedule campaign");
      }

      // Show success alert
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Campaign scheduled successfully!",
        confirmButtonColor: "#3085d6",
      });

      // Reset form
      setFormData({
        phone_number: "",
        body: "",
        date_send: "",
        time_send: "",
      });
    } catch (err) {
      // Show error alert
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/group_admin/dashboard"} />
      </div>
      <div className="schedule-message-container p-lg-5 p-4 mt-5">
        <div className="d-flex justify-content-between align-items-center px-lg-4 px-3 pb-lg-4 pb-3">
          <h2 className="page-title mb-0">Schedule New Campaign</h2>
          <Link to="/agent/campaign-list">
            <button className="btn bg-white msg-list-btn">Campaign List</button>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="message-form px-lg-4 px-3 pb-lg-4 pb-3"
        >
          <div className="form-group mb-2">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter recipient's phone number with country code"
              pattern="^\[1-9]\d{1,14}$"
              className="form-control"
              required
            />
            <small className="input-hint text-white">
              Format: +CountryCodeNumber (e.g., +1234567890)
            </small>
          </div>

          <div className="form-group mb-2">
            <label htmlFor="body">Campaign Content</label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Type your campaign here..."
              rows="5"
              className="form-control"
              required
            />
          </div>

          <div className="datetime-group mb-3">
            <div className="form-group mb-2">
              <label htmlFor="date_send">Date</label>
              <input
                type="date"
                id="date_send"
                name="date_send"
                value={formData.date_send}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="form-control"
                required
              />
            </div>

            <div className="form-group mb-2">
              <label htmlFor="time_send">Time</label>
              <input
                type="time"
                id="time_send"
                name="time_send"
                value={formData.time_send}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn schedule-msg-btn rounded-pill w-50 mx-auto"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Scheduling...
              </>
            ) : (
              "Schedule Campaign"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default AgentScheduleMessage;
