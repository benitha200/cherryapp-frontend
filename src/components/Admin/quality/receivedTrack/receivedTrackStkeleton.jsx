import React from "react";

const DashboardSkeletonLoader = () => {
  const skeletonStyle = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loading 1.5s infinite",
    borderRadius: "4px",
  };

  const cardStyle = {
    border: "1px solid #dee2e6",
    borderRadius: "0.375rem",
    backgroundColor: "#fff",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    height: "180px",
    padding: "1rem",
    marginBottom: "1rem",
  };

  const headerStyle = {
    backgroundColor: "#f8f9fa",
    padding: "1rem",
    borderBottom: "1px solid #dee2e6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  };

  return (
    <div>
      <style>
        {`
          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>

      {/* Stats Cards Row */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Card 1 - Total Trucks */}
        <div style={{ ...cardStyle, flex: "1", minWidth: "250px" }}>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "60%",
              marginBottom: "1rem",
            }}
          ></div>
          <div
            style={{
              ...skeletonStyle,
              height: "32px",
              width: "40%",
              marginBottom: "1rem",
            }}
          ></div>
          <div style={{ ...skeletonStyle, height: "14px", width: "70%" }}></div>
        </div>

        {/* Card 2 - Total Transported */}
        <div style={{ ...cardStyle, flex: "1", minWidth: "250px" }}>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "80%",
              marginBottom: "1rem",
            }}
          ></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ ...skeletonStyle, height: "32px", width: "60%" }}
            ></div>
            <div
              style={{
                ...skeletonStyle,
                height: "16px",
                width: "16px",
                backgroundColor: "#28a745",
              }}
            ></div>
          </div>
          <div style={{ ...skeletonStyle, height: "14px", width: "90%" }}></div>
        </div>

        {/* Card 3 - Total Delivered */}
        <div style={{ ...cardStyle, flex: "1", minWidth: "250px" }}>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "70%",
              marginBottom: "1rem",
            }}
          ></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ ...skeletonStyle, height: "32px", width: "50%" }}
            ></div>
            <div
              style={{
                ...skeletonStyle,
                height: "16px",
                width: "16px",
                backgroundColor: "#28a745",
              }}
            ></div>
          </div>
          <div
            style={{
              ...skeletonStyle,
              height: "14px",
              width: "100%",
              marginBottom: "0.5rem",
            }}
          ></div>
          <div style={{ ...skeletonStyle, height: "14px", width: "80%" }}></div>
        </div>

        {/* Card 4 - Delivered/Transported % */}
        <div style={{ ...cardStyle, flex: "1", minWidth: "250px" }}>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "85%",
              marginBottom: "1rem",
            }}
          ></div>
          <div
            style={{
              ...skeletonStyle,
              height: "32px",
              width: "40%",
              backgroundColor: "#28a745",
              marginBottom: "1rem",
            }}
          ></div>
          <div style={{ ...skeletonStyle, height: "14px", width: "90%" }}></div>
        </div>
      </div>

      {/* Cup Profile Overview Skeleton */}
      <div
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "0.375rem",
          backgroundColor: "#fff",
        }}
      >
        <div style={headerStyle}>
          <div style={{ ...skeletonStyle, height: "20px", width: "60%" }}></div>
          <div
            style={{ ...skeletonStyle, height: "20px", width: "20px" }}
          ></div>
        </div>
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "70%",
              marginBottom: "0.5rem",
            }}
          ></div>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "40%",
              marginBottom: "0.5rem",
            }}
          ></div>
          <div
            style={{
              ...skeletonStyle,
              height: "16px",
              width: "60%",
              marginBottom: "0.5rem",
            }}
          ></div>
          <div style={{ ...skeletonStyle, height: "16px", width: "80%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeletonLoader;
