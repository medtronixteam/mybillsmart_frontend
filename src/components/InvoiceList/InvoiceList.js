import React, { useState, useEffect } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewTable, setShowNewTable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [itemsPerPage] = useState(10); // Number of items per page
  const { token } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://34.142.252.64:8080/api/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Invoices API Response:", data);
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }
    };

    fetchInvoices();
  }, [token]);

  // Fetch invoice details and offers
  const fetchInvoiceDetails = async (id) => {
    try {
      const invoiceResponse = await fetch(
        `http://34.142.252.64:8080/api/invoices/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const invoiceData = await invoiceResponse.json();
      console.log("Selected Invoice API Response:", invoiceData);
      setSelectedInvoice(invoiceData.data);

      const offersResponse = await fetch(
        `http://34.142.252.64:8080/api/offers?invoice_id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const offersData = await offersResponse.json();
      console.log("Offers API Response:", offersData);
      setOffers(offersData);

      setShowNewTable(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Filter and format the selected invoice data
  const getFilteredInvoiceData = (invoice) => {
    if (!invoice) return [];

    const excludedFields = ["id", "created_at", "updated_at", "agent_id"];

    const filteredData = Object.entries(invoice).filter(
      ([key, value]) => !excludedFields.includes(key) && value !== null && value !== ""
    );

    if (invoice.bill_info) {
      const filteredBillInfo = Object.entries(invoice.bill_info).filter(
        ([key, value]) => key !== "taxes" && value !== null && value !== ""
      );
      filteredData.push(...filteredBillInfo);
    }

    return filteredData;
  };

  const renderOfferCards = () => {
    if (!offers.length) return <p>No offers available.</p>;

    return offers.map((offer) => (
      <div key={offer.id} className="offer-card">
        <h3>Offer Details</h3>
        {Object.entries(offer).map(([key, value]) => {
          if (["id", "created_at", "updated_at"].includes(key)) return null;
          return (
            <p key={key}>
              <strong>{key}:</strong> {value || "N/A"}
            </p>
          );
        })}
      </div>
    ));
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">Invoice List</h1>
      {showNewTable && selectedInvoice ? (
        <>
          <div className="table-responsive">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-table-header">Field</th>
                  <th className="invoice-table-header">Value</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredInvoiceData(selectedInvoice).map(([key, value]) => (
                  <tr key={key}>
                    <td className="invoice-table-cell">{key}</td>
                    <td className="invoice-table-cell">
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : value || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h1 className="text-center pt-3 mb-0">Offer List</h1>
          <div className="offer-list container">
            <div className="row justify-content-center">
              {renderOfferCards()}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="table-responsive">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-table-header">Invoice ID</th>
                  <th className="invoice-table-header">Bill Type</th>
                  <th className="invoice-table-header">Address</th>
                  <th className="invoice-table-header">Billing Period</th>
                  <th className="invoice-table-header">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-table-cell">{invoice.id}</td>
                    <td className="invoice-table-cell">{invoice.bill_type}</td>
                    <td className="invoice-table-cell">{invoice.address}</td>
                    <td className="invoice-table-cell">{invoice.billing_period}</td>
                    <td className="invoice-table-cell">
                      <button
                        className="view-invoice-btn"
                        onClick={() => fetchInvoiceDetails(invoice.id)}
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="current-page">{currentPage}</span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceList;