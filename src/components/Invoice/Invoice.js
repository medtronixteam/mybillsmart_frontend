import React, { useState } from "react";
import { BsCloudUpload } from "react-icons/bs";
import "./Invoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../../contexts/AuthContext";
import jsPDF from "jspdf";

const Invoice = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  // Handle file upload
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

  // Upload file to the server
  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://34.142.252.64:7000/api/file/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Call match API
      const matchResponse = await axios.post("http://34.142.252.64:7000/api/match/", formData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Match API Response:", matchResponse.data);
      setSubmittedData(matchResponse.data);

      // Step 2: Call invoices API to get invoice_id
      const invoiceResponse = await axios.post("http://34.142.252.64:8080/api/invoices", formData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      console.log("Invoice API Response:", invoiceResponse.data);

      // Extract invoice_id from the response
      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);

      // Step 3: Call offers API with invoice_id and match API data
      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const offersResponse = await axios.post("http://34.142.252.64:8080/api/offers", offersData, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      console.log("Offers API Response:", offersResponse.data);

      setStep(3);
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting data", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  // Render form fields dynamically
  const renderFormFields = (data) => {
    return Object.keys(data)
      .filter((key) => data[key] !== null && typeof data[key] !== "object")
      .map((key, index) => {
        const value = data[key];
        return (
          <div key={index} className="form-field">
            <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</label>
            <input
              type="text"
              name={key}
              value={value || ""}
              onChange={handleFormChange}
              required
            />
          </div>
        );
      });
  };

  // Function to generate PDF from text
  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    let yOffset = 20;

    pdf.setFontSize(18);
    pdf.text("Invoice Details", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 10;

    pdf.setLineWidth(0.5);
    pdf.line(10, yOffset, pageWidth - 10, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    submittedData.forEach((supplier, index) => {
      pdf.text(`Supplier ${index + 1}: ${supplier["Supplier Name"]}`, 10, yOffset);
      yOffset += 10;

      Object.keys(supplier).forEach((key) => {
        if (key !== "Supplier Name") {
          pdf.text(`${key}: ${supplier[key]}`, 15, yOffset);
          yOffset += 10;
        }
      });

      yOffset += 10;
    });

    pdf.save("invoice_details.pdf");
  };

  // Function to handle contract button click
  const handleContractClick = (supplierData) => {
    navigate("/agent/contract", { state: { supplierData } }); // Pass supplier data as state
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
          <h2 className="invoice-upload-heading">Upload your Invoice File</h2>
          <div className="invoice-file-upload-box" onClick={() => document.getElementById("file-input").click()}>
            <label htmlFor="file-input" className="invoice-file-upload-btn">
              <BsCloudUpload className="invoice-upload-icon" />
              <p>{uploading ? "Uploading..." : "Click to Upload"}</p>
            </label>
            <input type="file" id="file-input" className="invoice-file-input" onChange={handleFileChange} />
          </div>
        </>
      )}

      {/* Step 2: Fill the Form */}
      {step === 2 && responseData && (
        <div className="invoice-form-container">
          <h2 className="invoice-form-heading">Verify your Invoice</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              {renderFormFields(formData).map((field, index) => (
                <div key={index} className="form-row-item">
                  {field}
                </div>
              ))}
            </div>
            <div>
              <button type="submit" className="invoice-submit-btn">Submit</button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && submittedData && (
        <div className="invoice-confirmation-container">
          {/* Add Download PDF Button */}
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <button onClick={generatePDF} className="invoice-download-pdf-btn">
              Download PDF
            </button>
          </div>

          {submittedData.map((supplier, index) => (
            <div className="invoice-card" key={index}>
              <h3 className="invoice-confirmation-heading">{supplier["Supplier Name"]}</h3>
              {Object.keys(supplier).map((key, keyIndex) => {
                if (key !== "Supplier Name") {
                  return (
                    <p key={keyIndex}>
                      <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</strong> {supplier[key]}
                    </p>
                  );
                }
                return null;
              })}

              <button
                className="invoice-confirmation-btn"
                onClick={() => handleContractClick(supplier)} // Pass supplier data
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