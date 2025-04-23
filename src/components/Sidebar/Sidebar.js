import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaFileContract,
  FaUserPlus,
  FaGem,
  FaSignOutAlt,
  FaLink,
} from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
import "./Sidebar.css";
import { RiArrowDropDownLine } from "react-icons/ri";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    // Ensure the Google Translate script is loaded
    if (window.google && window.google.translate) {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,es" },
        "google_translate_element"
      );
    }
  }, []);
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
        <NavLink className="navbar-brand m-0" to="/agent/dashboard">
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
              to="/agent/dashboard"
              activeClassName="active-class"
              exact
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
              to="/agent/invoice"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaFileInvoiceDollar />
              </div>
              <span className="nav-link-text ms-1">Manage Invoice</span>
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
                <FaFileInvoiceDollar />
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
                      to="/agent/invoice"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileInvoiceDollar />
                      </div>
                      <span className="nav-link-text">Manage Invoice</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/agent/invoice-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileInvoiceDollar />
                      </div>
                      <span className="nav-link-text">Invoice List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/contract-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaFileContract />
              </div>
              <span className="nav-link-text ms-1">Contract List</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/invoice-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaFileInvoiceDollar />
              </div>
              <span className="nav-link-text ms-1">Invoice List</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/add-client"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaUserPlus />
              </div>
              <span className="nav-link-text ms-1">Manage Client</span>
            </NavLink>
          </li>
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/submission-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Submission Link</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/refferal-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Refferal Link</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/whatsapp"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">WhatsApp Link</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/goal"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Goal List</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/message"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">View Messages</span>
            </NavLink>
          </li>
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
                <FaLink />
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
                  <li>
                    <NavLink
                      className="nav-link"
                      to="/agent/submission-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">Submission Link</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="nav-link"
                      to="/agent/refferal-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">Refferal Link</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className="nav-link"
                      to="/agent/whatsapp"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text ">WhatsApp Link</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/agent/goal"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">View Goal</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
      <div className="sidenav-footer mx-3">
        <div id="google_translate_element"></div>

        {/* Subscription Button */}
        {/* <Link to="/agent/subscription">
          <button className="btn mt-3 w-100" type="button" id="icon-color">
            <FaGem className="me-2" />
            Subscription
          </button>
        </Link> */}

        {/* LogOut Button */}
        <button
          className="btn w-100 mt-2"
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

export default Sidebar;
