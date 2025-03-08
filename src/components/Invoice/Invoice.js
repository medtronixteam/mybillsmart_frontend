import React, { useState } from "react";
import { BsCloudUpload } from "react-icons/bs";
import "./Invoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
const Invoice = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Only JPEG, PNG, and PDF files are allowed.");
        return;
      }

      if (file) {
        toast.info("A file is already uploaded. Please submit the form.");
        return;
      }
      setFile(selectedFile);
      uploadFile(selectedFile);
    }
  };

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://34.142.252.64:7000/api/file/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data) {
        setResponseData(response.data);
        setFormData(response.data);
        setStep(2);
        toast.success("File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file", error);
      toast.error("Error uploading file. Please try again.");
    }
    setUploading(false);
    setFile(selectedFile);
    document.getElementById("file-input").value = "";
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const matchResponse = await axios.post(
        "http://34.142.252.64:7000/api/match/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Match API Response:", matchResponse.data);
      setSubmittedData(matchResponse.data);

      const responseForCards = await axios.post(
        "http://34.142.252.64:8080/api/invoices",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Second API Response:", responseForCards.data);
      setResponseData(responseForCards.data);

      setStep(3);
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting match data", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  const renderFormFields = (data) => {
    return Object.keys(data).map((key, index) => {
      const value = data[key];

      // Check if the value is an object (excluding null)
      if (typeof value === "object" && value !== null) {
        return null; // Skip rendering this field
      }

      let displayValue = value;

      return (
        <div key={index} className="form-field">
          <label>
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            :
          </label>
          <input
            type="text"
            name={key}
            value={displayValue || ""}
            onChange={handleFormChange}
            required
          />
        </div>
      );
    });
  };

  return (
    <div className="invoice-container">
      <ToastContainer />

      {/* Stepper Navigation */}
      <div className="invoice-stepper">
        <div className={`step ${step === 1 ? "active" : ""}`}>1</div>
        <div className={`line ${step === 1 ? "active-line" : ""}`}></div>
        <div className={`step ${step === 2 ? "active" : ""}`}>2</div>
        <div className={`line ${step === 2 ? "active-line" : ""}`}></div>
        <div className={`step ${step === 3 ? "active" : ""}`}>3</div>
      </div>

      {/* Step 1: Upload Invoice */}
      {step === 1 && (
        <>
          <h2 className="invoice-upload-heading text-center">
            Upload your Invoice File
          </h2>
          <div
            className="invoice-file-upload-box mx-auto"
            onClick={() => document.getElementById("file-input").click()}
          >
            <label htmlFor="file-input" className="invoice-file-upload-btn">
              <BsCloudUpload className="invoice-upload-icon" />
              <p>{uploading ? "Uploading..." : "Click to Upload"}</p>
            </label>
            <input
              type="file"
              id="file-input"
              className="invoice-file-input"
              onChange={handleFileChange}
            />
          </div>
        </>
      )}

      {/* Step 2: Fill the Form */}
      {step === 2 && responseData && (
        <div className="invoice-form-container container">
          <h2 className="invoice-form-heading">Verify your Invoice</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderFormFields(responseData).map((field, index) => (
                <div key={index} className="col-lg-6">
                  {field}
                </div>
              ))}
            </div>
            <div>
              <button type="submit" className="invoice-submit-btn">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 3 && submittedData && (
        <div className="invoice-confirmation-container">
          {submittedData.map((supplier, index) => (
            <div className="invoice-card" key={index}>
              <h3 className="invoice-confirmation-heading">
                {supplier["Supplier Name"]}
              </h3>
              {Object.keys(supplier).map((key, keyIndex) => {
                if (key !== "Supplier Name") {
                  return (
                    <p key={keyIndex}>
                      <strong>
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                        :
                      </strong>{" "}
                      {supplier[key]}
                    </p>
                  );
                }
                return null;
              })}

              <button
                className="invoice-confirmation-btn"
                onClick={() => navigate("/agent/contract")} // Navigate to the route
              >
                Manage Contract
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoice;
