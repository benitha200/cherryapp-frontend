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
import RequireAuth from "./components/guard.jsx";
import GeneralReport from "./components/Admin/Reports/GeneralReport/index.jsx";
import DeliveryReport from "./components/Admin/Reports/deliveryNewReport/index.jsx";
import QualityAnalysisReport from "./components/Admin/Reports/QualityAnalysisNEw/index.jsx";

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
              {/* GUARANTE ADMINS ONLY  */}
              <Route
                path="/"
                element={
                  <RequireAuth
                    allowedRoles={["ADMIN", "SUPER_ADMIN", "QUALITY"]}
                  />
                }
              >
                <Route path="/purchases-all" element={<PurchaseListAll />} />

                <Route path="/quality-report" element={<QualityReport />} />
                <Route path="/cws" element={<CwsList />} />
                <Route
                  path="/site-collections"
                  element={<SiteCollectionList />}
                />
                <Route
                  path="/wet-transfer-cws-mapping"
                  element={<WetTransferCwsMapping />}
                />
                <Route path="/pricing" element={<PricingManagement />} />
                <Route path="/users" element={<Users />} />

                <Route path="/quality-delivery" element={<DeliveryTracks />} />
                <Route path="/general-report" element={<GeneralReport />} />
                <Route path="/delivery-report" element={<DeliveryReport />} />
                <Route
                  path="/quality-analysis-report"
                  element={<QualityAnalysisReport />}
                />
              </Route>
              {/* GUARANTEE CWS MANAGER ONLY */}
              <Route
                path="/"
                element={<RequireAuth allowedRoles={["CWS_MANAGER"]} />}
              >
                <Route path="/purchases" element={<PurchaseList />} />
                <Route path="/processing" element={<ProcessingList />} />
                <Route path="/transfer" element={<Transfer />} />
                <Route
                  path="/wet-transfer-receiver"
                  element={<WetTransferReceiver />}
                />
              </Route>
              {/* GUARANTE CWS MANAGER AND ADMIN */}
              <Route
                path="/"
                element={
                  <RequireAuth
                    allowedRoles={[
                      "CWS_MANAGER",
                      "ADMIN",
                      "SUPER_ADMIN",
                      ,
                      "QUALITY",
                    ]}
                  />
                }
              >
                <Route path="/quality-all" element={<Quality />} />
              </Route>
              {/* AUTHENTICATE SUPERVISOR , MD , FINACNE AND OPERATION */}
              <Route
                path="/"
                element={
                  <RequireAuth
                    allowedRoles={[
                      "SUPERVISOR",
                      "MD",
                      "FINANCE",
                      "OPERATIONS",
                      "ADMIN",
                      "SUPER_ADMIN",
                    ]}
                  />
                }
              >
                <Route
                  path="/purchase-by-station"
                  element={<PurchaseByStation />}
                />

                <Route
                  path="/wet-transfer-admin"
                  element={<WetTransferAdmin />}
                />
                <Route path="/processing-all" element={<ProcessingListAll />} />

                <Route path="/transport" element={<Transport />} />
                <Route path="/stock" element={<StockManagement />} />
                <Route
                  path="/cherry-purchase-report"
                  element={<CherryPurchaseReportDetailed />}
                />
                <Route
                  path="/bagging-off-report"
                  element={<BaggingOffReport />}
                />
                <Route path="/quality-report" element={<QualityReport />} />
              </Route>
              {/* GUARANTEE GROUPE OF CWS MANAGAGER ADMIN QUALITY AND SUPPER ADMIN */}
              <Route
                path="/"
                element={
                  <RequireAuth
                    allowedRoles={[
                      "QUALITY",
                      "CWS_MANAGER",
                      "ADMIN",
                      "SUPER_ADMIN",
                    ]}
                  />
                }
              >
                <Route path="/quality-report" element={<QualityReport />} />
              </Route>
              <Route
                path="/purchases/date/:date"
                element={<DailyPurchaseDetails />}
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
                path="/site-collections/new"
                element={
                  <PrivateRoute>
                    <SiteCollectionForm />
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
                path="/bagg-off-list"
                element={
                  <PrivateRoute>
                    <BaggingOffList />
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
            duration: 5000,
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
