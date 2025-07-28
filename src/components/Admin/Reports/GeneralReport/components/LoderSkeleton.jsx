import PropTypes from "prop-types";

const ProcessingTableSkeletonLoader = ({ rows = 18 }) => {
  const shimmerStyle = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "4px",
    height: "16px",
    marginBottom: "4px",
  };

  const getBadgeVariant = (index, type) => {
    if (type === "processing") {
      const variants = ["#e5e9ecff", "#e3e6e3ff"];
      return variants[index % variants.length];
    } else if (type === "status") {
      const variants = ["#e5e9ecff", "#e3e6e3ff"];
      return variants[index % variants.length];
    } else if (type === "transfer") {
      const variants = ["#e5e9ecff", "#e3e6e3ff"];
      return variants[index % variants.length];
    } else if (type === "bagging") {
      const variants = ["#e5e9ecff", "#e3e6e3ff"];
      return variants[index % variants.length];
    }
    return "#f0f0f0";
  };

  return (
    <div style={{ padding: "1rem" }}>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          .processing-skeleton-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #dee2e6;
            background-color: white;
            font-size: 14px;
          }
          
          .processing-skeleton-table th {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 0.5rem;
            font-weight: 600;
            color: #495057;
            text-align: left;
            font-size: 12px;
            white-space: nowrap;
          }
          
          .processing-skeleton-table td {
            border: 1px solid #dee2e6;
            padding: 0.5rem;
            vertical-align: middle;
          }
          
          .processing-skeleton-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          
          .processing-skeleton-table tbody tr:hover {
            background-color: #e3f2fd;
          }
          
          .search-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            height: 38px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            margin-bottom: 1rem;
          }
          
          .filter-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            height: 40px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
          }
          
          .badge-skeleton {
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
            height: 24px;
            display: inline-block;
            min-width: 80px;
          }
          
          .number-skeleton {
            background: linear-gradient(90deg, #e3f2fd 25%, #bbdefb 50%, #e3f2fd 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            height: 16px;
            color: #1976d2;
          }
        `}
      </style>

      {/* Filters Section Skeleton */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              height: "24px",
              width: "60px",
              borderRadius: "4px",
            }}
          ></div>
          <div
            style={{
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              height: "32px",
              width: "80px",
              borderRadius: "4px",
              border: "1px solid #6c757d",
            }}
          ></div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Filter Labels and Inputs */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index}>
              <div
                style={{
                  background:
                    "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  height: "14px",
                  width: "70%",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div className="filter-skeleton"></div>
            </div>
          ))}
        </div>

        {/* Filter Summary */}
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              height: "14px",
              width: "150px",
              borderRadius: "4px",
            }}
          ></div>
        </div>
      </div>

      {/* Search and Items Per Page */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ width: "300px" }}>
          <div className="search-skeleton"></div>
        </div>
        <div style={{ width: "60px" }}>
          <div className="search-skeleton" style={{ width: "100%" }}></div>
        </div>
      </div>

      <table className="processing-skeleton-table">
        <thead>
          <tr>
            <th>PURCHASE BATCH NO</th>
            <th>SUB-BATCH NO</th>
            <th>PURCHASED QTY (KG)</th>
            <th>PROCESSING QTY (KG)</th>
            <th>PRICE/KG (RWF)</th>
            <th>CWS</th>
            <th>PURCHASE DATE</th>
            <th>PROCESSING TYPE</th>
            <th>PROCESSING STATUS</th>
            <th>WET TRANSFER</th>
            <th>BAGGED OFF (KG)</th>
            <th>BAGGING STATUS</th>
            <th>TRUCK NO</th>
            <th>DRIVER</th>
            <th>CUP PROFILE (SAMPLE)</th>
            <th>CUP PROFILE (DELIVERY)</th>
            <th>QUALITY STATUS</th>
            <th>SAMPLE STORAGE</th>
            <th>OUTTURN (%)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td>
                <div style={{ ...shimmerStyle, width: "85%" }}></div>
              </td>
              <td>
                <div className="number-skeleton" style={{ width: "90%" }}></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "60%" }}></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "55%" }}></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "50%" }}></div>
              </td>
              <td>
                <div className="number-skeleton" style={{ width: "70%" }}></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "75%" }}></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "processing")} 25%, ${getBadgeVariant(index + 1, "processing")} 50%, ${getBadgeVariant(index, "processing")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "status")} 25%, ${getBadgeVariant(index + 1, "status")} 50%, ${getBadgeVariant(index, "status")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "transfer")} 25%, ${getBadgeVariant(index + 1, "transfer")} 50%, ${getBadgeVariant(index, "transfer")} 75%)`,
                    minWidth: "40px",
                  }}
                ></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "65%" }}></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "bagging")} 25%, ${getBadgeVariant(index + 1, "bagging")} 50%, ${getBadgeVariant(index, "bagging")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "70%" }}></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "75%" }}></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "status")} 25%, ${getBadgeVariant(index + 1, "status")} 50%, ${getBadgeVariant(index, "status")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "status")} 25%, ${getBadgeVariant(index + 1, "status")} 50%, ${getBadgeVariant(index, "status")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, ${getBadgeVariant(index, "status")} 25%, ${getBadgeVariant(index + 1, "status")} 50%, ${getBadgeVariant(index, "status")} 75%)`,
                  }}
                ></div>
              </td>
              <td>
                <div style={{ ...shimmerStyle, width: "80%" }}></div>
              </td>
              <td>
                <div
                  className="badge-skeleton"
                  style={{
                    background: `linear-gradient(90deg, #e3f2fd 25%, #bbdefb 50%, #e3f2fd 75%)`,
                    color: "#1976d2",
                    width: "50px",
                  }}
                ></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ProcessingTableSkeletonLoader.propTypes = {
  rows: PropTypes.number,
};

export default ProcessingTableSkeletonLoader;
