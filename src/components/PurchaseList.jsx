// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../constants/Constants';

// // Consistent theme colors
// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   tableHover: '#F8FAFA', // Ultra light teal for table hover
//   directDelivery: '#4FB3B3', // Lighter teal for direct delivery badge
//   centralStation: '#008080'  // Main teal for central station badge
// };

// const PurchaseList = () => {
//   const [groupedPurchases, setGroupedPurchases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();
//   const skeletonRows = Array(5).fill(0);

//   useEffect(() => {
//     fetchGroupedPurchases();
//   }, []);

//   const fetchGroupedPurchases = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/purchases/grouped`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });

//       const grouped = res.data.reduce((acc, curr) => {
//         const date = new Date(curr.date).toISOString().split('T')[0];
//         if (!acc[date]) {
//           acc[date] = {
//             date: curr.date,
//             totalKgs: 0,
//             totalPrice: 0,
//             totalPurchases: 0,
//             deliveryTypes: []
//           };
//         }
//         acc[date].totalKgs += curr.totalKgs;
//         acc[date].totalPrice += curr.totalPrice;
//         acc[date].totalPurchases += curr.totalPurchases;
//         acc[date].deliveryTypes.push(...curr.deliveryTypes);
//         return acc;
//       }, {});

//       const groupedArray = Object.values(grouped);
//       setGroupedPurchases(groupedArray);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching grouped purchases:', error);
//       setError('Error fetching grouped purchases');
//       setLoading(false);
//     }
//   };

//   const viewDailyDetails = date => navigate(`/purchases/date/${date}`);

//   if (loading) return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div 
//           className="d-flex justify-content-between align-items-center"
//           style={{ backgroundColor: theme.neutral }}
//         >
//           <div 
//             className="skeleton-title h4 mb-0 m-4"
//             style={{ 
//               backgroundColor: '#f0f0f0', 
//               width: '200px', 
//               height: '25px', 
//               borderRadius: '4px' 
//             }}
//           />
//           <div 
//             className="skeleton-button m-4"
//             style={{ 
//               backgroundColor: '#f0f0f0', 
//               width: '120px', 
//               height: '35px', 
//               borderRadius: '4px' 
//             }}
//           />
//         </div>

//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   {['Date', 'Total', 'KGs', 'Price', 'Delivery', 'Actions'].map((header, index) => (
//                     <th key={index}>
//                       <div 
//                         className="skeleton-header"
//                         style={{ 
//                           backgroundColor: '#f0f0f0', 
//                           width: '80px', 
//                           height: '15px', 
//                           borderRadius: '4px' 
//                         }}
//                       />
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {skeletonRows.map((_, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {[1, 2, 3, 4, 5, 6].map((cellIndex) => (
//                       <td key={cellIndex}>
//                         <div 
//                           className="skeleton-cell"
//                           style={{ 
//                             backgroundColor: '#f5f5f5', 
//                             width: '80%', 
//                             height: '15px', 
//                             borderRadius: '4px' 
//                           }}
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (error) return (
//     <div className="alert alert-danger m-3" role="alert">{error}</div>
//   );

//   return (
//     <div className="container-fluid py-4">
//       <div className="card border-0 shadow-sm">
//         <div 
//           className="d-flex justify-content-between align-items-center"
//           style={{ backgroundColor: theme.neutral }}
//         >
//           <h2 
//             className="card-title h4 mb-0 m-4"
//             style={{ color: theme.primary }}
//           >
//             All Purchases
//           </h2>
//           <Link
//             to="/purchases/new"
//             className="btn m-4"
//             style={{ 
//               backgroundColor: theme.primary,
//               color: 'white',
//               borderColor: theme.primary
//             }}
//           >
//             <i className="bi bi-plus-lg me-2"></i>
//             New Purchase
//           </Link>
//         </div>

//         <div className="card-body p-0">
//           <div className="table-responsive">
//             <table className="table mb-0">
//               <thead style={{ backgroundColor: theme.neutral }}>
//                 <tr>
//                   <th>Date</th>
//                   <th>Total</th>
//                   <th>KGs</th>
//                   <th>Amount (RWF)</th>
//                   <th>Delivery</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {groupedPurchases.map(({ date, totalPurchases, totalKgs, totalPrice, deliveryTypes }, i) => (
//                   <tr 
//                     key={i}
//                     style={{ ':hover': { backgroundColor: theme.tableHover } }}
//                   >
//                     <td>{new Date(date).toLocaleDateString()}</td>
//                     <td>{totalPurchases}</td>
//                     <td>{totalKgs.toFixed(2)} kg</td>
//                     <td>{totalPrice.toFixed(2)}</td>
//                     <td>
//                       {deliveryTypes.map(({ deliveryType, _count }) => (
//                         <span 
//                           key={deliveryType} 
//                           className="badge me-1"
//                           style={{ 
//                             backgroundColor: deliveryType === 'DIRECT_DELIVERY' 
//                               ? theme.directDelivery 
//                               : theme.centralStation 
//                           }}
//                         >
//                           {deliveryType}: {_count.id}
//                         </span>
//                       ))}
//                     </td>
//                     <td>
//                       <button 
//                         className="btn btn-sm"
//                         style={{ 
//                           color: theme.primary,
//                           borderColor: theme.primary,
//                           backgroundColor: 'transparent',
//                           ':hover': {
//                             backgroundColor: theme.primary
//                           }
//                         }}
//                         onClick={() => viewDailyDetails(date)}
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchaseList;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../constants/Constants';

const theme = {
  primary: '#008080',    
  secondary: '#4FB3B3',  
  accent: '#D95032',     
  neutral: '#E6F3F3',    
  tableHover: '#F8FAFA', 
  directDelivery: '#4FB3B3',
  centralStation: '#008080'  
};

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [siteCollections, setSiteCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user'));

  const [newPurchase, setNewPurchase] = useState({
    cwsId: userInfo.cwsId,
    deliveryType: 'DIRECT_DELIVERY',
    totalKgs: '',
    totalPrice: '',
    grade: 'A',
    purchaseDate: new Date().toISOString().split('T')[0],
    siteCollectionId: '',
    batchNo: ''
  });

  useEffect(() => {
    fetchPurchases();
    fetchSiteCollections();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${API_URL}/purchases`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPurchases(response.data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchSiteCollections = async () => {
    try {
      const response = await axios.get(`${API_URL}/site-collections/cws/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSiteCollections(response.data);
    } catch (error) {
      console.error('Error fetching site collections:', error);
    }
  };

  const handleNewPurchaseChange = (e) => {
    setNewPurchase({
      ...newPurchase,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPurchase = {
        ...newPurchase,
        totalKgs: parseFloat(newPurchase.totalKgs),
        totalPrice: parseFloat(newPurchase.totalPrice),
        cwsId: parseInt(newPurchase.cwsId, 10),
        siteCollectionId: newPurchase.siteCollectionId ? parseInt(newPurchase.siteCollectionId, 10) : null,
        purchaseDate: new Date(newPurchase.purchaseDate)
      };

      if (formattedPurchase.deliveryType === 'DIRECT_DELIVERY') {
        delete formattedPurchase.siteCollectionId;
      }

      const response = await axios.post(`${API_URL}/purchases`, formattedPurchase, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPurchases([response.data, ...purchases]);
      setNewPurchase({
        cwsId: userInfo.cwsId,
        deliveryType: 'DIRECT_DELIVERY',
        totalKgs: '',
        totalPrice: '',
        grade: 'A',
        purchaseDate: new Date().toISOString().split('T')[0],
        siteCollectionId: '',
        batchNo: ''
      });
    } catch (error) {
      console.error('Error adding purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="text-left">
              <tr style={{ backgroundColor: theme.neutral }}>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Site</th>
                <th className="px-4 py-3 font-semibold">Delivery Type</th>
                <th className="px-4 py-3 font-semibold">Total KGs</th>
                <th className="px-4 py-3 font-semibold">Price (RWF)</th>
                <th className="px-4 py-3 font-semibold">Grade</th>
                <th className="px-4 py-3 font-semibold">Batch No</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2">
                  <input
                    type="date"
                    name="purchaseDate"
                    value={newPurchase.purchaseDate}
                    onChange={handleNewPurchaseChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </td>
                <td className="px-4 py-2">
                  {newPurchase.deliveryType === 'SITE_COLLECTION' && (
                    <select
                      name="siteCollectionId"
                      value={newPurchase.siteCollectionId}
                      onChange={handleNewPurchaseChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select Site</option>
                      {siteCollections.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4 py-2">
                  <select
                    name="deliveryType"
                    value={newPurchase.deliveryType}
                    onChange={handleNewPurchaseChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="DIRECT_DELIVERY">Direct</option>
                    <option value="SITE_COLLECTION">Site</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="1"
                    name="totalKgs"
                    value={newPurchase.totalKgs}
                    onChange={handleNewPurchaseChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="KGs"
                    required
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    step="1"
                    name="totalPrice"
                    value={newPurchase.totalPrice}
                    onChange={handleNewPurchaseChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Price"
                    required
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    name="grade"
                    value={newPurchase.grade}
                    onChange={handleNewPurchaseChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="batchNo"
                      hidden
                      value={newPurchase.batchNo}
                      onChange={handleNewPurchaseChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Batch No"
                    />
                    <button
                      className="px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: theme.primary }}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        '+'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
              {purchases.map((purchase) => (
                <tr 
                  key={purchase.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{purchase.siteCollection?.name || 'Direct'}</td>
                  <td className="px-4 py-3">
                    <span 
                      className="px-3 py-1 text-white text-sm rounded-full"
                      style={{ 
                        backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' 
                          ? theme.directDelivery 
                          : theme.centralStation 
                      }}
                    >
                      {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' : 'Site'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{purchase.totalKgs.toLocaleString()}</td>
                  <td className="px-4 py-3">{purchase.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">{purchase.grade}</td>
                  <td className="px-4 py-3">{purchase.batchNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseList;