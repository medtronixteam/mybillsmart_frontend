import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = ({ homePath }) => {
  const location = useLocation();

  // List of folders/directories you want to ignore in breadcrumb
  const ignoreList = ["client", "group_admin", "supervisor", "user", "agent"];

  // Split path and filter out folders
  const paths = location.pathname
    .split("/")
    .filter((path) => path && !ignoreList.includes(path));

  return (
    <nav aria-label="breadcrumb">
      <ol className="d-flex list-unstyled mb-0">
        <li>
          <Link to={homePath}>Home</Link>
          {paths.length > 0 && <span className="mx-2">/</span>}
        </li>
        {paths.map((path, index) => {
          const fullPath = "/" + paths.slice(0, index + 1).join("/");
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1); // Capitalize

          return (
            <li key={fullPath}>
              {!isLast ? (
                <>
                  <Link to={fullPath}>{formattedPath}</Link>
                  <span className="mx-2">/</span>
                </>
              ) : (
                <span>{formattedPath}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
