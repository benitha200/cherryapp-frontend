// Updated App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import PurchaseForm from './components/PurchaseForm.jsx';
import PurchaseList from './components/PurchaseList.jsx';
// import { SiteCollectionForm, SiteCollectionList } from './components/SiteCollection.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import SiteCollectionForm from './components/SiteCollectionForm.jsx';
import SiteCollectionList from './components/SiteCollectionList.jsx';
import ProcessingList from './components/ProcessingList.jsx';
import DailyPurchaseDetails from './components/DailyPurchaseDetails.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
    </Router>
  );
}

export default App;