import React from "react";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";

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
        className="collapse navbar-collapse w-auto overflow-hidden h-100"
        id="sidenav-collapse-main"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/dashboard"
              activeClassName="active-class"
            >
              <div className="icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <FaHome id="icon" />
              </div>
              <span className="nav-link-text ">Dashboard</span>
            </NavLink>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/add-product"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaBoxes />
              </div>
              <span className="nav-link-text ms-1">Manage Products</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseProducts"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <FaBoxes />
              </div>
              <span className="nav-link-text ">Manage Products</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseProducts"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/supervisor/add-product"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaBoxes />
                      </div>
                      <span className="nav-link-text ">Add Product</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/supervisor/product-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaBoxes />
                      </div>
                      <span className="nav-link-text">Product List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
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
          {/* <li className="nav-item">
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
          </li> */}

          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseUsers"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaBoxes />
              </div>
              <span className="nav-link-text">Manage Users</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseUsers"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/supervisor/add-client"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaBoxes />
                      </div>
                      <span className="nav-link-text">Add User</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/supervisor/client-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaBoxes />
                      </div>
                      <span className="nav-link-text">User List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
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
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/submission-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text">Submission Link</span>
            </NavLink>
          </li> */}

          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseSettings"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaBoxes />
              </div>
              <span className="nav-link-text">Settings</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseSettings"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/supervisor/submission-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">Submission Link</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/message"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text">Message List</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/goal"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text">Goal List</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/supervisor/session-history"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Session History</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
        <div id="google_translate_element"></div>
        {/* <Link to="/supervisor/subscription">
          <button className="btn mt-4 w-100" type="button" id="icon-color">
            <FaGem className="me-2" />
            Subscription
          </button>
        </Link> */}
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
