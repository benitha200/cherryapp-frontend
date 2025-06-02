import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import API_URL from "../../constants/Constants";
import { Button } from "react-bootstrap";

const theme = {
  primary: "#008080",
  secondary: "#4FB3B3",
  accent: "#D95032",
  neutral: "#E6F3F3",
  tableHover: "#F8FAFA",
  directDelivery: "#4FB3B3",
  centralStation: "#008080",
  supplier: "#FFA500",
};

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array(cols)
      .fill(0)
      .map((_, index) => (
        <td key={index} className="p-3">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
          </div>
        </td>
      ))}
  </tr>
);

const EmptyState = ({ message = "No records found" }) => (
  <tr>
    <td colSpan="100%" className="text-center py-4">
      <div className="d-flex flex-column align-items-center">
        <i className="bi bi-inbox fs-1 text-muted"></i>
        <p className="text-muted mt-2">{message}</p>
      </div>
    </td>
  </tr>
);

const PurchaseByStation = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [selectedDate, setSelectedDate] = useState({
    startDate: null,
    endDate: null,
  });
  const [cwsList, setCwsList] = useState([]);
  const [selectedCws, setSelectedCws] = useState("");
  const [selectedCWSList, steSelectedCWSList] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [totals, setTotals] = useState({
    totalKgs: 0,
    totalPrice: 0,
    totalCherryPrice: 0,
    totalTransportFee: 0,
    totalCommissionFee: 0,
    averagePricePerKg: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stationCount, setStationCount] = useState(0);

  const filteredCwsList = cwsList.filter(
    (cws) =>
      cws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cws.id.toString().includes(searchTerm)
  );

  const handleCwsSelect = (cwsId) => {
    setSelectedCws(cwsId);
    steSelectedCWSList((prev) => [...new Set([...prev, cwsId])]);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const fetchCwsList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/cws`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCwsList(response.data);
      } catch (error) {
        console.error("Error fetching CWS list:", error);
      }
    };
    fetchCwsList();
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let endpoint;
        let processedData;

        if (selectedDate?.startDate) {
          // Fix: Format date correctly to avoid timezone issues
          // Use the date's year, month, and day directly to create the proper YYYY-MM-DD format
          const year = selectedDate.startDate.getFullYear();
          const month = String(selectedDate.startDate.getMonth() + 1).padStart(
            2,
            "0"
          );
          const day = String(selectedDate.startDate.getDate()).padStart(2, "0");
          const startDate = `${year}-${month}-${day}`;
          selectedDate.endDate = selectedDate?.endDate
            ? selectedDate.endDate
            : new Date();

          // end date
          const yearEnd = selectedDate.endDate.getFullYear();
          const monthEnd = String(selectedDate.endDate.getMonth() + 1).padStart(
            2,
            "0"
          );
          const dayEnd = String(selectedDate.endDate.getDate()).padStart(
            2,
            "0"
          );
          const endDate = `${yearEnd}-${monthEnd}-${dayEnd}`;
          endpoint = `${API_URL}/purchases/date/${startDate}/${endDate}`;
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Process daily data
          processedData = response.data.cwsData.map((cwsGroup) => {
            // Calculate totals from individual purchases
            const totals = cwsGroup.purchases.reduce(
              (acc, purchase) => ({
                totalKgs: acc.totalKgs + purchase.totalKgs,
                totalPrice: acc.totalPrice + purchase.totalPrice,
                totalCherryPrice:
                  acc.totalCherryPrice +
                  purchase.totalKgs * purchase.cherryPrice,
                totalTransportFee:
                  acc.totalTransportFee +
                  purchase.totalKgs * purchase.transportFee,
                totalCommissionFee:
                  acc.totalCommissionFee +
                  purchase.totalKgs * purchase.commissionFee,
              }),
              {
                totalKgs: 0,
                totalPrice: 0,
                totalCherryPrice: 0,
                totalTransportFee: 0,
                totalCommissionFee: 0,
              }
            );

            return {
              cwsName: cwsGroup.name,
              totalKgs: totals.totalKgs,
              totalPrice: totals.totalPrice,
              totalCherryPrice: totals.totalCherryPrice,
              totalTransportFee: totals.totalTransportFee,
              totalCommissionFee: totals.totalCommissionFee,
              averagePricePerKg:
                totals.totalKgs > 0 ? totals.totalPrice / totals.totalKgs : 0,
            };
          });
        } else {
          // Fetch all-time aggregated data
          endpoint = `${API_URL}/purchases/cws-aggregated-all`;
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Process aggregated data
          processedData = response.data.data.map((cws) => ({
            cwsName: cws.cwsName,
            totalKgs: cws.totalKgs,
            totalPrice: cws.totalPrice,
            totalCherryPrice: cws.totalCherryPrice,
            totalTransportFee: cws.totalTransportFee,
            totalCommissionFee: cws.totalCommissionFee,
            averagePricePerKg:
              cws.totalKgs > 0 ? cws.totalPrice / cws.totalKgs : 0,
          }));
        }

        setPurchases(processedData);
        updateFilteredPurchases(processedData, selectedCws);
      } catch (err) {
        setError("Error fetching purchase data");
        console.error("Error fetching purchase data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (cwsList.length > 0) {
      fetchPurchases();
    }
  }, [selectedDate, cwsList]);

  // Modify your updateFilteredPurchases function to update the station count

  const updateFilteredPurchases = (purchases, cwsId) => {
    const selection = cwsList.filter((cws) =>
      selectedCWSList.includes(cws?.id?.toString())
    );
    const listNames = selection.map((element) => element?.name);
    const filtered =
      selectedCWSList.length > 0
        ? purchases.filter((p) => {
            return listNames.includes(p?.cwsName);
          })
        : purchases;

    setFilteredPurchases(filtered);

    // Count unique stations
    const uniqueStations = new Set(filtered.map((p) => p.cwsName));
    setStationCount(uniqueStations.size);

    const newTotals = filtered.reduce(
      (acc, item) => ({
        totalKgs: acc.totalKgs + item.totalKgs,
        totalPrice: acc.totalPrice + item.totalPrice,
        totalCherryPrice: acc.totalCherryPrice + item.totalCherryPrice,
        totalTransportFee: acc.totalTransportFee + item.totalTransportFee,
        totalCommissionFee: acc.totalCommissionFee + item.totalCommissionFee,
        averagePricePerKg: acc.totalKgs > 0 ? acc.totalPrice / acc.totalKgs : 0,
      }),
      {
        totalKgs: 0,
        totalPrice: 0,
        totalCherryPrice: 0,
        totalTransportFee: 0,
        totalCommissionFee: 0,
        averagePricePerKg: 0,
      }
    );

    setTotals(newTotals);
    setCurrentPage(1);
  };

  useEffect(() => {
    updateFilteredPurchases(purchases, selectedCws);
  }, [selectedCws, purchases, selectedCWSList]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
          <h2 className="mb-3 mb-md-0">Purchases By Station</h2>
        </div>

        <div className="d-flex flex-sm-wrap" style={{ gap: "2rem" }}>
          <div className=" d-flex" style={{ gap: "1rem" }}>
            <div>
              <label className="form-label" style={{ color: theme.primary }}>
                Start Date (Optional)
              </label>
              <DatePicker
                selected={selectedDate?.startDate}
                onChange={(date) =>
                  setSelectedDate((prev) => ({ ...prev, startDate: date }))
                }
                className="form-control w-100"
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="Start Date"
                maxDate={
                  selectedDate.endDate ? selectedDate.endDate : new Date()
                }
                style={{
                  borderColor: theme.primary,
                  "&:focus": {
                    borderColor: theme.secondary,
                    boxShadow: `0 0 0 0.2rem ${theme.neutral}`,
                  },
                }}
              />
            </div>
            <div>
              <label className="form-label" style={{ color: theme.primary }}>
                End Date (Optional)
              </label>
              <DatePicker
                selected={selectedDate.endDate}
                onChange={(date) =>
                  setSelectedDate((prev) => ({ ...prev, endDate: date }))
                }
                className="form-control w-100"
                dateFormat="yyyy-MM-dd"
                isClearable
                placeholderText="End Date"
                minDate={selectedDate.startDate ?? new Date()}
                maxDate={new Date()}
                style={{
                  borderColor: theme.primary,
                  "&:focus": {
                    borderColor: theme.secondary,
                    boxShadow: `0 0 0 0.2rem ${theme.neutral}`,
                  },
                }}
              />
            </div>
          </div>

          <div className="col-12 col-md-5 col-lg-7 mt-3">
            <div className="position-relative">
              <div
                className=" d-flex g-5 justify-content-end"
                style={{ gap: "1rem" }}
              >
                {selectedCWSList?.length > 0 && (
                  <div
                    className=" d-flex justify-content-start align-items-center"
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: "white",
                      gap: "1rem",
                      width: "50vw",
                      overflowX: "scroll",
                      padding: ".5rem",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {cwsList
                      .filter((cws) =>
                        selectedCWSList.includes(cws?.id?.toString())
                      )
                      .map((cws) => (
                        <div
                          style={{
                            backgroundColor: "#f9fafb",
                            border: "1px solid #d1d5db",
                            borderRadius: "0.5rem",
                            padding: "0.3rem 0.6rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            fontFamily: "sans-serif",
                            fontSize: "0.9rem",
                            color: "#111827",
                          }}
                        >
                          <span style={{ color: "#0284c7" }}>
                            {cws?.name ?? ""}
                          </span>
                          <span
                            onClick={() =>
                              steSelectedCWSList((prev) =>
                                prev.filter((id) => id != cws?.id?.toString())
                              )
                            }
                            style={{
                              cursor: "pointer",
                              color: "#ef4444",
                              fontWeight: "bold",
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                <Button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  size="sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    height: "2.5rem",
                    margin: "1rem 0 .5rem 0",
                    backgroundColor: theme?.primary,
                  }}
                >
                  Stations
                  <span style={{ fontSize: "0.8rem" }}>
                    <i className={`bi bi-chevron-down`}></i>
                  </span>
                </Button>
              </div>

              <div
                className={`dropdown-menu w-100 ${
                  isDropdownOpen ? "show" : ""
                }`}
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  borderColor: theme.primary,
                  width: "100%",
                }}
              >
                <div className="px-3 py-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search CWS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ borderColor: theme.primary }}
                  />
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className={`dropdown-item ${!selectedCws ? "active" : ""}`}
                  onClick={() => {
                    handleCwsSelect("");
                    steSelectedCWSList([]);
                  }}
                  style={{
                    backgroundColor: !selectedCws
                      ? theme.primary
                      : "transparent",
                    color: !selectedCws ? "white" : "inherit",
                  }}
                >
                  All CWS
                </button>
                {filteredCwsList.map((cws) => (
                  <button
                    key={cws.id}
                    className={`dropdown-item ${
                      selectedCws === cws.id.toString() ? "active" : ""
                    }`}
                    onClick={() => handleCwsSelect(cws.id.toString())}
                    style={{
                      backgroundColor:
                        selectedCws === cws.id.toString()
                          ? theme.primary
                          : "transparent",
                      color:
                        selectedCws === cws.id.toString() ? "white" : "inherit",
                    }}
                  >
                    {cws.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Total KGs</h6>
              <h4 className="card-title mb-0">
                {totals.totalKgs.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Total (RWF)</h6>
              <h4 className="card-title mb-0">
                {totals.totalPrice.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Cherry (RWF)</h6>
              <h4 className="card-title mb-0">
                {totals.totalCherryPrice.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Transport (RWF)</h6>
              <h4 className="card-title mb-0">
                {totals.totalTransportFee.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Commission (RWF)</h6>
              <h4 className="card-title mb-0">
                {totals.totalCommissionFee.toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
        <div className="col">
          <div
            className="card h-100"
            style={{ backgroundColor: theme.neutral }}
          >
            <div className="card-body">
              <h6 className="card-subtitle mb-2">Total Stations</h6>
              <h4 className="card-title mb-0">
                {selectedCWSList.length > 0
                  ? selectedCWSList?.length
                  : stationCount}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr style={{ backgroundColor: theme.neutral }}>
                  <th className="fw-semibold">#</th>
                  <th>CWS Name</th>
                  <th className="text-end">Average Price/Kg</th>
                  <th className="text-end">Total KGs</th>
                  <th className="text-end">Total Amount (RWF)</th>
                  <th className="text-end">Cherry Amount (RWF)</th>
                  <th className="text-end">Transport Amount (RWF)</th>
                  <th className="text-end">Commission Amount (RWF)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(20)
                    .fill(0)
                    .map((_, index) => <SkeletonRow key={index} cols={8} />)
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center text-danger">
                      {error}
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((purchase, index) => (
                    <tr key={index}>
                      <td className="fw-semibold">{index + 1}</td>
                      <td>{purchase.cwsName}</td>
                      <td className="text-end">
                        {purchase.averagePricePerKg.toFixed(2)}
                      </td>
                      <td className="text-end">
                        {purchase.totalKgs.toLocaleString()}
                      </td>
                      <td className="text-end">
                        {purchase.totalPrice.toLocaleString()}
                      </td>
                      <td className="text-end">
                        {purchase.totalCherryPrice.toLocaleString()}
                      </td>
                      <td className="text-end">
                        {purchase.totalTransportFee.toLocaleString()}
                      </td>
                      <td className="text-end">
                        {purchase.totalCommissionFee.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyState />
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination with updated styling */}
          {!loading && !error && filteredPurchases.length > itemsPerPage && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      color: theme.primary,
                      borderColor: theme.primary,
                    }}
                  >
                    Previous
                  </button>
                </li>
                {[
                  ...Array(Math.ceil(filteredPurchases.length / itemsPerPage)),
                ].map((_, index) => (
                  <li
                    key={index + 1}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(index + 1)}
                      style={{
                        backgroundColor:
                          currentPage === index + 1 ? theme.primary : "white",
                        borderColor: theme.primary,
                        color:
                          currentPage === index + 1 ? "white" : theme.primary,
                      }}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage ===
                    Math.ceil(filteredPurchases.length / itemsPerPage)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      Math.ceil(filteredPurchases.length / itemsPerPage)
                    }
                    style={{
                      color: theme.primary,
                      borderColor: theme.primary,
                    }}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseByStation;
