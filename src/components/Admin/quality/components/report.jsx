import React, { useState, useEffect } from "react";
import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";
import { loggedInUser } from "../../../../utils/loggedInUser";
import { useNavigate } from "react-router-dom";
import GenericModal from "./model";
import {
  getQualityBatchesInTesting,
  updateQualityInformation,
} from "../../../../apis/quality";
import { Error, Success } from "./responses";
import { Pagination } from "./paginations";
import { sampleStorage as storage } from "../../../../apis/sampleStorage";
import { GenericModel } from "../../../../sharedCompoents/genericModel";

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
    yellow: "#D4AF37",
    green: "#D3D3D3",
  };
  // State declarations
  const navigate = useNavigate();
  const [processingBatches, setProcessingBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allBatches, setAllBatches] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [checkedBatches, setCheckedBathes] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    processingType: "",
    grade: "",
    station: "",
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
  const [stations, setStations] = useState([]);
  const [respondSampleError, setRespondSampleError] = useState(false);
  const [respondSampleSuccess, setRespondSampleSuccess] = useState(false);
  const [activatedBatches, setActivivatedBatches] = useState([]);
  const [displayItems, setDisplayItems] = useState(5);
  const [page, setPage] = useState(1);
  const [sampleStorage, setSampleStorage] = useState([]);

  const processingTypes = [
    "Select_by_processing_type",
    "All",
    "FULLY_WASHED",
    "NATURAL",
  ];
  const calculateSummaryData = (batches) => {
    let stations = ["Select_by_stations"];
    batches?.forEach((batch) => {
      stations.push(batch?.cws?.name);
    });
    setStations([...new Set(stations)]);
  };

  // check if field is activate
  const isInActivatedBatches = (id) => activatedBatches?.includes(id);

  // Update the fetchAllBatches function to avoid unnecessary calculations
  const fetchAllBatches = async () => {
    try {
      const res = await getQualityBatchesInTesting(1, displayItems);
      if (res?.data) {
        if (res.data?.length <= 0) {
          setError("You dont have sample in testing");
          return;
        }

        const batchData = res?.data?.batches;
        setAllBatches(batchData);
        calculateSummaryData(batchData);
      } else {
        setError(res?.response?.data?.message ?? "Failed to fetch Samples.");
      }
    } catch (error) {
      console.error("Error fetching all batches:", error);
      setError("Error fetching batch data");
    }
  };

  const fetchProcessingBatches = async () => {
    setLoading(true);
    try {
      const res = await getQualityBatchesInTesting(page, displayItems);
      if (res?.data) {
        if (res.data?.length <= 0) {
          setError("You dont have sample in tesing");
          return;
        }
        setProcessingBatches(res?.data?.batches);
        setPaginationData(res?.data?.pagination);
        setPagination((prev) => ({
          ...prev,
          total: res?.data?.pagination?.total,
          totalPages: Math.ceil(res?.data?.pagination?.total / prev?.limit),
        }));
      } else {
        setError(res?.response?.data?.message ?? "Something went wrong");
      }
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
      const getSampleStorage = await storage();
      if (getSampleStorage?.length > 0) {
        setSampleStorage(getSampleStorage || []);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await fetchAllBatches();
      await fetchProcessingBatches();
    };
    initializeData();
  }, [page, displayItems]);

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

  const findKeys = (processingType) =>
    processingType === "NATURAL"
      ? { key1: "N1", key2: "N2" }
      : processingType === "HONEY"
      ? { key1: "H1", key2: "H2" }
      : { key1: "A0", key2: "A1" };

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
        batch.processing?.processingType === filters.processingType;

      const matchesGrade =
        !filters.grade ||
        filters.grade === "All" ||
        batch.grade === filters.grade;

      const matchesStation =
        !filters?.station ||
        filters?.station === "All" ||
        batch?.cws?.name === filters?.station;

      return matchesSearch && matchesType && matchesGrade && matchesStation;
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

  const handleSubmit = async () => {
    setLoading(true);
    const res = await updateQualityInformation(checkedBatches);

    if (res?.response?.data?.error) {
      setCheckedBathes([]);
      setActivivatedBatches([]);
      setRespondSampleError(
        res?.response?.data?.message ?? "Something went wrong."
      );
      setTimeout(() => {
        setRespondSampleError(false);
      }, 4000);
    } else {
      await fetchAllBatches();
      await fetchProcessingBatches();
      setActivivatedBatches([]);
      setCheckedBathes([]);
      setRespondSampleSuccess(
        res?.response?.data?.message ?? "Sample data, updated successfully."
      );
      setTimeout(() => {
        setRespondSampleSuccess(false);
      }, 4000);
    }

    setLoading(false);
    if (res?.message) {
      setLoading(false);
    }
    setLoading(false);
  };
  // sample
  const handleCheckboxChange = (batchId, processingType, ischecked) => {
    ischecked == true
      ? setActivivatedBatches((prev) => [...new Set([...prev, batchId])])
      : setActivivatedBatches((prev) =>
          prev.filter((eleme) => batchId !== eleme)
        );
    setCheckedBathes((prev) => {
      const isAlreadySelected = prev.find((item) => item.id === batchId);

      if (isAlreadySelected) {
        return prev.filter((item) => item.id !== batchId);
      }
      return [
        ...prev,
        {
          id: batchId,
          processingType,
          labMoisture: { A0: "", A1: "" },
          cwsMoisture: { A0: "", A1: "" },
          "16+": { A0: "", A1: "" },
          "15+": { A0: "", A1: "" },
          "14+": { A0: "", A1: "" },
          "13+": { A0: "", A1: "" },
          "B/12": { A0: "", A1: "" },
          deffect: { A0: "", A1: "" },
          ppScore: { A0: "", A1: "" },
          sampleStorage: { A0: "", A1: "" },
          category: { A0: "", A1: "" },
        },
      ];
    });
  };

  // sample
  const handleInputChange = (batchId, field, aKey, value) => {
    setCheckedBathes((prev) =>
      prev.map((item) =>
        item.id === batchId
          ? {
              ...item,
              [field]: {
                ...item[field],
                [aKey]: value,
              },
            }
          : item
      )
    );
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

  const renderPagination = async (filteredData) => {
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
      {isAdmin ? (
        <>
          <button
            disabled={checkedBatches?.length <= 0}
            className="btn text-white mb-2"
            onClick={() => handleSubmit()}
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
          {respondSampleSuccess && <Success message={respondSampleSuccess} />}
          {respondSampleError && <Error error={respondSampleError} />}
        </>
      ) : (
        ""
      )}
      <Card className="mb-4">
        <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
          <Row className=" g-3 mb-2">
            {/* <Col md={8}>
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
            </Col> */}
          </Row>
          <Row className="g-3">
            <Col md={2}>
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
            {isAdmin && (
              <Col md={2}>
                <Form.Select
                  value={filters?.station}
                  onChange={(e) =>
                    handleFilterChange("station", e.target.value)
                  }
                  disabled={loading}
                >
                  {stations?.map((type) => (
                    <option
                      disabled={type == "Select_by_stations"}
                      key={
                        type == "Select_by_stations"
                          ? "Select_by_stations"
                          : type
                      }
                      value={type == "Select_by_stations" ? "" : type}
                    >
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            )}
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
          className="table-responsive mx-4 mt-4 "
          style={{ maxHeight: "70vh" }}
        >
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
                      { key: "select", label: " Select " },
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
                            batch?.processing?.processingType
                          )}
                        >
                          {batch.processing?.processingType}
                        </span>
                      </td>
                      {/* Rwacof inputs */}
                      {isAdmin && (
                        <td className="align-middle">
                          <div style={{ marginLeft: "1rem" }}>
                            <input
                              type="checkbox"
                              defaultChecked={false}
                              onChange={(e) => {
                                const isChecked = e.target?.checked;
                                handleCheckboxChange(
                                  batch?.batchNo,
                                  batch?.processing?.processingType,
                                  isChecked
                                );
                              }}
                            />
                          </div>
                        </td>
                      )}
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
                              <td
                                style={{
                                  width: "5rem",
                                  backgroundColor: isAdmin ? theme?.yellow : "",
                                }}
                              >
                                +16
                              </td>
                              <td
                                style={{
                                  width: "5rem",
                                  backgroundColor: isAdmin ? theme?.yellow : "",
                                }}
                              >
                                15
                              </td>
                              <td
                                style={{
                                  width: "5rem",
                                  backgroundColor: isAdmin ? theme?.yellow : "",
                                }}
                              >
                                14
                              </td>
                              <td
                                style={{
                                  width: "5rem",
                                  backgroundColor: isAdmin ? theme?.yellow : "",
                                }}
                              >
                                13
                              </td>
                              <td
                                style={{
                                  width: "5rem",
                                  backgroundColor: isAdmin ? theme?.yellow : "",
                                }}
                              >
                                B12
                              </td>
                              <td
                                style={{
                                  width: "10rem",
                                  backgroundColor: isAdmin ? theme?.green : "",
                                }}
                              >
                                Deffect
                              </td>
                              <td
                                style={{
                                  width: "10rem",
                                  backgroundColor: isAdmin ? theme?.green : "",
                                }}
                              >
                                PP Score(%)
                              </td>
                              <td
                                style={{
                                  width: "10rem",
                                  backgroundColor: isAdmin ? theme?.green : "",
                                }}
                              >
                                Sample storage
                              </td>
                              <td
                                style={{
                                  width: "10rem",
                                  backgroundColor: isAdmin ? theme?.green : "",
                                }}
                              >
                                Category
                              </td>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              batch?.A0 || batch?.N1 || batch?.H1,
                              batch?.A1 || batch?.N2 || batch?.H2,
                            ].map((element, index) => {
                              return (
                                <tr
                                  key={`${batch?.batchNo}-${
                                    index / 2 == 0 ? "(A0)" : "(A1)"
                                  }`}
                                >
                                  <td className="align-middle">
                                    <div style={{ width: "10rem" }}>
                                      {`${batch?.batchNo}-${
                                        index == 0
                                          ? `(${
                                              findKeys(
                                                batch?.processing
                                                  ?.processingType
                                              )?.key1
                                            })`
                                          : `(${
                                              findKeys(
                                                batch?.processing
                                                  ?.processingType
                                              )?.key2
                                            })`
                                      }`}
                                    </div>
                                  </td>

                                  {/* Station moisture */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.cwsMoisture1 ?? 0
                                        }
                                        required
                                        value={batch?.cwsMoisture1}
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "cwsMoisture",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.cwsMoisture1}
                                  </td>
                                  {/* lab moisture */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={element?.labMoisture ?? 0}
                                        required
                                        value={batch?.labMoisture?.A0}
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "labMoisture",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.labMoisture}
                                  </td>
                                  {/* +16 */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.screen["16+"] ?? 0
                                        }
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "16+",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.screen["16+"]}
                                  </td>
                                  {/* +15 */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.screen["15"] ?? 0
                                        }
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "15+",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.screen["15"]}
                                  </td>
                                  {/* +14 */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.screen["14"] ?? ""
                                        }
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "14+",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.screen["14"]}
                                  </td>
                                  {/* +13 */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.screen["13"] ?? 0
                                        }
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "13+",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.screen["13"]}
                                  </td>
                                  {/* +12 */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          element?.screen["B/12"] ?? 0
                                        }
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "B/12",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.screen["B/12"]}
                                  </td>
                                  {/* deffect */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={element?.defect}
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "deffect",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.defect}
                                  </td>
                                  {/* pp score */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <input
                                        type="number"
                                        className="form-control"
                                        disabled={
                                          loading ||
                                          !isInActivatedBatches(batch?.batchNo)
                                        }
                                        style={{ width: "7rem" }}
                                        defaultValue={element?.ppScore}
                                        required
                                        onChange={(e) =>
                                          handleInputChange(
                                            batch?.batchNo,
                                            "ppScore",
                                            index / 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    )}
                                    {!isAdmin && element?.ppScore}
                                  </td>
                                  {/* category  */}
                                  <td className="align-middle">
                                    {isAdmin && (
                                      <div style={{ width: "7rem" }}>
                                        <Form.Select
                                          onChange={(e) =>
                                            handleInputChange(
                                              batch?.batchNo,
                                              "sampleStorage",
                                              index / 2 == 0 ? "A0" : "A1",
                                              e.target.value
                                            )
                                          }
                                          disabled={
                                            loading ||
                                            !isInActivatedBatches(
                                              batch?.batchNo
                                            )
                                          }
                                          defaultValue={
                                            index % 2 == 0
                                              ? element?.sampleStorage_0?.id
                                              : element?.sampleStorage_1?.id
                                          }
                                        >
                                          {sampleStorage?.map((type) => (
                                            <option
                                              key={type?.id}
                                              value={type?.id}
                                              style={{
                                                outline: "none",
                                              }}
                                            >
                                              {type?.name}
                                            </option>
                                          ))}
                                        </Form.Select>
                                      </div>
                                    )}
                                    {!isAdmin &&
                                      (index % 2 == 0
                                        ? element?.sampleStorage_0?.name ?? ""
                                        : element?.sampleStorage_1?.name ?? "")}
                                  </td>
                                  {/**sample storage */}
                                  <td className="align-middle">
                                    {element?.category ?? ""}
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
                            })}
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
  );
};

export default ShortSummary;
