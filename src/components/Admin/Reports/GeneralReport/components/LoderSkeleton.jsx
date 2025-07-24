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
      const variants = ["#17a2b8", "#28a745", "#6c757d", "#ffc107"];
      return variants[index % variants.length];
    } else if (type === "status") {
      const variants = ["#28a745", "#17a2b8", "#ffc107", "#6c757d"];
      return variants[index % variants.length];
    } else if (type === "transfer") {
      const variants = ["#6c757d", "#28a745"];
      return variants[index % variants.length];
    } else if (type === "bagging") {
      const variants = ["#28a745", "#ffc107", "#6c757d"];
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
            border-radius: 4px;
            border: 1px solid #ced4da;
            margin-bottom: 1rem;
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
            <th>PRICING (RWF)</th>
            <th>CWS</th>
            <th>PURCHASE DATE</th>
            <th>PROCESSING TYPE</th>
            <th>PROCESSING STATUS</th>
            <th>WET TRANSFER</th>
            <th>BAGGED OFF (KG)</th>
            <th>BAGGING</th>
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
