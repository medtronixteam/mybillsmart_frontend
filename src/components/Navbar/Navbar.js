import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react"; 
import { IoIosNotificationsOutline } from "react-icons/io";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = ({ toggleSidebar }) => {
  const { name } = useAuth();

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };  

  return (
    <nav
      className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
      id="navbarBlur"
      navbar-scroll="true">
      <div className="container-fluid py-1 px-3 d-flex justify-content-between align-items-center">
        <h6 className="font-weight-bolder mb-0 d-none d-lg-block">
          Sale Agent Dashboard
        </h6>

        <div className="d-flex align-items-center gap-2">
          <Link to="/agent/notifications">
            <IoIosNotificationsOutline size={30} color="#344767" />
          </Link> 
          <Link
            to="/agent/profile-edit"
            className="d-flex align-items-center text-decoration-none">
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
                fontWeight: "bold"
              }}
            >
              {getInitials(name)}
            </div>
            <span className="ms-2 text-sm font-weight-bold text-dark">
              {name || "User"}
            </span>
          </Link>
        </div>

        {/* Right Side: Transparent Menu Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleSidebar}
          style={{ backgroundColor: "transparent" }}>
          <Menu size={24} color="black" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;