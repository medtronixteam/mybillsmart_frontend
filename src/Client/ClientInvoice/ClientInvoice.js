import React, { useState, useEffect, useCallback } from "react";
import { BsCloudUpload, BsDownload, BsExclamationCircle } from "react-icons/bs";
import "./ClientInvoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import jsPDF from "jspdf";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import config from "../../config";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const ClientInvoice = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);
  const [loadingPlanInfo, setLoadingPlanInfo] = useState(true);
  const navigate = useNavigate();
  const { token, groupId } = useAuth();

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
      showConfirmButton: true,
      timer: 3000,
    });
  };

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await axios.get(`${config.BASE_URL}/api/plan/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlanInfo(response.data);
      } catch (error) {
        console.error("Error fetching plan info:", error);
        setPlanInfo(error.response?.data || {
          status: "error",
          message: "Failed to fetch plan information",
        });
      } finally {
        setLoadingPlanInfo(false);
      }
    };
    fetchPlanInfo();
  }, [token]);

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
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleFiles = useCallback(
    (files) => {
      if (planInfo?.status === "error") return;
      const selectedFile = files[0];
      if (!selectedFile) return;
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        showAlert("error", "Error", "Only JPEG, PNG, and PDF files are allowed.");
        return;
      }
      if (file) {
        showAlert("info", "Info", "A file is already uploaded. Please submit the form.");
        return;
      }
      uploadFile(selectedFile);
    },
    [file, planInfo]
  );

  const handleFileChange = (e) => {
    e.stopPropagation();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = "";
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
        showAlert("success", "Success", "File uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading file", error);
      showAlert("error", "Error", "Error uploading file. Please try again.");
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
      const matchData = {
        ...formData,
        group_id: groupId,
      };
      const matchResponse = await axios.post(
        "http://34.142.252.64:7000/api/match/",
        matchData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSubmittedData(matchResponse.data);
      setOffers(matchResponse.data);
      const invoiceData = {
        ...formData,
        group_id: groupId,
      };
      const invoiceResponse = await axios.post(
        `${config.BASE_URL}/api/client/invoices`,
        invoiceData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);
      setStep(3);
      showAlert("success", "Success", "Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting data", error);
      showAlert("error", "Error", "Error submitting form. Please try again.");
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
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
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

  const convertToCSV = (data) => {
    if (!Array.isArray(data) || data.length === 0) return "";
    const allKeys = data.reduce((keys, item) => {
      Object.keys(item).forEach((key) => {
        if (
          !keys.includes(key) &&
          ![
            "user_id",
            "invoice_id",
            "created_at",
            "updated_at",
            "id",
            "Client_id",
          ].includes(key)
        ) {
          keys.push(key);
        }
      });
      return keys;
    }, []);
    const headers = allKeys
      .map(
        (key) =>
          `"${key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}"`
      )
      .join(",");
    const rows = data
      .map((item) => {
        return allKeys
          .map((key) => {
            const value = item[key] !== undefined ? item[key] : "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",");
      })
      .join("\n");
    return `${headers}\n${rows}`;
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    if (!submittedData || !Array.isArray(submittedData) || submittedData.length === 0) {
      showAlert("error", "Error", "No data available to download");
      return;
    }
    try {
      const csvContent = convertToCSV(submittedData);
      downloadFile(`invoice_${invoiceId}_data.csv`, csvContent, "text/csv;charset=utf-8;");
      showAlert("success", "Success", "CSV downloaded successfully");
    } catch (error) {
      console.error("Error generating CSV:", error);
      showAlert("error", "Error", "Failed to generate CSV file");
    }
  };

  const downloadExcel = () => {
    if (!submittedData || !Array.isArray(submittedData) || submittedData.length === 0) {
      showAlert("error", "Error", "No data available to download");
      return;
    }
    try {
      const csvContent = "\uFEFF" + convertToCSV(submittedData);
      downloadFile(`invoice_${invoiceId}_data.xls`, csvContent, "application/vnd.ms-excel;charset=utf-8;");
      showAlert("success", "Success", "Excel file downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel:", error);
      showAlert("error", "Error", "Failed to generate Excel file");
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yOffset = 20;
    pdf.setFontSize(18);
    pdf.text("Invoice Details", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 10;
    pdf.setLineWidth(0.5);
    pdf.line(10, yOffset, pageWidth - 10, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    if (submittedData && Array.isArray(submittedData)) {
      submittedData.forEach((supplier, index) => {
        const supplierName =
          supplier["Supplier Name"] ||
          supplier["supplierName"] ||
          `Supplier ${index + 1}`;
        pdf.text(`Supplier ${index + 1}: ${supplierName}`, 10, yOffset);
        yOffset += 10;
        Object.keys(supplier).forEach((key) => {
          if (
            ![
              "Supplier Name",
              "supplierName",
              "user_id",
              "invoice_id",
              "created_at",
              "updated_at",
            ].includes(key) &&
            supplier[key] &&
            typeof supplier[key] !== "object"
          ) {
            const displayKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            pdf.text(`${displayKey}: ${supplier[key]}`, 15, yOffset);
            yOffset += 10;
          }
        });
        yOffset += 10;
      });
    } else {
      pdf.text("No supplier data available", 10, yOffset);
    }
    pdf.save("invoice_details.pdf");
  };

  const handleContractClick = (offer) => {
    navigate("/agent/contract", {
      state: {
        offerData: offer,
        offerId: offer.id,
      },
    });
  };

  if (loadingPlanInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (planInfo?.status === "error") {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-danger">
              <div className="card-body text-center p-5">
                <BsExclamationCircle className="text-danger mb-4" style={{ fontSize: "4rem" }} />
                <h2 className="card-title mb-3">Plan Information</h2>
                <p className="card-text mb-4">
                  {planInfo.message || "You need to purchase a plan to submit invoices."}
                </p>
                {/* <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/client/subscription")}
                >
                  View Plans
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 container">
        <Breadcrumbs homePath={"/client/dashboard"} />
      </div>
      <div className="invoice-container">
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
              className={`invoice-file-upload-box ${isDragging ? "dragging" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input").click();
              }}
            >
              <label htmlFor="file-input" className="invoice-file-upload-btn">
                <BsCloudUpload className="invoice-upload-icon" />
                <p>{uploading ? "Uploading..." : "Choose / Drop a File Here"}</p>
                {file && (
                  <div className="file-preview">
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
          <div className="invoice-form-container w-100">
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
                <button type="submit" className="invoice-submit-btn mb-3">
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
        {step === 3 && offers.length > 0 && (
          <>
            <div className="text-center container">
              <div className="row">
                <div className="col-12">
                  <h1 className="best-offers-heading mb-0">
                    Here is some best offers for you choose one of them
                  </h1>
                </div>
              </div>
            </div>
            <div className="justify-content-center row w-100">
              {offers.map((offer, index) => (
                <div className="col-xl-4 col-md-6" key={index}>
                  <div className="invoice-card-responsive invoice-card h-100 w-100">
                    {Object.keys(offer).map((key) => {
                      if (
                        key !== "user_id" &&
                        key !== "invoice_id" &&
                        key !== "created_at" &&
                        key !== "updated_at" &&
                        key !== "id" &&
                        key !== "Client_id" &&
                        offer[key]
                      ) {
                        return (
                          <p key={key}>
                            <strong>
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              :
                            </strong>{" "}
                            {offer[key]}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-3 gy-3 w-100 text-center justify-content-center">
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                <button
                  onClick={generatePDF}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                >
                  <BsDownload className="me-2" />
                  Download PDF
                </button>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                <button
                  onClick={downloadCSV}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                  disabled={!submittedData || submittedData.length === 0}
                >
                  <FaFileCsv className="me-2" />
                  Download CSV
                </button>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                <button
                  onClick={downloadExcel}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                  disabled={!submittedData || submittedData.length === 0}
                >
                  <FaFileExcel className="me-2" />
                  Export Excel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ClientInvoice;