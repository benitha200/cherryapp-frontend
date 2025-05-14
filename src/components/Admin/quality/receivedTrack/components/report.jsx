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
import { useNavigate } from "react-router-dom";
import { loggedInUser } from "../../../../../utils/loggedInUser";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Pagination } from "../../../../../sharedCompoents/paginations";
import { GetAllDelivaries, UpdateDelivary } from "../actions";
import { GenericModel } from "../../../../../sharedCompoents/genericModel";
import { QuantityReceived } from "./quantityReceived";
import { ProcessedBatches } from "./proccesedBatches";
import { Error } from "../../components/responses";

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
  const [selectedId, setSelectedId] = useState(null);
  // received quenatity
  const [info, setInfo] = useState({
    C1: null,
    C2: null,
    S382: null,
    sampleStorage: null,
  });
  // batches
  const [activatedBatches, setActivivatedBatches] = useState([]);
  const [activatedBatchesData, setActivatedBatchesData] = useState([]);
  // data query
  const { getAllPending, getAllError, allDelivaries } = GetAllDelivaries(1, 10);
  const { updatingError, isUpdating, mutate } = UpdateDelivary(selectedId);
  const handleopenModel = () => {
    setOpenModle(!openModle);
  };

  const handleFormSubmission = () => {
    mutate({ info, activatedBatchesData });
    console.log({ info, activatedBatchesData });
    // handleopenModel();
  };
  // columns
  const columns = [
    {
      field: "batchNo",
      header: "Truck Plat Number",
      render: (item) => <span>{`${item?.truckNumber ?? ""}`}</span>,
    },
    {
      field: "cws",
      header: "cws",
      render: (item) => <span>{item?.cws ?? "N/A"}</span>,
    },
    {
      field: "quantity",
      header: "Quantity(kg)",
      render: (item) => (
        <span>{(item?.outputKgs?.N1 ?? 0) + (item?.outputKgs.N2 ?? 0)}</span>
      ),
    },
    { field: "driverName", header: "Driver_Name" },
    { field: "driverPhone", header: "Driver_PHone" },

    // {
    //   field: "+16",
    //   header: "+16",
    //   render: (item) => (
    //     <div style={{ backgroundColor: "#D4AF37" }}>
    //       {item?.screen["16"] ?? "N/A"}
    //     </div>
    //   ),
    // },
    // {
    //   field: "15",
    //   header: "15",
    //   render: (item) => <span>{item?.screen["16"] ?? "N/A"}</span>,
    // },
    // {
    //   field: "14",
    //   header: "14",
    //   render: (item) => <span>{item?.screen["14"] ?? "N/A"}</span>,
    // },
    // {
    //   field: "13",
    //   header: "13",
    //   render: (item) => <span>{item?.screen["13"] ?? "N/A"}</span>,
    // },

    // {
    //   field: "B/12",
    //   header: "B/12",
    //   render: (item) => <span>{item?.screen["B/12"] ?? "N/A"}</span>,
    // },

    {
      field: "category",
      header: "Actions",
      render: (item) => (
        <Button
          variant="success"
          onClick={() => {
            handleopenModel();
            setSelectedId(item?.truckNumber ?? "");
          }}
        >
          <i class="bi bi-pencil-square"></i>{" "}
        </Button>
      ),
    },
  ];

  if (getAllPending) return <div>Loading ....</div>;

  return (
    <div className="container-fluid">
      <Card className="mb-4">
        <ReusableTable
          data={allDelivaries?.data?.trucks ?? []}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialPageSize={5}
          isLoading={false}
          onPageSizeChange={() => null}
          rowKeyField="id"
          itemsPerPage={4}
        >
          <Pagination
            currentPage={allDelivaries?.pagination?.page ?? 1}
            totalPages={3 ?? 0}
            totalItems={allDelivaries?.pagination?.total ?? 1}
            itemsPerPage={5}
            onPageChange={() => null}
          />
        </ReusableTable>
      </Card>
      <GenericModel
        isOpen={openModle}
        onClose={handleopenModel}
        onConfirm={handleFormSubmission}
        isLoading={isUpdating}
        title="Coffee Quality accessment"
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
        modalSize="xl"
      >
        {updatingError && (
          <Error
            error={updatingError.message ?? "Failed to update the content"}
          />
        )}
        {/* Quantiy received */}
        <QuantityReceived info={info} setInfo={setInfo} />
        {/* proccessed batches */}
        <ProcessedBatches
          activatedBatches={activatedBatches}
          setActivivatedBatches={setActivivatedBatches}
          activatedBatchesData={activatedBatchesData}
          setActivatedBatchesData={setActivatedBatchesData}
          selectedTrackPlat={selectedId}
        />
      </GenericModel>
    </div>
  );
};
