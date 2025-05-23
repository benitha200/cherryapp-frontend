export const ReportsHeading = ({ children }) => {
  const processingTheme = {
    primary: "#008080", // Sucafina teal
    secondary: "#4FB3B3", // Lighter teal
    accent: "#D95032", // Complementary orange
    neutral: "#E6F3F3", // Very light teal
    tableHover: "#F8FAFA", // Ultra light teal for ta
  };
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
      <h2 className="mb-3 mb-md-0" style={{ marginLeft: "1rem" }}>
        {children}
      </h2>
    </div>
  );
};
