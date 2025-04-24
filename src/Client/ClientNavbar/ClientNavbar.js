import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuth } from "../../contexts/AuthContext";

const ClientNavbar = ({ toggleSidebar }) => {
  const [show, setShow] = useState(false);
  const { name } = useAuth();

  // Function to get user initials
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
      className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
      id="navbarBlur"
      navbar-scroll="true"
    >
      <div className="container-fluid py-1 px-3 d-flex justify-content-between align-items-center">
        <h6 className="font-weight-bolder mb-0 d-none d-lg-block">
          Client Dashboard
        </h6>

        <div className="d-flex align-items-center">
          <Link to="/client/notifications">
            <IoIosNotificationsOutline
              size={30}
              color="#344767"
              className="me-2"
            />
          </Link>
          <div
            className="d-flex align-items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {/* <Link
            to="/client/profile-edit"
            className="d-flex align-items-center text-decoration-none"
          > */}
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
            {/* </Link> */}
            {show && (
              <div
                className=" dropdown-menu show shadow rounded-3 bg-white p-2 border-0"
                style={{ marginTop: "160px", marginLeft: "-5px" }}
              >
                <Link
                  to="/client/profile-edit"
                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                >
                  Profile Setting
                </Link>
                <Link
                  to="/client/session-history"
                  className="dropdown-item rounded-2 py-2 px-3 text-dark hover-bg cursor-pointer text-decoration-none"
                >
                  Session History
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

export default ClientNavbar;
