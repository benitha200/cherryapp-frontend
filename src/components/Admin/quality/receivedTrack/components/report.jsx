import { useEffect, useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Pagination } from "../../../../../sharedCompoents/paginations";
import { GetAllDelivaries, UpdateDelivary } from "../actions";
import { GenericModel } from "../../../../../sharedCompoents/genericModel";
import { QuantityReceived } from "./quantityReceived";
import { ProcessedBatches } from "./proccesedBatches";
import { Error, Success } from "../../components/responses";
import { DeliveryTableSkeleton } from "./skeleton";

export const DerivalyTable = () => {
  // State declarations
  const navigate = useNavigate();
  const [openModle, setOpenModle] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // received quenatity
  const [info, setInfo] = useState({
    c1: null,
    c2: null,
    s86: null,
    s87: null,
    s88: null,
  });
  // batches
  const [activatedBatches, setActivivatedBatches] = useState([]);
  const [activatedBatchesData, setActivatedBatchesData] = useState([]);
  const [categories, setCategories] = useState({
    c2: 0,
    c1: 0,
    s86: 0,
    s87: 0,
    s88: 0,
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [transportData, setTransportData] = useState([]);

  const [selectedTransportInfo, setSelectedTransportInfo] = useState({
    cws: null,
    quantity: null,
    driver: null,
  });

  // logs

  console.log(transportData, ":::::::::::::::transport data");
  // data query
  const { getAllPending, getAllError, allDelivaries } = GetAllDelivaries(1, 10);
  const handleopenModel = () => {
    setOpenModle(!openModle);
  };

  const onUpdateSuccess = () => {
    handleopenModel();
    setSelectedId(null);
    setActivivatedBatches([]);
    setActivatedBatchesData([]);
  };
  const { updatingError, isUpdating, mutate } = UpdateDelivary(
    selectedId,
    onUpdateSuccess
  );

  useEffect(() => {}, [allDelivaries, selectedTransportInfo]);

  const handleFormSubmission = () => {
    mutate({ info, activatedBatchesData });
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

    {
      field: "category",
      header: "Actions",
      render: (item) => (
        <Button
          variant="success"
          onClick={() => {
            handleopenModel();
            setSelectedId(item?.truckNumber ?? "");
            setSelectedTransportInfo((prev) => ({
              ...prev,
              cws: item?.cws,
              quantity: 200,
              driver: item?.driverName,
            }));
          }}
        >
          <i class="bi bi-pencil-square"></i>{" "}
        </Button>
      ),
    },
  ];

  if (getAllPending) return <DeliveryTableSkeleton />;
  if (getAllError)
    return (
      <Error error={getAllError?.message ?? "Failed to get Delivered Tracks"} />
    );
  const paginationData = {
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 0,
  };
  if (allDelivaries) {
    const delivariersSize = allDelivaries?.data?.trucks?.length ?? 0;
    paginationData.totalPages = Math.ceil(delivariersSize / itemsPerPage);
    (paginationData.totalItems = delivariersSize),
      (paginationData.itemsPerPage = itemsPerPage);
  }

  return (
    <div className="container-fluid">
      <Card className="mb-4">
        <ReusableTable
          data={allDelivaries?.data?.trucks ?? []}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialPageSize={5}
          isLoading={false}
          onPageSizeChange={setItemsPerPage}
          rowKeyField="id"
          itemsPerPage={itemsPerPage}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData?.totalPages}
            totalItems={paginationData?.totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
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
        onConfirmDisalbe={activatedBatchesData.length == 0}
      >
        {updatingError && (
          <Error
            error={updatingError.message ?? "Failed to update the content"}
          />
        )}
        {/* Quantiy received */}
        <QuantityReceived
          info={info}
          setInfo={setInfo}
          categories={categories}
          selectedTransportInfo={selectedTransportInfo}
        />
        {/* proccessed batches */}
        <ProcessedBatches
          activatedBatches={activatedBatches}
          setActivivatedBatches={setActivivatedBatches}
          activatedBatchesData={activatedBatchesData}
          setActivatedBatchesData={setActivatedBatchesData}
          selectedTrackPlat={selectedId}
          setCategories={setCategories}
        />
      </GenericModel>
    </div>
  );
};
