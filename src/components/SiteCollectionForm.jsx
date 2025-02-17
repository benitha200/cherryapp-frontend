// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../constants/Constants';

// const SiteCollectionForm = () => {
//   const navigate = useNavigate();
//   const userInfo = JSON.parse(localStorage.getItem('user'));

//   const [formData, setFormData] = useState({
//     name: '',
//     cwsId: userInfo?.cwsId || ''
//   });

//   const [cwsList, setCwsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCwsList();
//   }, []);

//   const fetchCwsList = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/cws`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setCwsList(response.data);
      
//       // If user doesn't have a cwsId, set the first CWS as default
//       if (!userInfo?.cwsId && response.data.length > 0) {
//         setFormData(prev => ({
//           ...prev,
//           cwsId: response.data[0].id
//         }));
//       }
//     } catch (error) {
//       setError('Error fetching CWS list');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await axios.post(
//         `${API_URL}/site-collections`,
//         {
//           ...formData,
//           cwsId: parseInt(formData.cwsId, 10)
//         },
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         }
//       );
//       navigate('/site-collections');
//     } catch (error) {
//       setError(error.response?.data?.error || 'Error creating site collection');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="container py-4">
//       <div className="row justify-content-center">
//         <div className="col-12 col-md-8 col-lg-6">
//           <div className="card border-0 shadow-sm">
//             <div className="card-header bg-light bg-opacity-1 border-0">
//               <h2 className="card-title h4 mb-0 text-sucafina py-2">New Site Collection</h2>
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
//                   {userInfo?.cwsId ? (
//                     <input
//                       type="text"
//                       className="form-control border-0 bg-light"
//                       value={cwsList.find(cws => cws.id === userInfo.cwsId)?.name || ''}
//                       readOnly
//                     />
//                   ) : (
//                     <select
//                       className="form-select border-0 bg-light"
//                       value={formData.cwsId}
//                       onChange={(e) => setFormData({ ...formData, cwsId: e.target.value })}
//                       required
//                     >
//                       <option value="">Select CWS</option>
//                       {cwsList.map(cws => (
//                         <option key={cws.id} value={cws.id}>
//                           {cws.name}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label text-secondary">Name</label>
//                   <input
//                     type="text"
//                     className="form-control border-0 bg-light"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     required
//                   />
//                 </div>

                

//                 <button
//                   type="submit"
//                   className="btn btn-sucafina w-100 text-white py-2"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <div className="d-flex align-items-center justify-content-center">
//                       <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                       <span>Creating Site Collection...</span>
//                     </div>
//                   ) : (
//                     <div className="d-flex align-items-center justify-content-center">
//                       <i className="bi bi-plus-circle me-2"></i>
//                       <span>Create Site Collection</span>
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

// export default SiteCollectionForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../constants/Constants';

const SiteCollectionForm = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    name: '',
    cwsId: userInfo?.cwsId || '',
    transportFee: 0
  });

  const [cwsList, setCwsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCwsList();
  }, []);

  const fetchCwsList = async () => {
    try {
      const response = await axios.get(`${API_URL}/cws`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCwsList(response.data);
      
      if (!userInfo?.cwsId && response.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          cwsId: response.data[0].id
        }));
      }
    } catch (error) {
      setError('Error fetching CWS list');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First create the site collection
      const siteResponse = await axios.post(
        `${API_URL}/site-collections`,
        {
          name: formData.name,
          cwsId: parseInt(formData.cwsId, 10)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Then set the site collection pricing
      await axios.post(
        `${API_URL}/pricing/site-fees`,
        {
          siteCollectionId: siteResponse.data.id,
          transportFee: parseFloat(formData.transportFee)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      navigate('/site-collections');
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating site collection');
    }
    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light bg-opacity-1 border-0">
              <h2 className="card-title h4 mb-0 text-sucafina py-2">New Site Collection</h2>
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
                  <label className="form-label text-secondary">CWS</label>
                  {userInfo?.cwsId ? (
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      value={cwsList.find(cws => cws.id === userInfo.cwsId)?.name || ''}
                      readOnly
                    />
                  ) : (
                    <select
                      className="form-select border-0 bg-light"
                      value={formData.cwsId}
                      onChange={(e) => setFormData({ ...formData, cwsId: e.target.value })}
                      required
                    >
                      <option value="">Select CWS</option>
                      {cwsList.map(cws => (
                        <option key={cws.id} value={cws.id}>
                          {cws.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary">Name</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary">Transport Fee (RWF/kg)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control border-0 bg-light"
                      value={formData.transportFee}
                      onChange={(e) => setFormData({ ...formData, transportFee: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.1"
                      required
                    />
                    <span className="input-group-text border-0 bg-light">RWF</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-sucafina w-100 text-white py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Creating Site Collection...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>Create Site Collection</span>
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

export default SiteCollectionForm;