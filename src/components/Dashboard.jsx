import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ComposedChart, Line, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import API_URL from '../constants/Constants';
import PurchasesDashboardSkeleton from './PurchaseDashboardSkeleton';

// Custom theme colors that complement Sucafina teal (#008080)
const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  accent: '#D95032',     // Complementary orange for contrast
  neutral: '#E6F3F3',    // Very light teal for backgrounds
};

const DashboardCard = ({ title, value, iconClass }) => (
  <div className="card shadow-sm hover-shadow transition">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <h6 className="text-muted small mb-2">{title}</h6>
        <p className="h3 mb-0 fw-bold">{value}</p>
      </div>
      <div style={{ backgroundColor: theme.neutral, borderRadius: '50%', padding: '1rem' }}>
        <i className={`${iconClass} fs-4`} style={{ color: theme.primary }}></i>
      </div>
    </div>
  </div>
);

const PurchasesDashboard = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPurchases = async () => {
      try {
        // Get user data from localStorage
        const userString = localStorage.getItem('user');
        let endpoint = `${API_URL}/purchases`;
        
        // Check if user exists and is a CWS_MANAGER
        if (userString) {
          const userData = JSON.parse(userString);
          
          if (userData.role === "CWS_MANAGER") {
            // Get CWS data from localStorage
            const cwsString = localStorage.getItem('cws');
            
            if (cwsString) {
              const cwsData = JSON.parse(cwsString);
              // Use CWS-specific endpoint with the cwsId
              endpoint = `${API_URL}/purchases/cws/${cwsData.id}`;
            }
          }
        }
        
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setPurchases(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Error fetching purchase data');
          setLoading(false);
        }
      }
    };

    fetchPurchases();
  }, [navigate]);

  // Updated stats computation to separate Grade A and Grade B
  const computeStats = () => {
    // Calculate stats specifically for Grade A
    const gradeAPurchases = purchases.filter(purchase => purchase.grade === 'A');
    const gradeATotalKgs = gradeAPurchases.reduce((sum, purchase) => sum + purchase.totalKgs, 0);
    const gradeATotalPrice = gradeAPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
    const gradeAAveragePricePerKg = gradeATotalPrice / gradeATotalKgs || 0;
    
    // Calculate stats specifically for Grade B
    const gradeBPurchases = purchases.filter(purchase => purchase.grade === 'B');
    const gradeBTotalKgs = gradeBPurchases.reduce((sum, purchase) => sum + purchase.totalKgs, 0);
    const gradeBTotalPrice = gradeBPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
    const gradeBAveragePricePerKg = gradeBTotalPrice / gradeBTotalKgs || 0;

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
      gradeATotalKgs,
      gradeATotalPrice,
      gradeAAveragePricePerKg,
      gradeBTotalKgs,
      gradeBTotalPrice,
      gradeBAveragePricePerKg,
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

  if (loading) return <PurchasesDashboardSkeleton />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafa' }}>
      {/* Grade A Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className="text-sucafina mb-3">Grade A Summary</h5>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade A Coffee Weight (kg)" 
            value={stats.gradeATotalKgs.toLocaleString()} 
            iconClass="bi-basket" 
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade A Purchase Value" 
            value={`${stats.gradeATotalPrice.toLocaleString()}`} 
            iconClass="bi-cash-stack" 
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade A Avg Price per KG" 
            value={`${stats.gradeAAveragePricePerKg.toLocaleString()}`} 
            iconClass="bi-cash" 
          />
        </div>
      </div>

      {/* Grade B Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <h5 className="text-sucafina mb-3">Grade B Summary</h5>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade B Coffee Weight (kg)" 
            value={stats.gradeBTotalKgs.toFixed(2)} 
            iconClass="bi-basket-fill" 
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade B Purchase Value" 
            value={`${stats.gradeBTotalPrice.toLocaleString()}`} 
            iconClass="bi-cash-stack" 
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <DashboardCard 
            title="Grade B Avg Price per KG" 
            value={`${stats.gradeBAveragePricePerKg.toFixed(2)}`} 
            iconClass="bi-cash" 
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header" style={{ backgroundColor: theme.neutral, color: theme.primary }}>
              Delivery Types Comparison
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={deliveryTypeChartData}>
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'KGs', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Price ($)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kgs" barSize={20} fill={theme.primary} />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke={theme.accent} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header" style={{ backgroundColor: theme.neutral, color: theme.primary }}>
              Coffee Grades Comparison
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={gradeChartData}>
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" label={{ value: 'KGs', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Price ($)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kgs" barSize={20} fill={theme.secondary} />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke={theme.accent} />
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