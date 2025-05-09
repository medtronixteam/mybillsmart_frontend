import React from "react";
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
          <img
            src="/assets/img/logo.jpg"
            className="navbar-brand-img w-100"
            alt="main_logo"
          />
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
                      to="/group_admin/admin-invoice"
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
                      to="/group_admin/invoice-list"
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
              data-bs-target="#collapssProducts"
              aria-expanded="false"
              aria-controls="collapseInvoices"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                <FaBoxes />
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
                        <FaBoxOpen />
                      </div>
                      <span className="nav-link-text">Add Product</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/products"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                        <MdViewList />
                      </div>
                      <span className="nav-link-text">Products List</span>
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
              data-bs-target="#collapseUsers"
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
                        <MdPersonAdd />
                      </div>
                      <span className="nav-link-text">Add User</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/user-list"
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
                <FaBullseye />
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
                        <MdAddCircle />
                      </div>
                      <span className="nav-link-text">Create Goal</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/goal-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <MdListAlt />
                      </div>
                      <span className="nav-link-text">Goal List</span>
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
              data-bs-target="#collapseCampaign"
              aria-expanded="false"
              aria-controls="collapseCampaign"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <MdMessage />
              </div>
              <span className="nav-link-text">Manage Campaign</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseCampaign"
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
                        <MdSchedule />
                      </div>
                      <span className="nav-link-text">Schedule Campaign</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/message-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaListUl />
                      </div>
                      <span className="nav-link-text">Campaign List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* <li className="nav-item">
            <NavLink
              className="accordion-button sidebar-accordion bg-transparent shadow-none d-flex align-items-center collapsed nav-link"
              style={{ color: " #67748e" }}
              data-bs-toggle="collapse"
              data-bs-target="#collapseAgreement"
              aria-expanded="false"
              aria-controls="collapseAgreement"
            >
              <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center  d-flex align-items-center justify-content-center">
                <FaFileContract />
              </div>
              <span className="nav-link-text">Manage Agreement</span>
              <RiArrowDropDownLine size={30} />
            </NavLink>
            <div
              id="collapseAgreement"
              className="accordion-collapse collapse"
              aria-labelledby="headingInvoices"
              data-bs-parent="#sidebarAccordion"
            >
              <div className="accordion-body py-0">
                <ul className="list-unstyled">
                  <li>
                    <NavLink
                      to="/group_admin/agrement"
                      className="nav-link"
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <FaFileContract />
                      </div>
                      <span className="nav-link-text">Create Agreement</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/group_admin/agrement-list"
                      className="nav-link "
                      activeClassName="active-class"
                    >
                      <div className="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center">
                        <MdListAlt />
                      </div>
                      <span className="nav-link-text">Agreement List</span>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
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
                <MdSettings />
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
                        <MdEmail />
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
                        <FaRedo />
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
                        <FaWhatsapp />
                      </div>
                      <span className="nav-link-text">WhatsApp Link</span>
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
