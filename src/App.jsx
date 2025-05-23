import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PurchaseForm from "./components/PurchaseForm.jsx";
import PurchaseList from "./components/PurchaseList.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import SiteCollectionForm from "./components/SiteCollectionForm.jsx";
import SiteCollectionList from "./components/SiteCollectionList.jsx";
import ProcessingList from "./components/ProcessingList.jsx";
import DailyPurchaseDetails from "./components/DailyPurchaseDetails.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Transfer from "./components/Transfer.jsx";
import PricingManagement from "./components/Admin/PricingManagement.jsx";
import Users from "./components/Admin/Users.jsx";
import CwsList from "./components/Admin/Cws/CwsList.jsx";
import CwsForm from "./components/Admin/Cws/CwsForm.jsx";
import PurchaseByStation from "./components/Supervisor/PurchaseByStation.jsx";
import PurchaseListAll from "./components/Admin/Cherry/PurchaseListAll.jsx";
import CherryPurchaseReportDetailed from "./components/Admin/Reports/CherryPurchaseReportDetailed.jsx";
import MyAccount from "./components/Auth/MyAccount.jsx";
import ProcessingListAll from "./components/Admin/Cherry/ProcessingListAll.jsx";
import WetTransfer from "./components/Cws/WetTransfer.jsx";
import WetTransferReceiver from "./components/Cws/WetTransferReceiver.jsx";
import BaggingOffList from "./components/Admin/Reports/BaggingOffList.jsx";
import BaggingOffReport from "./components/Admin/Reports/BaggingOffReport.jsx";
import WetTransferCwsMapping from "./components/Cws/WetTransferCwsMapping.jsx";
import WetTransferBoth from "./components/Cws/WetTransferBoth.jsx";
import Transport from "./components/Admin/Transport/Transport.jsx";
import WetTransferAdmin from "./components/Admin/WetTransfer/WetTransferAdmin.jsx";
import Quality from "./components/Admin/quality/index.jsx";
import { SampleForm } from "./components/Admin/quality/sample/index.jsx";
import OfflineModal from "./sharedCompoents/networkError.jsx";
import NotFoundPage from "./sharedCompoents/404/404.jsx";
import DeliveryTracks from "./components/Admin/quality/receivedTrack/index.jsx";
import { Toaster } from "react-hot-toast";
import QualityReport from "./components/Admin/quality/report/index.jsx";
import StockManagement from "./components/Admin/Cherry/StockManagement.jsx";

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isMobile, setIsMobile] = useState(false);
  const [isOffiline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {isOffiline && <OfflineModal />}
      <div
        className="d-flex min-vh-100"
        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
      >
        {!isLoginPage && <Sidebar />}
        <div
          className="flex-grow-1 bg-light overflow-auto"
          style={{
            marginLeft: isLoginPage ? "0" : isMobile ? "0" : "250px",
            height: "100vh",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          {/* <div
  className="alert m-2 text-center"
  role="alert"
  style={{
    fontWeight: 'bold',
    fontSize: '16px',
    backgroundColor: '#BF0000',
    color: 'white',
    border: '2px solid darkred',
    boxShadow: '0 0 10px rgba(148, 4, 4, 0.5)',
    animation: 'blinking 1.5s infinite'
  }}
>
  <i className="bi bi-exclamation-triangle-fill me-2"></i>
  This is for Testing purpose only
</div> */}

          <div className="container-fluid p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/purchases/new"
                element={
                  <PrivateRoute>
                    <PurchaseForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/purchases"
                element={
                  <PrivateRoute>
                    <PurchaseList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/purchases-all"
                element={
                  <PrivateRoute>
                    <PurchaseListAll />
                  </PrivateRoute>
                }
              />
              <Route
                path="/processing-all"
                element={
                  <PrivateRoute>
                    <ProcessingListAll />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quality-all"
                element={
                  <PrivateRoute>
                    <Quality />
                  </PrivateRoute>
                }
              />

              <Route
                path="/quality-delivery"
                element={
                  <PrivateRoute>
                    <DeliveryTracks />
                  </PrivateRoute>
                }
              />
              <Route
                path="/quality-all/form"
                element={
                  <PrivateRoute>
                    <SampleForm />
                  </PrivateRoute>
                }
              />

              <Route
                path="/quality-report"
                element={
                  <PrivateRoute>
                    <QualityReport />
                  </PrivateRoute>
                }
              />

              <Route
                path="/transport"
                element={
                  <PrivateRoute>
                    <Transport />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wet-transfer-admin"
                element={
                  <PrivateRoute>
                    <WetTransferAdmin />
                  </PrivateRoute>
                }
              />
              <Route
                path="/purchases/date/:date"
                element={<DailyPurchaseDetails />}
              />
              <Route
                path="/purchase-by-station"
                element={<PurchaseByStation />}
              />

              <Route
                path="/processing"
                element={
                  <PrivateRoute>
                    <ProcessingList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/stock"
                element={
                  <PrivateRoute>
                    <StockManagement />
                  </PrivateRoute>
                }
              />

              {/* sender */}
              <Route
                path="/wet-transfer"
                element={
                  <PrivateRoute>
                    <WetTransfer />
                  </PrivateRoute>
                }
              />
              {/* wet transfer receiver */}
              <Route
                path="/wet-transfer-receiver"
                element={
                  <PrivateRoute>
                    <WetTransferReceiver />
                  </PrivateRoute>
                }
              />

              {/* wet transfer sender and receiver */}
              <Route
                path="/wet-transfer-both"
                element={
                  <PrivateRoute>
                    <WetTransferBoth />
                  </PrivateRoute>
                }
              />

              <Route
                path="/transfer"
                element={
                  <PrivateRoute>
                    <Transfer />
                  </PrivateRoute>
                }
              />

              <Route
                path="/site-collections/new"
                element={
                  <PrivateRoute>
                    <SiteCollectionForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/site-collections"
                element={
                  <PrivateRoute>
                    <SiteCollectionList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute>
                    <Users />
                  </PrivateRoute>
                }
              />
              <Route
                path="/pricing"
                element={
                  <PrivateRoute>
                    <PricingManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cws"
                element={
                  <PrivateRoute>
                    <CwsList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cws/new"
                element={
                  <PrivateRoute>
                    <CwsForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/wet-transfer-cws-mapping"
                element={
                  <PrivateRoute>
                    <WetTransferCwsMapping />
                  </PrivateRoute>
                }
              />

              <Route
                path="/cherry-purchase-report"
                element={
                  <PrivateRoute>
                    <CherryPurchaseReportDetailed />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bagg-off-list"
                element={
                  <PrivateRoute>
                    <BaggingOffList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bagging-off-report"
                element={
                  <PrivateRoute>
                    <BaggingOffReport />
                  </PrivateRoute>
                }
              />
              {/* <Route path="/delivery-track" element={<DeliveryTracks />} /> */}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            padding: "16px 24px",
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
