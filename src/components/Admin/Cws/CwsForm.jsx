// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import API_URL from '../../../constants/Constants';

// const CwsForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     location: ''
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("Authorization", `Bearer ${localStorage.getItem('token')}`);

//     try {
//       await axios.post(
//         `${API_URL}/cws`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
//       navigate('/cws');
//     } catch (error) {
//       setError(error.response?.data?.error || 'Error creating CWS');
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="container py-4">
//       <div className="row justify-content-center">
//         <div className="col-12 col-md-8 col-lg-6">
//           <div className="card border-0 shadow-sm">
//             <div className="card-header bg-light bg-opacity-1 border-0">
//               <h2 className="card-title h4 mb-0 text-sucafina py-2">Add Coffee Washing Station</h2>
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
//                   <label className="form-label text-secondary">Code</label>
//                   <input
//                     type="text"
//                     className="form-control border-0 bg-light"
//                     value={formData.code}
//                     onChange={(e) => setFormData({ ...formData, code: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label text-secondary">Location</label>
//                   <input
//                     type="text"
//                     className="form-control border-0 bg-light"
//                     value={formData.location}
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
//                       <span>Creating CWS...</span>
//                     </div>
//                   ) : (
//                     <div className="d-flex align-items-center justify-content-center">
//                       <i className="bi bi-plus-circle me-2"></i>
//                       <span>Add CWS</span>
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

// export default CwsForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../constants/Constants';

const CwsForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    havespeciality: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.getItem('token')}`);

    try {
      await axios.post(
        `${API_URL}/cws`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate('/cws');
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating CWS');
    }
    setLoading(false);
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light bg-opacity-1 border-0">
              <h2 className="card-title h4 mb-0 text-sucafina py-2">Add Coffee Washing Station</h2>
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
                  <label className="form-label text-secondary">Code</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary">Location</label>
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="havespeciality"
                      checked={formData.havespeciality}
                      onChange={(e) => setFormData({ ...formData, havespeciality: e.target.checked })}
                    />
                    <label className="form-check-label text-secondary" htmlFor="havespeciality">
                      Has Specialty
                    </label>
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
                      <span>Creating CWS...</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-plus-circle me-2"></i>
                      <span>Add CWS</span>
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

export default CwsForm;