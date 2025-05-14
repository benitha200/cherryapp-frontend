import { useState } from "react";
import {
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Placeholder,
  Button,
} from "react-bootstrap";
import { Pagination } from "../../../../../sharedCompoents/paginations";
import { SubTableHeading } from "./subTableHeading";
import { GetDelivaryById } from "../actions";
import { DelivarySkeleton } from "../../delivery/components/skeleton";
const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table hover
  yellow: "#D4AF37",
  green: "#D3D3D3",
};

const processingTheme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange
  neutral: "#E6F3F3", // Very light teal
  tableHover: "#F8FAFA", // Ultra light teal for table
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

const data = [
  {
    batchId: 2,
    cws: "Ngororero",
    processingType: "Full washed",
    processingBatch: [
      {
        id: 3,
        batchNo: "2025MUS0305(A0)",
        stationMoisture: 20,
        kgs: 30,
        labMoisture: 20,
        16: 20,
        15: 20,
        14: 20,
        13: 20,
        "B/12": 20,
        Deffect: 10,
        ppScore: 90,
        storage: "A2",
        category: "C1",
      },
      {
        id: 4,
        batchNo: "2025MUS0305(A1)",
        stationMoisture: 20,
        kgs: 30,
        labMoisture: 20,
        16: 20,
        15: 20,
        14: 20,
        13: 20,
        "B/12": 20,
        Deffect: 10,
        ppScore: 90,
        storage: "A3",
        category: "C1",
      },
    ],
  },

  {
    batchId: 2,
    cws: "Ngororero",
    processingType: "Full washed",
    processingBatch: [
      {
        id: 3,
        batchNo: "2025MUS0305(A0)",
        stationMoisture: 20,
        kgs: 30,
        labMoisture: 20,
        16: 20,
        15: 20,
        14: 20,
        13: 20,
        "B/12": 20,
        Deffect: 10,
        ppScore: 90,
        storage: "A2",
        category: "C1",
      },
      {
        id: 4,
        batchNo: "2025MUS0305(A1)",
        stationMoisture: 20,
        kgs: 30,
        labMoisture: 20,
        16: 20,
        15: 20,
        14: 20,
        13: 20,
        "B/12": 20,
        Deffect: 10,
        ppScore: 90,
        storage: "A3",
        category: "C1",
      },
    ],
  },
];

// ACTUAL APP FUCNTIONALITY

export const ProcessedBatches = ({
  activatedBatches,
  setActivivatedBatches,
  activatedBatchesData,
  setActivatedBatchesData,
  selectedTrackPlat,
}) => {
  // get track
  const { getByIdError, getByIdPending, delivary } =
    GetDelivaryById(selectedTrackPlat);

  // handle processing type
  const handleProcessingType = (processingType) => {
    return processingType == "NATURAL"
      ? { ky1: "N1", key2: "N2" }
      : processingType == "HONEY"
      ? { ky1: "H1", key2: "H2" }
      : { ky1: "A0", key2: "A1" };
  };

  // FORMAT ARRAY
  const formatArray = (data, processingType) => {
    const keys = handleProcessingType(processingType);
    return [data[keys.ky1], data[keys.key2]].filter(
      (element) => element !== null
    );
  };
  const handleCheckboxChange = (batchId, ischecked, spId, transferId) => {
    ischecked == true
      ? setActivivatedBatches((prev) => [...new Set([...prev, batchId])])
      : setActivivatedBatches((prev) =>
          prev.filter((eleme) => batchId !== eleme)
        );
    setActivatedBatchesData((prev) => {
      const isAlreadySelected = prev.find((item) => item.id === batchId);

      if (isAlreadySelected) {
        return prev.filter((item) => item.id !== batchId);
      }
      return [
        ...prev,
        {
          id: batchId,
          spId: spId,
          transferId: transferId,
          labMoisture: { A0: "", A1: "" },
          16: { A0: "", A1: "" },
          15: { A0: "", A1: "" },
          14: { A0: "", A1: "" },
          13: { A0: "", A1: "" },
          "B/12": { A0: "", A1: "" },
          deffect: { A0: "", A1: "" },
          ppScore: { A0: "", A1: "" },
          storage: { A0: "", A1: "" },
          category: { A0: "", A1: "" },
        },
      ];
    });
  };

  const isChecked = (batchId) => activatedBatches.includes(batchId);

  const handleInputChange = (subBatchId, field, aKey, value) => {
    setActivatedBatchesData((prev) =>
      prev.map((item) =>
        item.id === subBatchId
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

  if (getByIdPending) return <DelivarySkeleton />;
  formatArray(delivary?.data?.batches[0], "NATURAL");

  return (
    <div className="container-fluid ">
      <Card className="mb-4">
        {/* Filters Section */}
        <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
          <Row className="g-3 mb-2"></Row>
          <Row className="g-3">
            <Col md={2}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search across all fields..."
                />
              </InputGroup>
            </Col>

            <Col md={4}>
              <Form.Select>
                <option value="" disabled>
                  Select by processing type
                </option>
                <option>All</option>
                <option>FULLY_WASHED</option>
                <option>NATURAL</option>
                <option>H</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>

        {/* Table Section */}
        <div
          className="table-responsive mx-2"
          style={{
            maxHeight: "44vh",
            overflowY: "scroll",
          }}
        >
          <table className="table-hover">
            <thead>
              <tr>
                <th>Processing Type</th>
                <th>Select</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Card */}

              {delivary?.data?.batches.map((element) => {
                return (
                  <tr>
                    {/* processing type  */}
                    <td className="align-middle">
                      <span
                        className="badge"
                        style={getProcessingTypeBadgeStyle("FULLY_WASHED")}
                      >
                        {element?.processing?.processingType ?? "N/a"}
                      </span>
                    </td>
                    {/* check box */}
                    <td className="align-middle">
                      <div style={{ marginLeft: "1rem" }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const isChecked = e.target?.checked;
                            handleCheckboxChange(
                              element.batchId,
                              isChecked,
                              {
                                A0:
                                  element?.A0 ||
                                  element?.N1 ||
                                  element?.H1 ||
                                  "N/A",
                                A1:
                                  element?.A1 ||
                                  element?.N2 ||
                                  element?.H2 ||
                                  "N/A",
                              },
                              { A0: "", A1: "" }
                            );
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                        <table className="table" style={{ marginLeft: "2rem" }}>
                          <thead>
                            <SubTableHeading />
                          </thead>

                          <tbody>
                            {formatArray(
                              delivary?.data?.batches[0],
                              element?.processingType
                            ).map((subelement, index) => {
                              return (
                                <>
                                  {/* First low*/}
                                  <tr>
                                    {/* sub batch no */}
                                    <td className="align-middle">
                                      <div style={{ width: "10rem" }}>
                                        {subelement?.category}
                                      </div>
                                    </td>
                                    {/* station moisture */}
                                    <td className="align-middle">
                                      {subelement?.cwsMoisture ?? "N/A"}
                                    </td>
                                    {/* total kgs */}
                                    <td className="align-middle">
                                      {subelement?.cwsMoisture ?? "N/A"}
                                    </td>
                                    {/* lab moisture */}
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.labMoisture}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "labMoisture",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    {/* +16 */}
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.screen["16+"]}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "16",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.screen["15"]}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "15",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.screen["14"]}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "14",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.screen["13"]}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "13",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={
                                          subelement?.screen["B/12"]
                                        }
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "B/12",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>

                                    {/* deffect */}
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.defect}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "deffect",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    {/* pp score */}
                                    <td className="align-middle">
                                      <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: "7rem" }}
                                        defaultValue={subelement?.ppScore}
                                        disabled={!isChecked(element?.batchId)}
                                        onChange={(e) =>
                                          handleInputChange(
                                            element?.batchId,
                                            "ppScore",
                                            index % 2 == 0 ? "A0" : "A1",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    {/* storage */}
                                    <td className="align-middle">
                                      <div style={{ width: "7rem" }}>
                                        {subelement?.sampleStorage?.name ??
                                          "N/A"}
                                      </div>
                                    </td>
                                    <td className="align-middle">
                                      {subelement?.category}
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
