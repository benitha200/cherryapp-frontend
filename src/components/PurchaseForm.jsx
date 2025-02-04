// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const PurchaseForm = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     cwsId: '',
//     deliveryType: 'DIRECT_DELIVERY',
//     totalKgs: '',
//     totalPrice: '',
//     grade: 'CA',
//     siteCollections: []
//   });
//   const [cwsList, setCwsList] = useState([]);
//   const [availableSiteCollections, setAvailableSiteCollections] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCWSList();
//   }, []);

//   useEffect(() => {
//     if (formData.cwsId) {
//       fetchSiteCollections(formData.cwsId);
//     }
//   }, [formData.cwsId]);

//   const fetchCWSList = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/cws', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setCwsList(response.data);
//     } catch (error) {
//       setError('Error fetching CWS list');
//     }
//   };

//   const fetchSiteCollections = async (cwsId) => {
//     try {
//       const response = await axios.get(`http://localhost:3000/api/site-collections/cws/${cwsId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setAvailableSiteCollections(response.data);
//     } catch (error) {
//       setError('Error fetching site collections');
//     }
//   };

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
//         await axios.post('http://localhost:3000/api/purchases', purchase, {
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
//             <div className="card-header bg-info bg-opacity-10 border-0">
//               <h2 className="card-title h4 mb-0 text-info py-2">New Purchase</h2>
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
//                   <label className="form-label text-secondary">CWS</label>
//                   <select
//                     className="form-select border-0 bg-light"
//                     value={formData.cwsId}
//                     onChange={(e) => setFormData({ ...formData, cwsId: e.target.value })}
//                     required
//                   >
//                     <option value="">Select CWS</option>
//                     {cwsList.map((cws) => (
//                       <option key={cws.id} value={cws.id}>{cws.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label text-secondary">Delivery Type</label>
//                   <select
//                     className="form-select border-0 bg-light"
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
//                       <div key={index} className="mb-4 p-3 border rounded bg-light">
//                         <div className="d-flex justify-content-between align-items-center mb-3">
//                           <h6 className="mb-0">Site Collection {index + 1}</h6>
//                           <button
//                             type="button"
//                             className="btn btn-outline-danger btn-sm"
//                             onClick={() => removeSiteCollection(index)}
//                           >
//                             <i className="bi bi-trash"></i>
//                           </button>
//                         </div>

//                         <div className="mb-3">
//                           <label className="form-label text-secondary">Site</label>
//                           <select
//                             className="form-select border-0 bg-white"
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

//                         <div className="mb-3">
//                           <label className="form-label text-secondary">KGs</label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="form-control border-0 bg-white"
//                             value={site.totalKgs}
//                             onChange={(e) => updateSiteCollection(index, 'totalKgs', e.target.value)}
//                             required
//                           />
//                         </div>

//                         <div className="mb-3">
//                           <label className="form-label text-secondary">Price</label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="form-control border-0 bg-white"
//                             value={site.totalPrice}
//                             onChange={(e) => updateSiteCollection(index, 'totalPrice', e.target.value)}
//                             required
//                           />
//                         </div>
//                       </div>
//                     ))}

//                     <button
//                       type="button"
//                       className="btn btn-outline-info w-100 mb-4"
//                       onClick={addSiteCollection}
//                     >
//                       <i className="bi bi-plus-circle me-2"></i>
//                       Add Site Collection
//                     </button>

//                     <div className="mb-4">
//                       <label className="form-label text-secondary">Total KGs (Calculated)</label>
//                       <input
//                         type="number"
//                         className="form-control border-0 bg-light"
//                         value={formData.totalKgs}
//                         readOnly
//                       />
//                     </div>

//                     <div className="mb-4">
//                       <label className="form-label text-secondary">Total Price (Calculated)</label>
//                       <input
//                         type="number"
//                         className="form-control border-0 bg-light"
//                         value={formData.totalPrice}
//                         readOnly
//                       />
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <div className="mb-4">
//                       <label className="form-label text-secondary">Total KGs</label>
//                       <div className="input-group">
//                         <input
//                           type="number"
//                           step="0.01"
//                           className="form-control border-0 bg-light"
//                           value={formData.totalKgs}
//                           onChange={(e) => setFormData({ ...formData, totalKgs: e.target.value })}
//                           required
//                         />
//                         <span className="input-group-text border-0 bg-light">kg</span>
//                       </div>
//                     </div>

//                     <div className="mb-4">
//                       <label className="form-label text-secondary">Total Price</label>
//                       <div className="input-group">
//                         <input
//                           type="number"
//                           step="0.01"
//                           className="form-control border-0 bg-light"
//                           value={formData.totalPrice}
//                           onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <div className="mb-4">
//                   <label className="form-label text-secondary">Grade</label>
//                   <select
//                     className="form-select border-0 bg-light"
//                     value={formData.grade}
//                     onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
//                     required
//                   >
//                     <option value="CA">CA</option>
//                     <option value="CB">CB</option>
//                     <option value="NA">NA</option>
//                     <option value="NB">NB</option>
//                   </select>
//                 </div>

//                 <button
//                   type="submit"
//                   className="btn btn-info w-100 text-white py-2"
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

const PurchaseForm = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));
  console.log(JSON.stringify(userInfo));
  const [formData, setFormData] = useState({
    cwsId: userInfo.cwsId, // Use cwsId from user info directly
    deliveryType: 'DIRECT_DELIVERY',
    totalKgs: '',
    totalPrice: '',
    grade: 'CA',
    siteCollections: []
  });
  const [availableSiteCollections, setAvailableSiteCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSiteCollections(formData.cwsId);
  }, []);

  const fetchSiteCollections = async (cwsId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/site-collections/cws/${cwsId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAvailableSiteCollections(response.data);
    } catch (error) {
      setError('Error fetching site collections');
    }
  };

  // Rest of the component remains the same as in the original code
  const addSiteCollection = () => {
    setFormData(prev => ({
      ...prev,
      siteCollections: [
        ...prev.siteCollections,
        { siteCollectionId: '', totalKgs: '', totalPrice: '' }
      ]
    }));
  };

  const removeSiteCollection = (index) => {
    setFormData(prev => ({
      ...prev,
      siteCollections: prev.siteCollections.filter((_, i) => i !== index)
    }));
  };

  const updateSiteCollection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      siteCollections: prev.siteCollections.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotals = () => {
    if (formData.deliveryType === 'SITE_COLLECTION' && formData.siteCollections.length > 0) {
      const totalKgs = formData.siteCollections.reduce((sum, item) => 
        sum + (parseFloat(item.totalKgs) || 0), 0);
      const totalPrice = formData.siteCollections.reduce((sum, item) => 
        sum + (parseFloat(item.totalPrice) || 0), 0);

      setFormData(prev => ({
        ...prev,
        totalKgs: totalKgs.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
      }));
    }
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.siteCollections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const purchases = [];

      if (formData.deliveryType === 'DIRECT_DELIVERY') {
        purchases.push({
          cwsId: parseInt(formData.cwsId, 10),
          deliveryType: formData.deliveryType,
          totalKgs: parseFloat(formData.totalKgs),
          totalPrice: parseFloat(formData.totalPrice),
          grade: formData.grade
        });
      } else {
        // Create separate purchase records for each site collection
        formData.siteCollections.forEach(site => {
          purchases.push({
            cwsId: parseInt(formData.cwsId, 10),
            deliveryType: formData.deliveryType,
            totalKgs: parseFloat(site.totalKgs),
            totalPrice: parseFloat(site.totalPrice),
            grade: formData.grade,
            siteCollectionId: parseInt(site.siteCollectionId, 10)
          });
        });
      }

      // Create all purchases sequentially
      for (const purchase of purchases) {
        await axios.post('http://localhost:3000/api/purchases', purchase, {
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
            <div className="card-header bg-info bg-opacity-10 border-0">
              <h2 className="card-title h4 mb-0 text-info py-2">New Purchase</h2>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                {/* Removed CWS select dropdown */}
                <div className="mb-4">
                  {/* <label className="form-label text-secondary">CWS</label> */}
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    value={userInfo.cwsId} 
                    readOnly 
                    hidden
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary">Delivery Type</label>
                  <select
                    className="form-select border-0 bg-light"
                    value={formData.deliveryType}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        deliveryType: e.target.value,
                        siteCollections: [],
                        totalKgs: '',
                        totalPrice: ''
                      });
                    }}
                    required
                  >
                    <option value="DIRECT_DELIVERY">Direct Delivery</option>
                    <option value="SITE_COLLECTION">Site Collection</option>
                  </select>
                </div>

                {/* Rest of the component remains the same */}
                {formData.deliveryType === 'SITE_COLLECTION' ? (
                  <>
                    {formData.siteCollections.map((site, index) => (
                      <div key={index} className="mb-4 p-3 border rounded bg-light">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="mb-0">Site Collection {index + 1}</h6>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeSiteCollection(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-secondary">Site</label>
                          <select
                            className="form-select border-0 bg-white"
                            value={site.siteCollectionId}
                            onChange={(e) => updateSiteCollection(index, 'siteCollectionId', e.target.value)}
                            required
                          >
                            <option value="">Select Site Collection</option>
                            {availableSiteCollections.map((site) => (
                              <option key={site.id} value={site.id}>{site.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-secondary">KGs</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control border-0 bg-white"
                            value={site.totalKgs}
                            onChange={(e) => updateSiteCollection(index, 'totalKgs', e.target.value)}
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-secondary">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control border-0 bg-white"
                            value={site.totalPrice}
                            onChange={(e) => updateSiteCollection(index, 'totalPrice', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline-info w-100 mb-4"
                      onClick={addSiteCollection}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Site Collection
                    </button>

                    <div className="mb-4">
                      <label className="form-label text-secondary">Total KGs (Calculated)</label>
                      <input
                        type="number"
                        className="form-control border-0 bg-light"
                        value={formData.totalKgs}
                        readOnly
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary">Total Price (Calculated)</label>
                      <input
                        type="number"
                        className="form-control border-0 bg-light"
                        value={formData.totalPrice}
                        readOnly
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="form-label text-secondary">Total KGs</label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.01"
                          className="form-control border-0 bg-light"
                          value={formData.totalKgs}
                          onChange={(e) => setFormData({ ...formData, totalKgs: e.target.value })}
                          required
                        />
                        <span className="input-group-text border-0 bg-light">kg</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-secondary">Total Price</label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.01"
                          className="form-control border-0 bg-light"
                          value={formData.totalPrice}
                          onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mb-4">
                  <label className="form-label text-secondary">Grade</label>
                  <select
                    className="form-select border-0 bg-light"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  >
                    <option value="CA">CA</option>
                    <option value="CB">CB</option>
                    <option value="NA">NA</option>
                    <option value="NB">NB</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 text-white py-2"
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