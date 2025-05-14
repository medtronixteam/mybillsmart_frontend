import React, { useState, useEffect } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";
import config from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaCheck, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import Breadcrumbs from "../../Breadcrumbs";

const InvoiceList = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewTable, setShowNewTable] = useState(false);
  const [offers, setOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const toggleDropdown = (index) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.BASE_URL}/api/agent/invoices`, {
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
        fetch(`${config.BASE_URL}/api/agent/invoices/${id}`, {
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
    navigate(`/agent/agents-contract-form?offer_id=${offerId}`);
  };

  const renderOfferStatus = (status) => {
    return status === 1 ? (
      <span className="offer-selected-yes">
        <span class="badge bg-info text-dark">Yes</span>
      </span>
    ) : (
      <span className="offer-selected-no">
        <span class="badge bg-warning text-dark">No</span>
      </span>
    );
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
        <div class="spinner-border" role="status" style={{ color: "#3598db" }}>
          <span class="visually-hidden">Loading...</span>
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
          to="/agent/contract-list"
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
                  {/* <th className="invoice-table-header">Agreement</th> */}
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
                      {/* <td className="invoice-table-cell">
                        {invoice.agreement}
                      </td> */}
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
    </div>
  );
};

export default InvoiceList;
