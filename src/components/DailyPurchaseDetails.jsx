import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DailyPurchaseDetails = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { date } = useParams();

  useEffect(() => {
    fetchDailyPurchases();
  }, [date]);

  const fetchDailyPurchases = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/purchases/date/${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Flatten the purchases array from the nested response
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-info bg-opacity-10 py-3">
          <h2 className="card-title h4 mb-0 text-info">
            Purchase Details for {new Date(date).toLocaleDateString()}
          </h2>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3">Batch No</th>
                  <th className="px-4 py-3">CWS</th>
                  <th className="px-4 py-3">Delivery Type</th>
                  <th className="px-4 py-3">Total KGs</th>
                  <th className="px-4 py-3">Total Price (RWF)</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Site Collection</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-4 py-3">{purchase.batchNo}</td>
                    <td className="px-4 py-3">{purchase.cwsName}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${purchase.deliveryType === 'DIRECT_DELIVERY' ? 'bg-info' : 'bg-primary'}`}>
                        {purchase.deliveryType}
                      </span>
                    </td>
                    <td className="px-4 py-3">{purchase.totalKgs.toFixed(2)} kg</td>
                    <td className="px-4 py-3">{purchase.totalPrice.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge bg-${getGradeColor(purchase.grade)}`}>
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
    case 'CA': return 'success';
    case 'CB': return 'info';
    case 'NA': return 'warning';
    case 'NB': return 'danger';
    default: return 'secondary';
  }
};

export default DailyPurchaseDetails;