import React from "react";
import team1 from "../../assets/img/team-2.jpg";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const ClientNavbar= ({ toggleSidebar }) => {
  return (
    <nav
      className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
      id="navbarBlur"
      navbar-scroll="true">
      <div className="container-fluid py-1 px-3 d-flex justify-content-between align-items-center">
        <h6 className="font-weight-bolder mb-0 d-none d-lg-block">
          Client Dashboard
        </h6>
 
        <div className="d-flex align-items-center gap-2">
          <Link
            to="/client/profile-edit"
            className="d-flex align-items-center text-decoration-none">
            <img
              src={team1}
              alt="User Profile"
              className="avatar avatar-sm"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            />
            <span className="ms-2 text-sm font-weight-bold text-dark">
              John Doe
            </span>
          </Link>
        </div>

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

export default ClientNavbar;
