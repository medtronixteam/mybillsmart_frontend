import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <nav>
      <ol className="d-flex list-unstyled">
        <li>
          <Link to="/">Home</Link>
          {paths.length > 0 && " / "}
        </li>
        {paths.map((path, index) => {
          const fullPath = "/" + paths.slice(0, index + 1).join("/");
          const isLast = index === paths.length - 1;
          return (
            <li key={fullPath}>
              {!isLast ? (
                <>
                  <Link to={fullPath}>{path}</Link> /
                </>
              ) : (
                <span>{path}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
