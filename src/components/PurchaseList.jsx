// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';

// const PurchaseList = () => {
//  const [purchases, setPurchases] = useState([]);
//  const [loading, setLoading] = useState(true);
//  const [error, setError] = useState('');

//  useEffect(() => {
//    fetchPurchases();
//  }, []);

//  const fetchPurchases = async () => {
//    try {
//      const response = await axios.get('http://localhost:3000/api/purchases', {
//        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//      });
//      setPurchases(response.data);
//    } catch (error) {
//      setError('Error fetching purchases');
//    }
//    setLoading(false);
//  };

//  if (loading) {
//    return (
//      <div className="d-flex justify-content-center p-5">
//        <div className="spinner-border text-info" role="status">
//          <span className="visually-hidden">Loading...</span>
//        </div>
//      </div>
//    );
//  }

//  if (error) {
//    return (
//      <div className="alert alert-danger m-3" role="alert">
//        {error}
//      </div>
//    );
//  }

//  return (
//    <div className="container-fluid py-4">
//      <div className="card border-0 shadow-sm">
//        <div className="card-header bg-info bg-opacity-10 py-3">
//          <div className="d-flex justify-content-between align-items-center">
//            <h2 className="card-title h4 mb-0 text-info">Purchases</h2>
//            <Link
//              to="/purchases/new"
//              className="btn btn-info text-white"
//            >
//              <i className="bi bi-plus-lg me-2"></i>
//              New Purchase
//            </Link>
//          </div>
//        </div>
//        <div className="card-body p-0">
//          <div className="table-responsive">
//            <table className="table table-hover mb-0">
//              <thead className="table-light">
//                <tr>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    CWS
//                  </th>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    Delivery Type
//                  </th>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    Total KGs
//                  </th>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    Total Price (RWF)
//                  </th>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    Grade
//                  </th>
//                  <th className="text-uppercase text-secondary px-4 py-3">
//                    Date
//                  </th>
//                </tr>
//              </thead>
//              <tbody>
//                {purchases.map((purchase) => (
//                  <tr key={purchase.id}>
//                    <td className="px-4 py-3">
//                      {purchase.cws.name}
//                    </td>
//                    <td className="px-4 py-3">
//                      <span className={`badge ${purchase.deliveryType === 'DIRECT_DELIVERY' ? 'bg-info' : 'bg-primary'}`}>
//                        {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' : 'Site Collection'}
//                      </span>
//                    </td>
//                    <td className="px-4 py-3">
//                      {purchase.totalKgs.toFixed(2)} kg
//                    </td>
//                    <td className="px-4 py-3">
//                      {purchase.totalPrice.toFixed(2)}
//                    </td>
//                    <td className="px-4 py-3">
//                      <span className={`badge bg-${getGradeColor(purchase.grade)}`}>
//                        {purchase.grade}
//                      </span>
//                    </td>
//                    <td className="px-4 py-3 text-secondary">
//                      {new Date(purchase.createdAt).toLocaleDateString('en-US', {
//                        year: 'numeric',
//                        month: 'short',
//                        day: 'numeric'
//                      })}
//                    </td>
//                  </tr>
//                ))}
//              </tbody>
//            </table>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
// };

// // Helper function to get badge color based on grade
// const getGradeColor = (grade) => {
//  switch (grade) {
//    case 'CA':
//      return 'success';
//    case 'CB':
//      return 'info';
//    case 'NA':
//      return 'warning';
//    case 'NB':
//      return 'danger';
//    default:
//      return 'secondary';
//  }
// };

// export default PurchaseList;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseList = () => {
  const [groupedPurchases, setGroupedPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupedPurchases();
  }, []);

  const fetchGroupedPurchases = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/purchases/grouped', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Group purchases by date
      const grouped = res.data.reduce((acc, curr) => {
        const date = new Date(curr.date).toISOString().split('T')[0]; // Extract the date part only
        if (!acc[date]) {
          acc[date] = {
            date: curr.date,
            totalKgs: 0,
            totalPrice: 0,
            totalPurchases: 0,
            deliveryTypes: []
          };
        }
        acc[date].totalKgs += curr.totalKgs;
        acc[date].totalPrice += curr.totalPrice;
        acc[date].totalPurchases += curr.totalPurchases;
        acc[date].deliveryTypes.push(...curr.deliveryTypes);
        return acc;
      }, {});

      // Convert the grouped object back to an array
      const groupedArray = Object.values(grouped);
      setGroupedPurchases(groupedArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching grouped purchases:', error);
      setError('Error fetching grouped purchases');
      setLoading(false);
    }
  };

  const viewDailyDetails = date => navigate(`/purchases/date/${date}`);

  if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border text-info" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error) return <div className="alert alert-danger m-3" role="alert">{error}</div>;

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title h4 mb-0 text-info m-4">All Purchases</h2>
            <Link
             to="/purchases/new"
             className="btn btn-info text-white m-4"
           >
             <i className="bi bi-plus-lg me-2"></i>
             New Purchase
           </Link>
         </div>
          
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light"><tr><th>Date</th><th>Total</th><th>KGs</th><th>Price (RWF)</th><th>Delivery</th><th>Actions</th></tr></thead>
              <tbody>
                {groupedPurchases.map(({ date, totalPurchases, totalKgs, totalPrice, deliveryTypes }, i) => (
                  <tr key={i}>
                    <td>{new Date(date).toLocaleDateString()}</td>
                    <td>{totalPurchases}</td>
                    <td>{totalKgs.toFixed(2)} kg</td>
                    <td>{totalPrice.toFixed(2)}</td>
                    <td>{deliveryTypes.map(({ deliveryType, _count }) => (
                      <span key={deliveryType} className={`badge me-1 ${deliveryType === 'DIRECT_DELIVERY' ? 'bg-info' : 'bg-primary'}`}>
                        {deliveryType}: {_count.id}
                      </span>
                    ))}</td>
                    <td><button className="btn btn-sm btn-outline-info" onClick={() => viewDailyDetails(date)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseList;