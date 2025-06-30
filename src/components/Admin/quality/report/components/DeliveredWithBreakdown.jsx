import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";

const gradeColors = {
    A2: "#4CAF50", // Green
    A3: "#8BC34A", // Light Green
    B1: "#FF9800", // Orange
    s86: "#2196F3", // Blue
    N2: "#9C27B0", // Purple
    c2: "#F44336", // Red
    c1: "#E91E63", // Pink
    s88: "#795548", // Brown
};

export const DeliveredWithBreakdown = ({ title, totalValue, deliveredKgs, iconClass }) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const deliveryData = Object.entries(deliveredKgs || {}).map(([grade, value]) => ({
        grade,
        value,
        color: gradeColors[grade] || "#607D8B"
    }));

    const toggleBreakdown = () => {
        setShowBreakdown(!showBreakdown);
    };

    return (
        <div className="card shadow-sm hover-shadow transition h-100">
            <div className="card-body d-flex flex-column justify-content-between" style={{ minHeight: "100px" }}>
                <div style={{ width: "100%" }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6
                            className="text-muted small mb-0"
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
                        <button
                            className="btn btn-link p-0 ms-2"
                            onClick={toggleBreakdown}
                            style={{ border: 'none', background: 'none' }}
                            title={showBreakdown ? 'Hide breakdown' : 'Show breakdown'}
                        >
                            <i
                                className={`bi ${showBreakdown ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}
                                style={{ fontSize: "0.8rem" }}
                            ></i>
                        </button>
                    </div>

                    <p className="h6 mb-2 fw-bold">{formatNumberWithCommas(totalValue)} kgs</p>

                    <div className={`collapse ${showBreakdown ? 'show' : ''}`}>
                        <div className="d-flex flex-wrap gap-1" style={{ fontSize: "0.7rem", lineHeight: "1.3" }}>
                            {deliveryData.map(({ grade, value, color }) => (
                                <span
                                    key={grade}
                                    className="badge rounded-pill px-2 py-1"
                                    style={{
                                        backgroundColor: `${color}20`,
                                        color: color,
                                        border: `1px solid ${color}40`,
                                        fontWeight: "600",
                                        fontSize: "0.65rem"
                                    }}
                                >
                                    {grade}: {formatNumberWithCommas(value)}  kgs
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Add spacer when collapsed to maintain consistent height */}
                    {!showBreakdown && <div style={{ minHeight: "40px" }}></div>}
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

DeliveredWithBreakdown.propTypes = {
    title: PropTypes.string.isRequired,
    totalValue: PropTypes.number.isRequired,
    deliveredKgs: PropTypes.object.isRequired,
    iconClass: PropTypes.string
};
