import { Button } from "react-bootstrap";
import ReusableTable from "../../../sharedCompoents/reusableTable"
import { CreateStockDelivery, GetTranspotedTruck } from "../action";
import { SingleTransportedTruck } from "./singleTranportedTruck";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { GenericModel } from "../../../sharedCompoents/genericModel";

export const TransportedTruckTable = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedId, setSelectedId] = useState({
    transportGroupId: "",
    transferDate: ""
  });
  const [categories, setCategories] = useState([]);

  const [selectedTransportInfo, setSelectedTransportInfo] = useState({
    cws: "",
    trackPlatNumber: "",
    quantity: "",
    driver: "",
    driverPhone: "",
    truck: "",
  });

  const [categoryInputData, setCategoryInputData] = useState({});

  const { isPending, error, data } = GetTranspotedTruck();
  const { mutate, creatingError, isCreatingpending } = CreateStockDelivery();
  useEffect(() => {
    if (Object.keys(categoryInputData).length > 0) {
      console.log("Category Input Data Changed:", categoryInputData);
    }
  }, [categoryInputData]);

  const handleopenModel = () => {
    setIsModelOpen(!isModelOpen);
    
    if (isModelOpen) {
      setCategoryInputData({});
    }
  };

  const handleCompleteAction = () => {
    const transportDate = categoryInputData?.dates?.transportDate;
    const deliveryDate = categoryInputData?.dates?.deliveryDate;
    
    if (!transportDate || !deliveryDate) {
      toast?.error("Please fill in both Transport Date and Delivery Date");
      return;
    }

    const apiData = [];
    
    Object.keys(categoryInputData).forEach(categoryKey => {
      if (categoryKey === 'dates') return;
      
      const categoryData = categoryInputData[categoryKey];
      
      if (categoryData && (categoryData.delivered || categoryData.wrn)) {
        const apiObject = {
          transferDate: transportDate,
          arrivalDate: deliveryDate,
          transportGroupId: selectedId.transportGroupId,
          category: categoryKey,
          deliveryKgs: parseFloat(categoryData.delivered || 0),
          numberOfBags: 10, // Assuming a fixed number of bags for simplicity
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
    
    mutate(apiData, {
      onSuccess: (response) => {
        toast.success("Data sent successfully");
        handleopenModel();
      },
      onError: (error) => {
        toast.error("Error sending data please try again");
      }
    });
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
          variant="success"
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
          }}
        >
          <i className="bi bi-pencil-square"></i>{" "}
        </Button>
      )
    }
  ];

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <ReusableTable 
        data={data?.data ?? []} 
        columns={columns} 
        pageSizeOptions={[5, 10, 20]} 
        pageSize={5} 
        rowsPerPageOptions={[5, 10, 20]}
      />
      
      <GenericModel
        isOpen={isModelOpen}
        onClose={handleopenModel}
        onConfirm={handleCompleteAction}
        isLoading={isCreatingpending}
        title="Transported Truck"
        confirmButtonText="Complete"
        cancelButtonText="Cancel"
        modalSize="xl"
        onConfirmDisalbe={
          (Object.keys(categoryInputData).length ===0) ||
          !categoryInputData?.dates?.transportDate ||
          !categoryInputData?.dates?.deliveryDate
          
        }
      >
        <SingleTransportedTruck 
          selectedTransportInfo={selectedTransportInfo} 
          categories={categories}
          setInfo={setCategoryInputData}
        />
      </GenericModel>
    </>
  );
};