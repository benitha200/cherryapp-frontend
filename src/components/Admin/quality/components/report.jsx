import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Placeholder,
} from "react-bootstrap";
import API_URL from "../../../../constants/Constants";
import { loggedInUser } from "../../../../utils/loggedInUser";
import { useNavigate } from "react-router-dom";
import GenericModal from "./model";

const processingTheme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover

  // Grade colors
  gradeA: "#4FB3B3", // Lighter teal
  gradeB: "#6ECECE", // Even lighter teal
  gradeDefault: "#87CEEB", // Light blue

  // Processing Type colors
  fullyWashed: "#008080", // Main teal
  natural: "#4FB3B3", // Lighter teal

  // Status colors
  statusCompleted: "#2E8B57", // Sea green
  statusInProgress: "#D4AF37", // Golden
  statusPending: "#808080", // Gray
};

const LoadingSkeleton = () => {
  return (
    <div className="container-fluid">
      {/* Header Skeleton */}
      <div
        className="mb-4"
        style={{ borderBottom: `2px solid ${processingTheme.primary}` }}
      >
        <Placeholder as="h2" animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as="p" animation="glow">
          <Placeholder xs={8} />
        </Placeholder>
      </div>

      {/* Summary Cards Skeleton */}
      <Row className="mb-4">
        {[...Array(4)].map((_, idx) => (
          <Col md={3} key={idx}>
            <Card className="text-center h-100">
              <Card.Body>
                <Placeholder as={Card.Title} animation="glow">
                  <Placeholder xs={8} />
                </Placeholder>
                <Placeholder as="h2" animation="glow">
                  <Placeholder xs={6} />
                </Placeholder>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters Skeleton */}
      <Card className="mb-4">
        <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
          <Row className="g-3">
            <Col md={12}>
              <Placeholder animation="glow">
                <Placeholder xs={12} />
              </Placeholder>
            </Col>
          </Row>
        </Card.Body>

        {/* Table Skeleton */}
        <div className="table-responsive">
          <table className="table">
            <thead style={{ backgroundColor: processingTheme.neutral }}>
              <tr>
                {[
                  "Batch No",
                  "Total KGs",
                  "Grade",
                  "CWS",
                  "Processing Type",
                ].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  {[...Array(6)].map((_, cellIdx) => (
                    <td key={cellIdx}>
                      <Placeholder animation="glow">
                        <Placeholder xs={8} />
                      </Placeholder>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ShortSummary = () => {
  const loggedinUser = loggedInUser();
  const isAdmin = loggedinUser?.role == "ADMIN";
  const isWorkingStations = loggedinUser?.role === "CWS_MANAGER";
  const theme = {
    primary: "#008080", // Sucafina teal
    secondary: "#4FB3B3", // Lighter teal
    accent: "#D95032", // Complementary orange
    neutral: "#E6F3F3", // Very light teal
    tableHover: "#F8FAFA", // Ultra light teal for ta
  };
  // State declarations
  const navigate = useNavigate();
  const [processingBatches, setProcessingBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBatches, setAllBatches] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    processingType: "",
    grade: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 0,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [summaryData, setSummaryData] = useState({
    totalBatches: 0,
    totalKgs: 0,
    fullyWashedKgs: 0,
    naturalKgs: 0,
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const processingTypes = [
    "Select_by_processing_type",
    "All",
    "FULLY_WASHED",
    "NATURAL",
  ];

  const calculateSummaryData = (batches) => {
    const totalKgs = batches.reduce(
      (sum, batch) => sum + (Number(batch.totalKgs) || 0),
      0
    );
    const fullyWashedKgs = batches
      .filter((batch) => batch.processingType === "FULLY_WASHED")
      .reduce((sum, batch) => sum + (Number(batch.totalKgs) || 0), 0);
    const naturalKgs = batches
      .filter((batch) => batch.processingType === "NATURAL")
      .reduce((sum, batch) => sum + (Number(batch.totalKgs) || 0), 0);

    setSummaryData({
      totalBatches: batches.length,
      totalKgs,
      fullyWashedKgs,
      naturalKgs,
    });
  };

  // Add this useEffect to recalculate summary data when filters or processingBatches change
  useEffect(() => {
    const filteredData = filteredBatches(processingBatches);
    calculateSummaryData(filteredData);
  }, [filters, processingBatches]);

  // Update the fetchAllBatches function to avoid unnecessary calculations
  const fetchAllBatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/processing?limit=100000`);
      const batchData = res.data.data;
      setAllBatches(batchData);
      // Calculate summary data for the initial load (all batches)
      calculateSummaryData(batchData);
    } catch (error) {
      console.error("Error fetching all batches:", error);
      setError("Error fetching batch data");
    }
  };

  const fetchProcessingBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/processing?limit=100000`);
      setProcessingBatches(res.data.data);
      setPagination((prev) => ({
        ...prev,
        total: res.data.pagination.total,
        totalPages: Math.ceil(res.data.pagination.total / prev.limit),
      }));
    } catch (error) {
      console.error("Error fetching processing batches:", error);
      setError("Error fetching processing batches");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchAllBatches();
      await fetchProcessingBatches();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchProcessingBatches();
    }
  }, [pagination.page, isInitialLoad]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredBatches = (batches) => {
    return batches.filter((batch) => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        batch.batchNo?.toLowerCase().includes(searchTerm) ||
        batch.totalKgs?.toString().includes(searchTerm) ||
        batch.grade?.toLowerCase().includes(searchTerm) ||
        batch.cws?.name?.toLowerCase().includes(searchTerm) ||
        batch.processingType?.toLowerCase().includes(searchTerm) ||
        batch.status?.toLowerCase().includes(searchTerm);

      const matchesType =
        !filters.processingType ||
        filters.processingType === "All" ||
        batch.processingType === filters.processingType;

      const matchesGrade =
        !filters.grade ||
        filters.grade === "All" ||
        batch.grade === filters.grade;

      return matchesSearch && matchesType && matchesGrade;
    });
  };

  const getPaginatedBatches = (filteredData) => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSelectedBatch = (batchId) => {
    setSelectedBatch(batchId);
  };

  useEffect(() => {
    const totalFilteredItems = filteredBatches(processingBatches).length;
    setPagination((prev) => ({
      ...prev,
      total: totalFilteredItems,
      totalPages: Math.ceil(totalFilteredItems / prev.limit),
      page: 1,
    }));
  }, [filters, processingBatches]);

  const getProcessingTypeBadgeStyle = (type) => ({
    backgroundColor:
      type === "FULLY_WASHED"
        ? processingTheme.fullyWashed
        : processingTheme.natural,
    color: "white",
    fontSize: "0.9em",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    display: "inline-block",
  });

  const renderPagination = (filteredData) => {
    const totalFilteredItems = filteredData.length;
    const totalPages = Math.ceil(totalFilteredItems / pagination.limit);

    if (totalFilteredItems <= pagination.limit) {
      return (
        <div className="d-flex justify-content-between align-items-center mt-4 px-3">
          <div className="text-muted">
            Showing {totalFilteredItems} of {totalFilteredItems} entries
          </div>
        </div>
      );
    }

    const paginationStyle = {
      pageLink: {
        color: processingTheme.primary,
        border: `1px solid ${processingTheme.neutral}`,
        ":hover": {
          backgroundColor: processingTheme.neutral,
        },
      },
      activePageLink: {
        backgroundColor: processingTheme.primary,
        borderColor: processingTheme.primary,
        color: "white",
      },
      disabledPageLink: {
        color: "#6c757d",
        backgroundColor: "#f8f9fa",
        borderColor: "#dee2e6",
      },
    };

    return (
      <div className="d-flex justify-content-between align-items-center mt-4 px-3">
        <div className="text-muted">
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, totalFilteredItems)} of{" "}
          {totalFilteredItems} entries
        </div>
        <nav>
          <ul className="pagination mb-0">
            <li
              className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={
                  pagination.page === 1
                    ? paginationStyle.disabledPageLink
                    : paginationStyle.pageLink
                }
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
              <li
                key={idx + 1}
                className={`page-item ${
                  pagination.page === idx + 1 ? "active" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(idx + 1)}
                  style={
                    pagination.page === idx + 1
                      ? paginationStyle.activePageLink
                      : paginationStyle.pageLink
                  }
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                pagination.page === totalPages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                style={
                  pagination.page === totalPages
                    ? paginationStyle.disabledPageLink
                    : paginationStyle.pageLink
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  if (isInitialLoad) return <LoadingSkeleton />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const filteredData = filteredBatches(processingBatches);
  const displayData = getPaginatedBatches(filteredData);

  const sortedData = sortConfig.key
    ? [...displayData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const direction = sortConfig.direction === "asc" ? 1 : -1;
        return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
      })
    : displayData;

  return (
    <div className="container-fluid">
      <Card className="mb-4">
        <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
          <Row className=" g-3 mb-2">
            <Col md={8}>
              <div className="col-md-2 col-sm-6">
                {isWorkingStations && (
                  <button
                    className="btn btn-primary w-100"
                    disabled={loading}
                    onClick={() => navigate("/quality-all/form")}
                    style={{
                      backgroundColor: theme?.primary,
                      borderColor: theme?.primary,
                    }}
                  >
                    {<i className="bi bi-plus-lg me-2"></i>}
                    Add Sample
                  </button>
                )}
              </div>
            </Col>
          </Row>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search across all fields..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={loading}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.processingType}
                onChange={(e) =>
                  handleFilterChange("processingType", e.target.value)
                }
                disabled={loading}
              >
                {processingTypes.map((type) => (
                  <option
                    disabled={type == "Select_by_processing_type"}
                    key={type == "Select_by_processing_type" ? "All" : type}
                    value={type == "Select_by_processing_type" ? "" : type}
                  >
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>

        <div className="table-responsive mx-4 mt-4">
          <table className=" table-hover">
            <thead>
              <tr>
                {(!isAdmin
                  ? [
                      { key: "processingType", label: "Processing Type" },
                      { key: "summary", label: "" },
                    ]
                  : [
                      { key: "CWS", label: "CWS" },
                      { key: "processingType", label: "Processing Type" },
                      { key: "summary", label: "" },
                    ]
                ).map(({ key, label }, index) => (
                  <th
                    key={key}
                    onClick={() => !loading && handleSort(key)}
                    style={{ cursor: loading ? "default" : "pointer" }}
                  >
                    <div className=" align-items-center gap-2">
                      {label}
                      {sortConfig.key === key && (
                        <i
                          className={`bi bi-arrow-${
                            sortConfig.direction === "asc" ? "up" : "down"
                          }`}
                        ></i>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx}>
                    {[...Array(6)].map((_, cellIdx) => (
                      <td key={cellIdx}>
                        <Placeholder animation="glow">
                          <Placeholder xs={8} />
                        </Placeholder>
                      </td>
                    ))}
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No processing batches found matching your criteria
                  </td>
                </tr>
              ) : (
                sortedData.map((batch) => (
                  <>
                    <tr
                      key={batch.id}
                      style={{
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          processingTheme.tableHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {isAdmin && (
                        <td className="align-middle">
                          {batch?.cws?.name ?? "-"}
                        </td>
                      )}
                      <td className="align-middle">
                        <span
                          className="badge"
                          style={getProcessingTypeBadgeStyle(
                            batch.processingType
                          )}
                        >
                          {batch.processingType}
                        </span>
                      </td>
                      {/* Rwacof inputs */}
                      <div>
                        <table
                          className=" table "
                          style={{ marginLeft: "2rem" }}
                        >
                          <thead>
                            <tr>
                              <td style={{ width: "10rem" }}>Batch No</td>
                              <td style={{ width: "10rem" }}>
                                Station Moisture
                              </td>
                              <td style={{ width: "10rem" }}>Lab Moisture</td>
                              <td style={{ width: "5rem" }}>16+</td>
                              <td style={{ width: "5rem" }}>15</td>
                              <td style={{ width: "5rem" }}>14</td>
                              <td style={{ width: "5rem" }}>13</td>
                              <td style={{ width: "5rem" }}>B12</td>
                              <td style={{ width: "10rem" }}>Potato cups</td>
                              <td style={{ width: "10rem" }}>overall Score</td>
                              <td style={{ width: "10rem" }}>PP Score</td>
                              <td style={{ width: "10rem" }}>deffect</td>
                              <td style={{ width: "10rem" }}>sample storage</td>
                              {isAdmin && (
                                <td style={{ width: "10rem" }}>Action</td>
                              )}{" "}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 2 }, (_, index) => index).map(
                              (element, index) => {
                                return (
                                  <tr key={element}>
                                    <td className="align-middle">{`${
                                      batch?.batchNo
                                    }-${index / 2 == 0 ? "(A0)" : "(A1)"}`}</td>
                                    <td className="align-middle">12</td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "4rem" }}
                                          defaultValue={0}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "7rem" }}
                                          defaultValue={2}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "7rem" }}
                                          defaultValue={2}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>{" "}
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "7rem" }}
                                          defaultValue={2}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>{" "}
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "7rem" }}
                                          defaultValue={2}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>{" "}
                                    <td className="align-middle">
                                      {isAdmin && (
                                        <input
                                          type="number"
                                          className="form-control"
                                          disabled={loading || !isAdmin}
                                          style={{ width: "7rem" }}
                                          defaultValue={2}
                                          required
                                        />
                                      )}
                                      {!isAdmin && 2}
                                    </td>
                                    <td>
                                      {isAdmin ? (
                                        <button
                                          className="btn text-white"
                                          onClick={() =>
                                            handleSelectedBatch(batch?.batchNo)
                                          }
                                          style={{
                                            backgroundColor: theme?.primary,
                                          }}
                                        >
                                          {loading ? (
                                            <>
                                              <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                              ></span>
                                              Processing...
                                            </>
                                          ) : (
                                            "Save"
                                          )}
                                        </button>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <GenericModal
                                      isOpen={
                                        selectedBatch !== null &&
                                        selectedBatch == batch?.batchNo
                                      }
                                      onClose={() => setSelectedBatch(null)}
                                      onConfirm={() => null}
                                      isLoading={false}
                                      title={"Mosture content"}
                                      message={
                                        "Are you sure you want to save the data"
                                      }
                                      confirmButtonText="Save"
                                      confirmButtonColor="secondary"
                                      cancelButtonText="Cancel"
                                      cancelButtonColor="primary"
                                    />
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                    </tr>
                    <div className=" mb-4"></div>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && renderPagination(filteredData)}
      </Card>
    </div>
  );
};

export default ShortSummary;
