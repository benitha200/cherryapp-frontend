export const Columns = [
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
    field: "transportGroupId",
    header: "Transport Group Id",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.transportGroupId}
      </div>
    ),
  },
  {
    field: "transported",
    header: "Transported Kgs",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.transported?.toLocaleString() || "0"}
      </div>
    ),
  },
  {
    field: "delivered",
    header: "Delivered Kgs",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.delivered?.toLocaleString() || "0"}
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
  {
    field: "rowLabels",
    header: "Row Labels",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.rowLabels}
      </div>
    ),
  },
  {
    field: "wcaAvg15Plus",
    header: "PCA of AVG 15+",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.wcaAvg15Plus?.toFixed(1) || "0.0"}
      </div>
    ),
  },
  {
    field: "avgAvg15PlusS",
    header: "Average of AVG 15+ (S)",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.avgAvg15PlusS?.toFixed(1) || "0.0"}
      </div>
    ),
  },
  {
    field: "wca1314",
    header: "PCA 13/14",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.wca1314?.toFixed(1) || "0.0"}
      </div>
    ),
  },
  {
    field: "avg1314S",
    header: "AVG 13/14 (S)",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.avg1314S?.toFixed(0) || "0"}
      </div>
    ),
  },
  {
    field: "wcaAvgLG",
    header: "PCA of AVG LG",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.wcaAvgLG?.toFixed(1) || "0.0"}
      </div>
    ),
  },
  {
    field: "avgAvgLGS",
    header: "Average of AVG LG (S)",
    render: (item) => (
      <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
        {item?.avgAvgLGS?.toFixed(1) || "0.0"}
      </div>
    ),
  },
  // {
  //   field: "wcaOTDelivery",
  //   header: "PCA of OT Delivery",
  //   render: (item) => (
  //     <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
  //       {item?.wcaOTDelivery?.toFixed(1) || "0.0"}
  //     </div>
  //   ),
  // },
  // {
  //   field: "avgOTSample",
  //   header: "Average of OT Sample",
  //   render: (item) => (
  //     <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
  //       {item?.avgOTSample?.toFixed(1) || "0.0"}
  //     </div>
  //   ),
  // },
  // {
  //   field: "wcaPPScore",
  //   header: "PCA of PP Score",
  //   render: (item) => (
  //     <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
  //       {item?.wcaPPScore?.toFixed(1) || "0.0"}
  //     </div>
  //   ),
  // },
  // {
  //   field: "avgPPScoreS",
  //   header: "Average of PP Score (S)",
  //   render: (item) => (
  //     <div className={`${item?.isGrandTotal ? "font-bold" : ""}`}>
  //       {item?.avgPPScoreS?.toFixed(1) || "0.0"}
  //     </div>
  //   ),
  // },
];
