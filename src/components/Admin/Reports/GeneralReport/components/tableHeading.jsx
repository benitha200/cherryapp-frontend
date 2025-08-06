import { Badge } from "react-bootstrap";
import { formatDate } from "../../../../../utils/formatDate";

const theme = {
  primary: "#008080",
  neutral: "#E6F3F3",
  fullyWashed: "#008080",
  natural: "#4FB3B3",
  completed: "#28a745",
  pending: "#ffc107",
  inProgress: "#17a2b8",
};

const getProcessingTypeBadgeStyle = (type) => ({
  backgroundColor: type === "FULLY_WASHED" ? theme.fullyWashed : theme.natural,
  color: "white",
  fontSize: "0.9em",
  padding: "6px 10px",
  border: "none",
  borderRadius: "4px",
  display: "inline-block",
  width: "8rem",
});

const getStatusBadgeStyle = (status) => {
  let backgroundColor;
  switch (status) {
    case "COMPLETED":
      backgroundColor = theme.completed;
      break;
    case "PENDING":
      backgroundColor = theme.pending;
      break;
    case "IN_PROGRESS":
    case "BAGGING_STARTED":
      backgroundColor = theme.inProgress;
      break;
    case "TESTING":
      backgroundColor = "#6c757d";
      break;
    default:
      backgroundColor = "#6c757d";
  }

  return {
    backgroundColor,
    color: "white",
    fontSize: "0.8em",
    padding: "4px 8px",
    border: "none",
    borderRadius: "3px",
    display: "inline-block",
  };
};

const getCupProfileBadgeStyle = (profile) => {
  let backgroundColor;
  switch (profile) {
    case "S88":
      backgroundColor = "#41d9dfff";
      break;
    case "S87":
      backgroundColor = "#3eccd1ff";
      break;
    case "S86":
      backgroundColor = "#17a2b8";
      break;
    case "C1":
      backgroundColor = "#28a745";
      break;
    case "C2":
      backgroundColor = "#10a01cff";
      break;
    default:
      backgroundColor = "#6c757d";
  }

  return {
    backgroundColor,
    color: "white",
    fontSize: "0.8em",
    padding: "4px 8px",
    border: "none",
    borderRadius: "3px",
    display: "inline-block",
  };
};

const calculateOutturn = (item) => {
  const purchasedKgs = item?.purchaseInfo?.totalKgs || 0;
  const baggingOffKgs = item?.baggingOff?.totalOutputKgs || 0;

  if (purchasedKgs > 0 && baggingOffKgs > 0) {
    return ((baggingOffKgs / purchasedKgs) * 100).toFixed(1);
  }
  return "-";
};

const getTotalBaggedKgs = (item) => {
  return item?.baggingOff?.totalOutputKgs || 0;
};

const getCupProfile = (item, type = "sample") => {
  if (type === "delivery" && item?.qualityDelivery?.length > 0) {
    return item.qualityDelivery[0]?.category || "-";
  }

  if (item?.transfer?.length > 0) {
    return item.transfer[0]?.cupProfile || "-";
  }

  return "-";
};

export const Columns = [
  {
    field: "purchaseBatchNo",
    header: "Purchase Batch No",
    render: (item) => (
      <div style={{ width: "10rem", fontWeight: "bold" }}>
        {item?.purchaseBatchNo}
      </div>
    ),
  },
  {
    field: "batchNo",
    header: "Sub-Batch No",
    render: (item) => (
      <div style={{ width: "10rem", color: theme.primary }}>
        {item?.batchNo}
      </div>
    ),
  },
  {
    field: "purchasedQuantity",
    header: "Purchased Qty (kg)",
    render: (item) => (
      <div style={{ width: "8rem", textAlign: "right" }}>
        {item?.purchaseInfo?.totalKgs?.toLocaleString() || "-"}
      </div>
    ),
  },
  {
    field: "processingQuantity",
    header: "Processing Qty (kg)",
    render: (item) => (
      <div style={{ width: "8rem", textAlign: "right" }}>
        {item?.processing?.totalKgs?.toLocaleString() || "-"}
      </div>
    ),
  },
  {
    field: "cherryPrice",
    header: "Price/kg (RWF)",
    render: (item) => (
      <div style={{ width: "8rem", textAlign: "right" }}>
        {item?.purchaseInfo?.cherryPrice?.toLocaleString() || "-"}
      </div>
    ),
  },
  {
    field: "cwsName",
    header: "CWS",
    render: (item) => (
      <div style={{ width: "8rem" }}>{item?.purchaseInfo?.cwsName || "-"}</div>
    ),
  },
  {
    field: "purchaseDate",
    header: "Purchase Date",
    render: (item) => (
      <div style={{ width: "9rem" }}>
        {formatDate(item?.purchaseInfo?.purchaseDate) || "-"}
      </div>
    ),
  },
  {
    field: "processingType",
    header: "Processing Type",
    render: (item) => (
      <span
        style={getProcessingTypeBadgeStyle(item?.processing?.processingType)}
      >
        {item?.processing?.processingType?.replace("_", " ") || "-"}
      </span>
    ),
  },
  {
    field: "processingStatus",
    header: "Processing Status",
    render: (item) => (
      <span style={getStatusBadgeStyle(item?.processing?.status)}>
        {item?.processing?.status?.replace("_", " ") || "-"}
      </span>
    ),
  },
  {
    field: "wetTransfer",
    header: "Wet Transfer",
    render: (item) => (
      <div style={{ textAlign: "center" }}>
        <Badge bg={item?.hasWetTransfer ? "success" : "secondary"}>
          {item?.hasWetTransfer ? "Yes" : "No"}
        </Badge>
      </div>
    ),
  },
  {
    field: "baggedOffKgs",
    header: "Bagged Off (kg)",
    render: (item) => (
      <div style={{ width: "8rem", textAlign: "right" }}>
        {getTotalBaggedKgs(item).toLocaleString() || "-"}
      </div>
    ),
  },
  {
    field: "baggedOffStatus",
    header: "Bagging Status",
    render: (item) => (
      <span style={getStatusBadgeStyle(item?.baggingOff?.status)}>
        {item?.baggingOff?.status || "NOT_STARTED"}
      </span>
    ),
  },

   {
    field: "truckNumber",
    header: "15+ %",
    render: (item) => (
      <div style={{ width: "8rem" }}>
        {item?.transfer?.[0]?.truckNumber || "-"}
      </div>
    ),
  }, {
    field: "truckNumber",
    header: "14/13 %",
    render: (item) => (
      <div style={{ width: "8rem" }}>
        {item?.transfer?.[0]?.truckNumber || "-"}
      </div>
    ),
  },
  {
    field: "truckNumber",
    header: "Truck No",
    render: (item) => (
      <div style={{ width: "8rem" }}>
        {item?.transfer?.[0]?.truckNumber || "-"}
      </div>
    ),
  },
  {
    field: "driverName",
    header: "Driver",
    render: (item) => (
      <div style={{ width: "8rem" }}>
        {item?.transfer?.[0]?.driverName || "-"}
      </div>
    ),
  },
  {
    field: "cupProfileSample",
    header: "Cup Profile (Sample)",
    render: (item) => {
      const profile = getCupProfile(item, "sample");
      return <span style={getCupProfileBadgeStyle(profile)}>{profile}</span>;
    },
  },
  {
    field: "cupProfileDelivery",
    header: "Cup Profile (Delivery)",
    render: (item) => {
      const profile = getCupProfile(item, "delivery");
      return <span style={getCupProfileBadgeStyle(profile)}>{profile}</span>;
    },
  },
  {
    field: "qualityStatus",
    header: "Quality Status",
    render: (item) => (
      <span style={getStatusBadgeStyle(item?.quality?.status)}>
        {item?.quality?.status || "NOT_TESTED"}
      </span>
    ),
  },
  {
    field: "sampleStorage",
    header: "Sample Storage",
    render: (item) => (
      <div style={{ width: "6rem" }}>
        {item?.quality?.sampleStorage0Name ||
          item?.qualityDelivery?.[0]?.sampleStorageName ||
          "-"}
      </div>
    ),
  },
  {
    field: "outturn",
    header: "Outturn (%)",
    render: (item) => {
      const outturn = calculateOutturn(item);
      const outturnValue = parseFloat(outturn);
      const isGoodOutturn = outturnValue >= 20.5 && outturnValue <= 25;

      return (
        <span
          style={{
            textAlign: "right",
            color: isGoodOutturn ? theme.primary : "red",
            backgroundColor: theme.neutral,
            padding: "4px 8px",
            borderRadius: "3px",
            fontWeight: "bold",
          }}
        >
          {outturn}%
        </span>
      );
    },
  },
];
