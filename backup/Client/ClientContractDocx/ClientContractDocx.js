import React from "react";
import "./ClientContractDocx.css";

const ClientContractDocx = () => {
  return (
    <div className="client-contract-docx-container container">
      <h1>Client Contract Docx</h1>
      <form className="row">
        <div className="col-lg-6">
          <label className="form-label m-0" htmlFor="cnic">
            Upload Card/NIE (Front & Back)
          </label>
          <input
            id="cnic" 
            type="file"
            accept="image/*,.pdf"
            multiple
            className="border rounded form-control w-100"
          />
        </div>
        <div className="col-lg-6">
          <label
            className="form-label m-0"
            htmlFor="differentiation"
          >
            Differentiation between
          </label>
          <select className="form-select w-100" id="differentiation">
            {/* <option value="">Differentiation</option> */}
            <option value="Individual">Individual</option>
            <option value="Company">Company</option>
          </select>
        </div>
        <div className="col-lg-6">
          <label className="form-label m-0" htmlFor="bank_receipt">
            Upload Bank Receipt
          </label>
          <input
            id="bank_receipt"
            type="file"
            accept="image/*,.pdf"
            className="border rounded form-control w-100"
          />
        </div>
        <div className="col-lg-6">
          <label
            className="form-label m-0"
            htmlFor="last_service_invoice"
          >
            Upload Last Service Invoice
          </label>
          <input
            id="last_service_invoice"
            type="file"
            accept="image/*,.pdf"
            className="border rounded form-control w-100"
          />
        </div>
        <div className="col-lg-6">
          <label
            className="form-label m-0"
            htmlFor="lease_agreement"
          >
            Upload Lease Agreement (if applicable)
          </label>
          <input
            id="lease_agreement"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="border rounded form-control w-100"
          />
        </div>
        <div className="col-lg-6">
       
        </div>
        <button type="submit" className="btn btn-primary  ">
            Submit
          </button>
      </form>
    </div>
  );
};

export default ClientContractDocx;
