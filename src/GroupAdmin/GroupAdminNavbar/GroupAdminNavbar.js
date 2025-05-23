import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import config from "../../config";
import { RiArrowDropDownLine } from "react-icons/ri";
const GroupAdminNavbar = ({ toggleSidebar }) => {
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { name, token } = useAuth();
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: `${config.BASE_URL}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchNotifications = async () => {
    try {
      // setLoading(true);
      const response = await api.get("/api/notifications");
      if (response.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          navigate("/login");
          return;
          }
    
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    } finally {
    }
  };
  useEffect(() => {
    fetchNotifications();
  }, []);
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };
  const toggleDropdown = () => {
    setShow(!show);
  };

  return (
    <nav
      className="navbar navbar-main navbar-expand-lg px-0 m-3 shadow-none border-radius-xl"
      id="navbarBlur"
      navbar-scroll="true"
    >
      <div className="container-fluid py-1 px-3 d-flex justify-content-between align-items-center">
        <h6 className="font-weight-bolder mb-0 d-none d-lg-block">
          Group Admin Dashboard
        </h6>
        <div className="d-flex align-items-center drop_menu_responsive gap-2">
          <Link to="/group_admin/notifications" className="position-relative">
            <IoIosNotificationsOutline
              size={30}
              color="#344767"
              className="me-1"
            />
            <span
              className="badge bg-danger rounded-pill px-2 py-1 position-absolute d-block"
              width="20"
              height="20"
              style={{ top: "-5px", right: "0" }}
            >
              {notifications.length > 0 ? notifications.length : 0}
            </span>
          </Link>
          <div
            className="d-flex align-items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {/* <Link
            to="/group_admin/profile-edit"
            className="d-flex align-items-center text-decoration-none"> */}
            <div
              className="avatar avatar-sm d-flex align-items-center justify-content-center"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                cursor: "pointer",
                backgroundColor: "#344767",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {getInitials(name)}
            </div>
            <span className=" text-sm font-weight-bold text-dark">
              {name || "User"}
            </span>
            <RiArrowDropDownLine size={30} />
            {/* </Link> */}
            {show && (
              <div
                className="position-absolute dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                style={{ top: "65px", right: "0px" }}
              >
                <Link
                  to="/group_admin/profile-edit"
                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                >
                  Profile Setting
                </Link>
                <Link
                  to="/group_admin/subscription-order"
                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                >
                  Order History
                </Link>
                <Link
                  to="/group_admin/company-details"
                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                >
                  Company Details
                </Link>
              </div>
            )}
          </div>
        </div>
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleSidebar}
          style={{ backgroundColor: "transparent" }}
        >
          <Menu size={24} color="black" />
        </button>
      </div>
    </nav>
  );
};

export default GroupAdminNavbar;
