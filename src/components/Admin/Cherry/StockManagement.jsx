import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import API_URL from "../../../constants/Constants";
import StockDashboardSkeleton from "./StockDashboardSkeleton";
import { FindAllStockInformation } from "./actions";
import { data } from "react-router-dom";

const theme = {
  primary: "#008080", // Sucafina teal
  secondary: "#4FB3B3", // Lighter teal
  accent: "#D95032", // Complementary orange for contrast
  neutral: "#E6F3F3", // Very light teal for backgrounds
  text: "#34495E",
};

const DashboardCard = ({ title, value, iconClass }) => (
  <div className="card shadow-sm hover-shadow transition">
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <h6 className="text-muted small mb-2">{title}</h6>
        <p className="h3 mb-0 fw-bold">{value}</p>
      </div>
      <div
        style={{
          backgroundColor: theme.neutral,
          borderRadius: "50%",
          padding: "1rem",
        }}
      >
        <i className={`${iconClass} fs-4`} style={{ color: theme.primary }}></i>
      </div>
    </div>
  </div>
);

const StockManagement = () => {
  const [stockData, setStockData] = useState({
    gradeStock: {},
    gradeByCWS: {},
    totalCherry: 0,
    totalParchment: 0,
    batchesByStatus: {},
    batchesByCWS: {},
    batchCount: 0,
    processingYield: 0,
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCWS, setSelectedCWS] = useState("All");
  const [cwsList, setCwsList] = useState([]);
  const [cwsGradeContribution, setCwsGradeContribution] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("A0");
  const [cwsGradeDistribution, setCwsGradeDistribution] = useState([]);
  const [detailedTableData, setDetailedTableData] = useState([]);

  // Define all grades to track
  const allGrades = ["A0", "A1", "A2", "A3", "H1", "N1", "N2"];
  const mainGrades = ["A0", "A1", "H1", "N1"];

  const { isError, isPending, stocksData } = FindAllStockInformation();

  // Colors for different grades
  const gradeColors = {
    A0: "#27AE60", // Green
    A1: "#2ECC71", // Light Green
    A2: "#8E44AD", // Purple
    A3: "#E74C3C", // Red
    H1: "#3498DB", // Blue
    N1: "#2980B9", // Dark Blue
    N2: "#34495E", // Dark Gray
    other: "#E67E22", // Orange
  };
  console.log(selectedCWS, "::::::::");
  const pieColors = [
    "#008080",
    "#4FB3B3",
    "#79CDCD",
    "#A3E0E0",
    "#D95032",
    "#E67E22",
    "#F39C12",
    "#FFC300",
    "#DAF7A6",
    "#9B59B6",
  ];

  useEffect(() => {
    // Fetch both datasets simultaneously
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch bagging-off data
        const baggingResponse = await fetch(`${API_URL}/bagging-off`);
        if (!baggingResponse.ok) {
          throw new Error(`HTTP error! Status: ${baggingResponse.status}`);
        }
        const baggingData = await baggingResponse.json();

        // Fetch processing data
        const processingResponse = await fetch(
          `${API_URL}/processing?limit=100000`
        );
        if (!processingResponse.ok) {
          throw new Error(`HTTP error! Status: ${processingResponse.status}`);
        }
        const processingResponseData = await processingResponse.json();
        const processingData = processingResponseData.data; // Access the nested 'data' property

        // Process the data
        const stockAnalysis = analyzeStock(baggingData, processingData);
        setStockData(stockAnalysis);

        // Extract unique CWS list
        const uniqueCWS = [
          "All",
          ...new Set(processingData.map((item) => item.cws?.name || "Unknown")),
        ];
        setCwsList(uniqueCWS);

        // Prepare CWS grade contribution data
        const contributionData = prepareCwsGradeContribution(
          stockAnalysis.gradeByCWS
        );
        setCwsGradeContribution(contributionData);

        // Prepare CWS grade distribution data (for horizontal stacked bar chart)
        const distributionData = prepareCwsGradeDistribution(
          stockAnalysis.gradeByCWS
        );
        setCwsGradeDistribution(distributionData);

        // Prepare detailed table data
        const tableData = prepareDetailedTableData(stockAnalysis.gradeByCWS);
        setDetailedTableData(tableData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching or processing data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare detailed table data showing all grades for each CWS
  const prepareDetailedTableData = (gradeByCWS) => {
    return Object.keys(gradeByCWS)
      .map((cws) => {
        const cwsData = { cws };
        let total = 0;

        // Add data for each grade
        allGrades.forEach((grade) => {
          const amount = gradeByCWS[cws][grade] || 0;
          cwsData[grade] = amount;
          total += amount;
        });

        // Add total
        cwsData.total = total;

        return cwsData;
      })
      .sort((a, b) => b.total - a.total); // Sort by total in descending order
  };

  // Prepare CWS grade distribution data for horizontal stacked bar chart
  const prepareCwsGradeDistribution = (gradeByCWS) => {
    const cwsList = Object.keys(gradeByCWS);

    // Sort CWS by total production
    const sortedCWS = cwsList.sort((a, b) => {
      const totalA = Object.values(gradeByCWS[a] || {}).reduce(
        (sum, val) => sum + val,
        0
      );
      const totalB = Object.values(gradeByCWS[b] || {}).reduce(
        (sum, val) => sum + val,
        0
      );
      return totalB - totalA;
    });

    // Create distribution data
    const distributionData = sortedCWS.map((cws) => {
      const cwsData = { cws };

      // For each grade, add its quantity
      mainGrades.forEach((grade) => {
        cwsData[grade] = gradeByCWS[cws][grade] || 0;
      });

      // Add total for sorting
      cwsData.total = mainGrades.reduce(
        (sum, grade) => sum + (gradeByCWS[cws][grade] || 0),
        0
      );

      return cwsData;
    });

    return distributionData;
  };

  // Prepare CWS grade contribution data
  const prepareCwsGradeContribution = (gradeByCWS) => {
    const cwsContributions = {};

    // Initialize data structure for each grade
    allGrades.forEach((grade) => {
      cwsContributions[grade] = [];

      // Calculate total for this grade across all CWS
      const totalForGrade = Object.values(gradeByCWS).reduce(
        (sum, cwsGrades) => {
          return sum + (cwsGrades[grade] || 0);
        },
        0
      );

      // For each CWS, calculate their contribution to this grade
      Object.entries(gradeByCWS).forEach(([cwsName, cwsGrades]) => {
        const amount = cwsGrades[grade] || 0;
        const percentage =
          totalForGrade > 0 ? (amount / totalForGrade) * 100 : 0;

        cwsContributions[grade].push({
          name: cwsName,
          amount,
          percentage,
        });
      });

      // Sort by amount in descending order
      cwsContributions[grade].sort((a, b) => b.amount - a.amount);
    });

    return cwsContributions;
  };

  const analyzeStock = (baggingOffData, processingData) => {
    // Filter for completed and receiver_completed statuses in bagging off
    const completedBaggingOff = baggingOffData.filter(
      (item) =>
        item.status === "COMPLETED" || item.status === "RECEIVER_COMPLETED"
    );

    // Filter processing for completed and baggingoff_started
    const relevantProcessing = processingData.filter(
      (item) =>
        item.status === "COMPLETED" || item.status === "BAGGINGOFF_STARTED"
    );

    // Initialize objects for tracking
    const gradeStock = {};
    const gradeByCWS = {};
    const batchesByStatus = {};
    const batchesByCWS = {};

    // Process bagging off data to get grade information
    completedBaggingOff.forEach((item) => {
      // Count batches by status
      batchesByStatus[item.status] = (batchesByStatus[item.status] || 0) + 1;

      // Get CWS info from related processing object or default to Unknown
      const cwsName = item.processing?.cws?.name || "Unknown";

      // Count batches by CWS
      batchesByCWS[cwsName] = (batchesByCWS[cwsName] || 0) + 1;

      // Initialize CWS in gradeByCWS if not exists
      if (!gradeByCWS[cwsName]) {
        gradeByCWS[cwsName] = {};
      }

      // Count output by grade
      if (item.outputKgs) {
        Object.entries(item.outputKgs).forEach(([grade, kg]) => {
          // Parse kg value to ensure it's a number
          const kgValue = parseFloat(kg) || 0;

          // Update overall grade stock
          gradeStock[grade] = (gradeStock[grade] || 0) + kgValue;

          // Update CWS-specific grade stock
          gradeByCWS[cwsName][grade] =
            (gradeByCWS[cwsName][grade] || 0) + kgValue;
        });
      }
    });

    // Calculate total cherry processed from processing data
    const totalCherry = relevantProcessing.reduce(
      (sum, item) => sum + (parseFloat(item.totalKgs) || 0),
      0
    );

    // Calculate total parchment (sum of all grades)
    const totalParchment = Object.values(gradeStock).reduce(
      (sum, kg) => sum + (parseFloat(kg) || 0),
      0
    );

    // Calculate processing yield
    const processingYield =
      totalCherry > 0 ? (totalParchment / totalCherry) * 100 : 0;

    // Count unique batches
    const uniqueBatchNos = new Set(
      completedBaggingOff.map((item) => item.batchNo)
    ).size;

    // Create monthly trends data
    const monthlyTrends = generateMonthlyTrends(completedBaggingOff);

    return {
      gradeStock,
      gradeByCWS,
      totalCherry,
      totalParchment,
      batchesByStatus,
      batchesByCWS,
      batchCount: uniqueBatchNos,
      processingYield,
      monthlyTrends,
    };
  };

  // Generate monthly trends data from bagging off data
  const generateMonthlyTrends = (baggingOffData) => {
    const months = {};

    // Group data by month
    baggingOffData.forEach((item) => {
      if (!item.date) return;

      const month = new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!months[month]) {
        months[month] = {
          month,
          totalParchment: 0,
        };

        // Initialize all grades
        allGrades.forEach((grade) => {
          months[month][grade] = 0;
        });
      }

      // Sum outputs by grade
      if (item.outputKgs) {
        Object.entries(item.outputKgs).forEach(([grade, kg]) => {
          if (allGrades.includes(grade)) {
            months[month][grade] += parseFloat(kg) || 0;
          }
          months[month].totalParchment += parseFloat(kg) || 0;
        });
      }
    });

    // Convert to array and sort chronologically
    return Object.values(months).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
  };

  // Handle CWS selection change
  const handleCWSChange = (e) => {
    setSelectedCWS(e.target.value);
  };

  // Handle grade selection change
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  // Calculate totals for specific grades
  const calculateGradeTotals = () => {
    const result = {};

    mainGrades.forEach((grade) => {
      result[grade] = stockData.gradeStock[grade] || 0;
    });

    return result;
  };

  // Filter data based on selected CWS
  const getFilteredData = () => {
    if (selectedCWS === "All") {
      return {
        gradeStock: stockData.gradeStock,
        totalParchment: stockData.totalParchment,
        gradeTotals: calculateGradeTotals(),
      };
    } else {
      const cwsGrades = stockData.gradeByCWS[selectedCWS] || {};
      const cwsTotalParchment = Object.values(cwsGrades).reduce(
        (sum, kg) => sum + parseFloat(kg),
        0
      );

      const cwsGradeTotals = {};
      mainGrades.forEach((grade) => {
        cwsGradeTotals[grade] = cwsGrades[grade] || 0;
      });

      return {
        gradeStock: cwsGrades,
        totalParchment: cwsTotalParchment,
        gradeTotals: cwsGradeTotals,
      };
    }
  };

  // Prepare grade CWS data for pie chart
  const prepareGradeCwsData = () => {
    if (!cwsGradeContribution[selectedGrade]) return [];

    // Get top contributors (up to 9) and combine the rest as "Others"
    const topContributors = cwsGradeContribution[selectedGrade].slice(0, 9);
    const othersContribution = cwsGradeContribution[selectedGrade]
      .slice(9)
      .reduce((sum, item) => sum + item.amount, 0);

    const result = topContributors.map((item) => ({
      name: item.name,
      value: item.amount,
    }));

    if (othersContribution > 0) {
      result.push({
        name: "Others",
        value: othersContribution,
      });
    }

    return result;
  };

  if (loading) {
    return <StockDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const gradeCwsData = prepareGradeCwsData();

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fafa" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-sucafina" style={{ color: theme.primary }}>
          Stock Dashboard
        </h4>

        <div className="d-flex align-items-center">
          <label htmlFor="cwsSelect" className="me-2 text-muted">
            CWS:
          </label>
          <select
            id="cwsSelect"
            value={selectedCWS}
            onChange={handleCWSChange}
            className="form-select"
            style={{ borderColor: theme.secondary }}
          >
            {cwsList?.map((cws) => (
              <option key={cws} value={cws}>
                {cws}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards - First Row */}
      {selectedCWS == "All"
        ? !isPending &&
          stocksData && (
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6">
                <DashboardCard
                  title="Total Cherry Purchased (kg)"
                  value={stocksData?.data?.totals?.totCherryPurchase?.toString()}
                  iconClass="bi-basket-fill"
                />
              </div>
              <div className="col-12 col-md-6">
                <DashboardCard
                  title={
                    selectedCWS === "All"
                      ? "Total Parchment output (kg)"
                      : `${selectedCWS} Parchment Output (kg)`
                  }
                  value={stocksData?.data?.totals?.totalParchmentOutput?.toLocaleString()}
                  iconClass="bi-box-seam"
                />
              </div>
              <div className="col-12 col-md-6">
                <DashboardCard
                  title={
                    selectedCWS === "All"
                      ? "Total Transported (kg)"
                      : `${selectedCWS} Parchment Output (kg)`
                  }
                  value={stocksData?.data?.totals?.totalTransportedKgs?.toLocaleString()}
                  iconClass="bi-bus-front"
                />
              </div>{" "}
              <div className="col-12 col-md-6">
                <DashboardCard
                  title={
                    selectedCWS === "All"
                      ? "Total Purchment in store (kg)"
                      : `${selectedCWS} Parchment Output (kg)`
                  }
                  value={stocksData?.data?.totals?.parchmentInstore?.toLocaleString()}
                  iconClass="bi-shop"
                />
              </div>
            </div>
          )
        : !isPending &&
          stocksData &&
          stocksData?.data?.byCws
            ?.filter((cws) => cws?.cwsName == selectedCWS)
            .map((element) => (
              <div className="row g-4 mb-4">
                <div className="col-12 col-md-6">
                  <DashboardCard
                    title="Total Cherry Purchased (kg)"
                    value={element?.cherryPurchase?.toString()}
                    iconClass="bi-basket-fill"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <DashboardCard
                    title={
                      selectedCWS === "All"
                        ? "Total Parchment output (kg)"
                        : `${selectedCWS} Parchment Output (kg)`
                    }
                    value={element?.parchmentOutput?.toLocaleString()}
                    iconClass="bi-box-seam"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <DashboardCard
                    title={
                      selectedCWS === "All"
                        ? "Total Transported (kg)"
                        : `${selectedCWS} Parchment Output (kg)`
                    }
                    value={element?.transportedKgs?.toLocaleString()}
                    iconClass="bi-bus-front"
                  />
                </div>{" "}
                <div className="col-12 col-md-6">
                  <DashboardCard
                    title={
                      selectedCWS === "All"
                        ? "Total Purchment in store (kg)"
                        : `${selectedCWS} Parchment Output (kg)`
                    }
                    value={element?.parchmentInstore?.toLocaleString()}
                    iconClass="bi-shop"
                  />
                </div>
              </div>
            ))}

      {/* Summary Cards - Grade Totals */}
      {/* <div className="row g-4 mb-4">
        {stocksData &&
          stocksData?.data?.byCws?.map((cws, index) => (
            <div key={cws?.cwsId ?? index} className="col-6 col-md-3">
              <DashboardCard
                title={`${cws?.cwsName} Grade Total (kg)`}
                value={cws?.cherryPurchase ?? 0}
                iconClass="bi-tag-fill"
              />
            </div>
          ))}
      </div> */}

      {/* CWS Distribution for Specific Grade */}
      {/* <div className="row g-4 mb-4">
                <div className="col-12 col-lg-8">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: theme.neutral, color: theme.primary }}>
                            <span>CWS Distribution by Grade</span>
                            <div>
                                <select
                                    value={selectedGrade}
                                    onChange={handleGradeChange}
                                    className="form-select form-select-sm"
                                    style={{ borderColor: theme.secondary, width: '120px' }}
                                >
                                    {allGrades.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={gradeCwsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                                        }
                                    >
                                        {gradeCwsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()} kg`, 'Amount']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header" style={{ backgroundColor: theme.neutral, color: theme.primary }}>
                            {selectedGrade} Grade Contribution by CWS
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead>
                                        <tr className="table-light">
                                            <th>CWS</th>
                                            <th className="text-end">Amount (kg)</th>
                                            <th className="text-end">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cwsGradeContribution[selectedGrade]?.slice(0, 10).map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <span
                                                        className="d-inline-block me-2"
                                                        style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: pieColors[index % pieColors.length] }}
                                                    ></span>
                                                    {item.name}
                                                </td>
                                                <td className="text-end">{Number(item.amount).toLocaleString()}</td>
                                                <td className="text-end">{item.percentage.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                        {cwsGradeContribution[selectedGrade]?.length > 10 && (
                                            <tr>
                                                <td>
                                                    <span
                                                        className="d-inline-block me-2"
                                                        style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: pieColors[10 % pieColors.length] }}
                                                    ></span>
                                                    Others
                                                </td>
                                                <td className="text-end">
                                                    {cwsGradeContribution[selectedGrade]
                                                        .slice(10)
                                                        .reduce((sum, item) => sum + item.amount, 0)
                                                        .toLocaleString()}
                                                </td>
                                                <td className="text-end">
                                                    {cwsGradeContribution[selectedGrade]
                                                        .slice(10)
                                                        .reduce((sum, item) => sum + item.percentage, 0)
                                                        .toFixed(1)}%
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}

      {/* Detailed Grade Table */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div
              className="card-header"
              style={{ backgroundColor: theme.neutral, color: theme.primary }}
            >
              <span>Detailed Grade Distribution by CWS</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead>
                    <tr className="table-light">
                      <th>Coffee Washing Station</th>
                      {allGrades.map((grade) => (
                        <th key={grade} className="text-end">
                          {grade} (kg)
                        </th>
                      ))}
                      <th className="text-end fw-bold">Total (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedTableData.map((station, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{station.cws}</td>
                        {allGrades.map((grade) => (
                          <td key={grade} className="text-end">
                            {station[grade]
                              ? station[grade].toLocaleString()
                              : "0"}
                          </td>
                        ))}
                        <td className="text-end fw-bold">
                          {station.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-light fw-bold">
                      <td>Total</td>
                      {allGrades.map((grade) => {
                        const gradeTotal = detailedTableData.reduce(
                          (sum, station) => sum + (station[grade] || 0),
                          0
                        );
                        return (
                          <td key={grade} className="text-end">
                            {gradeTotal.toLocaleString()}
                          </td>
                        );
                      })}
                      <td className="text-end">
                        {detailedTableData
                          .reduce((sum, station) => sum + station.total, 0)
                          .toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
