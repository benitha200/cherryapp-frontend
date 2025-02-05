import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

// Import theme colors
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  tableHover: '#F8FAFA', // Ultra light teal for table hover
  directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
  centralStation: '#008080'  // Main teal for central station badge
};

const DailyPurchaseDetails = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { date } = useParams();
  const skeletonRows = Array(5).fill(0);

  useEffect(() => {
    fetchDailyPurchases();
  }, [date]);

  const fetchDailyPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/purchases/date/${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const flattenedPurchases = response.data.flatMap(cws => 
        cws.purchases.map(purchase => ({
          ...purchase,
          cwsName: cws.name
        }))
      );
      
      setPurchases(flattenedPurchases);
      setLoading(false);
    } catch (error) {
      setError('Error fetching daily purchases');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div 
          className="d-flex align-items-center"
          style={{ backgroundColor: theme.neutral }}
        >
          <div 
            className="skeleton-title h4 mb-0 m-4"
            style={{ 
              backgroundColor: '#e0e0e0', 
              width: '300px', 
              height: '30px', 
              borderRadius: '4px' 
            }}
          />
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  {['Batch No', 'CWS', 'Delivery Type', 'Total KGs', 'Total Price', 'Grade', 'Site Collection'].map((header, index) => (
                    <th key={index} className="px-4 py-3">
                      <div 
                        className="skeleton-header"
                        style={{ 
                          backgroundColor: '#e0e0e0', 
                          width: '100px', 
                          height: '20px', 
                          borderRadius: '4px' 
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skeletonRows.map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {[1, 2, 3, 4, 5, 6, 7].map((cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        <div 
                          className="skeleton-cell"
                          style={{ 
                            backgroundColor: '#f0f0f0', 
                            width: '80%', 
                            height: '20px', 
                            borderRadius: '4px' 
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
          className="d-flex align-items-center"
          style={{ backgroundColor: theme.neutral }}
        >
          <h2 
            className="card-title h4 mb-0 m-4"
            style={{ color: theme.primary }}
          >
            Purchase Details for {new Date(date).toLocaleDateString()}
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ backgroundColor: theme.neutral }}>
                <tr>
                  <th className="px-4 py-3">Batch No</th>
                  <th className="px-4 py-3">CWS</th>
                  <th className="px-4 py-3">Delivery Type</th>
                  <th className="px-4 py-3">Total KGs</th>
                  <th className="px-4 py-3">Amount (RWF)</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Site Collection</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr 
                    key={purchase.id}
                    style={{ ':hover': { backgroundColor: theme.tableHover } }}
                  >
                    <td className="px-4 py-3">{purchase.batchNo}</td>
                    <td className="px-4 py-3">{purchase.cwsName}</td>
                    <td className="px-4 py-3">
                      <span 
                        className="badge"
                        style={{ 
                          backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' 
                            ? theme.directDelivery 
                            : theme.centralStation 
                        }}
                      >
                        {purchase.deliveryType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{purchase.totalKgs.toFixed(2)} kg</td>
                    <td className="px-4 py-3">{purchase.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span 
                        className="badge"
                        style={{ backgroundColor: getGradeColor(purchase.grade) }}
                      >
                        {purchase.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {purchase.siteCollection ? purchase.siteCollection.name : 'N/A'}
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

const getGradeColor = (grade) => {
  switch (grade) {
    case 'A': return theme.primary;
    case 'B': return theme.accent;
    default: return theme.secondary;
  }
};

export default DailyPurchaseDetails;