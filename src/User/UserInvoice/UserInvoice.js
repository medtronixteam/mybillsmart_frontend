import React, { useState, useEffect, useCallback } from "react";
import {
  BsCloudUpload,
  BsDownload,
  BsEnvelope,
  BsWhatsapp,
  BsExclamationCircle,
} from "react-icons/bs";
import "./UserInvoice.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";
import jsPDF from "jspdf";
import { IoIosSend } from "react-icons/io";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import config from "../../config";
import Breadcrumbs from "../../Breadcrumbs";

const UserInvoice = () => {
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
  const [showMultiWhatsappModal, setShowMultiWhatsappModal] = useState(false);
  const auth = useAuth();
  const email = auth.email || "";
  const [whatsappData, setWhatsappData] = useState({
    to: "",
    message: "",
  });
  const [isDragging, setIsDragging] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);
  const [loadingPlanInfo, setLoadingPlanInfo] = useState(true);
  const navigate = useNavigate();
  const { token, groupId } = useAuth();
  const [selectedOffers, setSelectedOffers] = useState([]);

  // Alert functions
  const showSuccessAlert = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      timer: 3000,
      showConfirmButton: false
    });
  };
  
  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 3000
    });
  };
  
  const showInfoAlert = (message) => {
    Swal.fire({
      icon: 'info',
      title: 'Info',
      text: message,
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Helper function to display API errors
  const showApiError = (error, defaultMessage = "An error occurred") => {
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      defaultMessage;
    Swal.fire({
      icon: "error",
      title: "Error",
      text: errorMessage,
      timer: 3000,
      showConfirmButton: false,
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
      console.log("planInfo:", response.data);

    } catch (error) {
      console.error("Error fetching plan info:", error);

      setPlanInfo({
        status: error.response?.status || "error",
        message: error.response?.data?.message || error.message || "Failed to fetch plan information",
        code: error.code || null,
      });

    } finally {
      setLoadingPlanInfo(false);
    }
  };

  if (token) {
    fetchPlanInfo();
  }
}, [token]);


  // Drag & Drop File Upload Listeners
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

  // Fetch clients when modal opens
  useEffect(() => {
    if (showModal) {
      fetchClients();
    }
  }, [showModal]);

  // Fetch Clients
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
        showInfoAlert("No clients found");
      }
    } catch (error) {
      console.error("Error fetching clients", error);
      showErrorAlert("Failed to fetch clients. Please try again.");
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSelectOffer = async (offerId) => {
    try {
      const response = await axios.post(
        `${config.BASE_URL}/api/agent/offer/selected`,
        { offer_id: offerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message || "Offer selected successfully!",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error selecting offer:", error);
      showApiError(error, "Failed to select offer");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to select offer. Please try again.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  // Handle Files
  const handleFiles = useCallback(
    (files) => {
      if (planInfo?.status === "error") return;
      const selectedFile = files[0];
      if (!selectedFile) return;
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(selectedFile.type)) {
        showErrorAlert("Only JPEG, PNG, and PDF files are allowed.");
        return;
      }
      if (file) {
        showInfoAlert("A file is already uploaded. Please submit the form.");
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

  // Upload File
  const uploadFile = async (selectedFile) => {
    if (!selectedFile) return;
    setUploading(true);
    setFile(selectedFile);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try { 
      const response = await axios.post(
        "https://ocr.ai3dscanning.com/api/file/ ",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data) {
        setResponseData(response.data);
        setFormData(response.data);
        setStep(2);
        showSuccessAlert(`Please Verify the ${selectedFile.name} file data before submitting`);
      }
    } catch (error) {
      console.error("Error uploading file", error);
      showErrorAlert(`${error}`);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Form Change Handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const matchData = {
        ...formData,
        group_id: groupId,
        app_mode: '0',
      };
      const matchResponse = await axios.post(
        "https://ocr.ai3dscanning.com/api/match/ ",
        matchData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSubmittedData(matchResponse.data);
      const invoiceData = {
        ...formData,
        group_id: groupId,
      };
      const invoiceResponse = await axios.post(
        `${config.BASE_URL}/api/agent/invoices`,
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
      const offersData = matchResponse.data.map((item) => ({
        ...item,
        invoice_id: invoiceId,
        group_id: groupId,
      }));
      const offersResponse = await axios.post(
        `${config.BASE_URL}/api/member/offers`,
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
      showSuccessAlert(`${invoiceResponse.data.message}` );
    } catch (error) {
      showErrorAlert(`${error.response.data.message}`);
    }
  };
  const handleSave = async () => {
  try {
    const payload = {
      ...formData,
      group_id: groupId,
    };

    const response = await axios.post(
      `${config.BASE_URL}/api/member/invoices`,
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
    showApiError(error, "Failed to save invoice");
  }
};

  // Render Fields
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

  // CSV Conversion
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

  // Download Functions
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
      showErrorAlert("No data available to download");
      return;
    }
    try {
      const csvContent = convertToCSV(submittedData);
      downloadFile(
        csvContent,
        `invoice_${invoiceId}_data.csv`,
        "text/csv;charset=utf-8;"
      );
      showSuccessAlert("CSV downloaded successfully");
    } catch (error) {
      console.error("Error generating CSV:", error);
      showErrorAlert("Failed to generate CSV file");
    }
  };
  
  const downloadExcel = () => {
    if (
      !submittedData ||
      !Array.isArray(submittedData) ||
      submittedData.length === 0
    ) {
      showErrorAlert("No data available to download");
      return;
    }
    try {
      const csvContent = "\uFEFF" + convertToCSV(submittedData);
      downloadFile(
        csvContent,
        `invoice_${invoiceId}_data.xls`,
        "application/vnd.ms-excel;charset=utf-8;"
      );
      showSuccessAlert("Excel file downloaded successfully");
    } catch (error) {
      console.error("Error generating Excel:", error);
      showErrorAlert("Failed to generate Excel file");
    }
  };

  // Generate PDF
  const generatePDF = (offersToInclude = submittedData) => {
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
      pdf.text("Energy Offers Summary", pageWidth / 2, yOffset, { align: "center" });
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
    
    addHeader();
    
    if (offersToInclude && Array.isArray(offersToInclude)) {
      offersToInclude.forEach((supplier, index) => {
        // Check if we need a new page (leave 40mm at bottom for footer)
        if (yOffset > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yOffset = margin;
          pageNumber++;
          addHeader();
        }
        
        // Supplier card header
        pdf.setFillColor(74, 107, 175);
        pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, 'F');
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
          if (![
            "Supplier Name", 
            "supplierName",
            "user_id",
            "invoice_id",
            "created_at",
            "updated_at",
            "id",
            "commission",
            "Commission"
          ].includes(key) && supplier[key] && typeof supplier[key] !== "object") {
            const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
            
            // Check if we need a new page before adding content
            if (Math.max(column1Y, column2Y) > pdf.internal.pageSize.getHeight() - 20) {
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
        
        // Move yOffset to max of both columns
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
        if (index < offersToInclude.length - 1) {
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
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
    }
    
    pdf.save(`MyBillSmart_Offers_${invoiceId}.pdf`);
  };

  const generatePDFBlob = (offersToInclude = submittedData) => {
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
      pdf.text("Energy Offers Summary", pageWidth / 2, yOffset, { align: "center" });
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
    
    addHeader();
    
    if (offersToInclude && Array.isArray(offersToInclude)) {
      offersToInclude.forEach((supplier, index) => {
        // Check if we need a new page (leave 40mm at bottom for footer)
        if (yOffset > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yOffset = margin;
          pageNumber++;
          addHeader();
        }
        
        // Supplier card header
        pdf.setFillColor(74, 107, 175);
        pdf.rect(margin, yOffset, pageWidth - 2 * margin, 10, 'F');
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
          if (![
            "Supplier Name", 
            "supplierName",
            "user_id",
            "invoice_id",
            "created_at",
            "updated_at",
            "id",
            "commission",
            "Commission"
          ].includes(key) && supplier[key] && typeof supplier[key] !== "object") {
            const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
            
            // Check if we need a new page before adding content
            if (Math.max(column1Y, column2Y) > pdf.internal.pageSize.getHeight() - 20) {
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
        
        // Move yOffset to max of both columns
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
        if (index < offersToInclude.length - 1) {
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
      pdf.text("Thank you for using MyBillSmart", pageWidth / 2, footerY - 5, { align: "center" });
      pdf.text("www.mybillsmart.com", pageWidth / 2, footerY, { align: "center" });
    }
    
    return pdf.output("blob");
  };

  // WhatsApp Handlers
  const handleWhatsappSubmit = async () => {
    if (!whatsappData.to.trim()) {
      showErrorAlert("Phone number is required");
      return;
    }
    const phoneRegex = /^\d{11,}$/;
    const rawPhone = whatsappData.to.replace(/^\+/, "").replace(/\D/g, "");
    
    if (!phoneRegex.test(rawPhone)) {
      showErrorAlert("Please enter a valid phone number (e.g., 923001234567)");
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
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }
      
      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `Invoice_${invoiceId}_Offers.pdf`;
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
        caption: whatsappData.message || "Here are your energy offers from MyBillSmart. Please review the attached PDF for details.",
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

  const handleMultiWhatsappClick = () => {
    setShowMultiWhatsappModal(true);
    setSelectedOffers([]); // Reset selection when opening
  };

  const handleMultiWhatsappModalClose = () => {
    setShowMultiWhatsappModal(false);
    setWhatsappData({ to: "", message: "" });
    setSelectedOffers([]);
  };

  const handleMultiWhatsappSubmit = async () => {
    if (!whatsappData.to.trim()) {
      showErrorAlert("Phone number is required");
      return;
    }
    
    if (selectedOffers.length === 0) {
      showErrorAlert("Please select at least one offer");
      return;
    }
    
    const phoneRegex = /^\d{11,}$/;
    const rawPhone = whatsappData.to.replace(/^\+/, "").replace(/\D/g, "");
    
    if (!phoneRegex.test(rawPhone)) {
      showErrorAlert("Please enter a valid phone number (e.g., 923001234567)");
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
      
      const pdfBlob = generatePDFBlob(selectedOffers);
      if (!pdfBlob) {
        throw new Error("Failed to generate PDF");
      }
      
      const formattedPhone = `${rawPhone}@c.us`;
      const filename = `MyBillSmart_Selected_Offers_${invoiceId}.pdf`;
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
        caption: whatsappData.message || "Here are your selected offers from MyBillSmart. Please review the attached PDF for details.",
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
      
      handleMultiWhatsappModalClose();
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

  const toggleOfferSelection = (offer) => {
    const isSelected = selectedOffers.some((o) => o.id === offer.id);
    
    if (isSelected) {
      setSelectedOffers(selectedOffers.filter((o) => o.id !== offer.id));
    } else {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  // Contract Click Handler
  const handleContractClick = (offer) => {
    navigate("/agent/contract", {
      state: {
        offerData: offer,
        offerId: offer.id,
      },
    });
  };

  // Send Actions
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

  // Modal Handlers
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedClient("");
  };
  
  const handleClientSelect = (e) => {
    setSelectedClient(e.target.value);
  };
  
  const handleModalSubmit = async () => {
    if (!selectedClient) {
      showErrorAlert("Please select a client!");
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
        showSuccessAlert("Email sent successfully!");
      } else if (modalType === "portal") {
        const response = await axios.post(
          `${config.BASE_URL}/api/agent/send/client/portal`,
          {
            client_id: selectedClient,
            invoice_id: invoiceId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.status === 200) {
          showSuccessAlert("Invoice sent to client portal successfully!");
        } else {
          showErrorAlert("Failed to send to client portal");
        }
      }
    } catch (error) {
      console.error("Error sending data", error);
      showErrorAlert("Failed to send. Please try again.");
    }
    handleModalClose();
  };

  // Loading State
  if (loadingPlanInfo) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
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
                <BsExclamationCircle className="text-danger mb-4" style={{ fontSize: "4rem" }} />
                <h2 className="card-title mb-3">Plan Information</h2>
                <p className="card-text mb-4">
                  {planInfo.message || "Your admin needs to purchase a plan to submit invoices."}
                </p>
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
        <Breadcrumbs homePath={"/agent/dashboard"} />
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
        
        {/* Step 1 */}
        {step === 1 && (
          <>
            <h2 className="invoice-upload-heading">Upload your Invoice File</h2>
            <div
              className={`invoice-file-upload-box ${isDragging ? "dragging" : ""}`}
              onClick={() => document.getElementById("file-input").click()}
            >
              <label className="invoice-file-upload-btn">
                <BsCloudUpload className="invoice-upload-icon" />
                <p>{uploading ? "Uploading..." : "Choose / Drop a file here"}</p>
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
        {/* Step 2 */}
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
                 <button
                type="button"
                className="invoice-save-btn"
                onClick={handleSave}
              >
                Save Invoice
              </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Step 3 */}
        {step === 3 && offers.length > 0 && (
          <>
            <div className="text-center container">
              <div className="row">
                <div className="col-12">
                  <h1 className="best-offers-heading mb-0">
                    Here are some best offers for you choose one of them
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
                    {/* <div className="d-flex flex-column gap-2">
                      <button
                        className="invoice-confirmation-btn"
                        onClick={() => handleContractClick(offer)}
                      >
                        Manage Agreement
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => handleSelectOffer(offer.id)}
                      >
                        Select Offer
                      </button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
            <div className="row mt-3 gy-3 w-100 text-center justify-content-center">
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                <button
                  onClick={() => generatePDF()}
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
                {/* <button
                  onClick={handleSendEmail}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                >
                  <BsEnvelope className="me-2" />
                  Send Email
                </button> */}
              </div>
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                {/* <button
                  onClick={handleWhatsappClick}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                >
                  <BsWhatsapp className="me-2" />
                  Send WhatsApp
                </button> */}
              </div>
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                {/* <button
                  onClick={handleMultiWhatsappClick}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                >
                  <BsWhatsapp className="me-2" />
                  Send Selected Offers
                </button> */}
              </div>
              <div className="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                {/* <button
                  onClick={handleSendToClientPortal}
                  className="pdf-btn p-2 rounded-2 text-white border-0 w-100"
                >
                  <IoIosSend className="me-2" />
                  Client Portal
                </button> */}
              </div>
            </div>
          </>
        )}
        
        {/* Modals */}
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
                )}
              </div>
              <div className="modal-footer">
                <button
                  onClick={handleModalClose}
                  className="btn btn-secondary"
                >
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
                    Enter phone number with country code but without + sign<br/>
                    (e.g., 923001234567 for Pakistan)
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
        
        {/* Multi WhatsApp Modal */}
        {showMultiWhatsappModal && (
          <div className="multi-whatsapp-modal-overlay">
            <div className="multi-whatsapp-modal-content">
              <div className="multi-whatsapp-modal-header">
                <h3>Select Offers & Send via WhatsApp</h3>
                <button
                  onClick={handleMultiWhatsappModalClose}
                  className="multi-whatsapp-modal-close-btn"
                >
                  &times;
                </button>
              </div>
              <div className="multi-whatsapp-modal-body">
                <div className="whatsapp-input-group">
                  <label htmlFor="multi-whatsapp-to">Phone Number:</label>
                  <input
                    type="text"
                    id="multi-whatsapp-to"
                    name="to"
                    value={whatsappData.to}
                    onChange={handleWhatsappChange}
                    placeholder="e.g., 923001234567"
                    required
                  />
                  <small className="whatsapp-input-hint">
                    Enter phone number with country code but without + sign<br/>
                    (e.g., 923001234567 for Pakistan)
                  </small>
                </div>
                
                <div className="offers-selection">
                  <h4>Select Offers:</h4>
                  <div className="offers-list">
                    {offers.map((offer) => (
                      <div key={offer.id} className="offer-item">
                        <input
                          type="checkbox"
                          id={`offer-${offer.id}`}
                          checked={selectedOffers.some((o) => o.id === offer.id)}
                          onChange={() => toggleOfferSelection(offer)}
                        />
                        <label htmlFor={`offer-${offer.id}`}>
                          {offer["Supplier Name"] || offer["supplierName"] || `Offer ${offer.id}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="multi-whatsapp-modal-footer">
                <button
                  onClick={handleMultiWhatsappModalClose}
                  className="multi-whatsapp-modal-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMultiWhatsappSubmit}
                  className="multi-whatsapp-modal-send-btn"
                  disabled={!whatsappData.to}
                >
                  <BsWhatsapp className="me-2" />
                  Send Selected Offers
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserInvoice;