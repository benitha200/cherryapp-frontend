import PropTypes from "prop-types";

export const DashboardCardWithPercentages = ({
  title,
  value,
  mainValue,
  totalDelivered,
  totalHighGrade,
  iconClass,
  type,
}) => {
  let percentageOfHighGrade = 0;
  if (totalHighGrade > 0) {
    if (type === "avgOT") {
      percentageOfHighGrade = (
        ((mainValue / totalHighGrade) * 100) /
        3
      ).toFixed(2);
    } else {
      percentageOfHighGrade = ((mainValue / totalHighGrade) * 100).toFixed(2);
    }
  }

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

          {/* <div className="d-flex flex-column gap-1" style={{ fontSize: "0.6rem" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted" style={{ fontSize: "0.6rem" }}>% of Total:</span>
                            <span
                                className="badge rounded-pill px-1 py-0"
                                style={{
                                    backgroundColor: "#008080",
                                    color: "white",
                                    fontSize: "0.6rem",
                                    fontWeight: "600"
                                }}
                            >
                                {percentageOfTotalDelivered}%
                            </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted" style={{ fontSize: "0.6rem" }}>% of High Grade:</span>
                            <span
                                className="badge rounded-pill px-1 py-0"
                                style={{
                                    backgroundColor: "#4FB3B3",
                                    color: "white",
                                    fontSize: "0.6rem",
                                    fontWeight: "600"
                                }}
                            >
                                {percentageOfHighGrade}%
                            </span>
                        </div>
                    </div> */}
        </div>
        {iconClass && (
          <div className="d-flex justify-content-end mt-1">
            <i
              className={`${iconClass} text-primary`}
              style={{ fontSize: "1rem" }}
            ></i>
          </div>
        )}
      </div>
    </div>
  );
};

DashboardCardWithPercentages.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  mainValue: PropTypes.number.isRequired,
  totalDelivered: PropTypes.number.isRequired,
  totalHighGrade: PropTypes.number.isRequired,
  iconClass: PropTypes.string,
  type: PropTypes.string.isRequired,
};
