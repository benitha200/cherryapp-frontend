import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Container, Card, Table, Form, Row, Col, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { GetDeliveryReportNew } from "../action";
import TableSkeletonLoader from "./skeleton";
import { DeliveryReportSummary } from "./repordData";
import CSVExport from "../../../../../sharedCompoents/csvfile";
import { formatDate } from "../../../../../utils/formatDate";

const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange for contrast
  neutral: "#E6F3F3", // Very light teal for backgrounds
  text: "#34495E",
};

const CollapsibleCWSTable = () => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const { isPending, error, data } = GetDeliveryReportNew();
  const sampleData = data?.data ?? [];

  const groupedData = useMemo(() => {
    const groups = {};

    sampleData.forEach((item) => {
      const key = `${item.cwsName}`;
      if (!groups[key]) {
        groups[key] = {
          cwsId: item.cwsId,
          cwsName: item.cwsName,
          children: [],
          transportedKgs: 0,
          deliveredKgs: 0,
          inTransitKgs: 0,
          inTransitTruckNo: 0,
          variation: 0,
          totalRecords: 0,
        };
      }

      groups[key].children.push(item);
      groups[key].transportedKgs += item.transportedKgs;
      groups[key].deliveredKgs += item.deliveredKgs;
      groups[key].inTransitKgs += item.inTransitKgs;
      groups[key].inTransitTruckNo += item.inTransitTruckNo;
      groups[key].variation += item.variation;
      groups[key].totalRecords += 1;
    });

    return Object.values(groups);
  }, [sampleData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return groupedData;

    const normalizedSearch = searchQuery?.toLowerCase();
    return groupedData?.filter(
      (group) =>
        group?.cwsName?.toLowerCase()?.includes(normalizedSearch) ||
        group?.children?.some(
          (child) =>
            child.transportGroupId?.toLowerCase()?.includes(normalizedSearch) ||
            child.cwsName?.toLowerCase()?.includes(normalizedSearch) ||
            (child.inTransitTrucks &&
              child.inTransitTrucks?.toLowerCase()?.includes(normalizedSearch))
        )
    );
  }, [groupedData, searchQuery]);

  // Calculate dynamic summary based on filtered data
  const dynamicSummary = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return original grand total when no search is applied
      return data?.grandTotal;
    }

    // Calculate totals from filtered data when search is applied
    // Using the exact field names that DeliveryReportSummary expects
    const calculatedSummary = filteredData.reduce(
      (acc, group) => ({
        transportedKgs: (acc.transportedKgs || 0) + (group.transportedKgs || 0),
        deliveredKgs: (acc.deliveredKgs || 0) + (group.deliveredKgs || 0),
        inTransitKgs: (acc.inTransitKgs || 0) + (group.inTransitKgs || 0),
        variation: (acc.variation || 0) + (group.variation || 0),
      }),
      {
        transportedKgs: 0,
        deliveredKgs: 0,
        inTransitKgs: 0,
        variation: 0,
      }
    );

    return calculatedSummary;
  }, [filteredData, searchQuery, data?.grandTotal]);

  const toggleRow = (cwsId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(cwsId)) {
      newExpandedRows.delete(cwsId);
    } else {
      newExpandedRows.add(cwsId);
    }
    setExpandedRows(newExpandedRows);
  };

  const formatreportDAte = (dateString) => {
    if (!dateString) return "-";
    return formatDate(dateString);
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const columns = [
    { field: "cwsName", header: "CWS Station" },
    { field: "transportGroupId", header: "Transport Group ID" },
    {
      field: "transferDate",
      header: "Transfer Date",
      reder: (data) => formatreportDAte(data.transferDate),
    },
    {
      header: "Arrival Date",
      reder: (data) => formatreportDAte(data.arrivalDate),
    },
    { field: "transportedKgs", header: "Transported (KG)" },
    { field: "deliveredKgs", header: "Delivered (KG)" },
    { field: "inTransitKgs", header: "In Transit (KG)" },
    {
      field: "inTransitTrucks",
      header: "In Transit Trucks",
      reder: (data) => formatreportDAte(data?.inTransitTrucks ?? "-"),
    },
    {
      field: "inTransitTruckNo",
      header: "Truck No",
      reder: (data) => formatreportDAte(data?.inTransitTruckNo ?? "-"),
    },
    { field: "variation", header: "Variation" },
  ];

  const ErrorAlert = ({ error }) => (
    <Alert variant="danger" className="m-3">
      <Alert.Heading>Error Loading Data</Alert.Heading>
      <p className="mb-0">
        {error?.message ||
          "An error occurred while fetching the delivery reports. Please try again later."}
      </p>
    </Alert>
  );

  const stickyHeaderStyles = {
    position: "sticky",
    top: -1,
    backgroundColor: "#f8f9fa",
    zIndex: 10,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  return (
    <div>
      {!error && !isPending && (
        <div className="p-4">
          <DeliveryReportSummary data={dynamicSummary} />
        </div>
      )}
      <Container fluid className="p-4">
        <Card className="shadow-sm">
          <Card.Header
            className="bg-opacity-10"
            style={{ backgroundColor: theme.neutral }}
          >
            <Card.Title className="mb-0 text-dark d-flex align-items-center">
              <CSVExport
                columns={columns}
                data={data?.data}
                filename={`Delivery-report-file-${new Date().getDate()}-${
                  new Date().getMonth() + 1
                }-${new Date().getFullYear()}`}
              />
            </Card.Title>
          </Card.Header>

          <Card.Body>
            {error ? (
              <ErrorAlert error={error} />
            ) : isPending ? (
              <TableSkeletonLoader />
            ) : (
              <>
                <Form.Control
                  type="text"
                  placeholder="Search CWS stations, transport groups, or truck numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-3"
                  disabled={isPending}
                />

                <div
                  className="table-responsive"
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                >
                  <Table striped bordered hover>
                    <thead className="table-light" style={stickyHeaderStyles}>
                      <tr>
                        <th>CWS Station</th>
                        <th>Transport Group ID</th>
                        <th>Transfer Date</th>
                        <th>Arrival Date</th>
                        <th>Transported (KG)</th>
                        <th>Delivered (KG)</th>
                        <th>In Transit (KG)</th>
                        <th>In Transit Trucks</th>
                        <th>Truck No</th>
                        <th>Variation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((group) => (
                        <React.Fragment key={`${group.cwsId}-${group.cwsName}`}>
                          <tr
                            className="table-hover cursor-pointer"
                            onClick={() =>
                              toggleRow(`${group.cwsId}-${group.cwsName}`)
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <td>
                              <div className="d-flex align-items-center">
                                {expandedRows.has(
                                  `${group.cwsId}-${group.cwsName}`
                                ) ? (
                                  <ChevronDown className="me-2" size={16} />
                                ) : (
                                  <ChevronRight className="me-2" size={16} />
                                )}
                                <div>
                                  <div className="fw-bold">{group.cwsName}</div>
                                  <small className="text-muted">
                                    {group.totalRecords} records
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="text-muted">Multiple Groups</td>
                            <td className="text-muted">-</td>
                            <td className="text-muted">-</td>
                            <td className="fw-bold">
                              {formatNumber(group.transportedKgs)}
                            </td>
                            <td className="fw-bold">
                              {formatNumber(group.deliveredKgs)}
                            </td>
                            <td className="fw-bold">
                              {formatNumber(group.inTransitKgs)}
                            </td>
                            <td className="text-muted">
                              {group.inTransitTruckNo > 0
                                ? `${group.inTransitTruckNo} trucks`
                                : "-"}
                            </td>
                            <td className="fw-bold">
                              {group.inTransitTruckNo}
                            </td>
                            <td>
                              <span
                                className={
                                  group.variation >= 0
                                    ? "text-success fw-bold"
                                    : "text-danger fw-bold"
                                }
                              >
                                {formatNumber(group.variation)}
                              </span>
                            </td>
                          </tr>

                          {expandedRows.has(
                            `${group.cwsId}-${group.cwsName}`
                          ) &&
                            group.children.map((child, index) => (
                              <tr
                                key={child.transportGroupId}
                                className="table-secondary"
                              >
                                <td>
                                  <div className="ps-4">
                                    <div className="text-dark">{index + 1}</div>
                                  </div>
                                </td>
                                <td>{child.transportGroupId}</td>
                                <td>{formatDate(child.transferDate)}</td>
                                <td>{formatDate(child.arrivalDate)}</td>
                                <td>{formatNumber(child.transportedKgs)}</td>
                                <td>{formatNumber(child.deliveredKgs)}</td>
                                <td>{formatNumber(child.inTransitKgs)}</td>
                                <td className="text-muted">
                                  {child.inTransitTrucks || "-"}
                                </td>
                                <td>{child.inTransitTruckNo}</td>
                                <td>
                                  <span
                                    className={
                                      child.variation >= 0
                                        ? "text-success fw-bold"
                                        : "text-danger fw-bold"
                                    }
                                  >
                                    {formatNumber(child.variation)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </Table>

                  {filteredData.length === 0 && !isPending && (
                    <div className="text-center py-4 text-muted">
                      {searchQuery
                        ? `No results found for "${searchQuery}"`
                        : "No data available"}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card.Body>

          {!isPending && !error && (
            <Card.Footer className="bg-light">
              <Row>
                <Col sm={6}>
                  <small className="text-muted">
                    Total CWS Stations: {filteredData.length}
                  </small>
                </Col>
                <Col sm={6} className="text-sm-end">
                  <small className="text-muted">
                    Total Records:{" "}
                    {filteredData.reduce(
                      (sum, group) => sum + group.totalRecords,
                      0
                    )}
                  </small>
                </Col>
              </Row>
            </Card.Footer>
          )}
        </Card>
      </Container>
    </div>
  );
};

export default CollapsibleCWSTable;
