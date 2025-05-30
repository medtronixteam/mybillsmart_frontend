import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useParams,
} from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import config from "./config";
import { AuthProvider } from "./contexts/AuthContext";
import "./assets/css/soft-ui-dashboard.css?v=1.0.3";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
// import './i18n'; // Add this at the top
// Layout Components
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import ProviderSidebar from "./Provider/ProviderSidebar/ProviderSidebar";
import ProviderNavbar from "./Provider/ProviderNavbar/ProviderNavbar";
import GroupAdminSidebar from "./GroupAdmin/GroupAdminSidebar/GroupAdminSidebar";
import GroupAdminNavbar from "./GroupAdmin/GroupAdminNavbar/GroupAdminNavbar";
import ClientSidebar from "./Client/ClientSidebar/ClientSidebar";
import ClientNavbar from "./Client/ClientNavbar/ClientNavbar";
import LinkSidebar from "./LinkInvoice/LinkSidebar/LinkSidebar";
import LinkNavbar from "./LinkInvoice/LinkNavbar/Navbar";

// Page Components
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard";
import Invoice from "./components/Invoice/Invoice";
import ProfileEdit from "./components/ProfileSetting/ProfileSetting";
import ProviderDashboard from "./Provider/ProviderDashboard";
import ProviderProfileSetting from "./Provider/ProviderProfileSetting/ProviderProfileSetting";
import Products from "./Provider/Products/Products";
import Signup from "./components/SignUp/Signup";
import ContractForm from "./components/ContractForm/ContractForm";
import ProtectedRoute from "./ProtectedRoute";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import ContractList from "./components/ContractList/ContractList";
import AddProduct from "./Provider/AddProduct/AddProduct";
import AddUser from "./GroupAdmin/AddUser/AddUser";
import UserList from "./GroupAdmin/userList/UserList";
import GroupAdminDashboard from "./GroupAdmin/GroupAdminDashboard";
import GroupAdminProfileSetting from "./GroupAdmin/GroupAdminProfileSetting/GroupAdminProfileSetting";
import InvoiceList from "./GroupAdmin/InvoiceList/InvoiceList";
import InvoiceListAgent from "./components/InvoiceList/InvoiceList";
import ClientContractList from "./Client/ClientContractList/ClientContractList";
import ClientContractDocx from "./Client/ClientContractDocx/ClientContractDocx";
import ClientDashboard from "./Client/ClientDashboard";
import ClientProfileSetting from "./Client/ClientProfileSetting/ClientProfileSetting";
import ClientInvoice from "./Client/ClientInvoice/ClientInvoice";
import AddClient from "./Provider/AddClient/AddClient";
import ClientList from "./Provider/ClientList/ClientList";
import AddClients from "./components/AddClient/AddClient";
import Notifications from "./Client/Notifications/Notifications";
import AgentNotifications from "./components/AgentNotifications/AgentNotifications";
import Subscription from "./GroupAdmin/Subscription/Subscription";
import SubmissionLink from "./GroupAdmin/SubmissionLink/SubmissionLink";
import ProviderSubmissionLink from "./Provider/ProviderSubmissionLink/ProviderSubmissionLink";
import ProviderSubscription from "./Provider/ProviderSubscription/ProviderSubscription";
import AgentSubmissionLink from "./components/AgentSubmissionLink/AgentSubmissionLink";
import AgentSubscription from "./components/AgentSubscription/AgentSubscription";
import ClientSubscription from "./Client/ClientSubscription/ClientSubscription";
import AdminInvoice from "./GroupAdmin/AdminInvoice/AdminInvoice";
import AdminContractForm from "./GroupAdmin/AdminContractForm/AdminContractForm";
import CheckoutForm from "./GroupAdmin/CheckoutForm/CheckoutForm";
import LinkInvoice from "./LinkInvoice/Invoice/LinkInvoice";
import PaymentSuccess from "./components/PaymentSuccess/PaymentSuccess";
import AgentCheckoutForm from "./components/CheckoutForm/CheckoutForm";
import ProviderCheckoutForm from "./Provider/CheckoutForm/CheckoutForm";
import AgentRefferalLink from "./components/RefferalLink/RefferalLink";
import ProviderRefferalLink from "./Provider/RefferalLink/RefferalLink";
import PointsUpdate from "./GroupAdmin/PointsUpdate/PointsUpdate";
import WhatsappIntigation from "./components/Whatsapp/Whatsapp";
import GroupAdminWhatsapp from "./GroupAdmin/GroupAdminWhatsapp/GroupAdminWhatsapp";
import ProviderWhatsapp from "./Provider/ProviderWhatsapp/ProviderWhatsapp";
import AdminContractList from "./GroupAdmin/AdminContractList/AdminContractList";
import ManageGoal from "./GroupAdmin/ManageGoal/ManageGoal";
import GoalList from "./GroupAdmin/GoalList/GoalList";
import UserPerformance from "./GroupAdmin/UserPerformance/UserPerformance";
import ScheduleMessage from "./GroupAdmin/ScheduleMessage/ScheduleMessage";
import MessageList from "./GroupAdmin/MessageList/MessageList";
import AgentMessageList from "./components/MessageList/MessageList";
import ProviderMessageList from "./Provider/MessageList/MessageList";
import AdminProducts from "./GroupAdmin/Products/AdminProducts";
import AdminAddProduct from "./GroupAdmin/AddProduct/AdminAddProduct";
import AgentGoalList from "./components/GoalList/GoalList";

import SessionHistory from "./GroupAdmin/SessionHistory/SessionHistory";
import SubscriptionOrder from "./GroupAdmin/SubscriptionOrder/SubscriptionOrder";
import CompanyDetails from "./GroupAdmin/CompanyDetails/CompanyDetails";
import ComapnyDetailsList from "./GroupAdmin/ComapnyDetailsList/ComapnyDetailsList";
import CompanyDetailsList from "./GroupAdmin/ComapnyDetailsList/ComapnyDetailsList";
import AgentSessionHistory from "./components/SessionHistory/AgentSessionHistory";
import SupervisorSessionHistory from "./Provider/SessionHistory/SupervisorSessionHistory";
import AgentUserList from "./components/AgentUserList/AgentUserList";
import ClientInvoiceList from "./Client/InvoiceList/ClientInvoiceList";
import ProviderNotifications from "./Provider/Notifications/ProviderNotifications";
import GroupAdminNotifications from "./GroupAdmin/Notifications/GroupAdminNotifications";
import ClientSessionHistory from "./Client/SessionHistory/ClientSessionHistory";
import Agrement from "./GroupAdmin/Agrement/Agrement";
import AgrementList from "./GroupAdmin/AgrementList/AgrementList";
import UserSidebar from "./User/UserSidebar/UserSidebar";
import UserProfileSetting from "./User/UserProfileSetting/UserProfileSetting";
import UserSessionHistory from "./User/UserSessionHistory/UserSessionHistory";
import UserInvoice from "./User/UserInvoice/UserInvoice";
import UserNavbar from "./User/UserNavbar/UserNavbar";
import UserInvoiceList from "./User/UserInvoiceList/UserInvoiceList";
import UserDashboard from "./User/UserDashboard";
import AminContractForm from "./GroupAdmin/AminContractForm/AminContractForm";
import UserAddUser from "./User/AddUser/AddUser";
import UserUserList from "./User/UserList/UserUserList";
import UserNotifications from "./User/Notifications/UserNotifications";
import AgentsContractForm from "./components/AgentsContractForm/AgentsContractForm";
import ReffredUserList from "./components/ReffredUserList/ReffredUserList";
import ChatBoard from "./GroupAdmin/ChatBoard/ChatBoard";
import SupervisorManageGoal from "./Provider/SupervisorManageGoal/SupervisorManageGoal";
import SupervisorGoalList from "./Provider/SupervisorGoalList/SupervisorGoalList";
import AgentScheduleMessage from "./components/AgentScheduleMessage/AgentScheduleMessage";

const stripePromise = loadStripe(config.STRIPE.PUBLIC_KEY);

const NotFound = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.clear();
      window.location.href = "/login";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>Redirecting to login page in 5 seconds...</p>
    </div>
  );
};

const PublicInvoiceSubmission = () => {
  const { id } = useParams();
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkLinkValidity = async () => {
      try {
        const response = await axios.get(
          `${config.BASE_URL}/api/verify-url/${id}`
        );
        if (response.data.status === "success") {
          setIsValid(true);
          setError(null);
        } else {
          setIsValid(false);
          setError(response.data.message || "Link is not available");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to validate link");
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkLinkValidity();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <h1>Invalid Link</h1>
        <p>{error || "This invoice submission link is not available."}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
        <LinkNavbar toggleSidebar={toggleSidebar} />
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-body px-0 pt-0 pb-2">
                  <LinkInvoice publicMode={true} linkId={id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
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
      <Elements stripe={stripePromise}>
        <Router>
          <ToastContainer />
          <ChatBoard />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forget-password" element={<ForgetPassword />} />

            <Route
              path="/u/invoice/:id"
              element={<PublicInvoiceSubmission />}
            />

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
                          <Route
                            path="profile-edit"
                            element={<ProfileEdit />}
                          />
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
                          <Route
                            path="notifications"
                            element={<AgentNotifications />}
                          />
                          <Route
                            path="submission-link"
                            element={<AgentSubmissionLink />}
                          />
                          <Route
                            path="refferal-link"
                            element={<AgentRefferalLink />}
                          />
                          <Route
                            path="subscription"
                            element={<AgentSubscription />}
                          />
                          <Route
                            path="whatsapp"
                            element={<WhatsappIntigation />}
                          />
                          <Route
                            path="checkout"
                            element={<AgentCheckoutForm />}
                          />
                          <Route
                            path="campaign-list"
                            element={<AgentMessageList />}
                          />
                          <Route
                            path="campaign"
                            element={<AgentScheduleMessage />}
                          />
                          <Route
                            path="session-history"
                            element={<AgentSessionHistory />}
                          />
                          <Route
                            path="agents-contract-form"
                            element={<AgentsContractForm />}
                          />
                          <Route
                            path="reffred-user"
                            element={<ReffredUserList />}
                          />
                          <Route path="user-list" element={<AgentUserList />} />
                          <Route path="goal" element={<AgentGoalList />} />

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
                            element={<ProviderNotifications />}
                          />
                          <Route
                            path="submission-link"
                            element={<ProviderSubmissionLink />}
                          />
                          <Route
                            path="refferal-link"
                            element={<ProviderRefferalLink />}
                          />
                          <Route
                            path="whatsapp"
                            element={<ProviderWhatsapp />}
                          />

                          <Route
                            path="subscription"
                            element={<ProviderSubscription />}
                          />
                          <Route
                            path="checkout"
                            element={<ProviderCheckoutForm />}
                          />
                          <Route
                            path="message"
                            element={<ProviderMessageList />}
                          />
                          <Route
                            path="session-history"
                            element={<SupervisorSessionHistory />}
                          />
                           <Route
                            path="manage-goal"
                            element={<SupervisorManageGoal />}
                          />

                           <Route
                            path="goal-list"
                            element={<SupervisorGoalList />}
                          />
                          
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
                          <Route
                            path="dashboard"
                            element={<GroupAdminDashboard />}
                          />
                          <Route path="products" element={<AdminProducts />} />
                          <Route
                            path="add-product"
                            element={<AdminAddProduct />}
                          />
                          <Route
                            path="profile-edit"
                            element={<GroupAdminProfileSetting />}
                          />
                          <Route
                            path="notifications"
                            element={<GroupAdminNotifications />}
                          />
                          <Route
                            path="invoice-list"
                            element={<InvoiceList />}
                          />
                          <Route
                            path="admin-invoice"
                            element={<AdminInvoice />}
                          />
                          <Route
                            path="admin-contract"
                            element={<AdminContractForm />}
                          />
                          <Route
                            path="admin-contract-from"
                            element={<AminContractForm />}
                          />
                          <Route
                            path="whatsapp"
                            element={<GroupAdminWhatsapp />}
                          />
                          <Route path="checkout" element={<CheckoutForm />} />
                          <Route
                            path="payment-success"
                            element={<PaymentSuccess />}
                          />
                          <Route
                            path="add-user"
                            element={<AddUser onAddUser={handleAddUser} />}
                          />
                          <Route
                            path="user-list"
                            element={
                              <UserList
                                users={users}
                                onDeleteUser={handleDeleteUser}
                                onEditUser={handleEditUser}
                              />
                            }
                          />
                          <Route
                            path="client-contract-list"
                            element={<AdminContractList />}
                          />
                          <Route
                            path="client-contract-docx"
                            element={<ClientContractDocx />}
                          />
                          <Route
                            path="subscription"
                            element={<Subscription />}
                          />
                          <Route
                            path="submission-link"
                            element={<SubmissionLink />}
                          />
                          <Route
                            path="points-update"
                            element={<PointsUpdate />}
                          />
                          <Route path="manage-goal" element={<ManageGoal />} />
                          <Route path="goal-list" element={<GoalList />} />
                          <Route
                            path="user-performance"
                            element={<UserPerformance />}
                          />
                          <Route
                            path="schedule-message"
                            element={<ScheduleMessage />}
                          />
                          <Route
                            path="message-list"
                            element={<MessageList />}
                          />
                          <Route
                            path="session-history"
                            element={<SessionHistory />}
                          />
                          <Route
                            path="subscription-order"
                            element={<SubscriptionOrder />}
                          />
                          <Route
                            path="company-details"
                            element={<CompanyDetails />}
                          />
                          <Route
                            path="company-details-list"
                            element={<CompanyDetailsList />}
                          />

                          <Route path="agrement" element={<Agrement />} />
                          <Route
                            path="agrement-list"
                            element={<AgrementList />}
                          />
                          
                          <Route
                            path="chat"
                            element={<ChatBoard />}
                          />
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
                          <Route
                            path="dashboard"
                            element={<ClientDashboard />}
                          />
                          <Route
                            path="profile-edit"
                            element={<ClientProfileSetting />}
                          />
                          <Route
                            path="session-history"
                            element={<ClientSessionHistory />}
                          />
                          <Route
                            path="contract-list"
                            element={<ClientContractList />}
                          />
                          <Route
                            path="contract-docx"
                            element={<ClientContractDocx />}
                          />
                          <Route
                            path="client-invoice"
                            element={<ClientInvoice />}
                          />
                          <Route
                            path="invoice-list"
                            element={<ClientInvoiceList />}
                          />
                          <Route
                            path="notifications"
                            element={<Notifications />}
                          />
                          <Route
                            path="subscription"
                            element={<ClientSubscription />}
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </>
                  }
                  requiredRole="client"
                />
              }
            />

            {/* User Routes */}
            <Route
              path="/user/*"
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
                        <UserSidebar />
                      </div>
                      <main className="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg">
                        <UserNavbar toggleSidebar={toggleSidebar} />
                        <Routes>
                          <Route path="dashboard" element={<UserDashboard />} />
                          <Route
                            path="profile-edit"
                            element={<UserProfileSetting />}
                          />
                          <Route
                            path="session-history"
                            element={<UserSessionHistory />}
                          />

                          <Route
                            path="user-invoice"
                            element={<UserInvoice />}
                          />
                          <Route
                            path="invoice-list"
                            element={<UserInvoiceList />}
                          />
                          <Route path="add-user" element={<UserAddUser />} />
                          <Route path="user-list" element={<UserUserList />} />
                          <Route
                            path="notifications"
                            element={<UserNotifications />}
                          />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </>
                  }
                  requiredRole="user"
                />
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Elements>
    </AuthProvider>
  );
};

export default App;
