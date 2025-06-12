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
import { formatDate } from "../../../../../utils/formatDate";

export const DerivalyTable = () => {
  // State declarations
  const navigate = useNavigate();
  const [openModle, setOpenModle] = useState(false);
  const [selectedId, setSelectedId] = useState({
    trackId: null,
    transferDate: null,
  });

  // batches
  const [activatedBatches, setActivivatedBatches] = useState([]);
  const [activatedBatchesData, setActivatedBatchesData] = useState([]);
  const [categories, setCategories] = useState({
    c1: null,
    c2: null,
    s86: null,
    s87: null,
    s88: null,
    A2: null,
    A3: null,
    B1: null,
    B2: null,
    relatedCategories: [],
  });
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [allTransportInfo, setAllTransportInfo] = useState([]);

  const [selectedTransportInfo, setSelectedTransportInfo] = useState({
    cws: null,
    quantity: null,
    driver: null,
    trackPlatNumber: null,
  });
  const [searchQuery, setSearchQuery] = useState(null);

  // logs

  // data query
  const { getAllPending, getAllError, allDelivaries } = GetAllDelivaries(1, 10);
  const handleopenModel = () => {
    setOpenModle(!openModle);
  };

  const onUpdateSuccess = () => {
    handleopenModel();
    setSelectedId({ trackId: null, transferDate: null, transferGroupId: null });
    setActivivatedBatches([]);
    setActivatedBatchesData([]);
    setCategories({
      c1: null,
      c2: null,
      s86: null,
      s87: null,
      s88: null,
      A2: null,
      A3: null,
      B1: null,
      B2: null,
      relatedCategories: [],
    });
  };
  const { updatingError, isUpdating, mutate } = UpdateDelivary(
    selectedId,
    onUpdateSuccess
  );

  // useEffect(() => {
  //   const data = allDelivaries?.data?.trucks ?? [];
  //   let skip = (currentPage - 1) * itemsPerPage;
  //   if (skip >= allTransportInfo.length + itemsPerPage - 1) {
  //     const res = data.slice(0, itemsPerPage);
  //     // setAllTransportInfo(res);
  //   } else {
  //     const res = data.slice(skip, skip + itemsPerPage);
  //     // setAllTransportInfo(res);
  //   }
  // }, [allDelivaries, selectedTransportInfo, currentPage, itemsPerPage]);
  useEffect(() => {
    setSearchQuery("");
  }, [currentPage]);

  useEffect(() => {
    const data = allDelivaries?.data?.trucks ?? [];
    let skip = (currentPage - 1) * itemsPerPage;
    let res = data;

    const d = res
      ?.filter(
        (element) =>
          element?.driverName
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, "")) ||
          element?.truckNumber
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, "")) ||
          element?.cws
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, "")) ||
          element?.transferGroupId
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, "")) ||
          element?.transferGroupId
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, "")) ||
          element?.driverPhone
            ?.toLowerCase()
            ?.replace(/\s+/g, "")
            .includes(searchQuery?.toLowerCase()?.replace(/\s+/g, ""))
      )
      ?.slice(0, itemsPerPage);
    if (skip >= allTransportInfo.length + itemsPerPage - 1) {
      res = d.slice(0, itemsPerPage);
    } else {
      res = d.slice(skip, skip + itemsPerPage);
    }
    setAllTransportInfo(() => d);
  }, [
    searchQuery,
    allDelivaries,
    selectedTransportInfo,
    currentPage,
    itemsPerPage,
  ]);
  const handleFormSubmission = () => {
    mutate({ categories, activatedBatchesData });
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
      field: "transferDate",
      header: "Transfer Date",
      render: (item) => <span>{formatDate(item?.transferDate) ?? "N/A"}</span>,
    },
    {
      field: "quantity",
      header: "Quantity(kg)",
      render: (item) => (
        <span>
          {Object.values(item?.outputKgs).reduce(
            (acc, value) => parseInt(value, 10) + acc,
            0
          )}
        </span>
      ),
    },
    { field: "driverName", header: "Driver_Name" },
    { field: "driverPhone", header: "Driver_PHone" },
    {
      field: "transferGroupId",
      header: "transferGroupId",
    },

    {
      field: "category",
      header: "Actions",
      render: (item) => (
        <Button
          variant="success"
          onClick={() => {
            handleopenModel();
            setSelectedId({
              trackId: item?.truckNumber ?? "",
              transferDate: item?.transferDate ?? "",
              transferGroupId: item?.transferGroupId ?? "",
            });
            setSelectedTransportInfo((prev) => ({
              ...prev,
              cws: item?.cws,
              trackPlatNumber: item?.truckNumber,
              quantity: Object.values(item?.outputKgs).reduce(
                (acc, value) => parseInt(value, 10) + acc,
                0
              ),
              driver: item?.driverName,
            }));
          }}
        >
          <i className="bi bi-pencil-square"></i>{" "}
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
    paginationData.totalItems = delivariersSize;
    paginationData.itemsPerPage = itemsPerPage;
  }

  return (
    <div className="container-fluid">
      <Card className="mb-4">
        <ReusableTable
          data={allTransportInfo}
          columns={columns}
          pageSizeOption={[50, 100, 1000, 2000]}
          initialPageSize={50}
          isLoading={false}
          onPageSizeChange={setItemsPerPage}
          rowKeyField="id"
          itemsPerPage={itemsPerPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
        onConfirmDisalbe={
          activatedBatchesData.length == 0
          //  &&Object.values(categories).filter(
          //   (element) =>
          //     element !== null &&
          //     element !== 0 &&
          //     element !== undefined &&
          //     element !== ""
          // ).length <= 1
        }
      >
        {updatingError && (
          <Error
            error={updatingError.message ?? "Failed to update the content"}
          />
        )}
        {/* Quantiy received */}
        <QuantityReceived
          setInfo={setCategories}
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
