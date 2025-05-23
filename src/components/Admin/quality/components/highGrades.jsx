import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";
import API_URL from "../../../../constants/Constants";
import { loggedInUser } from "../../../../utils/loggedInUser";
import { FormSelection } from "../sample/components/formSelections";
import { useNavigate } from "react-router-dom";
import { getHighgrades } from "../../../../apis/quality";
import { Pagination } from "./paginations";

const processingTheme = {
  // Base colors
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

const HighGrades = () => {
  const loggedinuser = loggedInUser();
  // State declarations
  const [processingBatches, setProcessingBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBatches, setAllBatches] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedBatchProcessingType, setSelectedBatchProcessingType] =
    useState(null);
  const [batchNo, setBatchNo] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [page, setPage] = useState(1);
  const [displayItems, setDisplayItems] = useState(5);
  const [refresh, setRefresh] = useState(false);
  const [baggedOffBatchesSize, setBaggedOffBathesSize] = useState(null);

  const navigate = useNavigate();
  const processingTypes = ["All", "FULLY_WASHED", "NATURAL"];

  // Update the fetchAllBatches function to avoid unnecessary calculations
  const fetchAllBatches = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/batches/sample/gradeA/${loggedinuser?.cwsId}?page1&limit=100`,

        {
          headers: {
            Authorization: `Bearer ${loggedinuser?.token}`,
          },
        }
      );
      const batchData = res.data.data;
      setAllBatches(batchData);
    } catch (error) {
      console.error(
        "Error fetching all batches:",
        error?.response?.data?.message
      );
      setError(error?.response?.data?.message ?? "Error fetching batch data");
    }
  };

  const fetchProcessingBatches = async () => {
    setLoading(true);
    const res = await getHighgrades(page, displayItems);
    if (res?.data && res.data?.length > 0) {
      setProcessingBatches(res?.data);
      setPaginationData(res?.pagination);
      setBaggedOffBathesSize(res.data?.length);
    } else if (res?.data?.length == 0) {
      setBaggedOffBathesSize(0);
      // setError("There is no bagged off butches.");
    } else {
      setError(error?.response?.data?.message ?? "Error fetching batchs data");
    }
    setLoading(false);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    setBaggedOffBathesSize(0);
    const initializeData = async () => {
      await fetchAllBatches();
      await fetchProcessingBatches();
    };
    initializeData();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await fetchAllBatches();
      await fetchProcessingBatches();
    };
    initializeData();
  }, [refresh, page, displayItems]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchProcessingBatches();
    }
  }, [pagination.page, isInitialLoad, setSelectedBatchId]);

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
    setPage(newPage);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRowClick = (batchId, batchNo, processingType) => {
    setSelectedBatchId(batchId);
    setBatchNo(batchNo);
    setSelectedBatchProcessingType(processingType);
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

  const getGradeBadgeStyle = (grade) => {
    let backgroundColor;
    switch (grade?.toUpperCase()) {
      case "A":
        backgroundColor = processingTheme.gradeA;
        break;
      case "B":
        backgroundColor = processingTheme.gradeB;
        break;
      default:
        backgroundColor = processingTheme.gradeDefault;
    }
    return {
      backgroundColor,
      color: "white",
      fontSize: "0.9em",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      display: "inline-block",
    };
  };

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

  if (isInitialLoad) return <LoadingSkeleton />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (baggedOffBatchesSize == 0)
    return (
      <div className="table-responsive mx-4 mt-4">
        <button
          className="btn text-white mb-3"
          style={{ backgroundColor: "#008080" }}
          onClick={() => navigate(-1)}
          type="button"
        >
          Back
        </button>
        <table className="table-hover">
          <tbody>
            <tr>
              <td colSpan="4">
                {" "}
                {/* Fixed string instead of template literal */}
                <div className="d-flex justify-content-center align-items-center p-5">
                  <div
                    className="text-center p-4 border border-warning rounded-3 bg-light"
                    style={{ maxWidth: "500px" }}
                  >
                    <div className="mb-3">
                      <i
                        className="bi bi-inbox text-warning"
                        style={{ fontSize: "2.5rem" }}
                      ></i>
                    </div>
                    <h5 className="mb-2">No Batches Available</h5>
                    <p className="text-muted mb-0">
                      There are no bagged off batches at the moment.
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

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
    <>
      <button
        className="btn text-white mb-3"
        style={{ backgroundColor: "#008080" }}
        onClick={() => navigate(-1)}
        type="button"
      >
        Back
      </button>
      <div className="" style={{ maxHeight: "75vh", gap: "7rem" }}>
        <div>
          {!loading && (
            <FormSelection
              selectedBatchId={selectedBatchId}
              batchNo={batchNo}
              setSelectedBatchId={setSelectedBatchId}
              processType={selectedBatchProcessingType}
              refresh={setRefresh}
            />
          )}
        </div>
        <Card className="mb-4  overflow-auto ">
          <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
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
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1}>
                <Form.Select
                  style={{ marginLeft: "6rem" }}
                  value={displayItems}
                  onChange={(e) => {
                    setDisplayItems(e.target.value);
                  }}
                  disabled={loading}
                >
                  {[5, 10, 20].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>

          <div
            className="table-responsive"
            style={{ overflow: "scroll", height: "40vh" }}
          >
            <table className="table table-hover">
              <thead style={{ backgroundColor: processingTheme.neutral }}>
                <tr>
                  {[
                    { key: "batchNo", label: "Batch No" },
                    { key: "totalKgs", label: "Total KGs" },
                    { key: "grade", label: "Grade" },
                    { key: "cws", label: "CWS" },
                    { key: "processingType", label: "Processing Type" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => !loading && handleSort(key)}
                      style={{ cursor: loading ? "default" : "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2">
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
                    <tr
                      key={batch.id}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: "green",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          processingTheme.tableHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "yellow";
                      }}
                      onClick={() => {
                        handleRowClick(
                          batch?.id,
                          batch?.batchNo,
                          batch?.processingType
                        );
                      }}
                    >
                      <td
                        className="align-middle"
                        style={{
                          backgroundColor:
                            batchNo == batch?.batchNo && batchNo !== null
                              ? processingTheme?.statusPending
                              : "",
                        }}
                      >
                        {batch.batchNo}
                      </td>
                      <td
                        className="align-middle"
                        style={{
                          backgroundColor:
                            batchNo == batch?.batchNo && batchNo !== null
                              ? processingTheme?.statusPending
                              : "",
                        }}
                      >
                        {batch?.totalOutputKgs?.toLocaleString() || 0} kg
                      </td>
                      <td
                        className="align-middle"
                        style={{
                          backgroundColor:
                            batchNo == batch?.batchNo && batchNo !== null
                              ? processingTheme?.statusPending
                              : "",
                        }}
                      >
                        <span
                          className="badge"
                          style={getGradeBadgeStyle(batch.grade)}
                        >
                          {batch?.processing?.grade || "N/A"}
                        </span>
                      </td>
                      <td
                        className="align-middle"
                        style={{
                          backgroundColor:
                            batchNo == batch?.batchNo && batchNo !== null
                              ? processingTheme?.statusPending
                              : "",
                        }}
                      >
                        {batch?.processing?.cws?.name ?? "N/A"}
                      </td>
                      <td
                        className="align-middle"
                        style={{
                          backgroundColor:
                            batchNo == batch?.batchNo && batchNo !== null
                              ? processingTheme?.statusPending
                              : "",
                        }}
                      >
                        <span
                          className="badge"
                          style={getProcessingTypeBadgeStyle(
                            batch.processingType
                          )}
                        >
                          {batch.processingType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && (
            <Pagination
              currentPage={page}
              totalPages={paginationData?.totalPages ?? 0}
              totalItems={paginationData?.total ?? 0}
              itemsPerPage={displayItems}
              onPageChange={handlePageChange}
            />
          )}
        </Card>
      </div>
    </>
  );
};

export default HighGrades;
