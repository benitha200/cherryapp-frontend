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
      <div>
        <h6 className="text-muted small mb-2">{title}</h6>
        <p className="h6 mb-0 ">{value}</p>
      </div>
      <div
        style={{
          backgroundColor: theme.neutral,
          borderRadius: "50%",
          padding: "1rem",
        }}
      >
        <i className={`${iconClass}`} style={{ color: theme.primary }}></i>
      </div>
    </div>
  </div>
);
