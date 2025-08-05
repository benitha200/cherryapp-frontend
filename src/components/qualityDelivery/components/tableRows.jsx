import { Button } from "react-bootstrap";
import ReusableTable from "../../../sharedCompoents/reusableTable";
import { CreateStockDelivery, GetTranspotedTruck } from "../action";
import { SingleTransportedTruck } from "./singleTranportedTruck";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { GenericModel } from "../../../sharedCompoents/genericModel";
import { Pagination } from "../../../sharedCompoents/paginations";
import { SingleTransportedTruckdisplay } from "./displayTransportedTrucks";
import TransportedTrackDelivery from "./sekeleton";

export const TransportedTruckTable = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState({
    transportGroupId: "",
    transferDate: "",
  });
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const [selectedTransportInfo, setSelectedTransportInfo] = useState({
    cws: "",
    trackPlatNumber: "",
    quantity: "",
    driver: "",
    driverPhone: "",
    truck: "",
  });

  const normalizeString = (str) => {
    if (!str) return "";
    return str.toString().toLowerCase().replace(/\s+/g, "");
  };

  const searchInObject = (obj, searchTerm) => {
    const normalizedSearch = normalizeString(searchTerm);

    if (!normalizedSearch) return true;

    const searchableFields = [
      "cwsName",
      "plateNumbers",
      "transferDate",
      "totalQuantity",
      "totalBags",
      "transportGroupId",
      "driverNames",
      "driverPhones",
    ];

    return searchableFields.some((field) => {
      const fieldValue = obj[field];
      const normalizedValue = normalizeString(fieldValue);
      return normalizedValue.includes(normalizedSearch);
    });
  };

  const handleopenModel = () => {
    setIsModelOpen(!isModelOpen);

    if (isModelOpen) {
      setCategoryInputData({});
    }
  };

  const onupdateSuccess = () => {
    toast.success("Data Created successfully");
    handleopenModel();
  };

  const [categoryInputData, setCategoryInputData] = useState({});
  const [submitted, setSubmitted] = useState({
    submitted: false,
    data: [],
  });

  const { isPending, error, data } = GetTranspotedTruck();
  const { mutate, creatingError, isCreatingpending } =
    CreateStockDelivery(onupdateSuccess);

  if (creatingError) {
    toast.error(
      creatingError.message ??
        "An error occurred while creating the stock delivery"
    );
  }

  // Filter data to only include records with "RECEIVED" status
  const receivedData = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.filter((item) => {
      // Check if the item has "RECEIVED" status
      return item?.status === "RECEIVED";
    });
  }, [data?.data]);

  const filteredData = useMemo(() => {
    if (!receivedData.length) return [];

    if (!searchQuery.trim()) {
      return receivedData;
    }

    return receivedData.filter((item) => searchInObject(item, searchQuery));
  }, [receivedData, searchQuery]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {}, [categoryInputData]);

  const handleCompleteAction = () => {
    const apiData = [];

    Object.keys(categoryInputData).forEach((categoryKey) => {
      if (categoryKey === "arrivalDate") return;

      const categoryData = categoryInputData[categoryKey];
      const hasData =
        categoryData &&
        (categoryData.delivered ||
          categoryData.wrn ||
          categoryData.plus16 ||
          categoryData.fifteen ||
          categoryData.fourteen ||
          categoryData.thirteen ||
          categoryData.b12 ||
          categoryData.defect ||
          categoryData.ppScore);

      if (hasData) {
        const apiObject = {
          // transferDate: selectedId?.transferDate,
          transportGroupId: selectedId.transportGroupId,
          labMoisture: parseFloat(categoryData.labMoisture||0),
          sixteenPlus: parseFloat(categoryData.plus16 || 0),
          fifteen: parseFloat(categoryData.fifteen || 0),
          // qualityGrade14: parseFloat(categoryData.fourteen || 0),
          thirteen: parseFloat(categoryData.thirteen || 0),
          b12: parseFloat(categoryData.b12 || 0),
          defect: parseFloat(categoryData.defect || 0),
          ppScore: parseFloat(categoryData.ppScore || 0),
          category: categoryKey,
          sampleStorageId:parseFloat(categoryData.sampleStorage||0)
       
        };

        apiData.push(apiObject);
      }
    });

    if (apiData.length === 0) {
      toast.error("Please fill in at least one category with data");
      return;
    }

    mutate(apiData);
  };

  const columns = [
    {
      field: "cwsName",
      header: "CWS",
    },
    {
      field: "plateNumbers",
      header: "Plate Numbers",
    },
    {
      field: "transferDate",
      header: "Transfer Date",
    },
    {
      field: "totalQuantity",
      header: "total Quantity",
    },
    {
      field: "totalBags",
      header: "total Bags",
    },
    {
      field: "transportGroupId",
      header: "transport Group Id",
    },
    {
      field: "driverNames",
      header: "driver Names",
    },
    {
      field: "driverPhones",
      header: "driver Phone",
    },
    {
      field: "status",
      header: "Status",
      render: (item) => (
        <span className={`badge ${
          item?.status === 'RECEIVED' ? 'bg-success' : 
          item?.status === 'COMPLETED' ? 'bg-primary' : 'bg-secondary'
        }`}>
          {item?.status || 'N/A'}
        </span>
      ),
    },
    {
      field: "category",
      header: "Actions",
      render: (item) => (
        <Button
          variant={item?.qualityStatus == true ? "warning" : "success"}
          onClick={() => {
            handleopenModel();
            setSelectedId({
              transportGroupId: item?.transportGroupId,
              transferDate: item?.transferDate,
            });
            setSelectedTransportInfo((prev) => ({
              ...prev,
              cws: item?.cwsName,
              trackPlatNumber: item?.plateNumbers,
              quantity: item?.totalQuantity,
              driver: item?.driverNames,
            }));

            setCategories(item?.cupProfiles || []);
            setCategoryInputData({});
            if (item?.qualityStatus == true ) {
              setSubmitted({
                submitted: true,
                data: {
                  transportGroupId: item?.transportGroupId,
                  transferDate: item?.transferDate,
                },
              });
            } else {
              setSubmitted({
                submitted: false,
                data: [],
              });
            }
          }}
        >
          <i className="bi bi-pencil-square"></i>{" "}
        </Button>
      ),
    },
  ];

  if (isPending) return <TransportedTrackDelivery />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <ReusableTable
        data={paginatedData} // Use paginated data instead of filteredData
        columns={columns}
        pageSizeOption={[50, 100, 1000]}
        pageSize={5}
        emptyStateMessage={
          searchQuery.trim()
            ? `No received trucks found matching "${searchQuery}"`
            : "There are no received trucks available for quality analysis."
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onPageSizeChange={setItemsPerPage}
        itemsPerPage={itemsPerPage}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages} // Use calculated total pages
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </ReusableTable>

      <GenericModel
        isOpen={isModelOpen && !submitted.submitted}
        onClose={handleopenModel}
        onConfirm={handleCompleteAction}
        isLoading={isCreatingpending}
        title="Quality Analysis - Received Truck"
        confirmButtonText="Complete"
        cancelButtonText="Cancel"
        modalSize="xl"
        onConfirmDisalbe={
          Object.keys(categoryInputData).length === 0 ||
          Object.keys(categoryInputData).every((key) => key === "arrivalDate")
        }
      >
        <SingleTransportedTruck
          selectedTransportInfo={selectedTransportInfo}
          categories={categories}
          setInfo={setCategoryInputData}
        />
      </GenericModel>

      <GenericModel
        isOpen={isModelOpen && submitted.submitted}
        title="Quality Analysis Results"
        onClose={handleopenModel}
        onConfirm={() => null}
        isLoading={isCreatingpending}
        confirmButtonText="Complete"
        cancelButtonText="Cancel"
        modalSize="xl"
        submitButton={false}
      >
        <SingleTransportedTruckdisplay
          selectedTransportInfo={submitted?.data}
        />
      </GenericModel>
    </>
  );
};