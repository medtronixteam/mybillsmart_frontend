import React, { useState, useEffect, useCallback } from "react";
import { BsCloudUpload } from "react-icons/bs";
import "./LinkInvoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../../contexts/AuthContext"; 

const LinkInvoice = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const handleDragEnter = (e) => {
      preventDefaults(e);
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      preventDefaults(e);
      setIsDragging(false);
    };

    const handleDragOver = (e) => {
      preventDefaults(e);
      setIsDragging(true);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFiles = useCallback((files) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only JPEG, PNG, and PDF files are allowed.");
      return;
    }

    if (file) {
      toast.info("A file is already uploaded. Please submit the form.");
      return;
    }

    uploadFile(selectedFile);
  }, [file]);

  const handleFileChange = (e) => {
    e.stopPropagation();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    setFile(selectedFile);
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
      setFile(null);
    } finally {
      setUploading(false);
    }
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
      // Step 1: Call match API
      const matchResponse = await axios.post(
        "http://34.142.252.64:7000/api/match/", 
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSubmittedData(matchResponse.data);

      // Step 2: Call invoices API to get invoice_id
      const invoiceResponse = await axios.post(
        "http://34.142.252.64:8080/api/agent/invoices", 
        formData,
        {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
        }
      );

      // Extract invoice_id from the response
      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);

      // Step 3: Call offers API with invoice_id and match API data
      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      // const offersResponse = await axios.post(
      //   "http://34.142.252.64:8080/api/offers", 
      //   offersData,
      //   {
      //     headers: { 
      //       "Content-Type": "application/json", 
      //       Authorization: `Bearer ${token}` 
      //     },
      //   }
      // );

      setStep(3);
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting data", error);
      toast.error("Error submitting form. Please try again.");
    }
  };

  const renderFormFields = (data) => {
    return Object.keys(data)
      .filter((key) => data[key] !== null && typeof data[key] !== "object")
      .map((key, index) => {
        const value = data[key];
        return (
          <div key={index} className="form-field">
            <label>
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
            </label>
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

  return (
    <div className="invoice-container">
      <ToastContainer />

      {isDragging && (
        <div className="drag-drop-overlay">
          <div className="drag-drop-content">
            <BsCloudUpload className="drag-drop-icon" />
            <h3>Drop your file here</h3>
            <p>Supported formats: JPEG, PNG, PDF</p>
          </div>
        </div>
      )}

      <div className="invoice-stepper">
        <div className={`step ${step === 1 ? "active" : ""}`}>1</div>
        <div className={`line ${step === 1 ? "active-line" : ""}`}></div>
        <div className={`step ${step === 2 ? "active" : ""}`}>2</div>
        <div className={`line ${step === 2 ? "active-line" : ""}`}></div>
        <div className={`step ${step === 3 ? "active" : ""}`}>3</div>
      </div>

      {step === 1 && (
        <>
          <h2 className="invoice-upload-heading">Upload your Invoice File</h2>
          <div
            className={`invoice-file-upload-box ${isDragging ? 'dragging' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("file-input").click();
            }}
          >
            <label htmlFor="file-input" className="invoice-file-upload-btn">
              <BsCloudUpload className="invoice-upload-icon" />
              <p>{uploading ? "Uploading..." : "Click to Upload or Drag & Drop"}</p>
              {file && (
                <div className="file-preview">
                  <p>Selected file: {file.name}</p>
                  <p>({Math.round(file.size / 1024)} KB)</p>
                </div>
              )}
            </label>
            <input
              type="file"
              id="file-input"
              className="invoice-file-input"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
            />
          </div>
        </>
      )}

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

      {step === 3 && submittedData && (
        <div className="invoice-confirmation-container">
          {submittedData.map((supplier, index) => (
            <div className="invoice-card" key={index}>
              <h3 className="invoice-confirmation-heading">
                {supplier["Supplier Name"] || `Supplier ${index + 1}`}
              </h3>
              {Object.keys(supplier).map((key, keyIndex) => {
                if (key !== "Supplier Name") {  
                  return (
                    <p key={keyIndex}>
                      <strong>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
                      </strong> {supplier[key]}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinkInvoice;