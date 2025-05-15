import { useState } from "react";
import { Form, Row, Col, Card, InputGroup, Placeholder } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loggedInUser } from "../../../../../utils/loggedInUser";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Pagination } from "../../../../../sharedCompoents/paginations";
import { FindAllDelivaries } from "../actions";
import { DelivarySkeleton } from "./skeleton";
import { GenericModel } from "../../../../../sharedCompoents/genericModel";
import { EditDelivary } from "./EditForm";

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

export const DerivalyTable = () => {
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
  const [openModle, setOpenModle] = useState(false);
  const [qualityData, setQualityData] = useState(null);

  const { error, isPending, delivaries } = FindAllDelivaries(1, 10);
  const handleopenModel = () => {
    setOpenModle(!openModle);
  };

  // columns
  const columns = [
    {
      field: "batchNo",
      header: "Batch No",
      render: (item) => (
        <span>{`${item?.batchNo ?? ""}-${item?.gradeKey ?? "N/A"}`}</span>
      ),
    },
    {
      field: "cws",
      header: "CWS",
      render: (item) => <span>{item?.cws?.name ?? "N/A"}</span>,
    },
    { field: "cwsMoisture", header: "CWSMoisture" },
    {
      field: "labMoisture",
      header: "Lab Moisture",
    },

    {
      field: "+16",
      header: "+16",
      render: (item) => (
        <div style={{ backgroundColor: "#D4AF37" }}>
          {item?.screen["16"] ?? "N/A"}
        </div>
      ),
    },
    {
      field: "15",
      header: "15",
      render: (item) => <span>{item?.screen["16"] ?? "N/A"}</span>,
    },
    {
      field: "14",
      header: "14",
      render: (item) => <span>{item?.screen["14"] ?? "N/A"}</span>,
    },
    {
      field: "13",
      header: "13",
      render: (item) => <span>{item?.screen["13"] ?? "N/A"}</span>,
    },

    {
      field: "B/12",
      header: "B/12",
      render: (item) => <span>{item?.screen["B/12"] ?? "N/A"}</span>,
    },
    {
      field: "deffect",
      header: "Deffect",
      render: (item) => <span>{item?.defect ?? "N/A"}</span>,
    },
    {
      field: "ppScore",
      header: "PP Score(%)",
      render: (item) => <span>{item?.ppScore ?? "N/A"}</span>,
    },
    {
      field: "samplestorage",
      header: "Sample storage",
      render: (item) => <span>{item?.sampleStorage?.name ?? "N/A"}</span>,
    },
    {
      field: "category",
      header: "Preve Category",
      render: (item) => <span>{item?.category ?? "N/A"}</span>,
    },
    {
      field: "category",
      header: "Current Category",
      render: (item) => <span>{item?.category ?? "N/A"}</span>,
    },

    {
      field: "category",
      header: "Actions",
      render: (item) => (
        <button
          onClick={() => {
            handleopenModel();
            setQualityData(item);
          }}
        >
          Edit
        </button>
      ),
    },
  ];

  if (isPending) return <DelivarySkeleton />;

  return (
    <div className="container-fluid">
      <Card className="mb-4">
        <ReusableTable
          data={delivaries?.data?.batches ?? []}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialPageSize={5}
          isLoading={false}
          onPageSizeChange={() => null}
          rowKeyField="id"
          itemsPerPage={4}
        >
          <Pagination
            currentPage={delivaries?.pagination?.page ?? 1}
            totalPages={3 ?? 0}
            totalItems={delivaries?.pagination?.total ?? 1}
            itemsPerPage={5}
            onPageChange={() => null}
          />
        </ReusableTable>
      </Card>
      <GenericModel
        isOpen={openModle}
        onClose={handleopenModel}
        onConfirm={() => null}
        isLoading={false}
        title="Coffee Quality Assessment"
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
      >
        <EditDelivary />
      </GenericModel>
    </div>
  );
};
