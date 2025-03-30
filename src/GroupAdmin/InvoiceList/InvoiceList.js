import React, { useState, useEffect } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewTable, setShowNewTable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://34.142.252.64:8080/api/group/invoices", {
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
        setError(error.message);
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
      setError(null);
      
      const [invoiceResponse, offersResponse] = await Promise.all([
        fetch(`http://34.142.252.64:8080/api/group/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`http://34.142.252.64:8080/api/group/invoice/offers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invoice_id: id })
        })
      ]);

      if (!invoiceResponse.ok || !offersResponse.ok) {
        throw new Error("Failed to fetch invoice details or offers");
      }

      const invoiceData = await invoiceResponse.json();
      const offersData = await offersResponse.json();

      setSelectedInvoice(invoiceData.data || invoiceData);
      setOffers(Array.isArray(offersData) ? offersData : 
               Array.isArray(offersData.data) ? offersData.data : 
               offersData.offers || []);
      setShowNewTable(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (!offers || offers.length === 0) {
      return <div className="no-offers">No offers available for this invoice</div>;
    }

    return offers.map((offer, index) => (
      <div key={offer.id || index} className="offer-card">
        <div className="offer-card-header">
          <h3>Offer #{index + 1}</h3>
          {/* <span className="offer-status active">
            Available
          </span> */}
        </div>
        
        <div className="offer-card-body">
          <div className="offer-field">
            <span className="offer-label">Provider:</span>
            <span className="offer-value">{offer.provider_name || "N/A"}</span>
          </div>
          
          <div className="offer-field">
            <span className="offer-label">Product:</span>
            <span className="offer-value">{offer.product_name || "N/A"}</span>
          </div>
          
          <div className="offer-field">
            <span className="offer-label">Savings:</span>
            <span className="offer-value">{offer.saving || "0"}%</span>
          </div>
          
          <div className="offer-field">
            <span className="offer-label">Commission:</span>
            <span className="offer-value">{offer.sales_commission || "0"}%</span>
          </div>
        </div>
      </div>
    ));
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
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">Invoice List</h1>
      
      {showNewTable && selectedInvoice ? (
        <>
          <button 
            className="back-button"
            onClick={() => setShowNewTable(false)}
          >
            Back to List
          </button>
          
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
          
          <h2 className="offers-title">Available Offers</h2>
          <div className="offers-container">
            {renderOfferCards()}
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
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => (
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
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-invoices">
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
    </div>
  );
};

export default InvoiceList;