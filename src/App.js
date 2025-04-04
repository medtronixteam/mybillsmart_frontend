import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
import InvoiceListAgent from "./components/InvoiceList/InvoiceList";
import ClientContractList from "./Client/ClientContractList/ClientContractList";
import ClientContractDocx from "./Client/ClientContractDocx/ClientContractDocx";
import ClientNavbar from "./Client/ClientNavbar/ClientNavbar";
import ClientDashboard from "./Client/ClientDashboard";
import ClientProfileSetting from "./Client/ClientProfileSetting/ClientProfileSetting";
import ClientSidebar from "./Client/ClientSidebar/ClientSidebar";
import ClientInvoice from "./Client/ClientInvoice/ClientInvoice";
import AddClient from "./Provider/AddClient/AddClient";
import ClientList from "./Provider/ClientList/ClientList";

import AddClients from "./components/AddClient/AddClient";
import Notifications from "./Client/Notifications/Notifications";
import AgentNotifications from "./components/AgentNotifications/AgentNotifications";
import Subscription from "./GroupAdmin/Subscription/Subscription";
import SubmissionLink from "./GroupAdmin/SubmissionLink/SubmissionLink";

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

  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
                        <Route path="contract-list" element={<ContractList />} />
                        <Route path="invoice-list" element={<InvoiceListAgent />} />
                        <Route path="notifications" element={<AgentNotifications />} />
                        <Route path="*" element={<NotFound />} />
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
                        <Route path="dashboard" element={<ProviderDashboard />} />
                        <Route path="profile-edit" element={<ProviderProfileSetting />} />
                        <Route path="product-list" element={<Products />} />
                        <Route path="add-product" element={<AddProduct />} />
                        <Route path="add-client" element={<AddClient />} />
                        <Route path="client-list" element={<ClientList />} />
                      
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="supervisor"
              />
            }
          />

          {/* Group Admin Routes */}
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
                        <Route path="dashboard" element={<GroupAdminDashboard />} />
                        <Route path="profile-edit" element={<GroupAdminProfileSetting />} />
                        <Route path="invoice-list" element={<InvoiceList />} />
                        <Route path="add-user" element={<AddUser onAddUser={handleAddUser} />} />
                        <Route path="user-list" element={
                          <UserList
                            users={users}
                            onDeleteUser={handleDeleteUser}
                            onEditUser={handleEditUser}
                          />
                        } />
                        <Route path="client-contract-list" element={<ClientContractList />} />
                        <Route path="client-contract-docx" element={<ClientContractDocx />} />
                        <Route path="subscription" element={<Subscription />} />
                        <Route path="submission-link" element={<SubmissionLink />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="group_admin"
              />
            }
          />

          {/* Client Routes */}
          <Route
            path="/client/*"
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
                      <ClientSidebar />
                    </div>
                    <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
                      <ClientNavbar toggleSidebar={toggleSidebar} />
                      <Routes>
                        <Route path="dashboard" element={<ClientDashboard />} />
                        <Route path="profile-edit" element={<ClientProfileSetting />} />
                        <Route path="contract-list" element={<ClientContractList />} />
                        <Route path="contract-docx" element={<ClientContractDocx />} />
                        <Route path="client-invoice" element={<ClientInvoice />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="notifications" element={<Notifications />} />
                      </Routes>
                    </main>
                  </>
                }
                requiredRole="client"
              />
            }
          />

          {/* Catch-all route for any undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;