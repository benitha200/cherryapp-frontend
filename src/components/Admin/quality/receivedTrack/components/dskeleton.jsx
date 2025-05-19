const processingTheme = {
  primary: "#008080",
  secondary: "#4FB3B3",
  neutral: "#E6F3F3",
  tableHeader: "#E0EEEE",
  tableBorder: "#D1E0E0",
};

export const DelivarySkeleton = ({
  rows = 2,
  columns = 10,
  showGroupHeaders = true,
  groupCount = 3,
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div
          className="skeleton-loader"
          style={{ width: "180px", height: "30px" }}
        ></div>
        <div
          className="skeleton-loader"
          style={{ width: "150px", height: "30px" }}
        ></div>
      </div>

      {Array(groupCount)
        .fill(0)
        .map((_, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {showGroupHeaders && (
              <div className="d-flex align-items-center mb-2">
                <div
                  className="skeleton-loader"
                  style={{
                    width: "120px",
                    height: "24px",
                    marginRight: "12px",
                  }}
                ></div>
                <div
                  className="skeleton-loader"
                  style={{ width: "100px", height: "24px" }}
                ></div>
              </div>
            )}

            <div className="table-responsive">
              <table
                className="table table-bordered mb-0"
                style={{
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  width: "100%",
                  border: `1px solid ${processingTheme.tableBorder}`,
                }}
              >
                <thead>
                  <tr>
                    {Array(columns)
                      .fill(0)
                      .map((_, index) => (
                        <th
                          key={index}
                          style={{
                            backgroundColor: processingTheme.tableHeader,
                            padding: "8px 12px",
                            borderBottom: `2px solid ${processingTheme.primary}`,
                          }}
                        >
                          <div
                            className="skeleton-loader"
                            style={{ width: "80px", height: "20px" }}
                          ></div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {Array(rows)
                    .fill(0)
                    .map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array(columns)
                          .fill(0)
                          .map((_, colIndex) => (
                            <td
                              key={colIndex}
                              style={{
                                padding: "8px 12px",
                                borderBottom: `1px solid ${processingTheme.tableBorder}`,
                              }}
                            >
                              <div
                                className="skeleton-loader"
                                style={{
                                  width:
                                    colIndex === 0
                                      ? "120px"
                                      : colIndex === columns - 1
                                      ? "60px"
                                      : "80px",
                                  height: "28px",
                                }}
                              ></div>
                            </td>
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div
          className="skeleton-loader"
          style={{ width: "80px", height: "32px" }}
        ></div>
        <div
          className="skeleton-loader"
          style={{ width: "40px", height: "32px" }}
        ></div>
        <div
          className="skeleton-loader"
          style={{ width: "80px", height: "32px" }}
        ></div>
      </div>

      <style jsx>{`
        .skeleton-loader {
          background: linear-gradient(
            90deg,
            ${processingTheme.tableBorder} 25%,
            ${processingTheme.neutral} 50%,
            ${processingTheme.tableBorder} 75%
          );
          background-size: 200% 100%;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};
