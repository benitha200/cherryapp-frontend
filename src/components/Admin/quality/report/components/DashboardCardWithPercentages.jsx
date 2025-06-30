import PropTypes from 'prop-types';

export const DashboardCardWithPercentages = ({ title, value, mainValue, totalDelivered, totalHighGrade, iconClass }) => {
    // Calculate percentages
    const percentageOfTotalDelivered = totalDelivered > 0 ? ((mainValue / totalDelivered) * 100).toFixed(1) : 0;
    const percentageOfHighGrade = totalHighGrade > 0 ? ((mainValue / totalHighGrade) * 100).toFixed(1) : 0;

    return (
        <div className="card shadow-sm hover-shadow transition h-100">
            <div className="card-body d-flex flex-column justify-content-between" style={{ minHeight: "140px" }}>
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

                    {/* Main value */}
                    <p className="h6 mb-2 fw-bold">{value}</p>

                    {/* Percentage breakdowns */}
                    <div className="d-flex flex-column gap-1" style={{ fontSize: "0.7rem" }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">% of Total Delivered:</span>
                            <span
                                className="badge rounded-pill px-2 py-1"
                                style={{
                                    backgroundColor: "#008080",
                                    color: "white",
                                    fontSize: "0.65rem",
                                    fontWeight: "600"
                                }}
                            >
                                {percentageOfTotalDelivered}%
                            </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted">% of High Grade:</span>
                            <span
                                className="badge rounded-pill px-2 py-1"
                                style={{
                                    backgroundColor: "#4FB3B3",
                                    color: "white",
                                    fontSize: "0.65rem",
                                    fontWeight: "600"
                                }}
                            >
                                {percentageOfHighGrade}%
                            </span>
                        </div>
                    </div>
                </div>
                {iconClass && (
                    <div className="d-flex justify-content-end mt-2">
                        <i className={`${iconClass} text-primary`} style={{ fontSize: "1.2rem" }}></i>
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
    iconClass: PropTypes.string
};
