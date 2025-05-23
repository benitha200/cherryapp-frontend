import React from 'react';

// Skeleton component for reusable skeleton elements
const Skeleton = ({ height, width, className = "" }) => (
  <div 
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    style={{ 
      height: height || '1rem',
      width: width || '100%'
    }}
  ></div>
);

// Skeleton for dashboard card
const SkeletonCard = () => (
  <div className="card shadow-sm">
    <div className="card-body d-flex justify-content-between align-items-center p-4">
      <div className="w-75">
        <Skeleton height="1rem" width="60%" className="mb-3" />
        <Skeleton height="2rem" width="40%" />
      </div>
      <div style={{ backgroundColor: '#E6F3F3', borderRadius: '50%', padding: '1rem', width: '60px', height: '60px' }}>
        <Skeleton height="100%" width="100%" className="rounded-circle" />
      </div>
    </div>
  </div>
);

// Skeleton for pie chart
const SkeletonPieChart = () => (
  <div className="card h-100 shadow-sm">
    <div className="card-header d-flex justify-content-between align-items-center">
      <Skeleton height="1.2rem" width="40%" />
      <Skeleton height="1rem" width="100px" />
    </div>
    <div className="card-body d-flex justify-content-center align-items-center">
      <div className="rounded-circle animate-pulse bg-gray-200" style={{ width: '220px', height: '220px' }}></div>
    </div>
  </div>
);

// Skeleton for table
const SkeletonTable = ({ rows = 5, columns = 8 }) => (
  <div className="card shadow-sm">
    <div className="card-header">
      <Skeleton height="1.2rem" width="40%" />
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              {Array(columns).fill().map((_, i) => (
                <th key={i}>
                  <Skeleton height="1.2rem" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows).fill().map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array(columns).fill().map((_, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton height="1rem" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Smaller table skeleton for contribution data
const SkeletonContributionTable = () => (
  <div className="card h-100 shadow-sm">
    <div className="card-header">
      <Skeleton height="1.2rem" width="70%" />
    </div>
    <div className="card-body p-0">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              {Array(3).fill().map((_, i) => (
                <th key={i}>
                  <Skeleton height="1.2rem" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(6).fill().map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array(3).fill().map((_, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton height="1rem" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Full dashboard skeleton
const StockDashboardSkeleton = () => (
  <div className="container-fluid p-4" style={{ backgroundColor: '#f8fafa' }}>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <Skeleton height="1.8rem" width="200px" />
      <Skeleton height="2rem" width="150px" />
    </div>

    {/* Summary Cards - First Row */}
    <div className="row g-4 mb-4">
      <div className="col-12 col-md-6">
        <SkeletonCard />
      </div>

      <div className="col-12 col-md-6">
        <SkeletonCard />
      </div>
    </div>

    {/* Summary Cards - Grade Totals */}
    {/* <div className="row g-4 mb-4">
      {Array(4).fill().map((_, i) => (
        <div key={i} className="col-6 col-md-3">
          <SkeletonCard />
        </div>
      ))}
    </div>

    <div className="row g-4 mb-4">
      <div className="col-12 col-lg-8">
        <SkeletonPieChart />
      </div>

      <div className="col-12 col-lg-4">
        <SkeletonContributionTable />
      </div>
    </div> */}

    {/* Detailed Grade Table */}
    <div className="row g-4">
      <div className="col-12">
        <SkeletonTable rows={8} columns={9} />
      </div>
    </div>
  </div>
);

export default StockDashboardSkeleton;