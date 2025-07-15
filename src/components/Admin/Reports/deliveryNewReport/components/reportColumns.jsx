import { render } from "react-dom";

export const columns = [
  {
    field: "cws_name",
    header: "CWS",
  },
  {
    field: "total_kgs",
    header: "Transported (kg)",
  },
  {
    field: "transitKgs",
    header: "In Transit (kg)",
  },
  // {
  //   field: "transitTruckTotal",
  //   header: "In Transit TrucksNo",
  // },
  // {
  //   field: "transitTruckTotal",
  //   header: "In Transit Trucks",
  //   render: (rowData) => {
  //     return rowData.transitTruck?.join(",") || "N/A";
  //   },
  // },
  {
    field: "total_delivered",
    header: "Delivered (kg)",
  },
  {
    field: "variation",
    header: "Variation (kg)",
  },
  // { field: "driverPhone", header: "16+" },
  // { field: "driverPhone", header: "15.00" },
  // { field: "driverPhone", header: "AV.15+/Delivery" },
  // { field: "driverPhone", header: "AV.15+ Samples" },
  // { field: "driverPhone", header: "Variation 15+" },
  // { field: "driverPhone", header: "14.00" },
  // { field: "driverPhone", header: "13.00" },
  // { field: "driverPhone", header: "AV.13/14/Delivery" },
  // { field: "driverPhone", header: "AV.13/14 Samples" },
  // { field: "driverPhone", header: "Variation 13/14" },
  // { field: "driverPhone", header: "B12" },
  // { field: "driverPhone", header: "Defects (%)" },
  // { field: "driverPhone", header: "AV.LG/Delivery" },
  // { field: "driverPhone", header: "AV.LG Samples" },
  // { field: "driverPhone", header: "Variation LG" },
  // { field: "driverPhone", header: "OT Delivery (%)" },
  // { field: "driverPhone", header: "O.T/Samples" },
  // { field: "driverPhone", header: "Variation OT" },
  // { field: "driverPhone", header: "PP Score/Delivery" },
  // { field: "driverPhone", header: "PP Score/samples" },
  // { field: "driverPhone", header: "Variation PP Score" },
  // { field: "driverPhone", header: "Sample storage" },
];
