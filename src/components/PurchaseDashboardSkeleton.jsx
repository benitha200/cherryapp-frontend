import React from 'react';

const theme = {
  primary: '#008080',    // Sucafina teal
  secondary: '#4FB3B3',  // Lighter teal
  neutral: '#E6F3F3',    // Very light teal for backgrounds
};

const DashboardCardSkeleton = () => (
  <div className="card shadow-sm">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <div 
          className="skeleton-title mb-2"
          style={{ 
            backgroundColor: '#e0e0e0', 
            width: '100px', 
            height: '15px', 
            borderRadius: '4px' 
          }}
        />
        <div 
          className="skeleton-value"
          style={{ 
            backgroundColor: '#f0f0f0', 
            width: '150px', 
            height: '30px', 
            borderRadius: '4px' 
          }}
        />
      </div>
      <div 
        style={{ 
          backgroundColor: theme.neutral, 
          borderRadius: '50%',
          padding: '1rem',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div 
          className="skeleton-icon"
          style={{ 
            backgroundColor: '#d0d0d0', 
            width: '30px', 
            height: '30px', 
            borderRadius: '50%' 
          }}
        />
      </div>
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="card h-100">
    <div 
      className="card-header" 
      style={{ 
        backgroundColor: theme.neutral, 
        color: theme.primary 
      }}
    >
      <div 
        className="skeleton-chart-title"
        style={{ 
          backgroundColor: '#e0e0e0', 
          width: '200px', 
          height: '20px', 
          borderRadius: '4px' 
        }}
      />
    </div>
    <div className="card-body">
      <div 
        className="skeleton-chart"
        style={{ 
          backgroundColor: '#f0f0f0', 
          width: '100%', 
          height: '300px', 
          borderRadius: '4px' 
        }}
      />
    </div>
  </div>
);

const PurchasesDashboardSkeleton = () => {
  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafa' }}>

        <div className="col-12">
          <h5 className="text-sucafina">Grade A Summary</h5>
        </div>
      <div className="row g-4 mb-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <DashboardCardSkeleton />
          </div>
        ))}
      </div>

      <div className="col-12">
          <h5 className="text-sucafina">Grade A Summary</h5>
        </div>
        
      <div className="row g-4 mb-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <DashboardCardSkeleton />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <ChartSkeleton />
        </div>
        <div className="col-12 col-md-6">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
};

export default PurchasesDashboardSkeleton;