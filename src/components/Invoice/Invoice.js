import React, { useState } from "react";
import { BsCloudUpload } from "react-icons/bs";
import "./Invoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [offers, setOffers] = useState([]); // State to store offers data
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
      const matchResponse = await axios.post(
        "http://34.142.252.64:7000/api/match/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Match API Response:", matchResponse.data);
      setSubmittedData(matchResponse.data);

      // Step 2: Call invoices API to get invoice_id
      const invoiceResponse = await axios.post(
        "http://34.142.252.64:8080/api/invoices",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Invoice API Response:", invoiceResponse.data);

      // Extract invoice_id from the response
      const invoiceId = invoiceResponse.data.invoice;
      setInvoiceId(invoiceId);

      // Step 3: Call offers API with invoice_id and match API data
      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
      }));

      const offersResponse = await axios.post(
        "http://34.142.252.64:8080/api/offers",
        offersData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Offers API Response:", offersResponse.data);

      // Set offers data from the API response
      if (offersResponse.data && offersResponse.data.offers) {
        setOffers(offersResponse.data.offers); // Store offers in state
      }

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

  // Function to handle contract button click
  const handleContractClick = (offer) => {
    // Pass the offer data (including id) as props
    navigate("/agent/contract", {
      state: {
        offerData: offer, // Pass the entire offer object
        offerId: offer.id, // Pass the id separately
      },
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

      {/* Step 2: Fill the Form */}
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

      {/* Step 3: Confirmation */}
      {step === 3 && offers.length > 0 && (
        <>
          <div className=" text-center container">
            <div className="row">
              <div className="col-12">
                <h1>Vendor List</h1>
                {/* Add Download PDF Button
                <button
                  onClick={generatePDF}
                  className="invoice-download-pdf-btn position-absolute"
                >
                  Download PDF
                </button> */}
              </div>
            </div>
          </div>

          {/* Display Offers in Cards */}
          <div className="justify-content-center row w-100">
            {offers.map((offer, index) => (
              <div className="col-xl-4 col-md-6" key={index}>
                <div className="invoice-card-responsive invoice-card h-100 w-100">
                  {/* Dynamically display offer data (excluding user_id, invoice_id, created_at, updated_at, id, Client_id) */}
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
                    onClick={() => handleContractClick(offer)} // Pass offer data (including id)
                  >
                    Manage Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="row gy-3 w-xl-50 w-md-75 w-sm-100 text-center justify-content-center">
            <div className="col-sm-4">
              <button
                onClick={generatePDF}
                className="invoice-download-pdf-btn"
              >
                Download PDF
              </button>
            </div>
            <div className="col-sm-4">
              <button className="invoice-download-pdf-btn">Send Email</button>
            </div>
            <div className="col-sm-4">
              <button className="invoice-download-pdf-btn">
                Send WhatsApp
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Invoice;
