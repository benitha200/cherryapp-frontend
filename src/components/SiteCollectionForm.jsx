// // SiteCollectionForm.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const SiteCollectionForm = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     name: '',
//     cwsId: ''
//   });
//   const [cwsList, setCwsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchCWSList();
//   }, []);

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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       await axios.post('http://localhost:3000/api/site-collections', 
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
//             <div className="card-header bg-info bg-opacity-10 border-0">
//               <h2 className="card-title h4 mb-0 text-info py-2">New Site Collection</h2>
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
//                   <label className="form-label text-secondary">Name</label>
//                   <input
//                     type="text"
//                     className="form-control border-0 bg-light"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     required
//                   />
//                 </div>

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

//                 <button
//                   type="submit"
//                   className="btn btn-info w-100 text-white py-2"
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



// export default SiteCollectionForm ;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SiteCollectionForm = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('user'));
  
  const [formData, setFormData] = useState({
    name: '',
    cwsId: userInfo.cwsId // Use cwsId from user info directly
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/site-collections', 
        {
          ...formData,
          cwsId: parseInt(formData.cwsId, 10)
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
            <div className="card-header bg-info bg-opacity-10 border-0">
              <h2 className="card-title h4 mb-0 text-info py-2">New Site Collection</h2>
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
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    value={userInfo.cwsId} 
                    readOnly 
                    hidden
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 text-white py-2"
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