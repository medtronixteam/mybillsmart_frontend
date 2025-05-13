import React, { useState, useEffect } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaCheck, FaTimes, FaFilePdf, FaFileCsv, FaWhatsapp, FaFileExcel } from "react-icons/fa";
import { IoIosSend } from "react-icons/io5";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";
import jsPDF from "jspdf";
import axios from "axios";

const InvoiceList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewTable, setShowNewTable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappData, setWhatsappData] = useState({
    to: "",
    message: "Here are your invoice details from MyBillSmart. Please review the attached PDF.",
  });
  const { token, email } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.BASE_URL}/api/group/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setInvoices(data);
        } else if (data && Array.isArray(data.data)) {
          setInvoices(data.data);
        } else if (data && Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch invoices. Please try again.",
        });
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [token]);

  const fetchInvoiceDetails = async (id) => {
    try {
      setLoading(true);
      const [invoiceResponse, offersResponse] = await Promise.all([
        fetch(`${config.BASE_URL}/api/group/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${config.BASE_URL}/api/group/invoice/offers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invoice_id: id }),
        }),
      ]);
      if (!invoiceResponse.ok || !offersResponse.ok) {
        throw new Error("Failed to fetch invoice details or offers");
      }
      const invoiceData = await invoiceResponse.json();
      const offersData = await offersResponse.json();
      setSelectedInvoice(invoiceData.data || invoiceData);
      setOffers(
        Array.isArray(offersData)
          ? offersData
          : Array.isArray(offersData.data)
          ? offersData.data
          : offersData.offers || []
      );
      setShowNewTable(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch invoice details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (name) => {
    return name
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return value.toString();
  };

  const flattenObject = (obj, prefix = "") => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return [...acc, ...flattenObject(value, newKey)];
      } else {
        return [...acc, [newKey, value]];
      }
    }, []);
  };

  const getFilteredInvoiceData = (invoice) => {
    if (!invoice) return [];
    const excludedFields = ["created_at", "updated_at"];
    const excludedPattern = /id$/i;
    const flattenedInvoice = flattenObject(invoice);
    return flattenedInvoice
      .filter(([key]) => {
        const baseKey = key.split(".")[0];
        return !excludedFields.includes(baseKey) && !excludedPattern.test(key);
      })
      .filter(([_, value]) => {
        return (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        );
      })
      .map(([key, value]) => {
        const displayKey = key
          .split(".")
          .map((part) => formatFieldName(part))
          .join(" → ");
        return [displayKey, value];
      });
  };

  const handleCreateAgreement = (offerId) => {
    navigate(`/group_admin/admin-contract-from?offer_id=${offerId}`);
  };

  const renderOfferStatus = (status) => {
    return status === 1 ? (
      <span className="offer-selected-yes">
        <FaCheck className="text-success me-1" /> Yes
      </span>
    ) : (
      <span className="offer-selected-no">
        <FaTimes className="text-danger me-1" /> No
      </span>
    );
  };

  const downloadPDF = () => {
    if (!selectedInvoice || !offers) return;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = margin;
    let pageNumber = 1;

    // Add header function for consistent headers on each page
    const addHeader = () => {
      pdf.setFontSize(20);
      pdf.setTextColor(74, 107, 175);
      pdf.text("MyBillSmart", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Invoice & Offers Summary", pageWidth / 2, yOffset, { align: "center" });
      yOffset += 15;
      // Add contact info
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
      pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, { align: "right" });
      yOffset += 10;
      // Add divider
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yOffset, pageWidth - margin, yOffset);
      yOffset += 15;
    };

    // Initial header
    addHeader();

    // Add offers section
    if (offers.length > 0) {
      pdf.setFontSize(14);
      pdf.text("Available Offers", margin, yOffset);
      yOffset += 15;

      offers.forEach((offer, index) => {
        if (yOffset > pdf.internal.pageSize.getHeight() - 60) {
          pdf.addPage();
          yOffset = margin;
          pageNumber++;
          addHeader();
        }

        // Offer header
        pdf.setFillColor(74, 107, 175);
        pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`Offer ${index + 1}`, margin + 5, yOffset + 7);
        yOffset += 15;

        // Offer details
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        const offerDetails = [
          `Provider: ${offer.provider_name || "N/A"}`,
          `Product: ${offer.product_name || "N/A"}`,
          `Savings: ${offer.saving || "0"}%`,
          `Commission: ${offer.sales_commission || "0"}%`,
          `Status: ${offer.is_selected ? "Selected" : "Not Selected"}`
        ];

        offerDetails.forEach(detail => {
          if (yOffset > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yOffset = margin;
            pageNumber++;
            addHeader();
          }
          pdf.text(detail, margin, yOffset);
          yOffset += 10;
        });

        yOffset += 10; // Space between offers
      });
    }

    // Add footer to each page
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const footerY = pdf.internal.pageSize.getHeight() - 10;
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
    }

    pdf.save(`Invoice_${selectedInvoice.id}_Offers.pdf`);
  };

  const convertToCSV = () => {
    if (!selectedInvoice) return "";
    const filteredData = getFilteredInvoiceData(selectedInvoice);
    const headers = ["Field", "Value"];
    const rows = filteredData.map(([key, value]) => [key, formatValue(value)]);

    // Add offers if available
    if (offers && offers.length > 0) {
      headers.push("", "Offers", "", "", "");
      offers.forEach((offer, index) => {
        rows.push(
          ["", `Offer ${index + 1}`],
          ["", `Provider: ${offer.provider_name || "N/A"}`],
          ["", `Product: ${offer.product_name || "N/A"}`],
          ["", `Savings: ${offer.saving || "0"}%`],
          ["", `Commission: ${offer.sales_commission || "0"}%`],
          ["", `Status: ${offer.is_selected ? "Selected" : "Not Selected"}`],
          ["", ""]
        );
      });
    }

    return [headers, ...rows]
      .map(row => row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  };

  const downloadCSV = () => {
    if (!selectedInvoice) return;
    try {
      const csvContent = convertToCSV();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${selectedInvoice.id}_Offers.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating CSV:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate CSV file",
      });
    }
  };

  const downloadExcel = () => {
    if (!selectedInvoice) return;
    try {
      const csvContent = "\uFEFF" + convertToCSV();
      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${selectedInvoice.id}_Offers.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate Excel file",
      });
    }
  };

  const generatePDFBlob = () => {
    const pdf = new jsPDF();
    // ... [same implementation as downloadPDF but return blob]
    return pdf.output("blob");
  };

  const handleWhatsappClick = () => {
    setShowWhatsappModal(true);
  };

  const handleWhatsappModalClose = () => {
    setShowWhatsappModal(false);
    setWhatsappData({
      to: "",
      message: "Here are your invoice details from MyBillSmart. Please review the attached PDF.",
    });
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
        icon: "error",
        title: "Error",
        text: "Phone number is required",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    const phoneRegex = /^\d{11,}$/;
    const rawPhone = whatsappData.to.replace(/^\+/, "").replace(/\D/g, "");
    if (!phoneRegex.test(rawPhone)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a valid phone number (e.g., 923001234567)",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    try {
      const loadingSwal = Swal.fire({
        title: 'Preparing PDF',
        html: 'Please wait while we generate and send your document...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const pdfBlob = generatePDFBlob();
      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `Invoice_${selectedInvoice.id}_Offers.pdf`;
      const sessionEmail = email.replace(/[@.]/g, "_");
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });
      const fileSizeMB = pdfBlob.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        throw new Error("PDF file is too large for WhatsApp (max 5MB)");
      }
      const payload = {
        chatId: formattedPhone,
        caption: whatsappData.message,
        session: sessionEmail,
        file: {
          data: base64data,
          filename: filename,
          mimeType: "application/pdf",
        },
      };
      const response = await axios.post(
        "https://waha.ai3dscanning.com/api/sendFile ",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000
        }
      );
      await loadingSwal.close();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "WhatsApp message sent successfully!",
        timer: 3000,
        showConfirmButton: false,
      });
      handleWhatsappModalClose();
    } catch (error) {
      console.error("WhatsApp send error:", error);
      let errorMessage = "Failed to send WhatsApp message";
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("too large")) {
        errorMessage = error.message;
      } else {
        errorMessage = error.response?.data?.error ||
                     error.response?.data?.message ||
                     error.message ||
                     errorMessage;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        timer: 5000,
        showConfirmButton: true,
      });
    }
  };

  const renderInvoiceDetails = () => {
    if (!selectedInvoice) return null;
    const filteredData = getFilteredInvoiceData(selectedInvoice);
    return (
      <div className="invoice-details-container">
        <div className="invoice-details-header">
          <h2>Invoice Details</h2>
          <button
            className="back-button"
            onClick={() => setShowNewTable(false)}
          >
            Back to List
          </button>
        </div>
        <div className="details-grid">
          {filteredData.map(([key, value]) => (
            <div key={key} className="detail-item">
              <div className="detail-label">{key}:</div>
              <div className="detail-value">
                {key.toLowerCase().includes("offer selected") ? 
                  renderOfferStatus(value) : 
                  formatValue(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOfferCards = () => {
    if (!offers || offers.length === 0) {
      return (
        <div className="no-offers">No offers available for this invoice</div>
      );
    }
    return (
      <div className="offers-section">
        <h2 className="offers-title">Available Offers</h2>
        <div className="offers-grid">
          {offers.map((offer, index) => (
            <div key={offer.id || index} className="offer-card">
              <div className="offer-card-header">
                <h3>Offer #{index + 1}</h3>
                {offer.is_selected && (
                  <span className="selected-badge">Selected</span>
                )}
              </div>
              <div className="offer-card-body">
                <div className="offer-field">
                  <span className="offer-label">Provider:</span>
                  <span className="offer-value">
                    {offer.provider_name || "N/A"}
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Product:</span>
                  <span className="offer-value">
                    {offer.product_name || "N/A"}
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Savings:</span>
                  <span className="offer-value">{offer.saving || "0"}%</span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Commission:</span>
                  <span className="offer-value">
                    {offer.sales_commission || "0"}%
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Status:</span>
                  <span className="offer-value">
                    {renderOfferStatus(offer.is_selected || 0)}
                  </span>
                </div>
                {selectedInvoice?.is_offer_selected === 0 && (
                  <button
                    className="create-agreement-btn"
                    onClick={() => handleCreateAgreement(offer.id)}
                  >
                    Create Agreement
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="export-buttons">
          <button onClick={downloadPDF} className="export-btn pdf-btn">
            <FaFilePdf className="me-2" /> PDF
          </button>
          <button onClick={downloadCSV} className="export-btn csv-btn">
            <FaFileCsv className="me-2" /> CSV
          </button>
          <button onClick={downloadExcel} className="export-btn excel-btn">
            <FaFileExcel className="me-2" /> Excel
          </button>
          <button onClick={handleWhatsappClick} className="export-btn whatsapp-btn">
            <FaWhatsapp className="me-2" /> WhatsApp
          </button>
        </div>
      </div>
    );
  };

  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="invoice-list-container">
      <Breadcrumbs homePath={"/group_admin/dashboard"} />
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="invoice-list-title mb-0">Invoice List</h1>
        <Link
          to="/group_admin/client-contract-list"
          type="button"
          className="btn btn-primary"
        >
          Client Agreement List
        </Link>
      </div>
      {showNewTable ? (
        <>
          {renderInvoiceDetails()}
          {renderOfferCards()}
        </>
      ) : (
        <>
          <div className="table-responsive">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-table-header">Bill Type</th>
                  <th className="invoice-table-header">Address</th>
                  <th className="invoice-table-header">Billing Period</th>
                  <th className="invoice-table-header">Agreement</th>
                  <th className="invoice-table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice, index) => (
                    <tr key={invoice.id}>
                      <td className="invoice-table-cell">
                        {invoice.bill_type}
                      </td>
                      <td className="invoice-table-cell">{invoice.address}</td>
                      <td className="invoice-table-cell">
                        {invoice.billing_period}
                      </td>
                      <td className="invoice-table-cell">
                        {renderOfferStatus(invoice.is_offer_selected || 0)}
                      </td>
                      <td className="invoice-table-cell">
                        <HiDotsHorizontal
                          size={30}
                          onClick={() => toggleDropdown(index)}
                          className="cursor-pointer"
                        />
                        {activeDropdown === index && (
                          <div
                            className="dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                            style={{ marginLeft: "-140px" }}
                          >
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                fetchInvoiceDetails(invoice.id);
                                setActiveDropdown(false);
                              }}
                            >
                              View Details
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-invoices">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {invoices.length > itemsPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
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
                  placeholder="e.g., 923001234567"
                  required
                />
                <small className="whatsapp-input-hint">
                  Enter phone number with country code but without + sign
                  (e.g., 923001234567 for Pakistan)
                </small>
              </div>
              <div className="whatsapp-pdf-preview">
                <p className="whatsapp-pdf-label">PDF Attachment:</p>
                <div className="whatsapp-pdf-placeholder">
                  <FaFilePdf className="whatsapp-pdf-icon" />
                  <p>Invoice_{selectedInvoice?.id}_Offers.pdf</p>
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
                <FaWhatsapp className="me-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;