import PropTypes from 'prop-types';
import { useState } from 'react';
import { formatNumberWithCommas } from "../../../../../utils/formatNumberWithComma";
import './DetailedDeliveryCard.css';

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

export const DetailedDeliveryCard = ({ title, totalValue, deliveredKgs, iconClass }) => {
    const [showDetails, setShowDetails] = useState(false);

    const deliveryData = Object.entries(deliveredKgs || {}).map(([grade, value]) => ({
        grade,
        value,
        color: gradeColors[grade] || "#607D8B" // Default gray color
    }));

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div className={`card shadow-sm hover-shadow transition detailed-delivery-card ${!showDetails ? 'collapsed-card' : ''}`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-muted small mb-0" style={{ lineHeight: "1.2" }}>
                        {title}
                    </h6>
                    {iconClass && (
                        <i className={`${iconClass} text-primary`} style={{ fontSize: "1.2rem" }}></i>
                    )}
                </div>

                {/* Total Value */}
                <div className="mb-3">
                    <p className="h5 mb-0 fw-bold text-primary">
                        {formatNumberWithCommas(totalValue)} kg
                    </p>
                    <small className="text-muted">Total Delivered</small>
                </div>

                {/* Toggle Button */}
                <div className="mb-3">
                    <button
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={toggleDetails}
                        type="button"
                    >
                        <i className={`bi ${showDetails ? 'bi-chevron-up' : 'bi-chevron-down'} me-2`}></i>
                        {showDetails ? 'Hide Details' : 'View Detailed Summary'}
                    </button>
                </div>

                {/* Quick Summary when collapsed */}
                {!showDetails && deliveryData.length > 0 && (
                    <div className="mb-3">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            {deliveryData.slice(0, 3).map(({ grade, value, color }) => (
                                <div key={grade} className="text-center">
                                    <div
                                        className="badge rounded-pill px-2 py-1"
                                        style={{
                                            backgroundColor: `${color}20`,
                                            color: color,
                                            border: `1px solid ${color}40`
                                        }}
                                    >
                                        <strong>{grade}</strong>: {formatNumberWithCommas(value)}kg
                                    </div>
                                </div>
                            ))}
                            {deliveryData.length > 3 && (
                                <div className="text-center">
                                    <div className="badge bg-secondary rounded-pill px-2 py-1">
                                        +{deliveryData.length - 3} more grades
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Collapsible Breakdown */}
                <div className={`collapse ${showDetails ? 'show' : ''}`}>
                    {/* Breakdown by Grade */}
                    <div className="mt-3">
                        <h6 className="text-muted small mb-2">Breakdown by Grade:</h6>
                        <div className="row g-2 grade-breakdown">
                            {deliveryData.map(({ grade, value, color }) => (
                                <div key={grade} className="col-6 col-sm-4 col-md-6 col-lg-4">
                                    <div
                                        className="p-2 rounded-3 text-center grade-item"
                                        style={{
                                            backgroundColor: `${color}15`,
                                            border: `1px solid ${color}30`,
                                            minHeight: "60px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <div
                                            className="fw-bold small"
                                            style={{
                                                color: color,
                                                fontSize: "0.75rem",
                                                marginBottom: "2px"
                                            }}
                                        >
                                            {grade}
                                        </div>
                                        <div
                                            className="fw-semibold"
                                            style={{
                                                color: color,
                                                fontSize: "0.8rem"
                                            }}
                                        >
                                            {formatNumberWithCommas(value)}
                                        </div>
                                        <div
                                            className="text-muted"
                                            style={{ fontSize: "0.65rem" }}
                                        >
                                            kg
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-3 pt-2" style={{ borderTop: "1px solid #e9ecef" }}>
                        <div className="d-flex flex-wrap gap-2">
                            {deliveryData.slice(0, 4).map(({ grade, color }) => (
                                <div key={grade} className="d-flex align-items-center">
                                    <div
                                        className="rounded-circle me-1 legend-dot"
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            backgroundColor: color
                                        }}
                                    ></div>
                                    <span style={{ fontSize: "0.7rem", color: "#6c757d" }}>
                                        {grade}
                                    </span>
                                </div>
                            ))}
                            {deliveryData.length > 4 && (
                                <span style={{ fontSize: "0.7rem", color: "#6c757d" }}>
                                    +{deliveryData.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

DetailedDeliveryCard.propTypes = {
    title: PropTypes.string.isRequired,
    totalValue: PropTypes.number.isRequired,
    deliveredKgs: PropTypes.object.isRequired,
    iconClass: PropTypes.string
};
