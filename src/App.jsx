// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar.jsx';
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

// // with navbar
// // const AppContent = () => {
// //   const location = useLocation();
// //   const isLoginPage = location.pathname === '/login';

// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {!isLoginPage && <Navbar />}
// //       <div className="container mx-auto px-4 py-8">
// //         <Routes>
// //           <Route path="/login" element={<Login />} />
// //           <Route path="/" element={
// //             <PrivateRoute>
// //               <Dashboard />
// //             </PrivateRoute>
// //           } />
// //           <Route path="/purchases/new" element={
// //             <PrivateRoute>
// //               <PurchaseForm />
// //             </PrivateRoute>
// //           } />
// //           <Route path="/purchases" element={
// //             <PrivateRoute>
// //               <PurchaseList />
// //             </PrivateRoute>
// //           } />
// //           <Route path="/purchases/date/:date" element={<DailyPurchaseDetails />} />
// //           <Route path="/processing" element={
// //             <PrivateRoute>
// //               <ProcessingList />
// //             </PrivateRoute>
// //           } />
// //           <Route path="/site-collections/new" element={
// //             <PrivateRoute>
// //               <SiteCollectionForm />
// //             </PrivateRoute>
// //           } />
// //           <Route path="/site-collections" element={
// //             <PrivateRoute>
// //               <SiteCollectionList />
// //             </PrivateRoute>
// //           } />
// //         </Routes>
// //       </div>
// //     </div>
// //   );
// // };

// // with sidebar

// const AppContent = () => {
//   const location = useLocation();
//   const isLoginPage = location.pathname === '/login';

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {!isLoginPage && <Sidebar />}
//       <div className="flex-1 container mx-auto px-4 py-8">
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/" element={
//             <PrivateRoute>
//               <Dashboard />
//             </PrivateRoute>
//           } />
//           <Route path="/purchases/new" element={
//             <PrivateRoute>
//               <PurchaseForm />
//             </PrivateRoute>
//           } />
//           <Route path="/purchases" element={
//             <PrivateRoute>
//               <PurchaseList />
//             </PrivateRoute>
//           } />
//           <Route path="/purchases/date/:date" element={<DailyPurchaseDetails />} />
//           <Route path="/processing" element={
//             <PrivateRoute>
//               <ProcessingList />
//             </PrivateRoute>
//           } />
//           <Route path="/site-collections/new" element={
//             <PrivateRoute>
//               <SiteCollectionForm />
//             </PrivateRoute>
//           } />
//           <Route path="/site-collections" element={
//             <PrivateRoute>
//               <SiteCollectionList />
//             </PrivateRoute>
//           } />
//         </Routes>
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

import React from 'react';
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

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="d-flex min-vh-100">
      {!isLoginPage && <Sidebar />}
      <div className="flex-grow-1 bg-light">
        <div className="container-fluid p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
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
            <Route path="/purchases/date/:date" element={<DailyPurchaseDetails />} />
            <Route path="/processing" element={
              <PrivateRoute>
                <ProcessingList />
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