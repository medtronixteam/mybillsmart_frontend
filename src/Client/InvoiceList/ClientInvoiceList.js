import React, { useState, useEffect } from "react";
import "./ClientInvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { HiDotsHorizontal } from "react-icons/hi";
import Breadcrumbs from "../../Breadcrumbs";

const ClientInvoiceList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewTable, setShowNewTable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 New state for search term

  const { token } = useAuth();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.BASE_URL}/api/client/invoices`, {
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
        } else {
          throw new Error("Unexpected API response format");
        }
        setInvoices(invoiceList);
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

  // 🔍 Apply filter on all invoices
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.bill_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.billing_period?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Pagination logic based on filtered list
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchInvoiceDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const [invoiceResponse, offersResponse] = await Promise.all([
        fetch(`${config.BASE_URL}/api/client/invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${config.BASE_URL}/api/agent/invoice/offers`, {
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
      setError(error.message);
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
              <div className="detail-value">{formatValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOfferCards = () => {
    if (!offers || offers.length === 0) {
      return (
        <div className="no-offers d-none">
          No offers available for this invoice
        </div>
      );
    }
    return (
      <div className="offers-section d-none">
        <h2 className="offers-title">Available Offers</h2>
        <div className="offers-grid">
          {offers.map((offer, index) => (
            <div key={offer.id || index} className="offer-card">
              <div className="offer-card-header">
                <h3>Offer #{index + 1}</h3>
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
                  <span className="offer-value">
                    {offer.saving || "0"}%
                  </span>
                </div>
                <div className="offer-field">
                  <span className="offer-label">Commission:</span>
                  <span className="offer-value">
                    {offer.sales_commission || "0"}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
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

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="invoice-list-container">
      <Breadcrumbs homePath={"/client/dashboard"} />

      {/* 🔍 Search Input */}
      <div className="d-flex justify-content-center align-items-center mb-3">
        <input
          type="text"
          placeholder="Search by Bill Type, Address or Billing Period"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control w-50"
        />
      </div>

      <h1 className="text-center mb-0">Invoice List</h1>

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
                  <th className="invoice-table-header">Invoice ID</th>
                  <th className="invoice-table-header">Bill Type</th>
                  <th className="invoice-table-header">Address</th>
                  <th className="invoice-table-header">Billing Period</th>
                  <th className="invoice-table-header d-none">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice, index) => (
                    <tr key={invoice.id}>
                      <td className="invoice-table-cell">{invoice.id}</td>
                      <td className="invoice-table-cell">
                        {invoice.bill_type}
                      </td>
                      <td className="invoice-table-cell">{invoice.address}</td>
                      <td className="invoice-table-cell">
                        {invoice.billing_period}
                      </td>
                      <td className="invoice-table-cell d-none">
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
                                setActiveDropdown(null);
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
            <div className="pagination justify-content-center mt-3">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button btn btn-outline-primary me-2"
              >
                Previous
              </button>
              <span className="page-info me-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button btn btn-outline-primary"
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

export default ClientInvoiceList;