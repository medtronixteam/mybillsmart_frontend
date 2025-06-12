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
        setPlanInfo(
          error.response?.data || {
            status: "error",
            message: "Failed to fetch plan information",
          }
        );
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
        showAlert(
          "error",
          "Error",
          "Only JPEG, PNG, and PDF files are allowed."
        );
        return;
      }
      if (file) {
        showAlert(
          "info",
          "Info",
          "A file is already uploaded. Please submit the form."
        );
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
        "https://ocr.ai3dscanning.com/api/file/",
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
      app_mode: "0",
    };

    const matchResponse = await axios.post(
      "https://ocr.ai3dscanning.com/api/match/",
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

    showAlert("success", "Success", invoiceResponse.data?.message || "Form submitted successfully!");
  } catch (error) {
    console.error("Error submitting data", error);

    const apiMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Error submitting form. Please try again.";

    showAlert("error", "Error", apiMessage);
  }
};

  const handleSave = async () => {
  try {
    const payload = {
      ...formData,
      group_id: groupId,
    };

    const response = await axios.post(
      `${config.BASE_URL}/api/client/invoices`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Invoice saved successfully!",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error saving invoice", error);
    showAlert("error", "Error", "Failed to save invoice");
  }
};

const renderFormFieldsByBillType = (data) => {
  const commonFields = [
    { key: "bill_type", label: "Bill Type" },
    { key: "address", label: "Address" },
    { key: "billing_period", label: "Billing Period" },
    { key: "cups", label: "C.U.P.S Code" },
    { key: "total_bill", label: "Total Bill" },
    { key: "meter_rental", label: "Meter Rental" },
  ];

  let additionalFields = [];

  if (data.bill_type === "GAS") {
    additionalFields = [
      { key: "total_consumption_m3", label: "Total Consumption (m³)" },
      { key: "total_consumption_kwh", label: "Total Consumption (kWh)" },
      { key: "price_per_unit", label: "Price per Unit" },
      { key: "fixed_term", label: "Fixed Term" },
      { key: "taxes", label: "Taxes" },
      { key: "tariff", label: "Tariff" },
    ];
  } else if (data.bill_type === "ELECTRICITY") {
    additionalFields = [
      { key: "total_consumption_kwh", label: "Total Consumption (kWh)" },
      { key: "fixed_term", label: "Fixed Term" },
      { key: "taxes", label: "Taxes" },
      { key: "tariff", label: "Tariff" },
      { key: "peak_consumption_kwh", label: "Peak Consumption (kWh)" },
      { key: "off_peak_consumption_kwh", label: "Off-Peak Consumption (kWh)" },
      { key: "valley_consumption_kwh", label: "Valley Consumption (kWh)" },
      { key: "peak_power_kw", label: "Peak Power (kW)" },
      { key: "valley_power_kw", label: "Valley Power (kW)" },
      { key: "peak_price_per_kwh", label: "Peak Price per kWh" },
      { key: "off_peak_price_per_kwh", label: "Off-Peak Price per kWh" },
      { key: "valley_price_per_kwh", label: "Valley Price per kWh" },
      { key: "energy_term", label: "Energy Term" },
    ];
  } else if (data.bill_type === "GAS & ELECTRICITY") {
    additionalFields = [
      { key: "total_consumption_kwh", label: "Total Consumption (kWh)" },
      { key: "price_per_unit", label: "Price per Unit" },
      { key: "fixed_term", label: "Fixed Term" },
      { key: "taxes", label: "Taxes" },
      { key: "gas_tariff", label: "Gas Tariff" },
      { key: "gas_fixed_term", label: "Gas Fixed Term" },
      { key: "gas_energy_cost", label: "Gas Energy Cost" },
      { key: "electricity_tariff", label: "Electricity Tariff" },
      { key: "electricity_fixed_term", label: "Electricity Fixed Term" },
      { key: "peak_consumption_kwh", label: "Peak Consumption (kWh)" },
      { key: "off_peak_consumption_kwh", label: "Off-Peak Consumption (kWh)" },
      { key: "valley_consumption_kwh", label: "Valley Consumption (kWh)" },
      { key: "peak_power_kw", label: "Peak Power (kW)" },
      { key: "valley_power_kw", label: "Valley Power (kW)" },
      { key: "peak_price_per_kwh", label: "Peak Price per kWh" },
      { key: "off_peak_price_per_kwh", label: "Off-Peak Price per kWh" },
      { key: "valley_price_per_kwh", label: "Valley Price per kWh" },
      { key: "energy_term", label: "Energy Term" },
    ];
  }

  const allFields = [...commonFields, ...additionalFields];

  return allFields.map((field, index) => (
    <div key={index} className="form-field">
      <label>{field.label}:</label>
      <input
        type="text"
        name={field.key}
        value={data[field.key] !== undefined ? data[field.key] : ""}
        onChange={handleFormChange}
        placeholder={`Enter ${field.label}`}
      />
    </div>
  ));
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
      showAlert("error", "Error", "No data available to download");
      return;
    }
    try {
      const csvContent = convertToCSV(submittedData);
      downloadFile(
        `invoice_${invoiceId}_data.csv`,
        csvContent,
        "text/csv;charset=utf-8;"
      );
      showAlert("success", "Success", "CSV downloaded successfully");
    } catch (error) {
      console.error("Error generating CSV:", error);
      showAlert("error", "Error", "Failed to generate CSV file");
    }
  };

  const downloadExcel = () => {
    if (
      !submittedData ||
      !Array.isArray(submittedData) ||
      submittedData.length === 0
    ) {
      showAlert("error", "Error", "No data available to download");
      return;
    }
    try {
      const csvContent = "\uFEFF" + convertToCSV(submittedData);
      downloadFile(
        `invoice_${invoiceId}_data.xls`,
        csvContent,
        "application/vnd.ms-excel;charset=utf-8;"
      );
      showAlert("success", "Success", "Excel file downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel:", error);
      showAlert("error", "Error", "Failed to generate Excel file");
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = margin;
    let pageNumber = 1;

    const addHeader = () => {
      pdf.setFontSize(20);
      pdf.setTextColor(74, 107, 175);
      pdf.text("MyBillSmart", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;

      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Energy Offers Summary", pageWidth / 2, yOffset, {
        align: "center",
      });
      yOffset += 15;

      // Add contact info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
      pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, {
        align: "right",
      });
      yOffset += 10;

      // Add divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yOffset, pageWidth - margin, yOffset);
      yOffset += 15;
    };

    // Initial header
    addHeader();

    if (submittedData && Array.isArray(submittedData)) {
      submittedData.forEach((supplier, index) => {
        // Check if we need a new page (leave 40mm at bottom for footer)
        if (yOffset > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yOffset = margin;
          pageNumber++;
          addHeader();
        }

        // Supplier card header
        pdf.setFillColor(74, 107, 175);
        pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, "F");
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(
          `Offer ${index + 1}: ${
            supplier["Supplier Name"] ||
            supplier["supplierName"] ||
            `Supplier ${index + 1}`
          }`,
          margin + 5,
          yOffset + 7
        );
        yOffset += 15;

        // Supplier details
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);

        // Create two columns for details
        const column1X = margin + 5;
        const column2X = pageWidth / 2 + 10;
        let column1Y = yOffset;
        let column2Y = yOffset;

        Object.keys(supplier).forEach((key, i) => {
          if (
            ![
              "Supplier Name",
              "supplierName",
              "user_id",
              "invoice_id",
              "created_at",
              "updated_at",
              "id",
            ].includes(key) &&
            supplier[key] &&
            typeof supplier[key] !== "object"
          ) {
            const displayKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

            // Check if we need a new page before adding content
            if (
              Math.max(column1Y, column2Y) >
              pdf.internal.pageSize.getHeight() - 20
            ) {
              pdf.addPage();
              yOffset = margin;
              pageNumber++;
              addHeader();
              column1Y = yOffset;
              column2Y = yOffset;
            }

            // Alternate between columns
            if (i % 2 === 0) {
              pdf.text(`${displayKey}:`, column1X, column1Y);
              pdf.text(`${supplier[key]}`, column1X + 40, column1Y);
              column1Y += 7;
            } else {
              pdf.text(`${displayKey}:`, column2X, column2Y);
              pdf.text(`${supplier[key]}`, column2X + 40, column2Y);
              column2Y += 7;
            }
          }
        });

        // Move yOffset to the max of both columns
        yOffset = Math.max(column1Y, column2Y) + 10;

        // Highlight savings if available
        if (supplier["Saving %"] || supplier["savingPercentage"]) {
          const savings = supplier["Saving %"] || supplier["savingPercentage"];
          pdf.setFontSize(12);
          pdf.setTextColor(0, 128, 0);
          pdf.text(`You save ${savings}% with this offer!`, margin, yOffset);
          yOffset += 10;
        }

        // Add divider between suppliers
        if (index < submittedData.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yOffset, pageWidth - margin, yOffset);
          yOffset += 15;
        }
      });
    } else {
      pdf.setFontSize(12);
      pdf.text("No offer data available", margin, yOffset);
      yOffset += 10;
    }

    // Add footer to each page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const footerY = pdf.internal.pageSize.getHeight() - 10;
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, {
        align: "center",
      });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, {
        align: "center",
      });
    }

    pdf.save(`MyBillSmart_Offers_${invoiceId}.pdf`);
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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (planInfo?.status === 404 || planInfo?.status === 403 || planInfo?.status === "error") {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-danger">
              <div className="card-body text-center p-5">
                <BsExclamationCircle
                  className="text-danger mb-4"
                  style={{ fontSize: "4rem" }}
                />
                <h2 className="card-title mb-3">Information</h2>
                <p className="card-text mb-4">
                  {planInfo.message ||
                    "You need to purchase a plan to submit invoices."}
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
              className={`invoice-file-upload-box ${
                isDragging ? "dragging" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input").click();
              }}
            >
              <label className="invoice-file-upload-btn">
                <BsCloudUpload className="invoice-upload-icon" />
                <p>
                  {uploading ? "Uploading..." : "Choose / Drop a File Here"}
                </p>
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
     {step === 2 && (
  <div className="invoice-form-container w-100">
    <h2 className="invoice-form-heading">Verify your Invoice</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        {renderFormFieldsByBillType(formData).map((field, idx) => (
          <div key={idx} className="form-row-item">
            {field}
          </div>
        ))}
      </div>
      <button type="submit" className="invoice-submit-btn">
        Get Offers
      </button>
      <button
        type="button"
        className="invoice-save-btn"
        onClick={handleSave}
      >
        Save Invoice
      </button>
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
