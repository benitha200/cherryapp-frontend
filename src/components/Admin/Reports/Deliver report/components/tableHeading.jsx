export const Columns = [
  {
    field: "staionName",
    header: "CWS",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.stationName}
      </div>
    ),
  },
  {
    field: "track",
    header: "Track",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.track}
      </div>
    ),
  },
  {
    field: "transported",
    header: "Transported Kgs",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.rawTransported?.toLocaleString() || "0"}
      </div>
    ),
  },
  {
    field: "delivered",
    header: "Delivered Kgs",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.rawDelivered?.toLocaleString() || "0"}
      </div>
    ),
  },
  {
    field: "delivered",
    header: "Variation Kgs",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.variation?.toLocaleString() || "0"}
      </div>
    ),
  },
];
