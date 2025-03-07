import React, { useEffect, useState } from "react";
import "./InvoiceList.css";
import { useAuth } from "../../contexts/AuthContext";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetch("http://34.142.252.64:8080/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setInvoices(data))
      .catch((error) => {
        console.error("There was an error fetching the invoice list!", error);
      });
  }, [token]);

  const handleViewInvoice = (id) => {
    fetch(`http://34.142.252.64:8080/api/invoices/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setSelectedInvoice(data))
      .catch((error) => {
        console.error("There was an error fetching the single invoice!", error);
      });
  };

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">Invoice List</h1>
      <div className="table-responsive">
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="invoice-table-header">Invoice ID</th>
              <th className="invoice-table-header">Bill Type</th>
              <th className="invoice-table-header">Address</th>
              <th className="invoice-table-header">Billing Period</th>
              <th className="invoice-table-header">Total Consumption</th>
              <th className="invoice-table-header">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="invoice-table-cell">{invoice.id}</td>
                <td className="invoice-table-cell">{invoice.billType}</td>
                <td className="invoice-table-cell">{invoice.address}</td>
                <td className="invoice-table-cell">{invoice.billingPeriod}</td>
                <td className="invoice-table-cell">
                  {invoice.totalConsumption}
                </td>
                <td className="invoice-table-cell">
                  <button
                    className="view-invoice-btn"
                    onClick={() => handleViewInvoice(invoice.id)}
                  >
                    View Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="invoice-details">
          <h2 className="invoice-details-title">Invoice Details</h2>
          <p className="invoice-details-item">
            <strong>Invoice ID:</strong> {selectedInvoice.id}
          </p>
          <p className="invoice-details-item">
            <strong>Bill Type:</strong> {selectedInvoice.billType}
          </p>
          <p className="invoice-details-item">
            <strong>Address:</strong> {selectedInvoice.address}
          </p>
          <p className="invoice-details-item">
            <strong>Billing Period:</strong> {selectedInvoice.billingPeriod}
          </p>
          <p className="invoice-details-item">
            <strong>Total Consumption:</strong>{" "}
            {selectedInvoice.totalConsumption}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
