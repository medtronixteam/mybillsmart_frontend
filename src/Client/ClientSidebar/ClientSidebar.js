import React from "react";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import { useNavigate } from "react-router-dom"; 
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
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
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
        className="collapse navbar-collapse w-auto max-height-vh-100 h-100"
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

          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/client/contract-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaCube />
              </div>
              <span className="nav-link-text ms-1">Contract List</span>
            </NavLink>
          </li>
          <li className="nav-item">
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
        {/* LogOut Button - On Click, it triggers handleLogout function */}
        <button
          className="btn mt-4 w-100"
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
