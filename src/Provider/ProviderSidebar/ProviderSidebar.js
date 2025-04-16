import React from "react";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHome,
  FaBoxes,
  FaPlusCircle,
  FaUserPlus,
  FaUsers,
  FaLink,
  FaGem,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./ProviderSidebar.css";

const ProviderSidebar = () => {
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
        <NavLink className="navbar-brand m-0" to="/supervisor/dashboard">
          <img src={logo} className="navbar-brand-img w-100" alt="main_logo" />
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
              to="/supervisor/dashboard"
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
              to="/supervisor/product-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaBoxes />
              </div>
              <span className="nav-link-text ms-1">Product List</span>
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/add-product"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaPlusCircle />
              </div>
              <span className="nav-link-text ms-1">Add Product</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/add-client"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaUserPlus />
              </div>
              <span className="nav-link-text ms-1">Add User</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/client-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaUsers />
              </div>
              <span className="nav-link-text ms-1">User List</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/submission-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Submission Link</span>
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/whatsapp"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">WhatsApp Link</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/refferal-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Refferal Link</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
      <div id="google_translate_element">
        
        </div>
        <Link to="/supervisor/subscription">
          <button className="btn mt-4 w-100" type="button" id="icon-color">
            <FaGem className="me-2" />
            Subscription
          </button>
        </Link>
        <button
          className="btn w-100"
          type="button"
          onClick={handleLogout}
          id="icon-color"
        >
          <FaSignOutAlt className="me-2" />
          LogOut
        </button>
      </div>
    </div>
  );
};

export default ProviderSidebar;
