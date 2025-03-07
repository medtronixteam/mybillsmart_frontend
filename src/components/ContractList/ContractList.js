import React from "react";
import "./ContractList.css";

const ContractList = () => {
  const contracts = [
    {
      clientName: "John Doe",
      contractedProvider: "Provider A",
      contractedRate: "$1000/month",
      closureDate: "2025-05-30",
      status: "Pending",
    },
    {
      clientName: "Alice Smith",
      contractedProvider: "Provider B",
      contractedRate: "$1500/month",
      closureDate: "2025-06-15",
      status: "Confirmed",
    },
    {
      clientName: "Bob Johnson",
      contractedProvider: "Provider C",
      contractedRate: "$1200/month",
      closureDate: "2025-07-20",
      status: "Rejected",
    },
  ];

  return (
    <div className="contract-list-container">
      <h1>Contract List</h1>
      <div className="table-responsive">
        <table className="contract-table">
          <thead>
            <tr>
              <th className="contract-table-header">Client Name</th>
              <th className="contract-table-header">Contracted Provider</th>
              <th className="contract-table-header">Contracted Rate</th>
              <th className="contract-table-header">Closure Date</th>
              <th className="contract-table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={index} className="contract-table-row">
                <td className="contract-table-cell">{contract.clientName}</td>
                <td className="contract-table-cell">
                  {contract.contractedProvider}
                </td>
                <td className="contract-table-cell">
                  {contract.contractedRate}
                </td>
                <td className="contract-table-cell">{contract.closureDate}</td>
                <td className="contract-table-cell">
                  <button
                    className={`w-100 status-button status-${contract.status.toLowerCase()}`}
                  >
                    {contract.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractList;
