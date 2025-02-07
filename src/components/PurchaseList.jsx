// import React, { useState, useEffect } from 'react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import axios from 'axios';
// import API_URL from '../constants/Constants';

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
//   const [purchases, setPurchases] = useState([]);
//   const [siteCollections, setSiteCollections] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [prices, setPrices] = useState({
//     A: 800,
//     B: 700
//   });
//   const [editingPrice, setEditingPrice] = useState({
//     A: false,
//     B: false
//   });
//   const userInfo = JSON.parse(localStorage.getItem('user'));

//   const [newPurchase, setNewPurchase] = useState({
//     cwsId: userInfo.cwsId,
//     deliveryType: 'DIRECT_DELIVERY',
//     totalKgs: '',
//     totalPrice: '',
//     grade: 'A',
//     purchaseDate: new Date().toISOString().split('T')[0],
//     siteCollectionId: '',
//     batchNo: ''
//   });

//   useEffect(() => {
//     fetchPurchases();
//     fetchSiteCollections();
//   }, []);

//   useEffect(() => {
//     if (newPurchase.totalKgs && newPurchase.grade) {
//       const price = prices[newPurchase.grade];
//       setNewPurchase(prev => ({
//         ...prev,
//         totalPrice: (parseFloat(prev.totalKgs) * price).toString()
//       }));
//     }
//   }, [newPurchase.totalKgs, newPurchase.grade, prices]);

//   const fetchPurchases = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/purchases`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setPurchases(response.data);
//     } catch (error) {
//       console.error('Error fetching purchases:', error);
//     }
//   };

//   const fetchSiteCollections = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/site-collections/cws/${userInfo.cwsId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setSiteCollections(response.data);
//     } catch (error) {
//       console.error('Error fetching site collections:', error);
//     }
//   };

//   const handleNewPurchaseChange = (e) => {
//     const { name, value } = e.target;
//     setNewPurchase(prev => ({
//       ...prev,
//       [name]: value,
//       ...(name === 'totalKgs' && {
//         totalPrice: (parseFloat(value || 0) * prices[prev.grade]).toString()
//       })
//     }));
//   };

//   const handlePriceEdit = (grade) => {
//     setEditingPrice(prev => ({
//       ...prev,
//       [grade]: true
//     }));
//   };

//   const handlePriceChange = (grade, value) => {
//     setPrices(prev => ({
//       ...prev,
//       [grade]: parseFloat(value) || 0
//     }));
//   };

//   const handlePriceSave = (grade) => {
//     setEditingPrice(prev => ({
//       ...prev,
//       [grade]: false
//     }));
//     // Here you would typically save the price to your backend
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formattedPurchase = {
//         ...newPurchase,
//         totalKgs: parseFloat(newPurchase.totalKgs),
//         totalPrice: parseFloat(newPurchase.totalPrice),
//         cwsId: parseInt(newPurchase.cwsId, 10),
//         siteCollectionId: newPurchase.siteCollectionId ? parseInt(newPurchase.siteCollectionId, 10) : null,
//         purchaseDate: new Date(newPurchase.purchaseDate)
//       };

//       if (formattedPurchase.deliveryType === 'DIRECT_DELIVERY') {
//         delete formattedPurchase.siteCollectionId;
//       }

//       const response = await axios.post(`${API_URL}/purchases`, formattedPurchase, {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`
//         }
//       });

//       setPurchases([response.data, ...purchases]);
//       setNewPurchase({
//         cwsId: userInfo.cwsId,
//         deliveryType: 'DIRECT_DELIVERY',
//         totalKgs: '',
//         totalPrice: '',
//         grade: 'A',
//         purchaseDate: new Date().toISOString().split('T')[0],
//         siteCollectionId: '',
//         batchNo: ''
//       });
//     } catch (error) {
//       console.error('Error adding purchase:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const [filters, setFilters] = useState({
//     startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     grade: 'ALL',
//     deliveryType: 'ALL',
//     siteId: 'ALL',
//     batchNo: ''
//   });

//   const [groupBy, setGroupBy] = useState('date');
//   const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

//   // Function to filter purchases based on current filters
//   const getFilteredPurchases = () => {
//     return purchases.filter(purchase => {
//       const purchaseDate = new Date(purchase.purchaseDate);
//       const startDate = new Date(filters.startDate);
//       const endDate = new Date(filters.endDate);

//       return (
//         purchaseDate >= startDate &&
//         purchaseDate <= endDate &&
//         (filters.grade === 'ALL' || purchase.grade === filters.grade) &&
//         (filters.deliveryType === 'ALL' || purchase.deliveryType === filters.deliveryType) &&
//         (filters.siteId === 'ALL' || purchase.siteCollection?.id === filters.siteId) &&
//         (filters.batchNo === '' || purchase.batchNo?.includes(filters.batchNo))
//       );
//     });
//   };

//   // Function to group purchases based on selected grouping
//   const getGroupedPurchases = () => {
//     const filtered = getFilteredPurchases();
//     const grouped = {};

//     filtered.forEach(purchase => {
//       let key;
//       switch (groupBy) {
//         case 'date':
//           key = new Date(purchase.purchaseDate).toLocaleDateString();
//           break;
//         case 'grade':
//           key = purchase.grade;
//           break;
//         case 'deliveryType':
//           key = purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' : 'Site';
//           break;
//         case 'site':
//           key = purchase.siteCollection?.name || 'Direct Delivery';
//           break;
//         case 'batchNo':
//           key = purchase.batchNo || 'No Batch';
//           break;
//         default:
//           key = 'Other';
//       }

//       if (!grouped[key]) {
//         grouped[key] = {
//           totalKgs: 0,
//           totalPrice: 0,
//           count: 0
//         };
//       }

//       grouped[key].totalKgs += purchase.totalKgs;
//       grouped[key].totalPrice += purchase.totalPrice;
//       grouped[key].count += 1;
//     });

//     return Object.entries(grouped).map(([key, value]) => ({
//       name: key,
//       ...value
//     }));
//   };

//   return (
//     <div className="container-fluid py-4">
//       <div className="card">
//         <div className="card-header">
//           <h5 className="card-title mb-0" style={{ color: theme.primary }}>
//             Cherry Purchases Analysis
//           </h5>
//         </div>

//         <div className="card-body">
//           {/* Summary Cards */}
//           <div className="row mb-4">
//             {[
//               { label: 'Total Purchases', value: getFilteredPurchases().length, icon: 'bi-cart-check' },
//               { label: 'Total KGs', value: getFilteredPurchases().reduce((sum, p) => sum + p.totalKgs, 0).toLocaleString(), icon: 'bi-box-seam' },
//               { label: 'Total Price (RWF)', value: getFilteredPurchases().reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString(), icon: 'bi-currency-dollar' },
//               {
//                 label: 'Avg. Price/KG', value: (getFilteredPurchases().reduce((sum, p) => sum + p.totalPrice, 0) /
//                   getFilteredPurchases().reduce((sum, p) => sum + p.totalKgs, 0) || 0).toLocaleString(), icon: 'bi-calculator'
//               }
//             ].map((stat, index) => (
//               <div key={index} className="col-md-3">
//                 <div className="card border-0 shadow-sm">
//                   <div className="card-body">
//                     <div className="d-flex align-items-center">
//                       <div className="rounded-circle p-3 me-3" style={{ backgroundColor: theme.neutral }}>
//                         <i className={`bi ${stat.icon} fs-4`} style={{ color: theme.primary }}></i>
//                       </div>
//                       <div>
//                         <div className="text-muted small">{stat.label}</div>
//                         <div className="h4 mb-0" style={{ color: theme.primary }}>{stat.value}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Tabs Navigation */}
//           <ul className="nav nav-tabs" role="tablist">
//             <li className="nav-item">
//               <button
//                 className="nav-link active"
//                 data-bs-toggle="tab"
//                 data-bs-target="#filters"
//                 type="button"
//                 role="tab"
//                 style={{ color: theme.primary }}
//               >
//                 <i className="bi bi-funnel me-2"></i>
//                 Filters & Analysis
//               </button>
//             </li>
//             <li className="nav-item">
//               <button
//                 className="nav-link"
//                 data-bs-toggle="tab"
//                 data-bs-target="#records"
//                 type="button"
//                 role="tab"
//                 style={{ color: theme.primary }}
//               >
//                 <i className="bi bi-clipboard-data me-2"></i>
//                 Purchases & Pricing
//               </button>
//             </li>
//           </ul>

//           {/* Tabs Content */}
//           <div className="tab-content pt-4">
//             {/* Filters Tab */}
//             <div className="tab-pane fade show active" id="filters" role="tabpanel">
//               <div className="row g-3 mb-4">
//                 <div className="col-md-4">
//                   <div className="card border-0 shadow-sm h-100">
//                     <div className="card-body">
//                       <h6 className="card-title mb-3">
//                         <i className="bi bi-calendar-range me-2"></i>
//                         Date Range
//                       </h6>
//                       <div className="input-group">
//                         <span className="input-group-text">From</span>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={filters.startDate}
//                           onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
//                         />
//                       </div>
//                       <div className="input-group mt-2">
//                         <span className="input-group-text">To</span>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={filters.endDate}
//                           onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-md-8">
//                   <div className="card border-0 shadow-sm h-100">
//                     <div className="card-body">
//                       <h6 className="card-title mb-3">
//                         <i className="bi bi-filter me-2"></i>
//                         Filter Options
//                       </h6>
//                       <div className="row g-3">
//                         <div className="col-md-3">
//                           <label className="form-label">Grade</label>
//                           <select
//                             className="form-select"
//                             value={filters.grade}
//                             onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
//                           >
//                             <option value="ALL">All Grades</option>
//                             <option value="A">Grade A</option>
//                             <option value="B">Grade B</option>
//                           </select>
//                         </div>
//                         <div className="col-md-3">
//                           <label className="form-label">Delivery Type</label>
//                           <select
//                             className="form-select"
//                             value={filters.deliveryType}
//                             onChange={(e) => setFilters(prev => ({ ...prev, deliveryType: e.target.value }))}
//                           >
//                             <option value="ALL">All Types</option>
//                             <option value="DIRECT_DELIVERY">Direct</option>
//                             <option value="SITE_COLLECTION">Site</option>
//                           </select>
//                         </div>
//                         <div className="col-md-3">
//                           <label className="form-label">Site</label>
//                           <select
//                             className="form-select"
//                             value={filters.siteId}
//                             onChange={(e) => setFilters(prev => ({ ...prev, siteId: e.target.value }))}
//                           >
//                             <option value="ALL">All Sites</option>
//                             {siteCollections.map(site => (
//                               <option key={site.id} value={site.id}>{site.name}</option>
//                             ))}
//                           </select>
//                         </div>
//                         <div className="col-md-3">
//                           <label className="form-label">Group By</label>
//                           <select
//                             className="form-select"
//                             value={groupBy}
//                             onChange={(e) => setGroupBy(e.target.value)}
//                           >
//                             <option value="date">Date</option>
//                             <option value="grade">Grade</option>
//                             <option value="deliveryType">Delivery Type</option>
//                             <option value="site">Site</option>
//                             <option value="batchNo">Batch No</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="card border-0 shadow-sm">
//                 <div className="card-body">
//                   <div className="d-flex justify-content-between align-items-center mb-4">
//                     <h6 className="card-title mb-0">Analysis Results</h6>
//                     <div className="btn-group">
//                       <button
//                         className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
//                         onClick={() => setViewMode('table')}
//                       >
//                         <i className="bi bi-table me-2"></i>
//                         Table
//                       </button>
//                       <button
//                         className={`btn ${viewMode === 'chart' ? 'btn-primary' : 'btn-outline-primary'}`}
//                         onClick={() => setViewMode('chart')}
//                       >
//                         <i className="bi bi-bar-chart-fill me-2"></i>
//                         Chart
//                       </button>
//                     </div>
//                   </div>

//                   {viewMode === 'chart' ? (
//                     <div style={{ height: '400px' }}>
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={getGroupedPurchases()}>
//                           <XAxis dataKey="name" />
//                           <YAxis yAxisId="left" orientation="left" stroke={theme.primary} />
//                           <YAxis yAxisId="right" orientation="right" stroke={theme.secondary} />
//                           <Tooltip />
//                           <Legend />
//                           <Bar yAxisId="left" dataKey="totalKgs" name="Total KGs" fill={theme.primary} />
//                           <Bar yAxisId="right" dataKey="totalPrice" name="Total Price" fill={theme.secondary} />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   ) : (
//                     <div className="table-responsive">
//                       <table className="table table-hover">
//                         <thead>
//                           <tr style={{ backgroundColor: theme.neutral }}>
//                             <th>{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</th>
//                             <th>Total Purchases</th>
//                             <th>Total KGs</th>
//                             <th>Total Price (RWF)</th>
//                             <th>Avg. Price/KG</th>
//                             {groupBy === 'batchNo' && <th>Actions</th>}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {getGroupedPurchases().map((group, index) => (
//                             <tr key={index}>
//                               <td>{group.name}</td>
//                               <td>{group.count}</td>
//                               <td>{group.totalKgs.toLocaleString()}</td>
//                               <td>{group.totalPrice.toLocaleString()}</td>
//                               <td>{(group.totalPrice / group.totalKgs).toLocaleString()}</td>
//                               {groupBy === 'batchNo' && (
//                                 <td>
//                                   <button
//                                     className="btn btn-success btn-sm"
//                                     onClick={() => {/* Handle processing start */ }}
//                                   >
//                                     <i className="bi bi-play-fill me-1"></i>
//                                     Start Processing
//                                   </button>
//                                 </td>
//                               )}
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Prices Tab */}
//             <div className="tab-pane fade" id="records" role="tabpanel">
//               {/* Price Management Section */}
//               <div className="row g-4 mb-4">
//                 {['A', 'B'].map(grade => (
//                   <div key={grade} className="col-md-6">
//                     <div className="card border-0 shadow-sm">
//                       <div className="card-body">
//                         <h6 className="card-title mb-4">Cherry Grade {grade}</h6>
//                         <div className="d-flex justify-content-between align-items-center">
//                           {editingPrice[grade] ? (
//                             <div className="input-group">
//                               <span className="input-group-text">RWF</span>
//                               <input
//                                 type="number"
//                                 className="form-control"
//                                 value={prices[grade]}
//                                 onChange={(e) => handlePriceChange(grade, e.target.value)}
//                               />
//                               <button 
//                                 className="btn btn-primary"
//                                 onClick={() => handlePriceSave(grade)}
//                                 style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
//                               >
//                                 <i className="bi bi-check-lg me-1"></i>
//                                 Save
//                               </button>
//                             </div>
//                           ) : (
//                             <>
//                               <span className="h4 mb-0">{prices[grade]} RWF</span>
//                               <button 
//                                 className="btn btn-outline-primary"
//                                 onClick={() => handlePriceEdit(grade)}
//                                 style={{ color: theme.primary, borderColor: theme.primary }}
//                               >
//                                 <i className="bi bi-pencil me-1"></i>
//                                 Edit
//                               </button>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Purchase Records Section */}
//               <div className="card border-0 shadow-sm">
//                 <div className="card-body">
//                   <h6 className="card-title mb-4">New Purchase</h6>
//                   <form onSubmit={handleSubmit} className="row g-3 mb-4">
//                     <div className="col-md-2">
//                       <label className="form-label">Date</label>
//                       <input
//                         type="date"
//                         className="form-control"
//                         name="purchaseDate"
//                         value={newPurchase.purchaseDate}
//                         onChange={handleNewPurchaseChange}
//                         required
//                       />
//                     </div>
//                     <div className="col-md-2">
//                       <label className="form-label">Delivery Type</label>
//                       <select
//                         name="deliveryType"
//                         className="form-select"
//                         value={newPurchase.deliveryType}
//                         onChange={handleNewPurchaseChange}
//                         required
//                       >
//                         <option value="DIRECT_DELIVERY">Direct</option>
//                         <option value="SITE_COLLECTION">Site</option>
//                       </select>
//                     </div>
//                     {newPurchase.deliveryType === 'SITE_COLLECTION' && (
//                       <div className="col-md-2">
//                         <label className="form-label">Site</label>
//                         <select
//                           name="siteCollectionId"
//                           className="form-select"
//                           value={newPurchase.siteCollectionId}
//                           onChange={handleNewPurchaseChange}
//                           required
//                         >
//                           <option value="">Select Site</option>
//                           {siteCollections.map(site => (
//                             <option key={site.id} value={site.id}>{site.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                     <div className="col-md-2">
//                       <label className="form-label">Grade</label>
//                       <select
//                         name="grade"
//                         className="form-select"
//                         value={newPurchase.grade}
//                         onChange={handleNewPurchaseChange}
//                         required
//                       >
//                         <option value="A">A</option>
//                         <option value="B">B</option>
//                       </select>
//                     </div>
//                     <div className="col-md-2">
//                       <label className="form-label">Total KGs</label>
//                       <input
//                         type="number"
//                         className="form-control"
//                         name="totalKgs"
//                         value={newPurchase.totalKgs}
//                         onChange={handleNewPurchaseChange}
//                         placeholder="Enter KGs"
//                         required
//                       />
//                     </div>
//                     <div className="col-md-2">
//                       <label className="form-label">Total Price</label>
//                       <input
//                         type="number"
//                         className="form-control"
//                         name="totalPrice"
//                         value={newPurchase.totalPrice}
//                         readOnly
//                         placeholder="Calculated"
//                       />
//                     </div>
//                     <div className="col-12">
//                       <button
//                         type="submit"
//                         className="btn btn-primary float-end"
//                         disabled={loading}
//                         style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
//                       >
//                         {loading ? (
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                         ) : (
//                           <i className="bi bi-plus-lg me-2"></i>
//                         )}
//                         Add Purchase
//                       </button>
//                     </div>
//                   </form>

//                   <div className="table-responsive mt-4">
//                     <table className="table table-hover">
//                       <thead>
//                         <tr style={{ backgroundColor: theme.neutral }}>
//                           <th>Date</th>
//                           <th>Site</th>
//                           <th>Delivery Type</th>
//                           <th>Grade</th>
//                           <th>Total KGs</th>
//                           <th>Price (RWF)</th>
//                           <th>Batch No</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {purchases.map((purchase) => (
//                           <tr key={purchase.id}>
//                             <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
//                             <td>{purchase.siteCollection?.name || 'Direct'}</td>
//                             <td>
//                               <span 
//                                 className="badge"
//                                 style={{ 
//                                   backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY' 
//                                     ? theme.directDelivery 
//                                     : theme.centralStation 
//                                 }}
//                               >
//                                 {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' : 'Site'}
//                               </span>
//                             </td>
//                             <td>
//                               <span className="badge bg-secondary">
//                                 Grade {purchase.grade}
//                               </span>
//                             </td>
//                             <td>{purchase.totalKgs.toLocaleString()}</td>
//                             <td>{purchase.totalPrice.toLocaleString()}</td>
//                             <td>{purchase.batchNo || '-'}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </div>
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
  const [processingEntries, setProcessingEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState({
    A: 800,
    B: 700
  });
  const [editingPrice, setEditingPrice] = useState({
    A: false,
    B: false
  });
  const [processingType, setProcessingType] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('user'));

  // Set today's date and yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  const [newPurchase, setNewPurchase] = useState({
    cwsId: userInfo.cwsId,
    deliveryType: 'DIRECT_DELIVERY',
    totalKgs: '',
    totalPrice: '',
    grade: 'A',
    purchaseDate: yesterdayString,
    siteCollectionId: '',
    batchNo: new Date().toISOString().split('T')[0] // Use date as batch number
  });


  useEffect(() => {
    fetchPurchases();
    fetchSiteCollections();
    fetchProcessingEntries();
  }, []);


  const fetchProcessingEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/processing/cws/${userInfo.cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProcessingEntries(response.data);
    } catch (error) {
      console.error('Error fetching processing entries:', error);
    }
  };

  useEffect(() => {
    if (newPurchase.totalKgs && newPurchase.grade) {
      const price = prices[newPurchase.grade];
      setNewPurchase(prev => ({
        ...prev,
        totalPrice: (parseFloat(prev.totalKgs) * price).toString()
      }));
    }
  }, [newPurchase.totalKgs, newPurchase.grade, prices]);

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
    const { name, value } = e.target;
    setNewPurchase(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'totalKgs' && {
        totalPrice: (parseFloat(value || 0) * prices[prev.grade]).toString()
      })
    }));
  };

  const handlePriceEdit = (grade) => {
    setEditingPrice(prev => ({
      ...prev,
      [grade]: true
    }));
  };

  const handlePriceChange = (grade, value) => {
    setPrices(prev => ({
      ...prev,
      [grade]: parseFloat(value) || 0
    }));
  };

  const handlePriceSave = (grade) => {
    setEditingPrice(prev => ({
      ...prev,
      [grade]: false
    }));
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
        purchaseDate: yesterdayString // Always use yesterday's date
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
      setNewPurchase(prev => ({
        ...prev,
        totalKgs: '',
        totalPrice: '',
        batchNo: yesterdayString
      }));
    } catch (error) {
      console.error('Error adding purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcessing = async (batch) => {
    setSelectedBatch(batch);
    // Reset processing type when selecting new batch
    setProcessingType('');
  };

  const handleProcessingSubmit = async () => {
    if (!processingType) {
      // Consider adding toast notification
      console.error('Please select a processing type');
      return;
    }

    try {
      const processingData = {
        batchNo: selectedBatch.batchNo,
        processingType: processingType,
        totalKgs: selectedBatch.totalKgs,
        grade: selectedBatch.grade,
        cwsId: userInfo.cwsId
      };

      const response = await axios.post(`${API_URL}/processing`, processingData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh data
      fetchPurchases();
      fetchProcessingEntries();

      // Reset states
      setSelectedBatch(null);
      setProcessingType('');

      // Consider adding success toast
      console.log('Processing started successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start processing';
      console.error('Error starting processing:', errorMessage);
      // Consider adding error toast
    }
  };



  // Group purchases by batch and grade
  const getYesterdayPurchases = () => {
    return purchases.filter(purchase => {
      // Convert both dates to YYYY-MM-DD format for comparison
      const purchaseDate = new Date(purchase.purchaseDate).toISOString().split('T')[0];
      return purchaseDate === yesterdayString;
    });
  };


  const getBatchesByGrade = () => {
    const batches = {};
    const processingStatusMap = {}; // Track processing statuses

    // First, map processing statuses
    processingEntries.forEach(entry => {
      const batchKey = `${entry.batchNo}-${entry.grade}`;
      processingStatusMap[batchKey] = entry.status;
    });

    // Then process batches
    getYesterdayPurchases().forEach(purchase => {
      const batchKey = `${purchase.batchNo}-${purchase.grade}`;

      // MODIFIED: Only include batches that are NOT started
      const processingStatus = processingStatusMap[batchKey] || 'NOT STARTED';
      if (processingStatus !== 'NOT STARTED') return;

      if (!batches[batchKey]) {
        batches[batchKey] = {
          batchNo: purchase.batchNo,
          grade: purchase.grade,
          totalKgs: 0,
          totalPrice: 0,
          purchases: [],
          processingStatus: processingStatus
        };
      }
      batches[batchKey].totalKgs += purchase.totalKgs;
      batches[batchKey].totalPrice += purchase.totalPrice;
      batches[batchKey].purchases.push(purchase);
    });

    return Object.values(batches);
  };

  useEffect(() => {
    console.log('Yesterday string:', yesterdayString);
    console.log('All purchases:', purchases);
    console.log('Yesterday purchases:', getYesterdayPurchases());
  }, [purchases]);

  const renderProcessingStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'bg-secondary',
      'IN_PROGRESS': 'bg-warning',
      'COMPLETED': 'bg-success',
      'HALTED': 'bg-danger'
    };

    return (
      <span className={`badge ${statusColors[status] || 'bg-secondary'}`}>
        {status || 'PENDING'}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0" style={{ color: theme.primary }}>
            Cherry Purchases & Processing
          </h5>
        </div>

        <div className="card-body">
          {/* Price Management Section */}
          <div className="row g-4 mb-4">
            {['A', 'B'].map(grade => (
              <div key={grade} className="col-md-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title mb-4">Cherry Grade {grade}</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      {editingPrice[grade] ? (
                        <div className="input-group">
                          <span className="input-group-text">RWF</span>
                          <input
                            type="number"
                            className="form-control"
                            value={prices[grade]}
                            onChange={(e) => handlePriceChange(grade, e.target.value)}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => handlePriceSave(grade)}
                            style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="h4 mb-0">{prices[grade]} RWF</span>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => handlePriceEdit(grade)}
                            style={{ color: theme.primary, borderColor: theme.primary }}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Purchase Form */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h6 className="card-title mb-4">New Purchase ({yesterdayString})</h6>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-2">
                  <label className="form-label">Delivery Type</label>
                  <select
                    name="deliveryType"
                    className="form-select"
                    value={newPurchase.deliveryType}
                    onChange={handleNewPurchaseChange}
                    required
                  >
                    <option value="DIRECT_DELIVERY">Direct</option>
                    <option value="SITE_COLLECTION">Site</option>
                  </select>
                </div>
                {newPurchase.deliveryType === 'SITE_COLLECTION' && (
                  <div className="col-md-2">
                    <label className="form-label">Site</label>
                    <select
                      name="siteCollectionId"
                      className="form-select"
                      value={newPurchase.siteCollectionId}
                      onChange={handleNewPurchaseChange}
                      required
                    >
                      <option value="">Select Site</option>
                      {siteCollections.map(site => (
                        <option key={site.id} value={site.id}>{site.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-md-2">
                  <label className="form-label">Grade</label>
                  <select
                    name="grade"
                    className="form-select"
                    value={newPurchase.grade}
                    onChange={handleNewPurchaseChange}
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Total KGs</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalKgs"
                    value={newPurchase.totalKgs}
                    onChange={handleNewPurchaseChange}
                    placeholder="Enter KGs"
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Total Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="totalPrice"
                    value={newPurchase.totalPrice}
                    readOnly
                    placeholder="Calculated"
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="submit"
                    className="btn btn-primary float-end mt-4 p-2"
                    disabled={loading}
                    style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-plus-lg me-2"></i>
                    )}
                    Add Purchase
                  </button>
                </div>
                {/* <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary float-end"
                    disabled={loading}
                    style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-plus-lg me-2"></i>
                    )}
                    Add Purchase
                  </button>
                </div> */}
              </form>
            </div>
          </div>

          {/* Yesterday's Purchases Table */}
          <div className="table-responsive mt-4">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: theme.neutral }}>
                  <th>Time</th>
                  <th>Site</th>
                  <th>Delivery Type</th>
                  <th>Grade</th>
                  <th>Total KGs</th>
                  <th>Price (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {getYesterdayPurchases().map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                    <td>{purchase.siteCollection?.name || 'Direct'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: purchase.deliveryType === 'DIRECT_DELIVERY'
                            ? theme.directDelivery
                            : theme.centralStation
                        }}
                      >
                        {purchase.deliveryType === 'DIRECT_DELIVERY' ? 'Direct' : 'Site'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        Grade {purchase.grade}
                      </span>
                    </td>
                    <td>{purchase.totalKgs.toLocaleString()}</td>
                    <td>{purchase.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Batches Section */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title mb-4">Batches</h6>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr style={{ backgroundColor: theme.neutral }}>
                      <th>Batch Date</th>
                      <th>Grade</th>
                      <th>Total KGs</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getBatchesByGrade().map((batch, index) => (
                      <tr key={index}>
                        <td>{batch.batchNo}</td>
                        <td>Grade {batch.grade}</td>
                        <td>{batch.totalKgs.toLocaleString()}</td>
                        <td>{batch.totalPrice.toLocaleString()}</td>
                        <td>
                          {renderProcessingStatusBadge(batch.processingStatus)}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStartProcessing(batch)}
                            style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                            disabled={batch.processingStatus === 'IN_PROGRESS'}
                          >
                            Start Processing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Processing Modal */}
          {selectedBatch && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Start Processing - Batch {selectedBatch.batchNo}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedBatch(null)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Processing Type</label>
                      <select
                        className="form-select"
                        value={processingType}
                        onChange={(e) => setProcessingType(e.target.value)}
                        required
                      >
                        <option value="">Select Processing Type</option>
                        {selectedBatch.grade === 'A' ? (
                          <>
                            <option value="FULLY_WASHED">Fully Washed</option>
                            <option value="NATURAL">Natural</option>
                            <option value="HONEY">Honey</option>
                          </>
                        ) : (
                          <option value="FULLY_WASHED">Fully Washed</option>
                        )}
                      </select>
                    </div>
                    {/* <div className="mb-3">
                      <label className="form-label">Batch Details</label>
                      <ul className="list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Grade
                          <span className="badge bg-secondary">Grade {selectedBatch.grade}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          Total KGs
                          <span>{selectedBatch.totalKgs.toLocaleString()}</span>
                        </li>
                      </ul>
                    </div> */}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedBatch(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleProcessingSubmit}
                      disabled={!processingType}
                      style={{ backgroundColor: theme.primary, borderColor: theme.primary }}
                    >
                      Start Processing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default PurchaseList;