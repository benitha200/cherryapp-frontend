// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../constants/Constants';

// // Consistent theme colors
// const theme = {
//   primary: '#008080',    // Sucafina teal
//   secondary: '#4FB3B3',  // Lighter teal
//   accent: '#D95032',     // Complementary orange
//   neutral: '#E6F3F3',    // Very light teal
//   lightBg: '#F8FAFA',    // Ultra light teal for inputs
//   text: '#2C3E50',       // Dark text color
//   error: '#DC3545'       // Error red
// };
// const PurchaseForm = () => {
//   const navigate = useNavigate();
//   const userInfo = JSON.parse(localStorage.getItem('user'));
//   console.log(JSON.stringify(userInfo));
//   const [formData, setFormData] = useState({
//     cwsId: userInfo.cwsId, // Use cwsId from user info directly
//     deliveryType: 'DIRECT_DELIVERY',
//     totalKgs: '',
//     totalPrice: '',
//     grade: 'A',
//     siteCollections: []
//   });
//   const [availableSiteCollections, setAvailableSiteCollections] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchSiteCollections(formData.cwsId);
//   }, []);

//   const fetchSiteCollections = async (cwsId) => {
//     try {
//       const response = await axios.get(`${API_URL}/site-collections/cws/${cwsId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setAvailableSiteCollections(response.data);
//     } catch (error) {
//       setError('Error fetching site collections');
//     }
//   };

//   // Rest of the component remains the same as in the original code
//   const addSiteCollection = () => {
//     setFormData(prev => ({
//       ...prev,
//       siteCollections: [
//         ...prev.siteCollections,
//         { siteCollectionId: '', totalKgs: '', totalPrice: '' }
//       ]
//     }));
//   };

//   const removeSiteCollection = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       siteCollections: prev.siteCollections.filter((_, i) => i !== index)
//     }));
//   };

//   const updateSiteCollection = (index, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       siteCollections: prev.siteCollections.map((item, i) => 
//         i === index ? { ...item, [field]: value } : item
//       )
//     }));
//   };

//   const calculateTotals = () => {
//     if (formData.deliveryType === 'SITE_COLLECTION' && formData.siteCollections.length > 0) {
//       const totalKgs = formData.siteCollections.reduce((sum, item) => 
//         sum + (parseFloat(item.totalKgs) || 0), 0);
//       const totalPrice = formData.siteCollections.reduce((sum, item) => 
//         sum + (parseFloat(item.totalPrice) || 0), 0);

//       setFormData(prev => ({
//         ...prev,
//         totalKgs: totalKgs.toFixed(2),
//         totalPrice: totalPrice.toFixed(2)
//       }));
//     }
//   };

//   useEffect(() => {
//     calculateTotals();
//   }, [formData.siteCollections]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const purchases = [];

//       if (formData.deliveryType === 'DIRECT_DELIVERY') {
//         purchases.push({
//           cwsId: parseInt(formData.cwsId, 10),
//           deliveryType: formData.deliveryType,
//           totalKgs: parseFloat(formData.totalKgs),
//           totalPrice: parseFloat(formData.totalPrice),
//           grade: formData.grade
//         });
//       } else {
//         // Create separate purchase records for each site collection
//         formData.siteCollections.forEach(site => {
//           purchases.push({
//             cwsId: parseInt(formData.cwsId, 10),
//             deliveryType: formData.deliveryType,
//             totalKgs: parseFloat(site.totalKgs),
//             totalPrice: parseFloat(site.totalPrice),
//             grade: formData.grade,
//             siteCollectionId: parseInt(site.siteCollectionId, 10)
//           });
//         });
//       }

//       // Create all purchases sequentially
//       for (const purchase of purchases) {
//         await axios.post(`${API_URL}/purchases`, purchase, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//       }

//       navigate('/purchases');
//     } catch (error) {
//       setError(error.response?.data?.error || 'Error creating purchase');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="container py-4">
//       <div className="row justify-content-center">
//         <div className="col-12 col-md-8 col-lg-6">
//           <div className="card border-0 shadow-sm">
//             <div className="card-header border-0" style={{ backgroundColor: theme.neutral }}>
//               <h2 className="card-title h4 mb-0 py-2" style={{ color: theme.primary }}>New Purchase</h2>
//             </div>
//             <div className="card-body p-4">
//               {error && (
//                 <div className="alert alert-danger d-flex align-items-center" role="alert">
//                   <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                   {error}
//                 </div>
//               )}
              
//               <form onSubmit={handleSubmit} className="needs-validation" noValidate>
//                 <div className="mb-4">
//                   <input 
//                     type="text" 
//                     className="form-control border-0"
//                     style={{ backgroundColor: theme.lightBg }}
//                     value={userInfo.cwsId} 
//                     readOnly 
//                     hidden
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label" style={{ color: theme.text }}>Delivery Type</label>
//                   <select
//                     className="form-select border-0"
//                     style={{ backgroundColor: theme.lightBg }}
//                     value={formData.deliveryType}
//                     onChange={(e) => {
//                       setFormData({
//                         ...formData,
//                         deliveryType: e.target.value,
//                         siteCollections: [],
//                         totalKgs: '',
//                         totalPrice: ''
//                       });
//                     }}
//                     required
//                   >
//                     <option value="DIRECT_DELIVERY">Direct Delivery</option>
//                     <option value="SITE_COLLECTION">Site Collection</option>
//                   </select>
//                 </div>

//                 {formData.deliveryType === 'SITE_COLLECTION' ? (
//                   <>
//                     {formData.siteCollections.map((site, index) => (
//                       <div key={index} className="mb-4 p-3 border rounded" style={{ backgroundColor: theme.lightBg }}>
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <h6 className="mb-0" style={{ color: theme.primary }}>Site Collection {index + 1}</h6>
//                           <button
//                             type="button"
//                             className="btn btn-sm"
//                             style={{ 
//                               color: theme.error,
//                               borderColor: theme.error,
//                               backgroundColor: 'transparent'
//                             }}
//                             onClick={() => removeSiteCollection(index)}
//                           >
//                             <i className="bi bi-trash"></i>
//                           </button>
//                         </div>

//                         <div className="mb-3">
//                           <label className="form-label" style={{ color: theme.text }}>Site</label>
//                           <select
//                             className="form-select border-0"
//                             style={{ backgroundColor: 'white' }}
//                             value={site.siteCollectionId}
//                             onChange={(e) => updateSiteCollection(index, 'siteCollectionId', e.target.value)}
//                             required
//                           >
//                             <option value="">Select Site Collection</option>
//                             {availableSiteCollections.map((site) => (
//                               <option key={site.id} value={site.id}>{site.name}</option>
//                             ))}
//                           </select>
//                         </div>

//                         {/* Site Collection inputs styled similarly */}
//                         <div className="mb-3">
//                           <label className="form-label" style={{ color: theme.text }}>KGs</label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="form-control border-0"
//                             style={{ backgroundColor: 'white' }}
//                             value={site.totalKgs}
//                             onChange={(e) => updateSiteCollection(index, 'totalKgs', e.target.value)}
//                             required
//                           />
//                         </div>

//                         <div className="mb-3">
//                           <label className="form-label" style={{ color: theme.text }}>Price</label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="form-control border-0"
//                             style={{ backgroundColor: 'white' }}
//                             value={site.totalPrice}
//                             onChange={(e) => updateSiteCollection(index, 'totalPrice', e.target.value)}
//                             required
//                           />
//                         </div>
//                       </div>
//                     ))}

//                     <button
//                       type="button"
//                       className="btn w-100 mb-4"
//                       style={{ 
//                         color: theme.primary,
//                         borderColor: theme.primary,
//                         backgroundColor: 'transparent'
//                       }}
//                       onClick={addSiteCollection}
//                     >
//                       <i className="bi bi-plus-circle me-2"></i>
//                       Add Site Collection
//                     </button>

//                     {/* Calculated fields */}
//                     <div className="mb-4">
//                       <label className="form-label" style={{ color: theme.text }}>Total KGs (Calculated)</label>
//                       <input
//                         type="number"
//                         className="form-control border-0"
//                         style={{ backgroundColor: theme.lightBg }}
//                         value={formData.totalKgs}
//                         readOnly
//                       />
//                     </div>

//                     <div className="mb-4">
//                       <label className="form-label" style={{ color: theme.text }}>Total Price (Calculated)</label>
//                       <input
//                         type="number"
//                         className="form-control border-0"
//                         style={{ backgroundColor: theme.lightBg }}
//                         value={formData.totalPrice}
//                         readOnly
//                       />
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="mb-4">
//                       <label className="form-label" style={{ color: theme.text }}>Total KGs</label>
//                       <div className="input-group">
//                         <input
//                           type="number"
//                           step="0.01"
//                           className="form-control border-0"
//                           style={{ backgroundColor: theme.lightBg }}
//                           value={formData.totalKgs}
//                           onChange={(e) => setFormData({ ...formData, totalKgs: e.target.value })}
//                           required
//                         />
//                         <span className="input-group-text border-0" style={{ backgroundColor: theme.lightBg }}>kg</span>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <label className="form-label" style={{ color: theme.text }}>Total Price</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         className="form-control border-0"
//                         style={{ backgroundColor: theme.lightBg }}
//                         value={formData.totalPrice}
//                         onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div className="mb-4">
//                   <label className="form-label" style={{ color: theme.text }}>Grade</label>
//                   <select
//                     className="form-select border-0"
//                     style={{ backgroundColor: theme.lightBg }}
//                     value={formData.grade}
//                     onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
//                     required
//                   >
//                     <option value="CA">A</option>
//                     <option value="CB">B</option>
//                   </select>
//                 </div>

//                 <button
//                   type="submit"
//                   className="btn w-100 py-2 text-white"
//                   style={{ 
//                     backgroundColor: theme.primary,
//                     borderColor: theme.primary
//                   }}
//                   disabled={loading || (formData.deliveryType === 'SITE_COLLECTION' && formData.siteCollections.length === 0)}
//                 >
//                   {loading ? (
//                     <div className="d-flex align-items-center justify-content-center">
//                       <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                       <span>Creating Purchase...</span>
//                     </div>
//                   ) : (
//                     <div className="d-flex align-items-center justify-content-center">
//                       <i className="bi bi-plus-circle me-2"></i>
//                       <span>Create Purchase</span>
//                     </div>
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchaseForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

// Consistent theme colors
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange
  neutral: '#E6F3F3',    // Very light teal
  lightBg: '#F8FAFA',    // Ultra light teal for inputs
  text: '#2C3E50',       // Dark text color
  error: '#DC3545'       // Error red
};

const PurchaseForm = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    cwsId: userInfo.cwsId,
    deliveryType: 'DIRECT_DELIVERY',
    purchaseDate: '',
    grades: {
      A: { totalKgs: '', totalPrice: '' },
      B: { totalKgs: '', totalPrice: '' }
    },
    siteCollections: []
  });

  const [availableSiteCollections, setAvailableSiteCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSiteCollections(formData.cwsId);
    // Set default date to today, but make it editable
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, purchaseDate: today }));
  }, []);


  const fetchSiteCollections = async (cwsId) => {
    try {
      const response = await axios.get(`${API_URL}/site-collections/cws/${cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableSiteCollections(response.data);
    } catch (error) {
      setError('Error fetching site collections');
    }
  };

  const addSiteCollection = () => {
    setFormData(prev => ({
      ...prev,
      siteCollections: [
        ...prev.siteCollections,
        { 
          siteCollectionId: '', 
          grades: {
            A: { totalKgs: '', totalPrice: '' },
            B: { totalKgs: '', totalPrice: '' }
          }
        }
      ]
    }));
  };

  const removeSiteCollection = (index) => {
    setFormData(prev => ({
      ...prev,
      siteCollections: prev.siteCollections.filter((_, i) => i !== index)
    }));
  };

  const updateDirectGrade = (grade, field, value) => {
    setFormData(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: {
          ...prev.grades[grade],
          [field]: value
        }
      }
    }));
  };

  const updateSiteCollection = (index, grade, field, value) => {
    setFormData(prev => ({
      ...prev,
      siteCollections: prev.siteCollections.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              grades: {
                ...item.grades,
                [grade]: {
                  ...item.grades[grade],
                  [field]: value
                }
              }
            } 
          : item
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const purchases = [];

      if (formData.deliveryType === 'DIRECT_DELIVERY') {
        // Create purchase for each grade with non-zero values
        Object.entries(formData.grades).forEach(([grade, data]) => {
          if (parseFloat(data.totalKgs) > 0 && parseFloat(data.totalPrice) > 0) {
            purchases.push({
              cwsId: parseInt(formData.cwsId, 10),
              deliveryType: formData.deliveryType,
              totalKgs: parseFloat(data.totalKgs),
              totalPrice: parseFloat(data.totalPrice),
              grade: grade,
              purchaseDate: formData.purchaseDate
            });
          }
        });
      } else {
        // Create purchase for each site collection and each grade
        formData.siteCollections.forEach(site => {
          Object.entries(site.grades).forEach(([grade, data]) => {
            if (parseFloat(data.totalKgs) > 0 && parseFloat(data.totalPrice) > 0) {
              purchases.push({
                cwsId: parseInt(formData.cwsId, 10),
                deliveryType: formData.deliveryType,
                totalKgs: parseFloat(data.totalKgs),
                totalPrice: parseFloat(data.totalPrice),
                grade: grade,
                siteCollectionId: parseInt(site.siteCollectionId, 10),
                purchaseDate: formData.purchaseDate
              });
            }
          });
        });
      }

      // Create all purchases sequentially
      for (const purchase of purchases) {
        await axios.post(`${API_URL}/purchases`, purchase, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }

      navigate('/purchases');
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating purchase');
    }
    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0" style={{ backgroundColor: theme.neutral }}>
              <h2 className="card-title h4 mb-0 py-2" style={{ color: theme.primary }}>New Purchase</h2>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-4">
                  <label className="form-label" style={{ color: theme.text }}>Purchase Date</label>
                  <input
                    type="date"
                    className="form-control border-0"
                    style={{ backgroundColor: theme.lightBg }}
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ color: theme.text }}>Delivery Type</label>
                  <select
                    className="form-select border-0"
                    style={{ backgroundColor: theme.lightBg }}
                    value={formData.deliveryType}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        deliveryType: e.target.value,
                        siteCollections: [],
                        grades: {
                          A: { totalKgs: '', totalPrice: '' },
                          B: { totalKgs: '', totalPrice: '' }
                        }
                      });
                    }}
                    required
                  >
                    <option value="DIRECT_DELIVERY">Direct Delivery</option>
                    <option value="SITE_COLLECTION">Site Collection</option>
                  </select>
                </div>

                {formData.deliveryType === 'DIRECT_DELIVERY' ? (
                  <>
                    {['A', 'B'].map(grade => (
                      <div key={grade} className="mb-4 p-3 border rounded" style={{ backgroundColor: theme.lightBg }}>
                        <h6 className="mb-3" style={{ color: theme.primary }}>Grade {grade}</h6>
                        
                        <div className="mb-3">
                          <label className="form-label" style={{ color: theme.text }}>KGs</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control border-0"
                            style={{ backgroundColor: 'white' }}
                            value={formData.grades[grade].totalKgs}
                            onChange={(e) => updateDirectGrade(grade, 'totalKgs', e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label" style={{ color: theme.text }}>Price</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control border-0"
                            style={{ backgroundColor: 'white' }}
                            value={formData.grades[grade].totalPrice}
                            onChange={(e) => updateDirectGrade(grade, 'totalPrice', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {formData.siteCollections.map((site, index) => (
                      <div key={index} className="mb-4 p-3 border rounded" style={{ backgroundColor: theme.lightBg }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0" style={{ color: theme.primary }}>Site Collection {index + 1}</h6>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ 
                              color: theme.error,
                              borderColor: theme.error,
                              backgroundColor: 'transparent'
                            }}
                            onClick={() => removeSiteCollection(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="form-label" style={{ color: theme.text }}>Site</label>
                          <select
                            className="form-select border-0"
                            style={{ backgroundColor: 'white' }}
                            value={site.siteCollectionId}
                            onChange={(e) => {
                              const newSiteCollections = [...formData.siteCollections];
                              newSiteCollections[index].siteCollectionId = e.target.value;
                              setFormData({ ...formData, siteCollections: newSiteCollections });
                            }}
                            required
                          >
                            <option value="">Select Site Collection</option>
                            {availableSiteCollections.map((site) => (
                              <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                          </select>
                        </div>

                        {['A', 'B'].map(grade => (
                          <div key={grade}>
                            <h6 className="mb-3" style={{ color: theme.secondary }}>Grade {grade}</h6>
                            <div className="mb-3">
                              <label className="form-label" style={{ color: theme.text }}>KGs</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control border-0"
                                style={{ backgroundColor: 'white' }}
                                value={site.grades[grade].totalKgs}
                                onChange={(e) => updateSiteCollection(index, grade, 'totalKgs', e.target.value)}
                              />
                            </div>

                            <div className="mb-3">
                              <label className="form-label" style={{ color: theme.text }}>Price</label>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control border-0"
                                style={{ backgroundColor: 'white' }}
                                value={site.grades[grade].totalPrice}
                                onChange={(e) => updateSiteCollection(index, grade, 'totalPrice', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn w-100 mb-4"
                      style={{ 
                        color: theme.primary,
                        borderColor: theme.primary,
                        backgroundColor: 'transparent'
                      }}
                      onClick={addSiteCollection}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Site Collection
                    </button>
                  </>
                )}

                <button
                  type="submit"
                  className="btn w-100 py-2 text-white"
                  style={{ 
                    backgroundColor: theme.primary,
                    borderColor: theme.primary
                  }}
                  disabled={loading || (formData.deliveryType === 'SITE_COLLECTION' && formData.siteCollections.length === 0)}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Creating Purchase...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>Create Purchase</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;