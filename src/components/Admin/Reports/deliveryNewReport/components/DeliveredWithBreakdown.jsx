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
            <div className="card-body d-flex flex-column justify-content-between p-2" style={{ minHeight: "60px" }}>
                <div style={{ width: "100%" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6
                            className="text-muted small mb-0"
                            style={{
                                minHeight: "18px",
                                width: "100%",
                                whiteSpace: "normal",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: "1.1",
                                fontSize: "0.75rem"
                            }}
                            title={title}
                        >
                            {title}
                        </h6>
                        <button
                            className="btn btn-link p-0 ms-1"
                            onClick={toggleBreakdown}
                            style={{ border: 'none', background: 'none' }}
                            title={showBreakdown ? 'Hide breakdown' : 'Show breakdown'}
                        >
                            <i
                                className={`bi ${showBreakdown ? 'bi-chevron-up' : 'bi-chevron-down'} text-primary`}
                                style={{ fontSize: "1rem" }}
                            ></i>
                        </button>
                    </div>

                    <p className="h6 mb-1 fw-bold" style={{ fontSize: "1rem" }}>{formatNumberWithCommas(totalValue)} kgs</p>

                    <div className={`collapse ${showBreakdown ? 'show' : ''}`}>
                        <div className="d-flex flex-wrap gap-1" style={{ fontSize: "1rem", lineHeight: "1.2" }}>
                            {deliveryData.map(({ grade, value, color }) => (
                                <span
                                    key={grade}
                                    className="badge rounded-pill px-1 py-0"
                                    style={{
                                        backgroundColor: `${color}20`,
                                        color: color,
                                        border: `1px solid ${color}40`,
                                        fontWeight: "600",
                                        fontSize: "0.8rem"
                                    }}
                                >
                                    {grade}: {formatNumberWithCommas(value)} kgs
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Add minimal spacer when collapsed to maintain consistent height */}
                    {!showBreakdown && <div style={{ minHeight: "12px" }}></div>}
                </div>
                {iconClass && (
                    <div className="d-flex justify-content-end mt-1">
                        <i className={`${iconClass} text-primary`} style={{ fontSize: "1rem" }}></i>
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
