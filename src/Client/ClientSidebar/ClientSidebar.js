import React from "react";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaGem,
  FaHome,
  FaTable,
  FaCreditCard,
  FaCube,
  FaCog,
  FaUser,
  FaSignInAlt,
  FaFileUpload,
  FaFileInvoice,
  FaListAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";

import "./ClientSidebar.css";

const ClientSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
  };
  return (
    <div>
      <div className="sidenav-header">
        <i
          className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
          aria-hidden="true"
          id="iconSidenav"
        />
        <NavLink className="navbar-brand m-0" to="/client/dashboard">
          <img src={logo} className="navbar-brand-img w-100" alt="main_logo" />
          {/* <span className="ms-1 font-weight-bold">MyBillSmart</span> */}
        </NavLink>
      </div>
      <hr className="horizontal dark mt-0" />
      <div
        className="collapse navbar-collapse overflow-hidden h-100"
        id="sidenav-collapse-main"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/client/dashboard"
              activeClassName="active-class"
            >
              <div className="icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaHome id="icon" />
              </div>
              <span className="nav-link-text ms-1">Dashboard</span>
            </NavLink>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/client/contract-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCube />
              </div>
              <span className="nav-link-text ms-1">Agreement List</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/client/client-invoice"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCreditCard />
              </div>
              <span className="nav-link-text ms-1">Invoice</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseInvoices"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                 <FaFileInvoice />
              </div>
              <span className="nav-link-text">Manage Invoices</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseInvoices"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/client/client-invoice"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Upload Invoice</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/invoice-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaListAlt />
                      </div>
                      <span className="nav-link-text">Invoice List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/client/contract-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCube />
              </div>
              <span className="nav-link-text ms-1">Agreement List</span>
            </NavLink>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/invoice-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCreditCard />
              </div>
              <span className="nav-link-text ms-1">Invoice List</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/client-contract-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCube />
              </div>
              <span className="nav-link-text ms-1">Client Contract List</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
        <div
          className="card card-background shadow-none card-background-mask-secondary"
          id="sidenavCard"
        >
          <div
            className="full-background"
            style={{
              backgroundImage: `url(${whiteCurvedImage})`,
            }}
          />
        </div>
        <Link to="/client/subscription">
          <button className="btn mt-5 w-100" type="button" id="icon-color">
            <FaGem className="me-2" />
            Subscription
          </button>
        </Link>
        {/* LogOut Button - On Click, it triggers handleLogout function */}
        <button
          className="btn mt-1 w-100"
          type="button"
          onClick={handleLogout}
          id="icon-color"
        >
          LogOut
        </button>
      </div>
    </div>
  );
};

export default ClientSidebar;
