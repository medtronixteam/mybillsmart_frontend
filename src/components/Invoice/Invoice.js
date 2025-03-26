import React, { useState, useEffect } from "react";
import {
  BsCloudUpload,
  BsDownload,
  BsEnvelope,
  BsWhatsapp,
} from "react-icons/bs";
import "./Invoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
import jsPDF from "jspdf";
import { IoIosSend } from "react-icons/io";

const Invoice = () => {
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
    message: ""
  });
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (showModal) {
      fetchClients();
    }
  }, [showModal]);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await axios.get("http://34.142.252.64:8080/api/agent/client/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
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
        toast.info("No clients found");
      }
    } catch (error) {
      console.error("Error fetching clients", error);
      toast.error("Failed to fetch clients. Please try again.");
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

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

      const invoiceResponse = await axios.post(
        "http://34.142.252.64:8080/api/agent/invoices",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Invoice API Response:", invoiceResponse.data);

      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);

      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const offersResponse = await axios.post(
        "http://34.142.252.64:8080/api/agent/offers",
        offersData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Offers API Response:", offersResponse.data);

      if (offersResponse.data && offersResponse.data.offers) {
        setOffers(offersResponse.data.offers);
      }

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
      pdf.text(
        `Supplier ${index + 1}: ${supplier["Supplier Name"]}`,
        10,
        yOffset
      );
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

  const generatePDFBlob = () => {
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
      pdf.text(
        `Supplier ${index + 1}: ${supplier["Supplier Name"]}`,
        10,
        yOffset
      );
      yOffset += 10;

      Object.keys(supplier).forEach((key) => {
        if (key !== "Supplier Name") {
          pdf.text(`${key}: ${supplier[key]}`, 15, yOffset);
          yOffset += 10;
        }
      });

      yOffset += 10;
    });

    return pdf.output("blob");
  };

  const handleContractClick = (offer) => {
    navigate("/agent/contract", {
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
      [name]: value
    });
  };

  const handleWhatsappSubmit = async () => {
    if (!whatsappData.to.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("to", whatsappData.to);
      formData.append("message", whatsappData.message);
      
      const pdfBlob = generatePDFBlob();
      formData.append("pdf", pdfBlob, `invoice_${invoiceId}.pdf`);

      const response = await axios.post(
        "http://34.142.252.64:8080/api/whatsapp/pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("WhatsApp message sent successfully!");
      handleWhatsappModalClose();
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast.error("Failed to send WhatsApp message. Please try again.");
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
      toast.error("Please select a client!");
      return;
    }

    try {
      if (modalType === "email") {
        await axios.post(
          "http://34.142.252.64:8080/api/agent/send-offers-email",
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
        toast.success("Email sent successfully!");
      } else if (modalType === "portal") {
        toast.success("Invoice sent to client portal!");
      }
    } catch (error) {
      console.error("Error sending data", error);
      toast.error("Failed to send. Please try again.");
    }

    handleModalClose();
  };

  return (
    <div className="invoice-container">
      <ToastContainer />

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
            className="invoice-file-upload-box"
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
                <h1>Vendor List</h1>
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
                    Manage Contract
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-3 gy-3 w-100 text-center justify-content-center">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <button
                onClick={generatePDF}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100 w-xl-auto"
              >
                <BsDownload className="me-2" />
                Download PDF
              </button>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <button
                onClick={handleSendEmail}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100 w-xl-auto"
              >
                <BsEnvelope className="me-2" />
                Send Email
              </button>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <button
                onClick={handleWhatsappClick}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100 w-xl-auto"
              >
                <BsWhatsapp className="me-2" />
                Send WhatsApp
              </button>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
              <button
                onClick={handleSendToClientPortal}
                className="pdf-btn p-2 rounded-2 text-white border-0 w-100 w-xl-auto"
              >
                <IoIosSend className="me-2" />
                Send to Client Portal
              </button>
            </div>
          </div>
        </>
      )}

      {/* WhatsApp Modal */}
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
                  placeholder="e.g., +923001234567"
                  required
                />
                <small className="whatsapp-input-hint">
                  Include country code (e.g., +92 for Pakistan)
                </small>
              </div>
              <div className="whatsapp-input-group">
                <label htmlFor="whatsapp-message">Message:</label>
                <textarea
                  id="whatsapp-message"
                  name="message"
                  value={whatsappData.message}
                  onChange={handleWhatsappChange}
                  placeholder="Type your message here..."
                  rows={5}
                />
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

      {/* Client Selection Modal */}
      {showModal && (
        <div className="send-to-client-modal">
          <div className="send-to-client-modal-content">
            <h2>{modalType === "email" ? "Send Email" : "Send to Client Portal"}</h2>
            {loadingClients ? (
              <div>Loading clients...</div>
            ) : clients.length > 0 ? (
              <>
                <p>Select a client:</p>
                <select
                  value={selectedClient}
                  onChange={handleClientSelect}
                  className="form-select"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name || `Client ${client.id}`}
                    </option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button onClick={handleModalClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleModalSubmit} className="btn btn-primary">
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="no-clients-message">
                <p>No clients available</p>
                <button onClick={handleModalClose} className="btn btn-secondary">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;