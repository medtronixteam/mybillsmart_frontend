import React, { useState } from "react";
import "./InvoiceList.css";

const InvoiceList = () => {
  const [showNewTable, setShowNewTable] = useState(false);

  const handleActionClick = () => {
    setShowNewTable(true);
  };

  return (
    <div className="invoice-list-container">
      <h1 className="invoice-list-title">Invoice List</h1>
      {showNewTable ? (
        <>
          <div className="table-responsive">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-table-header">New Invoice ID</th>
                  <th className="invoice-table-header">New Bill Type</th>
                  <th className="invoice-table-header">New Address</th>
                  <th className="invoice-table-header">New Billing Period</th>
                  <th className="invoice-table-header">
                    New Total Consumption
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="invoice-table-cell">101</td>
                  <td className="invoice-table-cell">Electric</td>
                  <td className="invoice-table-cell">Lahore</td>
                  <td className="invoice-table-cell">April</td>
                  <td className="invoice-table-cell">50%</td>
                </tr>
                <tr>
                  <td className="invoice-table-cell">102</td>
                  <td className="invoice-table-cell">Water</td>
                  <td className="invoice-table-cell">Karachi</td>
                  <td className="invoice-table-cell">April</td>
                  <td className="invoice-table-cell">30%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h1 className="text-center pt-3 mb-0">Offer List</h1>
          <div className="invoice-list container">
            <div className="row justify-content-center">
              <div className="col-xl-4 col-lg-6">
                <div className="invoice-card h-100">
                  <h3 className="invoice-confirmation-heading"></h3>
                  <p>
                    <strong>Provider_name:</strong> NATURGY
                  </p>
                  <p>
                    <strong>Product_name:</strong> Naturgy Business Standard
                  </p>
                  <p>
                    <strong>Sales_commission:</strong> 3.1
                  </p>
                  <p>
                    <strong>Saving %:</strong> 32
                  </p>
                  <button className="invoice-confirmation-btn">
                    Manage Contract
                  </button>
                </div>
              </div>
              <div className="col-xl-4 col-lg-6">
                <div className="invoice-card h-100">
                  <h3 className="invoice-confirmation-heading"></h3>
                  <p>
                    <strong>Provider_name:</strong> GANA ENERGIA
                  </p>
                  <p>
                    <strong>Product_name:</strong> Gana Business Flexible
                  </p>
                  <p>
                    <strong>Sales_commission:</strong> 2.5
                  </p>
                  <p>
                    <strong>Saving %:</strong> 39
                  </p>
                  <button className="invoice-confirmation-btn">
                    Manage Contract
                  </button>
                </div>
              </div>
              <div className="col-xl-4 col-lg-6">
                <div className="invoice-card h-100">
                  <h3 className="invoice-confirmation-heading"></h3>
                  <p>
                    <strong>Provider_name:</strong> ENDESA
                  </p>
                  <p>
                    <strong>Product_name:</strong> Endesa High Demand
                  </p>
                  <p>
                    <strong>Sales_commission:</strong> 3.8
                  </p>
                  <p>
                    <strong>Saving %:</strong> 32
                  </p>
                  <button className="invoice-confirmation-btn">
                    Manage Contract
                  </button>
                </div>
              </div>
              <div className="col-xl-4 col-lg-6">
                <div className="invoice-card h-100">
                  <h3 className="invoice-confirmation-heading"></h3>
                  <p>
                    <strong>Provider_name:</strong> GANA ENERGIA
                  </p>
                  <p>
                    <strong>Product_name:</strong> Gana Business Flexible
                  </p>
                  <p>
                    <strong>Sales_commission:</strong> 2.5
                  </p>
                  <p>
                    <strong>Saving %:</strong> 39
                  </p>
                  <button className="invoice-confirmation-btn">
                    Manage Contract
                  </button>
                </div>
              </div>
              <div className="col-xl-4 col-lg-6">
                <div className="invoice-card h-100">
                  <h3 className="invoice-confirmation-heading"></h3>
                  <p>
                    <strong>Provider_name:</strong> ENDESA
                  </p>
                  <p>
                    <strong>Product_name:</strong> Endesa High Demand
                  </p>
                  <p>
                    <strong>Sales_commission:</strong> 3.8
                  </p>
                  <p>
                    <strong>Saving %:</strong> 32
                  </p>
                  <button className="invoice-confirmation-btn">
                    Manage Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
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
              {[1, 2, 3].map((id) => (
                <tr key={id}>
                  <td className="invoice-table-cell">{id}</td>
                  <td className="invoice-table-cell">200</td>
                  <td className="invoice-table-cell">Sahiwal</td>
                  <td className="invoice-table-cell">March</td>
                  <td className="invoice-table-cell">20%</td>
                  <td className="invoice-table-cell">
                    <button
                      className="view-invoice-btn"
                      onClick={handleActionClick}
                    >
                      Action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
