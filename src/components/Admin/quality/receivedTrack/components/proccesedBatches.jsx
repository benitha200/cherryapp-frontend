import { useEffect, useState } from "react";
import { Form, Row, Col, Card, InputGroup, Button } from "react-bootstrap";
import { SubTableHeading } from "./subTableHeading";
import { SubBatchTable } from "./subBatchTable";
import { GetDelivaryById, GetSampleStorage } from "../actions";
import { DelivarySkeleton } from "./dskeleton";
import { Error } from "../../components/responses";

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

// ACTUAL APP FUCNTIONALITY

export const ProcessedBatches = ({
  activatedBatches,
  setActivivatedBatches,
  handleSave,
  setActivatedBatchesData,
  selectedTrackPlat,
  setCategories,
  setOnSave,
  disableSave,
}) => {
  // state
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryData, setDeliveryData] = useState({
    baggingOff: null,
    batchNo: null,
    mainbatch: [],
    processing: null,
  });
  // get track
  const { getByIdError, getByIdPending, delivary } =
    GetDelivaryById(selectedTrackPlat);
  const { sampleStoragedata, sampleStorageError, sampleStoragePeding } =
    GetSampleStorage();

  useEffect(() => {
    setCategories((prev) => ({
      ...delivary?.data?.categoryKgs,
      relatedCategories,
    }));
    setDeliveryData(delivary?.data);
  }, [delivary]);

  const handleSearch = (searchTerm) => {
    setSearchQuery((prev) => searchTerm);
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

  if (getByIdError)
    return (
      <Error
        error={
          getByIdError?.message ??
          "Failed to fetch Transefer, please reaload and try again."
        }
      />
    );
  let relatedCategories = [];
  if (delivary) {
    delivary?.data?.batches?.map((batch) => {
      batch?.lowGrades?.map((lowgrade) => {
        let res = Object.keys(lowgrade?.outputKgs);
        relatedCategories = [...relatedCategories, ...res];
      });
      batch?.mainbatch?.map((subBatch) => {
        relatedCategories.push(subBatch?.category);
      });
    });
  }
  return getByIdPending ? (
    <DelivarySkeleton />
  ) : (
    <div className="container-fluid ">
      <Card className="mb-4">
        {/* Filters Section */}
        <Card.Body style={{ backgroundColor: processingTheme.neutral }}>
          <Row className="justify-content-between align-items-center">
            <Col md={2}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search batch..."
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={getByIdPending}
                />
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button
                variant="success"
                onClick={() => {
                  setOnSave(true);
                  handleSave();
                }}
                disabled={disableSave}
              >
                Save
              </Button>
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
                <th>Batch No</th>
                <th>Select</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Card */}

              {(searchQuery
                ? deliveryData?.batches.filter((element) =>
                    element?.batchNo
                      ?.toLowerCase()
                      ?.replace(/\s+/g, "")
                      ?.includes(
                        searchQuery?.toLowerCase()?.replace(/\s+/g, "")
                      )
                  )
                : deliveryData?.batches
              )?.map((element) => {
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
                    {/* sub batch no */}
                    <td className="align-middle">
                      <div style={{ width: "7rem", marginLeft: "0.7rem" }}>
                        {element?.batchNo ?? ""}
                      </div>
                    </td>
                    {/* check box */}
                    <td className="align-middle">
                      <div style={{ marginLeft: "0.3rem" }}>
                        <input
                          type="checkbox"
                          checked={isChecked(element?.batchNo)}
                          onChange={(e) => {
                            const isChecked = e.target?.checked;
                            handleCheckboxChange(
                              element.batchNo,
                              isChecked,
                              {
                                A0: element?.mainbatch[0]?.id ?? "N/A",
                                A1: element?.mainbatch[1]?.id ?? "N/A",
                              },
                              {
                                A0: element?.mainbatch[0]?.transferId ?? "N/A",
                                A1: element?.mainbatch[1]?.transferId ?? "N/A",
                              }
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
                            {element?.mainbatch?.map(
                              (subElement, subElementIndex) =>
                                !sampleStoragePeding && (
                                  <SubBatchTable
                                    subelement={subElement}
                                    index={subElementIndex}
                                    isChecked={isChecked}
                                    batchNo={element?.batchNo}
                                    handleInputChange={handleInputChange}
                                    sampleStorages={sampleStoragedata}
                                  />
                                )
                            )}
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
