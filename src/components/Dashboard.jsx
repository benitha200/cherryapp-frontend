// import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import { 
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
//   PieChart, Pie, Cell, 
//   ResponsiveContainer 
// } from 'recharts';
// import axios from 'axios';

// const DashboardCard = ({ title, value, iconClass, loading }) => {
//   if (loading) {
//     return (
//       <div className="card placeholder-glow">
//         <div className="card-body d-flex justify-content-between align-items-center">
//           <div className="w-100">
//             <span className="placeholder col-4 mb-2"></span>
//             <span className="placeholder col-6"></span>
//           </div>
//           <span className="placeholder rounded-circle" style={{width: '40px', height: '40px'}}></span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="card shadow-sm hover-shadow transition">
//       <div className="card-body d-flex justify-content-between align-items-center">
//         <div>
//           <h6 className="text-muted small mb-2">{title}</h6>
//           <p className="h3 mb-0 fw-bold">{value}</p>
//         </div>
//         <div className="bg-primary bg-opacity-10 rounded-circle p-3">
//           <i className={`${iconClass} text-primary fs-4`}></i>
//         </div>
//       </div>
//     </div>
//   );
// };

// const PurchasesDashboard = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchPurchases();
//   }, []);

//   const fetchPurchases = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/purchases');
//       setPurchases(response.data);
//       setLoading(false);
//     } catch (error) {
//       setError('Error fetching purchase data');
//       setLoading(false);
//     }
//   };

//   const computeStats = () => {
//     const totalPurchases = purchases.length;
//     const totalKgs = purchases.reduce((sum, purchase) => sum + purchase.totalKgs, 0);
//     const totalPrice = purchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
    
//     const deliveryTypeStats = purchases.reduce((acc, purchase) => {
//       acc[purchase.deliveryType] = (acc[purchase.deliveryType] || 0) + 1;
//       return acc;
//     }, {});

//     const gradeStats = purchases.reduce((acc, purchase) => {
//       acc[purchase.grade] = (acc[purchase.grade] || 0) + 1;
//       return acc;
//     }, {});

//     return {
//       totalPurchases,
//       totalKgs,
//       totalPrice,
//       deliveryTypeStats,
//       gradeStats,
//       averagePricePerKg: totalPrice / totalKgs
//     };
//   };

//   const stats = computeStats();

//   const deliveryTypeChartData = Object.entries(stats.deliveryTypeStats).map(
//     ([name, value]) => ({ name, value })
//   );

//   const gradeChartData = Object.entries(stats.gradeStats).map(
//     ([name, value]) => ({ name, value })
//   );

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

//   if (loading) {
//     return (
//       <div className="container-fluid p-4">
//         <div className="row g-4">
//           {[1, 2, 3, 4].map(i => (
//             <div key={i} className="col-12 col-md-6 col-lg-3">
//               <DashboardCard loading={true} />
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger d-flex align-items-center" role="alert">
//         <i className="bi bi-exclamation-circle me-2"></i>
//         <div>{error}</div>
//       </div>
//     );
//   }

//   const dashboardItems = [
//     {
//       title: 'Total Purchases',
//       value: stats.totalPurchases,
//       iconClass: 'bi-cart-check'
//     },
//     {
//       title: 'Total Coffee Weight (kg)',
//       value: stats.totalKgs.toFixed(2),
//       iconClass: 'bi-graph-up'
//     },
//     {
//       title: 'Total Purchase Value',
//       value: `${stats.totalPrice.toLocaleString()}`,
//       iconClass: 'bi-cash'
//     },
//     {
//       title: 'Avg Price per KG',
//       value: `${stats.averagePricePerKg.toFixed(2)}`,
//       iconClass: 'bi-coin'
//     }
//   ];

//   return (
//     <div className="container-fluid bg-light p-4">
//       <div className="row g-4 mb-4">
//         {dashboardItems.map((item, index) => (
//           <div key={index} className="col-12 col-md-6 col-lg-3">
//             <DashboardCard
//               title={item.title}
//               value={item.value}
//               iconClass={item.iconClass}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="row g-4">
//         <div className="col-12 col-md-6">
//           <div className="card h-100">
//             <div className="card-header">
//               <h5 className="card-title mb-0">Delivery Types</h5>
//             </div>
//             <div className="card-body">
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={deliveryTypeChartData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   >
//                     {deliveryTypeChartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                   <Legend />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         <div className="col-12 col-md-6">
//           <div className="card h-100">
//             <div className="card-header">
//               <h5 className="card-title mb-0">Coffee Grades</h5>
//             </div>
//             <div className="card-body">
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={gradeChartData}>
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="value" fill="#8884d8" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchasesDashboard;

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ComposedChart, Line, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

const DashboardCard = ({ title, value, iconClass }) => (
  <div className="card shadow-sm hover-shadow transition">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <h6 className="text-muted small mb-2">{title}</h6>
        <p className="h3 mb-0 fw-bold">{value}</p>
      </div>
      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
        <i className={`${iconClass} text-primary fs-4`}></i>
      </div>
    </div>
  </div>
);

const PurchasesDashboard = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/purchases');
      setPurchases(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching purchase data');
      setLoading(false);
    }
  };

  const computeStats = () => {
    const totalPurchases = purchases.length;
    const totalKgs = purchases.reduce((sum, purchase) => sum + purchase.totalKgs, 0);
    const totalPrice = purchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
    const averagePricePerKg = totalPrice / totalKgs;

    const deliveryTypeStats = purchases.reduce((acc, purchase) => {
      acc[purchase.deliveryType] = {
        kgs: (acc[purchase.deliveryType]?.kgs || 0) + purchase.totalKgs,
        price: (acc[purchase.deliveryType]?.price || 0) + purchase.totalPrice,
        count: (acc[purchase.deliveryType]?.count || 0) + 1
      };
      return acc;
    }, {});

    const gradeStats = purchases.reduce((acc, purchase) => {
      acc[purchase.grade] = {
        kgs: (acc[purchase.grade]?.kgs || 0) + purchase.totalKgs,
        price: (acc[purchase.grade]?.price || 0) + purchase.totalPrice,
        count: (acc[purchase.grade]?.count || 0) + 1
      };
      return acc;
    }, {});

    return { 
      totalPurchases, 
      totalKgs, 
      totalPrice, 
      averagePricePerKg, 
      deliveryTypeStats, 
      gradeStats 
    };
  };

  const stats = computeStats();

  const deliveryTypeChartData = Object.entries(stats.deliveryTypeStats).map(
    ([name, { kgs, price, count }]) => ({ name, kgs, price, count })
  );

  const gradeChartData = Object.entries(stats.gradeStats).map(
    ([name, { kgs, price, count }]) => ({ name, kgs, price, count })
  );

  const dashboardItems = [
    {
      title: 'Total Purchases',
      value: stats.totalPurchases,
      iconClass: 'bi-cart-check'
    },
    {
      title: 'Total Coffee Weight (kg)',
      value: stats.totalKgs.toFixed(2),
      iconClass: 'bi-graph-up'
    },
    {
      title: 'Total Purchase Value',
      value: `$${stats.totalPrice.toLocaleString()}`,
      iconClass: 'bi-cash'
    },
    {
      title: 'Avg Price per KG',
      value: `$${stats.averagePricePerKg.toFixed(2)}`,
      iconClass: 'bi-coin'
    }
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid bg-light p-4">
      <div className="row g-4 mb-4">
        {dashboardItems.map((item, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <DashboardCard
              title={item.title}
              value={item.value}
              iconClass={item.iconClass}
            />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header">Delivery Types Comparison</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={deliveryTypeChartData}>
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'KGs', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Price ($)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kgs" barSize={20} fill="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-header">Coffee Grades Comparison</div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={gradeChartData}>
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'KGs', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Price ($)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kgs" barSize={20} fill="#82ca9d" />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasesDashboard;