import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

// Consistent theme colors
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
  directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
  centralStation: '#008080'  // Main teal for central station badge
};

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
      const res = await axios.get(`${API_URL}/purchases/grouped`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const grouped = res.data.reduce((acc, curr) => {
        const date = new Date(curr.date).toISOString().split('T')[0];
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

  if (loading) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border" style={{ color: theme.primary }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-3" role="alert">{error}</div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div 
          className="d-flex justify-content-between align-items-center"
          style={{ backgroundColor: theme.neutral }}
        >
          <h2 
            className="card-title h4 mb-0 m-4"
            style={{ color: theme.primary }}
          >
            All Purchases
          </h2>
          <Link
            to="/purchases/new"
            className="btn m-4"
            style={{ 
              backgroundColor: theme.primary,
              color: 'white',
              borderColor: theme.primary
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Purchase
          </Link>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  <th>Date</th>
                  <th>Total</th>
                  <th>KGs</th>
                  <th>Price (RWF)</th>
                  <th>Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedPurchases.map(({ date, totalPurchases, totalKgs, totalPrice, deliveryTypes }, i) => (
                  <tr 
                    key={i}
                    style={{ ':hover': { backgroundColor: theme.tableHover } }}
                  >
                    <td>{new Date(date).toLocaleDateString()}</td>
                    <td>{totalPurchases}</td>
                    <td>{totalKgs.toFixed(2)} kg</td>
                    <td>{totalPrice.toFixed(2)}</td>
                    <td>
                      {deliveryTypes.map(({ deliveryType, _count }) => (
                        <span 
                          key={deliveryType} 
                          className="badge me-1"
                          style={{ 
                            backgroundColor: deliveryType === 'DIRECT_DELIVERY' 
                              ? theme.directDelivery 
                              : theme.centralStation 
                          }}
                        >
                          {deliveryType}: {_count.id}
                        </span>
                      ))}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          color: theme.primary,
                          borderColor: theme.primary,
                          backgroundColor: 'transparent',
                          ':hover': {
                            backgroundColor: theme.primary
                          }
                        }}
                        onClick={() => viewDailyDetails(date)}
                      >
                        View
                      </button>
                    </td>
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