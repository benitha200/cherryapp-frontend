import { Badge } from "react-bootstrap";
import { formatDate } from "../../../../../utils/formatDate";

const theme = {
  primary: "#008080",
  neutral: "#E6F3F3",
  fullyWashed: "#008080",
  natural: "#4FB3B3",
};

const getProcessingTypeBadgeStyle = (type) => ({
  backgroundColor: type === "FULLY_WASHED" ? theme.fullyWashed : theme.natural,
  color: "white",
  fontSize: "0.9em",
  padding: "6px 10px",
  border: "none",
  borderRadius: "4px",
  display: "inline-block",
});

export const Columns = [
  {
    field: "cherry",
    header: "Batch No",
    render: (item) => <div style={{ width: "10rem" }}>{item?.purchaseBatchNo}</div>,
  },

  {
    field: "batch",
    header: "Cherry No",
        render: (item) => <div style={{ width: "10rem" }}>{`${item?.purchaseBatchNo}`}</div>,

  },
  {
    field: "quantity",
    header: "purchased quantity",
        render: (item) => <div style={{ width: "10rem" }}>{item?.purchaseInfo?.totalKgs?? '-'}</div>,

  },
  { field: "price", header: "Price/kg",
            render: (item) => <div style={{ width: "10rem" }}>{item?.purchaseInfo?.cherryPrice?? '-'}</div>,

   },
  {
    field: "cws",
    header: "cws",
    render: (item) => <div style={{ width: "10rem" }}>{item?.purchaseInfo?.cwsName?? '-'}</div>,

  },

  {
    field: "date",
    header: "Purchase Date",
    render: (item) => <div style={{ width: "10rem" }}>{formatDate( item?.purchaseInfo?.purchaseDate?? '-')}</div>,

  },
  {
    field: "ptype",
    header: "Processing Type",
    render: (item) => (
      <span style={getProcessingTypeBadgeStyle(item?.processingInfo[0]?.processingType)}>
        {item?.processingInfo[0]?.processingType}
      </span>
    ),
  },
  { field: "wet", header: "Wet Transfer",
        render: (item) => <div >{ item?.wetTransferInfo?.length >0 ? "true":"false" }</div>,

   },
  { field: "receiver", header: "Receiver CWS",
    render: (item) => <div >{ item?.wetTransferInfo?.length >0 ? item?.wetTransferInfo[0]?.destinationCwsName:"-" }</div>,

   },
  {
    field: "totalkgs",
    header: "baggedOf kgs",
  },
  {
    field: "track",
    header: "Track",
    render: (item)=> <div>{item?.transportInfo[0]?.truckNumber??'-'}</div>
  },
  {
    field: "cup",
    header: "Cup p sample",
    render: (item) => (
      <Badge
        key={item?.id}
        bg="info"
        className="me-1"
        style={{
          backgroundColor:
            item?.cup == "C1"
              ? "#28a745"
              : item?.cup === "C2"
              ? "#ffc107"
              : "#17a2b8",
        }}
      >
        {item?.cup}
      </Badge>
    ),
  },

  {
    field: "cupdel",
    header: "Cup p Delivery",
    render: (item) => (
      <Badge
        key={item?.id}
        bg="info"
        className="me-1"
        style={{
          backgroundColor:
            item?.cupdel === "C1"
              ? "#28a745"
              : item?.cupdel === "C2"
              ? "#ffc107"
              : "#17a2b8",
        }}
      >
        {item?.cupdel}
      </Badge>
    ),
  },
  {
    field: "storage",
    header: "Storage",
  },
  {
    field: "outturn",
    header: "OUt turn",
    render: (item) => (
      <span
        style={{
          textAlign: "right",
          color:
            item?.ptype === "NATURAL"
              ? "teal"
              : item?.outturn >= 20.5 && item.outturn <= 25
              ? theme.primary
              : "red",
          backgroundColor: theme.neutral,
        }}
      >
        {item.outturn}
      </span>
    ),
  },
];
