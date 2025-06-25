const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange for contrast
  neutral: "#E6F3F3", // Very light teal for backgrounds
  text: "#34495E",
};
export const DashboardCard = ({ title, value, iconClass }) => (
  <div className="card shadow-sm hover-shadow transition">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div style={{ width: "100%" }}>
        <h6
          className="text-muted small mb-2"
          style={{
            minHeight: "32px",
            width: "100%",
            whiteSpace: "normal",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "1.2",
          }}
          title={title}
        >
          {title}
        </h6>
        <p className="h6 mb-0 fw-bold">{value}</p>
      </div>
    </div>
  </div>
);
