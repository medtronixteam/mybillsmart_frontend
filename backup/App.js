import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./assets/css/soft-ui-dashboard.css?v=1.0.3";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./components/Dashboard";
import Invoice from "./components/Invoice/Invoice";
import ProfileEdit from "./components/ProfileSetting/ProfileSetting";

import ProviderSidebar from "./Provider/ProviderSidebar/ProviderSidebar";
import ProviderDashboard from "./Provider/ProviderDashboard";
import ProviderProfileSetting from "./Provider/ProviderProfileSetting/ProviderProfileSetting";
import Products from "./Provider/Products/Products";
import ProviderNavbar from "./Provider/ProviderNavbar/ProviderNavbar";
import Signup from "./components/SignUp/Signup";
// import AddUser from "./Provider/AddUser/AddUser";
// import UserList from "./Provider/userList/UserList";
import ContractForm from "./components/ContractForm/ContractForm";

import ProtectedRoute from "./ProtectedRoute";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import ContractList from "./components/ContractList/ContractList";
import AddProduct from "./Provider/AddProduct/AddProduct";
import AddUser from "./GroupAdmin/AddUser/AddUser";
import UserList from "./GroupAdmin/userList/UserList";
import GroupAdminSidebar from "./GroupAdmin/GroupAdminSidebar/GroupAdminSidebar";
import GroupAdminNavbar from "./GroupAdmin/GroupAdminNavbar/GroupAdminNavbar";
import GroupAdminDashboard from "./GroupAdmin/GroupAdminDashboard";
import GroupAdminProfileSetting from "./GroupAdmin/GroupAdminProfileSetting/GroupAdminProfileSetting";
import InvoiceList from "./GroupAdmin/InvoiceList/InvoiceList";
import ClientContractList from "./GroupAdmin/ClientContractList/ClientContractList";
import ClientContractDocx from "./GroupAdmin/ClientContractDocx/ClientContractDocx";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const handleAddUser = (newUser) => {
    setUsers([...users, newUser]);
  };
  const handleDeleteUser = (index) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  const handleEditUser = (index, updatedUser) => {
    const updatedUsers = users.map((user, i) =>
      i === index ? updatedUser : user
    );
    setUsers(updatedUsers);
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const NotFound = () => {
    useEffect(() => {
      const timer = setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 5000);
  
      return () => clearTimeout(timer);
    }, []);
  
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h1>404 - Page Not Found</h1>
        <p>Redirecting to login page in 5 seconds...</p>
      </div>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

          {/* Agent Routes */}
          <Route
            path="/agent/*"
            element={
              <ProtectedRoute
                element={
                  <>
                    <div
                      className={`sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 ${
                        isSidebarOpen ? "show-sidebar" : ""
                      }`}
                      id="sidenav-main"
                    >
                      <Sidebar />
                    </div>
                    <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
                      <Navbar toggleSidebar={toggleSidebar} />
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile-edit" element={<ProfileEdit />} />
                        <Route path="invoice" element={<Invoice />} />
                        <Route path="contract" element={<ContractForm />} />
                        <Route path="add-client" element={<AddClients />} />
                        <Route
                          path="contract-list"
                          element={<ContractList />}
                        />
                        <Route
                          path="invoice-list"
                          element={<InvoiceListAgent />}
                        />
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="agent"
              />
            }
          />

          {/* Provider Routes */}
          <Route
            path="/supervisor/*"
            element={
              <ProtectedRoute
                element={
                  <>
                    <div
                      className={`sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 ${
                        isSidebarOpen ? "show-sidebar" : ""
                      }`}
                      id="sidenav-main"
                    >
                      <ProviderSidebar />
                    </div>
                    <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
                      <ProviderNavbar toggleSidebar={toggleSidebar} />
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<ProviderDashboard />}
                        />

                        <Route
                          path="profile-edit"
                          element={<ProviderProfileSetting />}
                        />
                        <Route path="product-list" element={<Products />} />
                        <Route path="add-product" element={<AddProduct />} />
                        <Route path="add-client" element={<AddClient />} />
                        <Route path="client-list" element={<ClientList />} />
                        <Route
                          path="notifications"
                          element={<Notifications />}
                        />

                        {/* <Route
                        path="/add-user"
                        element={<AddUser onAddUser={handleAddUser} />}
                      />
                      <Route
                        path="/user-list"
                        element={
                          <UserList
                            users={users}
                            onDeleteUser={handleDeleteUser}
                            onEditUser={handleEditUser}
                          />
                        }
                      /> */}
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="supervisor"
              />
            }
          />
          {/* Group Admin */}
          <Route
            path="/group_admin/*"
            element={
              <ProtectedRoute
                element={
                  <>
                    <div
                      className={`sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 ${
                        isSidebarOpen ? "show-sidebar" : ""
                      }`}
                      id="sidenav-main"
                    >
                      <GroupAdminSidebar />
                    </div>
                    <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
                      <GroupAdminNavbar toggleSidebar={toggleSidebar} />
                      <Routes>
                        <Route
                          path="dashboard"
                          element={<GroupAdminDashboard />}
                        />

                        <Route
                          path="profile-edit"
                          element={<GroupAdminProfileSetting />}
                        />
                        <Route path="invoice-list" element={<InvoiceList />} />

                        <Route
                          path="/add-user"
                          element={<AddUser onAddUser={handleAddUser} />}
                        />
                        <Route
                          path="/user-list"
                          element={
                            <UserList
                              users={users}
                              onDeleteUser={handleDeleteUser}
                              onEditUser={handleEditUser}
                            />
                          }
                        />
                        <Route
                          path="/client-contract-list"
                          element={<ClientContractList />}
                        />
                        <Route
                          path="/client-contract-docx"
                          element={<ClientContractDocx />}
                        />
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="group_admin"
              />
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
