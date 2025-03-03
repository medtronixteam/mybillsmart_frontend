import React from "react";
import { FaCoins, FaGlobe, FaAward, FaShoppingCart } from "react-icons/fa";

const ProviderDashboard = () => {
  return (
    <div>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div className="card bg-white">
              <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
                <div className="numbers text-center">
                  <p className="text-sm mb-0 text-capitalize font-weight-bold">
                    Today's Money
                  </p>
                  <h5 className="font-weight-bolder mb-0">
                    $53,000
                    <span className="text-success text-sm font-weight-bolder">
                      +55%
                    </span>
                  </h5>
                </div>
                <div
                  className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                  id="dashboard-icon">
                  <FaCoins className="text-white text-lg opacity-10" />{" "}
                  {/* Icon color set to white */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div className="card bg-white">
              <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
                <div className="numbers text-center">
                  <p className="text-sm mb-0 text-capitalize font-weight-bold">
                    Today's Users
                  </p>
                  <h5 className="font-weight-bolder mb-0">
                    2,300
                    <span className="text-success text-sm font-weight-bolder">
                      +3%
                    </span>
                  </h5>
                </div>
                <div
                  className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                  id="dashboard-icon">
                  <FaGlobe className="text-white text-lg opacity-10" />{" "}
                  {/* Icon color set to white */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div className="card bg-white">
              <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
                <div className="numbers text-center">
                  <p className="text-sm mb-0 text-capitalize font-weight-bold">
                    New Clients
                  </p>
                  <h5 className="font-weight-bolder mb-0">
                    +3,462
                    <span className="text-danger text-sm font-weight-bolder">
                      -2%
                    </span>
                  </h5>
                </div>
                <div
                  className="icon icon-shape  shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                  id="dashboard-icon">
                  <FaAward className="text-white text-lg opacity-10" />{" "}
                  {/* Icon color set to white */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-sm-6">
            <div className="card bg-white">
              <div className="card-body p-3 d-flex justify-content-center align-items-center flex-column">
                <div className="numbers text-center">
                  <p className="text-sm mb-0 text-capitalize font-weight-bold">
                    Sales
                  </p>
                  <h5 className="font-weight-bolder mb-0">
                    $103,430
                    <span className="text-success text-sm font-weight-bolder">
                      +5%
                    </span>
                  </h5>
                </div>
                <div
                  className="icon icon-shape shadow text-center border-radius-md mt-3 d-flex justify-content-center align-items-center"
                  id="dashboard-icon">
                  <FaShoppingCart className="text-white text-lg opacity-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
