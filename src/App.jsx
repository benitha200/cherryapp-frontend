// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import Login from './components/Login.jsx';
// import Dashboard from './components/Dashboard.jsx';
// import PurchaseForm from './components/PurchaseForm.jsx';
// import PurchaseList from './components/PurchaseList.jsx';
// import PrivateRoute from './components/PrivateRoute.jsx';
// import SiteCollectionForm from './components/SiteCollectionForm.jsx';
// import SiteCollectionList from './components/SiteCollectionList.jsx';
// import ProcessingList from './components/ProcessingList.jsx';
// import DailyPurchaseDetails from './components/DailyPurchaseDetails.jsx';
// import Sidebar from './components/Sidebar.jsx';
// import Transfer from './components/Transfer.jsx';

// const AppContent = () => {
//   const location = useLocation();
//   const isLoginPage = location.pathname === '/login';

//   return (
//     <div className="d-flex min-vh-100">
//       {!isLoginPage && <Sidebar />}
//       <div className="flex-grow-1 bg-light">
//         <div className="container-fluid p-4">
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/" element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             } />
//             <Route path="/purchases/new" element={
//               <PrivateRoute>
//                 <PurchaseForm />
//               </PrivateRoute>
//             } />
//             <Route path="/purchases" element={
//               <PrivateRoute>
//                 <PurchaseList />
//               </PrivateRoute>
//             } />
//             <Route path="/purchases/date/:date" element={<DailyPurchaseDetails />} />
//             <Route path="/processing" element={
//               <PrivateRoute>
//                 <ProcessingList />
//               </PrivateRoute>
//             } />
//             <Route path="/transfer" element={
//               <PrivateRoute>
//                 <Transfer />
//               </PrivateRoute>
//             } />
//             <Route path="/site-collections/new" element={
//               <PrivateRoute>
//                 <SiteCollectionForm />
//               </PrivateRoute>
//             } />
//             <Route path="/site-collections" element={
//               <PrivateRoute>
//                 <SiteCollectionList />
//               </PrivateRoute>
//             } />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// };

// function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import PurchaseForm from './components/PurchaseForm.jsx';
import PurchaseList from './components/PurchaseList.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import SiteCollectionForm from './components/SiteCollectionForm.jsx';
import SiteCollectionList from './components/SiteCollectionList.jsx';
import ProcessingList from './components/ProcessingList.jsx';
import DailyPurchaseDetails from './components/DailyPurchaseDetails.jsx';
import Sidebar from './components/Sidebar.jsx';
import Transfer from './components/Transfer.jsx';
import PricingManagement from './components/Admin/PricingManagement.jsx';
import Users from './components/Admin/Users.jsx';
import CwsList from './components/Admin/Cws/CwsList.jsx';
import CwsForm from './components/Admin/Cws/CwsForm.jsx';
import PurchaseByStation from './components/Supervisor/PurchaseByStation.jsx';
import PurchaseListAll from './components/Admin/Cherry/PurchaseListAll.jsx';
import CherryPurchaseReportDetailed from './components/Admin/Reports/CherryPurchaseReportDetailed.jsx';
import MyAccount from './components/Auth/MyAccount.jsx';
import ProcessingListAll from './components/Admin/Cherry/ProcessingListAll.jsx';

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className="d-flex min-vh-100" style={{ fontFamily: 'Inter, sans-serif', fontSize: "14px" }}>
      {!isLoginPage && <Sidebar />}
      <div
        className="flex-grow-1 bg-light overflow-auto"
        style={{
          marginLeft: isLoginPage ? '0' : (isMobile ? '0' : '250px'),
          height: '100vh',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <div className="container-fluid p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/purchases/new" element={
              <PrivateRoute>
                <PurchaseForm />
              </PrivateRoute>
            } />
            <Route path="/purchases" element={
              <PrivateRoute>
                <PurchaseList />
              </PrivateRoute>
            } />
            <Route path="/purchases-all" element={
              <PrivateRoute>
                <PurchaseListAll />
              </PrivateRoute>
            } />
            <Route path="/processing-all" element={
              <PrivateRoute>
                <ProcessingListAll />
              </PrivateRoute>
            } />
            <Route path="/purchases/date/:date" element={<DailyPurchaseDetails />} />
            <Route path="/purchase-by-station" element={<PurchaseByStation />} />


            <Route path="/processing" element={
              <PrivateRoute>
                <ProcessingList />
              </PrivateRoute>
            } />
            <Route path="/transfer" element={
              <PrivateRoute>
                <Transfer />
              </PrivateRoute>
            } />
            <Route path="/site-collections/new" element={
              <PrivateRoute>
                <SiteCollectionForm />
              </PrivateRoute>
            } />
            <Route path="/site-collections" element={
              <PrivateRoute>
                <SiteCollectionList />
              </PrivateRoute>
            } />
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
              path="/cherry-purchase-report"
              element={
                <PrivateRoute>
                  <CherryPurchaseReportDetailed />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
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