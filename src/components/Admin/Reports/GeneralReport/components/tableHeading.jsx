import { Badge } from "react-bootstrap";

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
  },

  {
    field: "batch",
    header: "Cherry No",
  },
  {
    field: "quantity",
    header: "purchased quantity",
  },
  { field: "price", header: "Price/kg" },
  {
    field: "cws",
    header: "cws",
  },

  {
    field: "date",
    header: "Purchase Date",
  },
  {
    field: "ptype",
    header: "Processing Type",
    render: (item) => (
      <span style={getProcessingTypeBadgeStyle(item?.ptype)}>
        {item?.ptype}
      </span>
    ),
  },
  { field: "wet", header: "Wet Transfer" },
  { field: "receiver", header: "Receiver CWS" },
  {
    field: "totalkgs",
    header: "baggedOf kgs",
  },
  {
    field: "track",
    header: "Track",
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
