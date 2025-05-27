import { Spinner } from "react-bootstrap";

function LoadingPage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#f8f9fa", // light background, adjust as needed
      }}
    >
      <Spinner
        animation="border"
        role="status"
        style={{ width: "4rem", height: "4rem" }}
      >
        <span className="visually-hidden">Loading data...</span>
      </Spinner>
      <p style={{ marginTop: "1rem", fontSize: "1.2rem", color: "#555" }}>
        Loading data, please wait...
      </p>
    </div>
  );
}

export default LoadingPage;
