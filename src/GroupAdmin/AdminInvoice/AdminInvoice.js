import React, { useState, useEffect, useCallback } from "react";
import {
  BsCloudUpload,
  BsDownload,
  BsEnvelope,
  BsWhatsapp,
} from "react-icons/bs";
import "./AdminInvoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import jsPDF from "jspdf";
import { IoIosSend } from "react-icons/io";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import config from "../../config";

const AdminInvoice = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [invoiceId, setInvoiceId] = useState(null);
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);
  const [modalType, setModalType] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappData, setWhatsappData] = useState({
    to: "",
    message: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { token, email } = useAuth();

  useEffect(() => {
    if (showModal) {
      fetchClients();
    }
  }, [showModal]);

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

  const fetchGroupId = async () => {
    try {
      const response = await axios.get(`${config.BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.id;
    } catch (error) {
      console.error("Error fetching group ID:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch group information',
        timer: 3000,
        showConfirmButton: false
      });
      throw error;
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await axios.get(
        `${config.BASE_URL}/api/agent/client/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let clientsData = [];
      if (Array.isArray(response.data)) {
        clientsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        clientsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.clients)) {
        clientsData = response.data.clients;
      }

      setClients(clientsData || []);

      if (clientsData.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: 'No clients found',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error fetching clients", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch clients. Please try again.',
        timer: 3000,
        showConfirmButton: false
      });
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleFiles = useCallback(
    (files) => {
      const selectedFile = files[0];
      if (!selectedFile) return;

      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Only JPEG, PNG, and PDF files are allowed.',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }

      if (file) {
        Swal.fire({
          icon: 'info',
          title: 'Info',
          text: 'A file is already uploaded. Please submit the form.',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }

      uploadFile(selectedFile);
    },
    [file]
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
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'File uploaded successfully!',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error uploading file", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error uploading file. Please try again.',
        timer: 3000,
        showConfirmButton: false
      });
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
      const groupId = await fetchGroupId();

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

      const invoicePayload = {
        ...formData,
        group_id: groupId,
      };

      const invoiceResponse = await axios.post(
        `${config.BASE_URL}/api/group/invoices`,
        invoicePayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);

      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const offersResponse = await axios.post(
        `${config.BASE_URL}/api/group/offers`,
        offersData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (offersResponse.data && offersResponse.data.offers) {
        setOffers(offersResponse.data.offers);
      }

      setStep(3);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Form submitted successfully!',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error submitting data", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error submitting form. Please try again.',
        timer: 3000,
        showConfirmButton: false
      });
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
    if (
      !submittedData ||
      !Array.isArray(submittedData) ||
      submittedData.length === 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No data available to download',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      const csvContent = convertToCSV(submittedData);
      downloadFile(
        csvContent,
        `invoice_${invoiceId}_data.csv`,
        "text/csv;charset=utf-8;"
      );
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'CSV downloaded successfully',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error generating CSV:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate CSV file',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const downloadExcel = () => {
    if (
      !submittedData ||
      !Array.isArray(submittedData) ||
      submittedData.length === 0
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No data available to download',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      const csvContent = "\uFEFF" + convertToCSV(submittedData);
      downloadFile(
        csvContent,
        `invoice_${invoiceId}_data.xls`,
        "application/vnd.ms-excel;charset=utf-8;"
      );
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Excel file downloaded successfully',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate Excel file',
        timer: 3000,
        showConfirmButton: false
      });
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

  const generatePDFBlob = () => {
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

    return pdf.output("blob");
  };

  const handleContractClick = (offer) => {
    navigate("/group_admin/admin-contract", {
      state: {
        offerData: offer,
        offerId: offer.id,
      },
    });
  };

  const handleSendToClientPortal = () => {
    setModalType("portal");
    setShowModal(true);
  };

  const handleSendEmail = () => {
    setModalType("email");
    setShowModal(true);
  };

  const handleWhatsappClick = () => {
    setShowWhatsappModal(true);
  };

  const handleWhatsappModalClose = () => {
    setShowWhatsappModal(false);
    setWhatsappData({ to: "", message: "" });
  };

  const handleWhatsappChange = (e) => {
    const { name, value } = e.target;
    setWhatsappData({
      ...whatsappData,
      [name]: value,
    });
  };

  const handleWhatsappSubmit = async () => {
    if (!whatsappData.to.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Phone number is required',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const phoneRegex = /^\d{11,}$/;
    const rawPhone = whatsappData.to.replace(/^\+/, "");
    if (!phoneRegex.test(rawPhone)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a valid phone number (e.g., 923001234567)',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      const pdfBlob = generatePDFBlob();
      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `invoice_${invoiceId}.pdf`;
      const sessionEmail = email.replace(/[@.]/g, "_");

      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });

      const payload = {
        chatId: formattedPhone,
        caption: whatsappData.message || "Invoice details",
        session: sessionEmail,
        file: {
          data: base64data,
          filename: filename,
          mimeType: "application/pdf",
        },
      };

      const response = await axios.post(
        "http://34.142.252.64:3000/api/sendFile",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'WhatsApp message sent successfully!',
          timer: 3000,
          showConfirmButton: false
        });
        handleWhatsappModalClose();
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'WhatsApp message sent successfully!',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("WhatsApp send error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to send WhatsApp message";
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedClient("");
  };

  const handleClientSelect = (e) => {
    setSelectedClient(e.target.value);
  };

  const handleModalSubmit = async () => {
    if (!selectedClient) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a client!',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    try {
      if (modalType === "email") {
        await axios.post(
          `${config.BASE_URL}/api/agent/send-offers-email`,
          {
            client_id: selectedClient,
            invoice_id: invoiceId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Email sent successfully!',
          timer: 3000,
          showConfirmButton: false
        });
      } else if (modalType === "portal") {
        const response = await axios.post(
          `${config.BASE_URL}/api/notifications`,
          {
            user_id: selectedClient,
            invoice_id: invoiceId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Invoice sent to client portal successfully!',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to send to client portal',
            timer: 3000,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      console.error("Error sending data", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send. Please try again.',
        timer: 3000,
        showConfirmButton: false
      });
    }

    handleModalClose();
  };

  return (
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
            className={`invoice-file-upload-box ${
              isDragging ? "dragging" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("file-input").click();
            }}
          >
            <label htmlFor="file-input" className="invoice-file-upload-btn">
              <BsCloudUpload className="invoice-upload-icon" />
              <p>{uploading ? "Uploading..." : "Upload File Here"}</p>
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
              <button type="submit" className="invoice-submit-btn">
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

                  <button
                    className="invoice-confirmation-btn"
                    onClick={() => handleContractClick(offer)}
                  >
                    Manage Agreement
                  </button>
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
            <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
              <button
                onClick={handleSendEmail}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
              >
                <BsEnvelope className="me-2" />
                Send Email
              </button>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
              <button
                onClick={handleWhatsappClick}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
              >
                <BsWhatsapp className="me-2" />
                Send WhatsApp
              </button>
            </div>
            <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
              <button
                onClick={handleSendToClientPortal}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
              >
                <IoIosSend className="me-2" />
                Client Portal
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content w-100">
            <div className="modal-header">
              <h3 className="mb-0">
                {modalType === "email" ? "Send Email" : "Send to Client Portal"}
              </h3>
              <button
                onClick={handleModalClose}
                className="modal-close-btn bg-transparent border-0"
              >
                <IoClose size={25} />
              </button>
            </div>
            <div className="modal-body">
              {loadingClients ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading clients...</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label d-block pb-1 text-start">
                      Select Client:
                    </label>
                    <select
                      className="form-select"
                      value={selectedClient}
                      onChange={handleClientSelect}
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name || `Client ${client.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={handleModalClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="btn btn-primary"
                disabled={!selectedClient || loadingClients}
              >
                {modalType === "email" ? (
                  <>
                    <BsEnvelope className="me-2" />
                    Send Email
                  </>
                ) : (
                  <>
                    <IoIosSend className="me-2" />
                    Send to Portal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWhatsappModal && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-modal-header">
              <h3>Send via WhatsApp</h3>
              <button
                onClick={handleWhatsappModalClose}
                className="whatsapp-modal-close-btn"
              >
                &times;
              </button>
            </div>
            <div className="whatsapp-modal-body">
              <div className="whatsapp-input-group">
                <label htmlFor="whatsapp-to">Phone Number:</label>
                <input
                  type="text"
                  id="whatsapp-to"
                  name="to"
                  value={whatsappData.to}
                  onChange={handleWhatsappChange}
                  placeholder="e.g., 923001234567"
                  required
                />
                <small className="whatsapp-input-hint">
                  Enter phone number with country code but without + sign (e.g.,
                  923001234567 for Pakistan)
                </small>
              </div>
              <div className="whatsapp-pdf-preview">
                <p className="whatsapp-pdf-label">PDF Attachment:</p>
                <div className="whatsapp-pdf-placeholder">
                  <BsDownload className="whatsapp-pdf-icon" />
                  <p>Invoice_{invoiceId}.pdf</p>
                </div>
              </div>
            </div>
            <div className="whatsapp-modal-footer">
              <button
                onClick={handleWhatsappModalClose}
                className="whatsapp-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleWhatsappSubmit}
                className="whatsapp-modal-send-btn"
                disabled={!whatsappData.to}
              >
                <BsWhatsapp className="me-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoice;