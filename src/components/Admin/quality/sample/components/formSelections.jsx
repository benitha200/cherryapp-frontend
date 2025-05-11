import { useState } from "react";
import GenericModal from "../../components/model";
import { Alert } from "react-bootstrap";
import { createMoistureContent } from "../../../../../apis/quality";

export const FormSelection = ({
  selectedBatchId,
  batchNo,
  setSelectedBatchId,
  processType,
  refresh,
}) => {
  const [moisture, setMoisture] = useState({
    A0: null,
    A1: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ismodelOpen, setIsModelOpen] = useState(false);
  const [loading, setloading] = useState(false);
  const handleFormChange = (key, value) => {
    setMoisture((state) => ({
      ...state,
      [key]: value,
    }));
    setError(null);
  };

  const handleOpenModel = () => {
    setIsModelOpen(!ismodelOpen);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    setloading(true);
    refresh(true);
    if (!moisture?.A0 || !moisture?.A1) {
      setError(
        "Both A0 and A1 moisture values are required. Please fill them in before submitting."
      );
    } else {
      const res = await createMoistureContent(
        batchNo,
        moisture?.A0,
        moisture?.A1,
        processType
      );

      if (res?.data) {
        setloading(false);
        setSuccess(res?.message);
        setIsModelOpen(false);
        setTimeout(() => {
          setSelectedBatchId(null);
          setMoisture({ A0: null, A1: null });
          setSuccess(null);
        }, 2000);
      } else {
        setError(
          res?.response?.data.error ?? "Failed to send the request, try again."
        );
      }
      setloading(false);
      console.log("response::::::::::", res);
      handleOpenModel();
    }
  };
  return (
    <div
      className="bg-white p-2 rounded shadow w-100 mb-3 mx-auto"
      style={{ maxWidth: "50vw", margin: "1 auto" }}
    >
      {!selectedBatchId && (
        <h3 className="text-center mb-3" style={{ color: "#008080" }}>
          Select a Batch to Proceed
        </h3>
      )}

      {selectedBatchId && (
        <>
          <form
            onSubmit={handleSubmit}
            className="border border-light rounded p-4 "
          >
            <div className="mb-4">
              <h4 className="fw-semibold mb-2" style={{ color: "#008080" }}>
                Moisture content
              </h4>
            </div>

            <div
              className="d-flex justify-content-between mb-4"
              style={{ gap: "2rem" }}
            >
              <div className="flex-grow-1">
                <label className="form-label fw-bold">{`${batchNo}-A0`}</label>
                <input
                  type="number"
                  className="form-control border-success"
                  style={{ minWidth: "7rem" }}
                  defaultValue={0}
                  onChange={(e) =>
                    handleFormChange("A0", parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <div className="flex-grow-1">
                <label className="form-label fw-bold">{`${batchNo}-A1`}</label>
                <input
                  type="number"
                  className="form-control border-success"
                  style={{ minWidth: "7rem" }}
                  defaultValue={0}
                  onChange={(e) =>
                    handleFormChange("A1", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="d-flex ">
              <button
                type="button"
                className="btn text-white"
                disabled={loading || success}
                style={{
                  backgroundColor: "#008080",
                  height: "3.5rem",
                  width: "10rem",
                  fontSize: "1.1rem",
                  borderRadius: "0.5rem",
                }}
                onClick={() => {
                  moisture?.A0 !== null && moisture.A1 !== null
                    ? setIsModelOpen(!ismodelOpen)
                    : setError(
                        "Both A0 and A1 moisture values are required. Please fill them in before submitting."
                      );
                }}
              >
                Save Changes
              </button>
            </div>
          </form>

          <GenericModal
            isOpen={ismodelOpen}
            onClose={handleOpenModel}
            onConfirm={handleSubmit}
            isLoading={loading}
            title={"Moisture content"}
            message={"Are you sure you want to save the data"}
            confirmButtonText="Save"
            confirmButtonColor={"#008080"}
            cancelButtonText="Cancel"
            cancelButtonColor="primary"
          />

          {error && (
            <Alert variant="danger" className="mt-3 text-center">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mt-3 text-center">
              {success}
            </Alert>
          )}
        </>
      )}
    </div>
  );
};
