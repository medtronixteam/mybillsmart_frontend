import React from "react";
import logo from "../../assets/img/logo2.png";
import whiteCurvedImage from "../../assets/img/curved-images/white-curved.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  FaHome,
  FaUserPlus,
  FaUsers,
  FaFileInvoiceDollar,
  FaFileContract,
  FaLink,
  FaGem,
  FaSignOutAlt,
  FaFileUpload,
  FaListAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./GroupAdminSidebar.css";

const GroupAdminSidebar = () => {
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
        <NavLink className="navbar-brand m-0" to="/group_admin/dashboard">
          <img src={logo} className="navbar-brand-img w-100" alt="main_logo" />
        </NavLink>
      </div>
      <hr className="horizontal dark mt-0" />
      <div
        className="collapse navbar-collapse w-auto h-100 overflow-hidden"
        id="sidenav-collapse-main"
      >
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/dashboard"
              activeClassName="active-class"
            >
              <div className="icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaHome id="icon" />
              </div>
              <span className="nav-link-text">Dashboard</span>
            </NavLink>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/admin-invoice"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text ms-1">Manage Invoices</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            {/* <div className="accordion" id="sidebarAccordion"> */}
            {/* <div className="accordion-item border-0 bg-transparent"> */}
            {/* Toggle Button */}
            {/* <h2 className="accordion-header" id="headingInvoices"> */}
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseInvoices"
              aria-expanded="false"
              aria-controls="collapseInvoices"
              // activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text">Manage Invoices</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            {/* </h2> */}

            {/* Accordion Content */}
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
                      to="/group_admin/admin-invoice"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Manage Invoice</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/invoice-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Invoice List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
            {/* </div> */}
            {/* </div> */}
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/invoice-list"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaListAlt /> 
              </div>
              <span className="nav-link-text ms-1">Invoice List</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/add-product"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text ms-1">Manage Products</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapssProducts"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text">Manage Products</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapssProducts"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/group_admin/add-product"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Manage Product</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/products"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Products List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/add-user"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaUserPlus />
              </div>
              <span className="nav-link-text ms-1">Manage User</span>
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
                <FaFileUpload />
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
                      to="/group_admin/add-user"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Manage User</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/user-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
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
              to="/group_admin/client-contract-list"
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
              to="/group_admin/submission-link"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Submission Link</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/points-update"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Points Update</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/whatsapp"
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
              to="/group_admin/manage-goal"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Manage Goal</span>
            </NavLink>
          </li> */}

          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapgoals"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text">Manage Goals</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapgoals"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/group_admin/manage-goal"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Manage Goal</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/goal-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Goal List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/user-performance"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">User Performance</span>
            </NavLink>
          </li> */}
          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/schedule-message"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Schedule Message</span>
            </NavLink>
          </li> */}
          <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseMessages"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <FaFileUpload />
              </div>
              <span className="nav-link-text">Manage Messages</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseMessages"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/group_admin/schedule-message"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Schedule Message</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/message-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Message List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
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
                <FaFileUpload />
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
                      to="/group_admin/submission-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">Submission Link</span>
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/group_admin/points-update"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">Points Update</span>
                    </NavLink>
                  </li>

                  <li className="nav-item">
                    <NavLink
                      className="nav-link"
                      to="/group_admin/whatsapp"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaLink />
                      </div>
                      <span className="nav-link-text">WhatsApp Link</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="nav-link"
              to="/group_admin/session-history"
              activeClassName="active-class"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center me-2 d-flex align-items-center justify-content-center">
                <FaLink />
              </div>
              <span className="nav-link-text ms-1">Login History</span>
            </NavLink>
          </li> */}
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
        <div id="google_translate_element"></div>
        <Link to="/group_admin/subscription">
          <button className="btn mt-4 w-100" type="button" id="icon-color">
            <FaGem className="me-2" />
            Subscription
          </button>
        </Link>
        <button
          className="btn mt-1 w-100"
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

export default GroupAdminSidebar;
