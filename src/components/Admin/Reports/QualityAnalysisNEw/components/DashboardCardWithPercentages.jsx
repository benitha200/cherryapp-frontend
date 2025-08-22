import PropTypes from "prop-types";

export const DashboardCardWithPercentages = ({
  title,
  percentageOfHighGrade = 0,
}) => {
  return (
    <div className="card shadow-sm hover-shadow transition h-100">
      <div
        className="card-body d-flex flex-column justify-content-between p-2"
        style={{ minHeight: "60px" }}
      >
        <div style={{ width: "100%" }}>
          <h6
            className="text-muted small mb-1"
            style={{
              minHeight: "18px",
              width: "100%",
              whiteSpace: "normal",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: "1.1",
              fontSize: "0.75rem",
            }}
            title={title}
          >
            {title}
          </h6>

          <p className="h6 mb-1 fw-bold" style={{ fontSize: "1rem" }}>
            {percentageOfHighGrade} %
          </p>
        </div>
      </div>
    </div>
  );
};

DashboardCardWithPercentages.propTypes = {
  title: PropTypes.string.isRequired,
  percentageOfHighGrade: PropTypes.string.isRequired,
};
