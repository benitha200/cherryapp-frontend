import { Button } from "react-bootstrap";
import ReusableTable from "../../../sharedCompoents/reusableTable"
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
    transferDate: ""
  });
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
      'cwsName',
      'plateNumbers', 
      'transferDate',
      'totalQuantity',
      'totalBags',
      'transportGroupId',
      'driverNames',
      'driverPhones'
    ];
    
    return searchableFields.some(field => {
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
  }

  const [categoryInputData, setCategoryInputData] = useState({});
  const [ submitted, setSubmitted] = useState({
    submitted: false,
    data: []
  });

  const { isPending, error, data } = GetTranspotedTruck();
  const { mutate, creatingError, isCreatingpending } = CreateStockDelivery(onupdateSuccess);

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    
    if (!searchQuery.trim()) {
      return data.data;
    }
    
    return data.data.filter(item => searchInObject(item, searchQuery));
  }, [data?.data, searchQuery]);

  useEffect(() => {
    if (Object.keys(categoryInputData).length > 0) {
      console.log("Category Input Data Changed:", categoryInputData);
    }
  }, [categoryInputData]);

  const handleCompleteAction = () => {
    const apiData = [];
    
    const arrivalDate = categoryInputData.arrivalDate ? 
      new Date(categoryInputData.arrivalDate) : 
      new Date();
    
    Object.keys(categoryInputData).forEach(categoryKey => {
      if (categoryKey === 'arrivalDate') return;
      
      const categoryData = categoryInputData[categoryKey];
      
      if (categoryData && (categoryData.delivered || categoryData.wrn)) {
        const apiObject = {
          transferDate: selectedId?.transferDate,
          arrivalDate: arrivalDate,
          transportGroupId: selectedId.transportGroupId,
          category: categoryKey,
          deliveryKgs: parseFloat(categoryData.delivered || 0),
          WRN: categoryData.wrn || ""
        };
        
        apiData.push(apiObject);
      }
    });

    if (apiData.length === 0) {
      toast.error("Please fill in at least one category with delivery data");
      return;
    }

    console.log("API Data to send:", apiData);
    
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
      field: "category",
      header: "Actions",
      render: (item) => (
        <Button
          variant={item?.status === 'RECEIVED' ? "warning": "success"}
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
            if(item?.status === "RECEIVED") {
              setSubmitted({
                submitted: true,
                data:{ transportGroupId: item?.transportGroupId, transferDate: item?.transferDate,  }
              });
            }else {
              setSubmitted({
                submitted: false,
                data: []
              });
            }
          }}
        >
          <i className="bi bi-pencil-square"></i>{" "}
        </Button>
      )
    }
  ];

  if (isPending) return <TransportedTrackDelivery />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <ReusableTable 
        data={filteredData} 
        columns={columns} 
        pageSizeOptions={[5, 10, 20]} 
        pageSize={5} 
        rowsPerPageOptions={[5, 10, 20]}
        emptyStateMessage={
          searchQuery.trim() 
            ? `No transported trucks found matching "${searchQuery}"`
            : "There are no transported trucks available."
        }
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        <Pagination currentPage={currentPage} totalPages={1} itemsPerPage={5} onPageChange={setCurrentPage}/>
      </ReusableTable>
      
      <GenericModel
        isOpen={isModelOpen && !submitted.submitted}
        onClose={handleopenModel}
        onConfirm={handleCompleteAction}
        isLoading={isCreatingpending}
        title="Received Truck"
        confirmButtonText="Complete"
        cancelButtonText="Cancel"
        modalSize="xl"
        onConfirmDisalbe={
          (Object.keys(categoryInputData).length === 0 || 
           Object.keys(categoryInputData).every(key => key === 'arrivalDate'))
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
        title="received Truck"
        onClose={handleopenModel}
        onConfirm={()=>null}
        isLoading={isCreatingpending}
        confirmButtonText="Complete"
        cancelButtonText="Cancel"
        modalSize="xl"
        submitButton = {false}
        >
        
< SingleTransportedTruckdisplay selectedTransportInfo={submitted?.data}/>
        </GenericModel>
    </>
  );
};