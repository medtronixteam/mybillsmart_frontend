import React, { useState, useEffect } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import {
  FaCheck,
  FaTimes,
  FaFilePdf,
  FaFileCsv,
  FaWhatsapp,
  FaFileExcel,
} from "react-icons/fa";
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
  const [showSingleOfferWhatsappModal, setShowSingleOfferWhatsappModal] =
    useState(false);
  const [showMultiOfferWhatsappModal, setShowMultiOfferWhatsappModal] =
    useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [whatsappData, setWhatsappData] = useState({
    to: "",
    message:
      "Here are your invoice details from MyBillSmart. Please review the attached PDF.",
  });
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search state
  const [offersError, setOffersError] = useState(false);
  const [generatedOffers, setGeneratedOffers] = useState([]);
  const [generatingOffers, setGeneratingOffers] = useState(false);
  const [generateOffersError, setGenerateOffersError] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerFormData, setOfferFormData] = useState({});
  const [createdInvoiceDetails, setCreatedInvoiceDetails] = useState(null);

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
        let invoiceList = [];
        if (Array.isArray(data)) {
          invoiceList = data;
        } else if (data && Array.isArray(data.data)) {
          invoiceList = data.data;
        } else if (data && Array.isArray(data.invoices)) {
          invoiceList = data.invoices;
        }
        setInvoices(invoiceList);
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

  // 🔍 Apply filter globally on all invoices
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.bill_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.billing_period?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Pagination logic based on filtered list
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchInvoiceDetails = async (id) => {
    setLoading(true);
    setOffersError(false);
    try {
      // Fetch invoice details first
      const invoiceResponse = await fetch(`${config.BASE_URL}/api/group/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!invoiceResponse.ok) {
        throw new Error("Failed to fetch invoice details");
      }
      const invoiceData = await invoiceResponse.json();
      setSelectedInvoice(invoiceData.data || invoiceData);
      setShowNewTable(true);
      // Now try to fetch offers, but don't block invoice details if it fails
      try {
        const offersResponse = await fetch(`${config.BASE_URL}/api/group/invoice/offers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invoice_id: id }),
        });
        if (!offersResponse.ok) throw new Error("Offers API error");
        const offersData = await offersResponse.json();
        setOffers(
          Array.isArray(offersData)
            ? offersData
            : Array.isArray(offersData.data)
            ? offersData.data
            : offersData.offers || []
        );
        setOffersError(false);
      } catch (offerErr) {
        setOffers([]);
        setOffersError(true);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch invoice details. Please try again.",
      });
      setSelectedInvoice(null);
      setOffers([]);
      setOffersError(false);
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
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
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
        return (
          !excludedFields.includes(baseKey) && !excludedPattern.test(key)
        );
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
        <span className="badge bg-info text-dark">Yes</span>
      </span>
    ) : (
      <span className="offer-selected-no">
        <span className="badge bg-warning text-dark">No</span>
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

  const addHeader = () => {
    pdf.setFontSize(20);
    pdf.setTextColor(74, 107, 175);
    pdf.text("MyBillSmart", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Invoice & Offers Summary", pageWidth / 2, yOffset, {
      align: "center",
    });
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
    pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, {
      align: "right",
    });
    yOffset += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 15;
  };

  addHeader();

 
  // Offers section
  if (offers.length > 0) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Available Offers", margin, yOffset);
    yOffset += 10;

    offers.forEach((offer, index) => {
      if (yOffset > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yOffset = margin;
        pageNumber++;
        addHeader();
      }

      // Offer header box
      pdf.setFillColor(74, 107, 175);
      pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, "F");
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text(
        `Offer ${index + 1}: ${offer.provider_name || offer["Supplier Name"] || "N/A"}`,
        margin + 5,
        yOffset + 7
      );
      yOffset += 15;

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);

      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 15;
      let col1Y = yOffset;
      let col2Y = yOffset;

      Object.keys(offer).forEach((key, i) => {
        const skipFields = [
          "user_id", "invoice_id", "created_at", "updated_at", "id",
          "Client_id", "client_id", "product_id", "is_offer_selected",
          "Is_offer_selected", "Sales_Commission", "sales_commission"
        ];

        if (!skipFields.includes(key) && typeof offer[key] !== "object") {
          const label = key.replace(/_/g, " ").replace(/^./, (str) => str.toUpperCase());
          const value = String(offer[key]).trim();

          if (col1Y > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yOffset = margin;
            pageNumber++;
            addHeader();
            col1Y = yOffset;
            col2Y = yOffset;
          }

          if (i % 2 === 0) {
            pdf.text(`${label}:`, col1X, col1Y);
            pdf.text(value, col1X + 50, col1Y);
            col1Y += 7;
          } else {
            pdf.text(`${label}:`, col2X, col2Y);
            pdf.text(value, col2X + 50, col2Y);
            col2Y += 7;
          }
        }
      });

      if (offer.sales_commission) {
        if (col1Y > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yOffset = margin;
          pageNumber++;
          addHeader();
          col1Y = yOffset;
          col2Y = yOffset;
        }
        pdf.text("Sales Commission:", col1X, col1Y);
        pdf.text(String(offer.sales_commission), col1X + 60, col1Y);
        col1Y += 7;
      }

      yOffset = Math.max(col1Y, col2Y) + 10;
    });
  }

  // Footer for each page
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

  pdf.save(`Invoice_${selectedInvoice.id}_Offers.pdf`);
};


  const convertToCSV = () => {
    if (!selectedInvoice) return "";
    const filteredData = getFilteredInvoiceData(selectedInvoice);
    const headers = ["Field", "Value"];
    const rows = filteredData.map(([key, value]) => [
      key,
      formatValue(value),
    ]);

    if (offers && offers.length > 0) {
      headers.push("", "Offers", "", "", "");
      offers.forEach((offer, index) => {
        rows.push(
          ["", `Offer ${index + 1}`],
          ["", `Provider: ${offer.provider_name || "N/A"}`],
          ["", `Product: ${offer.product_name || "N/A"}`],
          ["", `Monthly Savings: ${offer.monthly_saving_amount  || "0"}`],
          ["", `Yearly Savings: ${offer.offer.yearly_saving_amount || "0"}`],
          ["", `Yearly Savings: ${offer.yearly_saving_percentage || "0"}%`],
          ["", `Commission: ${offer.sales_commission || "0"}`],
          // ["", `Status: ${offer.is_selected ? "Selected" : "Not Selected"}`],
          ["", ""]
        );
      });
    }

    return [headers, ...rows]
      .map((row) =>
        row
          .map((item) => `"${String(item).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
  };

  const downloadCSV = () => {
    if (!selectedInvoice) return;
    try {
      const csvContent = convertToCSV();
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Invoice_${selectedInvoice.id}_Offers.csv`
      );
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
      const blob = new Blob([csvContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Invoice_${selectedInvoice.id}_Offers.xls`
      );
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
  if (!selectedInvoice || !offers) return null;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yOffset = margin;
  let pageNumber = 1;

  // Header
  const addHeader = () => {
    pdf.setFontSize(20);
    pdf.setTextColor(74, 107, 175); // MyBillSmart blue
    pdf.setFont("helvetica", "bold");
    pdf.text("MyBillSmart", pageWidth / 2, yOffset, { align: "center" });

    yOffset += 10;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.text("Invoice & Offers Summary", pageWidth / 2, yOffset, { align: "center" });

    yOffset += 12;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
    pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, { align: "right" });

    yOffset += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yOffset, pageWidth - margin, yOffset);

    yOffset += 15;
  };

  // Add Footer to all pages
  const addFooterToAllPages = () => {
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 10;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
    }
  };

  // Add Offer Block
  const addOffer = (offer, index) => {
    // Check for page overflow
    if (yOffset > pageHeight - 60) {
      pdf.addPage();
      yOffset = margin;
      pageNumber++;
      addHeader();
    }

    // Offer Heading Box
    pdf.setFillColor(74, 107, 175);
    pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, "F");
    pdf.setFontSize(13);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Offer ${index + 1}`, margin + 5, yOffset + 7);

    yOffset += 15;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");

    const offerFields = [
      { label: "Provider", value: offer.provider_name || "N/A" },
      { label: "Product", value: offer.product_name || "N/A" },
      {
        label: "Monthly Saving",
        value: `${offer.monthly_saving_amount || 0}%`,
      },
      {
        label: "Yearly Amount",
        value: `${offer.yearly_saving_amount || 0}%`,
      },
      {
        label: "Yearly %",
        value: `${offer.yearly_saving_percentage || 0}%`,
      },
    ];

    const col1X = margin;
    const col2X = margin + 90;
    const rowHeight = 8;
    const padding = 6;

    offerFields.forEach((field, i) => {
      if (i % 2 === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text(field.label + ":", col1X, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(field.value, col1X + 60, yOffset, { align: "right" });
      } else {
        pdf.setFont("helvetica", "bold");
        pdf.text(field.label + ":", col2X, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(field.value, col2X + 60, yOffset, { align: "right" });
        yOffset += rowHeight;
      }
    });

    // If number of fields is odd, move down after last one
    if (offerFields.length % 2 !== 0) {
      yOffset += rowHeight;
    }

    yOffset += padding + 5;
  };

  // === Execution ===
  addHeader();

  if (offers.length > 0) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");
    pdf.text("Available Offers", margin, yOffset);
    yOffset += 10;

    offers.forEach((offer, index) => {
      addOffer(offer, index);
    });
  }

  addFooterToAllPages();

  return pdf.output("blob");
};
const generateSingleOfferPDFBlob = (offer) => {
  if (!selectedInvoice || !offer) return null;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let yOffset = margin;
  let pageNumber = 1;

  // Header Function
  const addHeader = () => {
    pdf.setFontSize(20);
    pdf.setTextColor(74, 107, 175); // MyBillSmart blue
    pdf.text("MyBillSmart", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Offer Details", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
    pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, { align: "right" });
    yOffset += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 15;
  };

  addHeader();

  // Offer Header Box
  pdf.setFillColor(74, 107, 175);
  pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, "F");
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Offer Details", margin + 5, yOffset + 7);
  yOffset += 15;
  pdf.setTextColor(0, 0, 0);

  // Offer Fields (excluding commission)
  const offerFields = [
    { label: "Provider", value: offer.provider_name || "N/A" },
    { label: "Product", value: offer.product_name || "N/A" },
    { label: "Monthly Saving", value: `${offer.monthly_saving_amount || 0}` },
    { label: "Yearly Saving", value: `${offer.yearly_saving_amount || 0}` },
    { label: "Yearly %", value: `${offer.yearly_saving_percentage || 0}%` },
  ];

  const col1X = margin;
  const col2X = margin + 90;
  const rowHeight = 8;
  const padding = 5;

  offerFields.forEach((field, i) => {
    if (i % 2 === 0) {
      pdf.setFont("helvetica", "bold");
      pdf.text(field.label + ":", col1X, yOffset);
      pdf.setFont("helvetica", "normal");
      pdf.text(field.value, col1X + 30, yOffset, { align: "right" });
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.text(field.label + ":", col2X, yOffset);
      pdf.setFont("helvetica", "normal");
      pdf.text(field.value, col2X + 30, yOffset, { align: "right" });
      yOffset += rowHeight;
    }
  });

  // Handle odd number of fields
  if (offerFields.length % 2 !== 0) {
    yOffset += rowHeight;
  }

  yOffset += padding + 10;

  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const footerY = pdf.internal.pageSize.getHeight() - 10;
    pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
    pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
  }

  return pdf.output("blob");
};


 const generateMultipleOfferPDFBlob = (selectedOffers) => {
  if (!selectedInvoice || !selectedOffers || selectedOffers.length === 0) return null;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
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
    pdf.text("Selected Offers", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Email: contact@mybillsmart.com", margin, yOffset);
    pdf.text(`Page ${pageNumber}`, pageWidth - margin, yOffset, { align: "right" });
    yOffset += 10;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yOffset, pageWidth - margin, yOffset);
    yOffset += 15;
  };

  const addFooter = () => {
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const footerY = pageHeight - 10;
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
    }
  };

  const drawOfferFields = (offer) => {
    const offerFields = [
      { label: "Provider", value: offer.provider_name || "N/A" },
      { label: "Product", value: offer.product_name || "N/A" },
      { label: "Monthly Saving", value: `${offer.monthly_saving_amount || 0}` },
      { label: "Yearly Saving", value: `${offer.yearly_saving_amount || 0}` },
      { label: "Yearly %", value: `${offer.yearly_saving_percentage || 0}%` },

    ];

    const col1X = margin;
    const col2X = margin + 90;
    const rowHeight = 8;

    offerFields.forEach((field, i) => {
      if (yOffset > pageHeight - 20) {
        pdf.addPage();
        yOffset = margin;
        pageNumber++;
        addHeader();
      }

      if (i % 2 === 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text(field.label + ":", col1X, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(field.value, col1X + 30, yOffset);
      } else {
        pdf.setFont("helvetica", "bold");
        pdf.text(field.label + ":", col2X, yOffset);
        pdf.setFont("helvetica", "normal");
        pdf.text(field.value, col2X + 30, yOffset);
        yOffset += rowHeight;
      }
    });

    if (offerFields.length % 2 !== 0) {
      yOffset += rowHeight;
    }

    yOffset += 5; // extra spacing after each offer
  };

  addHeader();

  selectedOffers.forEach((offer, index) => {
    if (yOffset > pageHeight - 50) {
      pdf.addPage();
      yOffset = margin;
      pageNumber++;
      addHeader();
    }

    // Offer Header Block
    pdf.setFillColor(74, 107, 175);
    pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, "F");
    pdf.setFontSize(14);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Offer ${index + 1}: ${offer.product_name || "Unnamed Product"}`, margin + 5, yOffset + 7);
    yOffset += 15;

    // Reset color for offer fields
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    drawOfferFields(offer);
  });

  addFooter();

  return pdf.output("blob");
};


  const handleWhatsappClick = () => {
    setShowWhatsappModal(true);
  };

  const handleWhatsappModalClose = () => {
    setShowWhatsappModal(false);
    setWhatsappData({
      to: "",
      message:
        "Here are your invoice details from MyBillSmart. Please review the attached PDF.",
    });
  };

  const handleSingleOfferWhatsappClick = (offer) => {
    setSelectedOffer(offer);
    setShowSingleOfferWhatsappModal(true);
    setWhatsappData({
      to: "",
      message: `Here is your offer details from MyBillSmart for ${
        offer.product_name || "product"
      }.`,
    });
  };

  const handleSingleOfferWhatsappModalClose = () => {
    setShowSingleOfferWhatsappModal(false);
    setSelectedOffer(null);
    setWhatsappData({
      to: "",
      message: "Here is your offer details from MyBillSmart.",
    });
  };

  const handleMultiOfferWhatsappClick = () => {
    setShowMultiOfferWhatsappModal(true);
  };

  const handleMultiOfferWhatsappModalClose = () => {
    setShowMultiOfferWhatsappModal(false);
    setSelectedOffers([]);
    setWhatsappData({
      to: "",
      message: "Here are your selected offers from MyBillSmart.",
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
        title: "Preparing PDF",
        html: "Please wait while we generate and send your document...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const pdfBlob = generatePDFBlob();
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }

      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `Invoice_${selectedInvoice?.id}_Offers.pdf`;
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
        "https://waha.ai3dscanning.com/api/sendFile  ",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
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
        errorMessage =
          error.response?.data?.error ||
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

  const handleSingleOfferWhatsappSubmit = async () => {
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
        title: "Preparing Offer PDF",
        html: "Please wait while we generate and send your offer...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const pdfBlob = generateSingleOfferPDFBlob(selectedOffer);
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }

      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `Offer_${selectedOffer.id}_Details.pdf`;
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
        "https://waha.ai3dscanning.com/api/sendFile  ",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
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
      handleSingleOfferWhatsappModalClose();
    } catch (error) {
      console.error("WhatsApp send error:", error);
      let errorMessage = "Failed to send WhatsApp message";
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("too large")) {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data?.error ||
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

  const handleMultiOfferWhatsappSubmit = async () => {
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

    if (selectedOffers.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select at least one offer to send",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const loadingSwal = Swal.fire({
        title: "Preparing Selected Offers PDF",
        html: "Please wait while we generate and send your selected offers...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const pdfBlob = generateMultipleOfferPDFBlob(selectedOffers);
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }

      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `Selected_Offers_Details.pdf`;
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
        "https://waha.ai3dscanning.com/api/sendFile  ",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
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
      handleMultiOfferWhatsappModalClose();
    } catch (error) {
      console.error("WhatsApp send error:", error);
      let errorMessage = "Failed to send WhatsApp message";
      if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("too large")) {
        errorMessage = error.message;
      } else {
        errorMessage =
          error.response?.data?.error ||
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

  const handleOfferCheckboxChange = (offer, isChecked) => {
    if (isChecked) {
      setSelectedOffers([...selectedOffers, offer]);
    } else {
      setSelectedOffers(
        selectedOffers.filter((o) => o.id !== offer.id)
      );
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
                {key.toLowerCase().includes("offer selected")
                  ? renderOfferStatus(value)
                  : formatValue(value)}
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
        <div className="no-offers">
          {offersError ? 'No offers available' : 'No offers available for this invoice'}
        </div>
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
                  <span className="offer-label">Monthly Saving:</span>
                  <span className="offer-value">
                    {offer.monthly_saving_amount || "0"}
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Yearly Saving:</span>
                  <span className="offer-value">
                    {offer.yearly_saving_amount || "0"}
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Yearly Saving:</span>
                  <span className="offer-value">
                    {offer.yearly_saving_percentage || "0"}%
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Commission:</span>
                  <span className="offer-value">
                    {offer.sales_commission || "0"}
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Status:</span>
                  <span className="offer-value">
                    {renderOfferStatus(offer.is_selected || 0)}
                  </span>
                </div>
                <div className="offer-actions">
                  {selectedInvoice?.is_offer_selected === 0 && (
                    <button
                      className="create-agreement-btn"
                      onClick={() => handleCreateAgreement(offer.id)}
                    >
                      Create Agreement
                    </button>
                  )}
                  {/* <button
                    className="whatsapp-offer-btn"
                    onClick={() => handleSingleOfferWhatsappClick(offer)}
                  >
                    <FaWhatsapp className="me-1" /> Share on WhatsApp
                  </button> */}
                </div>
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
          <button
            onClick={handleWhatsappClick}
            className="export-btn whatsapp-btn"
          >
            <FaWhatsapp className="me-2" /> WhatsApp
          </button>
          <button
            onClick={handleMultiOfferWhatsappClick}
            className="export-btn multi-whatsapp-btn"
          >
            <FaWhatsapp className="me-2" /> Select & Send
          </button>
        </div>
      </div>
    );
  };

  // Helper to get allowed fields from invoice and bill_info
  const getOfferFormFields = (invoice) => {
    const allowedTopFields = ['address', 'CUPS', 'billing_period'];
    const billInfo = invoice.bill_info || {};
    const allowedBillInfoFields = Object.keys(billInfo)
      .filter(key => key !== 'group_id' && typeof billInfo[key] !== 'object');
    return { allowedTopFields, allowedBillInfoFields };
  };

  // Update handleOfferFormChange to support nested bill_info fields
  const handleOfferFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bill_info.')) {
      const field = name.replace('bill_info.', '');
      setOfferFormData(prev => ({
        ...prev,
        bill_info: {
          ...prev.bill_info,
          [field]: value,
        },
      }));
    } else {
      setOfferFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOfferFormSubmit = async (e) => {
    e.preventDefault();
    setGeneratingOffers(true);
    setGenerateOffersError("");
    setGeneratedOffers([]);
    setCreatedInvoiceDetails(null);
    try {
      const { allowedTopFields, allowedBillInfoFields } = getOfferFormFields(offerFormData);
      // Validation
      for (const key of allowedTopFields) { if (!offerFormData[key] || offerFormData[key].trim() === '') { setGenerateOffersError('Please fill all fields.'); return; } }
      for (const key of allowedBillInfoFields) { if (!offerFormData.bill_info?.[key] || offerFormData.bill_info[key].toString().trim() === '') { setGenerateOffersError('Please fill all fields.'); return; } }
      // Build flat payload for match API
      const matchPayload = {};
      allowedTopFields.forEach(key => { matchPayload[key] = offerFormData[key]; });
      allowedBillInfoFields.forEach(key => { matchPayload[key] = offerFormData.bill_info?.[key]; });
      matchPayload.group_id = offerFormData.bill_info?.group_id || offerFormData.group_id;
      matchPayload.app_mode = 0;
      // 1. Call match API
      const matchRes = await fetch(`https://ocr.ai3dscanning.com/api/match/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matchPayload),
      });
      if (!matchRes.ok) throw new Error("Failed to generate offers (match API)");
      const matchData = await matchRes.json();
      // 2. Call invoice creation API
      const invoicePayload = { ...offerFormData, group_id: matchPayload.group_id };
      const invoiceRes = await fetch(`${config.BASE_URL}/api/group/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoicePayload),
      });
      if (!invoiceRes.ok) throw new Error("Failed to create invoice");
      const invoiceData = await invoiceRes.json();
      setCreatedInvoiceDetails(invoiceData.data || invoiceData);
      const invoiceId = invoiceData.invoice || invoiceData.id || invoiceData.data?.id;
      if (!invoiceId) throw new Error("Invoice ID not found");
      // 3. Add invoice_id to each offer in matchData
      const offersPayload = Array.isArray(matchData)
        ? matchData.map(offer => ({ ...offer, invoice_id: invoiceId }))
        : [];
      // 4. Call offers API
      const offersRes = await fetch(`${config.BASE_URL}/api/group/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(offersPayload),
      });
      if (!offersRes.ok) throw new Error("Failed to fetch offers");
      const offersData = await offersRes.json();
      setGeneratedOffers(offersData.data || offersData.offers || []);
      setShowOfferForm(false);
    } catch (err) {
      setGeneratedOffers([]);
      setCreatedInvoiceDetails(null);
      setGenerateOffersError(err.message || "Failed to generate offers. Please try again.");
    } finally {
      setGeneratingOffers(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div
          className="spinner-border"
          role="status"
          style={{ color: "#3598db" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
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

      {/* 🔍 Search Input */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          placeholder="Search by Bill Type, Address or Billing Period"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control w-50"
        />
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
                      <td className="invoice-table-cell">
                        {invoice.address}
                      </td>
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
                            <a
                              className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                              onClick={() => {
                                let billInfo = {};
                                if (invoice.bill_info && typeof invoice.bill_info === 'object') {
                                  if (invoice.bill_info.bill_info && typeof invoice.bill_info.bill_info === 'object') {
                                    billInfo = invoice.bill_info.bill_info;
                                  } else {
                                    billInfo = invoice.bill_info;
                                  }
                                }
                                setOfferFormData({
                                  ...invoice,
                                  bill_info: billInfo,
                                });
                                setShowOfferForm(true);
                              }}
                            >
                              Get Offers
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-invoices">
                      No matching invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          {totalPages > 0 && (
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

      {/* WhatsApp Modal for all offers */}
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

      {/* WhatsApp Modal for single offer */}
      {showSingleOfferWhatsappModal && selectedOffer && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-modal-header">
              <h3>Send Offer via WhatsApp</h3>
              <button
                onClick={handleSingleOfferWhatsappModalClose}
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
                <p className="whatsapp-pdf-label">Offer PDF Attachment:</p>
                <div className="whatsapp-pdf-placeholder">
                  <FaFilePdf className="whatsapp-pdf-icon" />
                  <p>Offer_{selectedOffer.id}_Details.pdf</p>
                </div>
              </div>
            </div>
            <div className="whatsapp-modal-footer">
              <button
                onClick={handleSingleOfferWhatsappModalClose}
                className="whatsapp-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSingleOfferWhatsappSubmit}
                className="whatsapp-modal-send-btn"
                disabled={!whatsappData.to}
              >
                <FaWhatsapp className="me-2" />
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal for multiple selected offers */}
      {showMultiOfferWhatsappModal && offers.length > 0 && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-modal-header">
              <h3>Select Offers to Send</h3>
              <button
                onClick={handleMultiOfferWhatsappModalClose}
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
              <div className="offers-selection">
                <h4>Select Offers:</h4>
                <div className="offers-checkboxes">
                  {offers.map((offer) => (
                    <div key={offer.id} className="offer-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedOffers.some(
                            (o) => o.id === offer.id
                          )}
                          onChange={(e) =>
                            handleOfferCheckboxChange(offer, e.target.checked)
                          }
                        />
                        {offer.product_name || "Unnamed Product"} (
                        {offer.provider_name || "Unknown Provider"})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="whatsapp-pdf-preview">
                <p className="whatsapp-pdf-label">Selected Offers PDF Attachment:</p>
                <div className="whatsapp-pdf-placeholder">
                  <FaFilePdf className="whatsapp-pdf-icon" />
                  <p>Selected_Offers_Details.pdf</p>
                </div>
              </div>
            </div>
            <div className="whatsapp-modal-footer">
              <button
                onClick={handleMultiOfferWhatsappModalClose}
                className="whatsapp-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleMultiOfferWhatsappSubmit}
                className="whatsapp-modal-send-btn"
                disabled={
                  !whatsappData.to || selectedOffers.length === 0
                }
              >
                <FaWhatsapp className="me-2" />
                Send Selected Offers
              </button>
            </div>
          </div>
        </div>
      )}

      {showOfferForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={handleOfferFormSubmit} className="offer-form-section">
              <div className="form-message" style={{ marginBottom: 10}}>
               <h2>Please Verify Invoice</h2>
              </div>
              {(() => {
                const { allowedTopFields, allowedBillInfoFields } = getOfferFormFields(offerFormData);
                return (
                  <>
                    {allowedTopFields.map(key => (
                      <div key={key} className="form-group">
                        <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                        <input
                          name={key}
                          value={['n/a', 'unknown'].includes(String(offerFormData[key] || '').toLowerCase()) ? '' : offerFormData[key] || ''}
                          onChange={handleOfferFormChange}
                          className="form-control"
                        />
                      </div>
                    ))}
                    {allowedBillInfoFields.map(key => (
                      <div key={key} className="form-group">
                        <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                        <input
                          name={`bill_info.${key}`}
                          value={['n/a', 'unknown'].includes(String(offerFormData.bill_info?.[key] || '').toLowerCase()) ? '' : offerFormData.bill_info?.[key] || ''}
                          onChange={handleOfferFormChange}
                          className="form-control"
                        />
                      </div>
                    ))}
                    
                  </>
                );
              })()}
              <button type="submit" className="modern-create-agreement-btn">Get Offers</button>
              <button type="button" className="back-button text-center" onClick={() => setShowOfferForm(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {generatingOffers && <div>Generating offers...</div>}
      {generateOffersError && <div className="no-offers">{generateOffersError}</div>}
      {generatedOffers.length > 0 && (
        <div className="modern-offer-cards">
          <h2 className="modern-offers-title">Generated Offers</h2>
          <div className="modern-offers-grid">
            {generatedOffers.map((offer, index) => (
              <div key={offer.id} className="modern-offer-card">
                <div className="modern-offer-header">
                  <h3>Offer #{index + 1}</h3>
                </div>
                <div className="modern-offer-body">
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Provider:</span>
                    <span className="modern-offer-value">
                      {offer.provider_name || "N/A"}
                    </span>
                  </div>
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Product:</span>
                    <span className="modern-offer-value">
                      {offer.product_name || "N/A"}
                    </span>
                  </div>
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Monthly Saving:</span>
                    <span className="modern-offer-value">
                      {offer.monthly_saving_amount || "0"}
                    </span>
                  </div>
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Yearly Saving:</span>
                    <span className="modern-offer-value">
                      {offer.yearly_saving_amount || "0"}
                    </span>
                  </div>
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Yearly Saving:</span>
                    <span className="modern-offer-value">
                      {offer.yearly_saving_percentage || "0"}%
                    </span>
                  </div>
                  <div className="modern-offer-field">
                    <span className="modern-offer-label">Commission:</span>
                    <span className="modern-offer-value">
                      {offer.sales_commission || "0"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {createdInvoiceDetails && (
        <div className="created-invoice-details">
          <h2>Created Invoice Details</h2>
          <div className="details-grid">
            {Object.entries(createdInvoiceDetails).map(([key, value]) => (
              <div key={key} className="detail-item">
                <div className="detail-label">{key}:</div>
                <div className="detail-value">
                  {formatValue(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;