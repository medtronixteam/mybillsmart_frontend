import React from "react";
import logo from "../../assets/img/logo2.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  MdViewList,
  MdManageAccounts,
  MdPersonAdd,
  MdAddCircle,
  MdListAlt,
  MdMessage,
  MdSchedule,
  MdSettings,
  MdEmail,
} from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  FaFileInvoice,
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
  FaBoxOpen,
  FaBoxes,
  FaBullseye,
  FaListUl,
  FaRedo,
  FaWhatsapp,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./UserSidebar.css";

const UserSidebar = () => {
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
              to="/user/dashboard"
              activeClassName="active-class"
            >
              <div className="icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaHome id="icon" />
              </div>
              <span className="nav-link-text">Dashboard</span>
            </NavLink>
          </li>

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
                      to="/user/user-invoice"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <FaFileUpload />
                      </div>
                      <span className="nav-link-text">Upload Invoice</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/user/invoice-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
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
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseClients"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <MdManageAccounts />
              </div>
              <span className="nav-link-text">Manage Users</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseClients"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/user/add-user"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <MdPersonAdd />
                      </div>
                      <span className="nav-link-text">Add User</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/user/user-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <HiOutlineUserGroup />
                      </div>
                      <span className="nav-link-text">User List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div className="sidenav-footer mx-3 ">
        <div id="google_translate_element"></div>

        <button
          className="btn mt-5 w-100"
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

export default UserSidebar;
