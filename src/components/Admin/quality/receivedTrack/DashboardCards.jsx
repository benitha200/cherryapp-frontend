import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, ProgressBar, Badge } from "react-bootstrap";
import { getAllTrucksWithDetailedBatches } from "../../../../apis/delivaryCapping";
import { ChevronDown, ChevronRight } from "lucide-react";
import DashboardSkeletonLoader from "./receivedTrackStkeleton";

const processingTheme = {
  primary: "#008080",
  accent: "#FF8C00",
  secondary: "#4FB3B3",
  neutral: "#E6F3F3",
  tableHover: "#F8FAFA",
  gray: "#6c757d",
  green: "#28a745",
};

const TRANSPORT_GRADES = ["A0", "A1", "A2", "A3", "N1", "N2", "H1"];
const DELIVERED_GRADES = [
  "c2",
  "c1",
  "s86",
  "s87",
  "s88",
  "A2",
  "A3",
  "B1",
  "B2",
  "N2",
];

export default function DashboardCards() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTransportGrades, setShowTransportGrades] = useState(false);
  const [showDeliveredGrades, setShowDeliveredGrades] = useState(false);
  const [toggleCards, setToggleCards] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const res = await getAllTrucksWithDetailedBatches();
        setSummary(res?.data);
      } catch {
        setError("Failed to load dashboard data");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeletonLoader />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!summary) return null;

  const renderGradeBreakdown = (gradesObj, total, gradesList) => (
    <div>
      {gradesList.map((grade) => {
        const value = Number(gradesObj?.[grade] || 0);
        const percent = total ? ((value / total) * 100).toFixed(1) : 0;
        return (
          <div
            key={grade}
            className="mb-3 p-2 rounded"
            style={{ background: "#f6fdf7", border: "1px solid #e6f3ec" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span>
                <Badge
                  style={{
                    backgroundColor: processingTheme.green,
                    color: "#fff",
                    minWidth: 40,
                    fontSize: 15,
                    padding: "6px 12px",
                  }}
                  className="me-2"
                >
                  {grade}
                </Badge>
                <span style={{ fontWeight: 500, fontSize: 15 }}>
                  {value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kg
                </span>
              </span>
              <span className="text-muted" style={{ fontSize: 14 }}>
                {percent}%
              </span>
            </div>
            <ProgressBar
              now={percent}
              style={{
                height: "8px",
                backgroundColor: processingTheme.tableHover,
                borderRadius: 4,
              }}
              variant="success"
            />
          </div>
        );
      })}
    </div>
  );

  // Cup Profile Cards using grandTotalDelivered as profiles
  const renderCupProfiles = () => {
    const delivered = summary.grandTotalDelivered || {};
    const totalKgs = summary.grandTotalDeliveredSum || 0;
    if (Object.keys(delivered).length > 0) {
      return (
        <Row>
          {Object.entries(delivered).map(([profile, value]) => (
            <Col md={3} key={profile} className="mb-3">
              <Card
                className="h-100 border-0"
                style={{ backgroundColor: processingTheme.tableHover }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{profile}</h6>
                  </div>
                  <h4>
                    {Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg
                  </h4>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${
                          totalKgs ? ((value / totalKgs) * 100).toFixed(1) : 0
                        }%`,
                        backgroundColor: processingTheme.primary,
                      }}
                      aria-valuenow={totalKgs ? (value / totalKgs) * 100 : 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <small className="text-muted mt-2 d-block">
                    {totalKgs ? ((value / totalKgs) * 100).toFixed(1) : 0}% of
                    total
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    return (
      <Row>
        <Col md={12} className="text-center text-muted">
          <em>No cup profile data available in this summary.</em>
        </Col>
      </Row>
    );
  };

  return (
    <>
      {/* Main Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.primary}` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1">Total Trucks</h6>
              <h3 style={{ color: processingTheme.primary }}>
                {summary.total?.toLocaleString()}
              </h3>
              <p className="mb-0">{summary.totalBatches} total batches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.accent}` }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Transported (Sum)</h6>
                  <h3 style={{ color: processingTheme.accent }}>
                    {summary.grandTotalTransportedSum?.toLocaleString()} kg
                  </h3>
                  <p className="mb-0">Grades: {TRANSPORT_GRADES.join(", ")}</p>
                </div>
                <button
                  className="btn btn-link p-0 ms-2"
                  style={{ fontSize: 20, color: processingTheme.green }}
                  onClick={() => setShowTransportGrades((v) => !v)}
                  aria-label="Toggle grade breakdown"
                >
                  {showTransportGrades ? (
                    <i className="bi bi-caret-up-fill"></i>
                  ) : (
                    <i className="bi bi-caret-down-fill"></i>
                  )}
                </button>
              </div>
              {showTransportGrades && (
                <div className="mt-3">
                  {renderGradeBreakdown(
                    summary.grandTotalTransported,
                    summary.grandTotalTransportedSum,
                    TRANSPORT_GRADES
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.gray}` }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Delivered (Sum)</h6>
                  <h3 style={{ color: processingTheme.gray }}>
                    {summary.grandTotalDeliveredSum?.toLocaleString()} kg
                  </h3>
                  <p className="mb-0">Grades: {DELIVERED_GRADES.join(", ")}</p>
                </div>
                <button
                  className="btn btn-link p-0 ms-2"
                  style={{ fontSize: 20, color: processingTheme.green }}
                  onClick={() => setShowDeliveredGrades((v) => !v)}
                  aria-label="Toggle grade breakdown"
                >
                  {showDeliveredGrades ? (
                    <i className="bi bi-caret-up-fill"></i>
                  ) : (
                    <i className="bi bi-caret-down-fill"></i>
                  )}
                </button>
              </div>
              {showDeliveredGrades && (
                <div className="mt-3">
                  {renderGradeBreakdown(
                    summary.grandTotalDelivered,
                    summary.grandTotalDeliveredSum,
                    DELIVERED_GRADES
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            className="h-100 shadow-sm"
            style={{ borderTop: `4px solid ${processingTheme.green}` }}
          >
            <Card.Body>
              <h6 className="text-muted mb-1">Delivered/Transported %</h6>
              <h3 style={{ color: processingTheme.green }}>
                {summary.grandTotalTransportedSum
                  ? (
                      (summary.grandTotalDeliveredSum /
                        summary.grandTotalTransportedSum) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </h3>
              <p className="mb-0">
                {summary.grandTotalDeliveredSum?.toLocaleString()} /{" "}
                {summary.grandTotalTransportedSum?.toLocaleString()} kg
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cup Profile Summary Cards */}
      <Card className="mb-4 shadow-sm">
        <Card.Header
          style={{
            backgroundColor: processingTheme.neutral,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onClick={() => setToggleCards(!toggleCards)}
        >
          <h5 style={{ color: processingTheme.primary, margin: 0 }}>
            Cup Profile Overview
          </h5>
          {toggleCards ? (
            <ChevronDown size={20} style={{ color: processingTheme.primary }} />
          ) : (
            <ChevronRight
              size={20}
              style={{ color: processingTheme.primary }}
            />
          )}
        </Card.Header>
        {toggleCards && <Card.Body>{renderCupProfiles()}</Card.Body>}
      </Card>
    </>
  );
}
