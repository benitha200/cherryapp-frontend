import { Pagination } from "../../../../../sharedCompoents/paginations";
import ReusableTable from "../../../../../sharedCompoents/reusableTable";
import { Columns } from "./tableHeading";
import { GetGeneralReport } from "../action";
import ProcessingTableSkeletonLoader from "./LoderSkeleton";
import { useState, useMemo, useEffect } from "react";

export const GeneralReportTable = () => {
  const { isPending, data } = GetGeneralReport();
  const [querySearcy, setQuerySearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // filter states
  const [filters, setFilters] = useState({
    process: "",
    washingStation: "",
    batch: "",
    grade: "",
    dateRange: {
      startDate: "",
      endDate: "",
      month: "",
    },
  });

  const flattenBatchData = (batchData) => {
    if (!batchData || !Array.isArray(batchData)) return [];

    const flattened = [];

    batchData.forEach((batch) => {
      if (batch.subBatches && Array.isArray(batch.subBatches)) {
        batch.subBatches.forEach((subBatch) => {
          flattened.push({
            ...subBatch,
            purchaseInfo: batch.purchaseInfo,
            purchaseBatchNo: batch.purchaseBatchNo,
            flowAnalysis: batch.flowAnalysis,
            hasWetTransfer: subBatch.hasWetTransfer || false,
            hasQualityTesting: subBatch.hasQualityTesting || false,
            hasQualityDeliveryTesting:
              subBatch.hasQualityDeliveryTesting || false,
          });
        });
      }
    });

    return flattened;
  };

  const flattenedData = flattenBatchData(data?.data);

  const filteredData = useMemo(() => {
    if (!flattenedData) return [];

    return flattenedData.filter((item) => {
      if (
        filters.process &&
        item?.processing?.processingType !== filters.process
      ) {
        return false;
      }

      if (
        filters.washingStation &&
        !item?.purchaseInfo?.cwsName
          ?.toLowerCase()
          .includes(filters.washingStation.toLowerCase())
      ) {
        return false;
      }

      if (
        filters.batch &&
        !item?.purchaseBatchNo
          ?.toLowerCase()
          .includes(filters.batch.toLowerCase()) &&
        !item?.batchNo?.toLowerCase().includes(filters.batch.toLowerCase())
      ) {
        return false;
      }

      if (filters.grade) {
        const sampleProfile = item?.transfer?.[0]?.cupProfile || "";
        const deliveryProfile = item?.qualityDelivery?.[0]?.category || "";

        if (
          !sampleProfile.includes(filters.grade) &&
          !deliveryProfile.includes(filters.grade)
        ) {
          return false;
        }
      }

      if (
        filters.dateRange.startDate ||
        filters.dateRange.endDate ||
        filters.dateRange.month
      ) {
        const purchaseDate = new Date(item?.purchaseInfo?.purchaseDate);

        if (filters.dateRange.startDate) {
          const startDate = new Date(filters.dateRange.startDate);
          if (purchaseDate < startDate) return false;
        }

        if (filters.dateRange.endDate) {
          const endDate = new Date(filters.dateRange.endDate);
          if (purchaseDate > endDate) return false;
        }

        if (filters.dateRange.month) {
          const selectedMonth = new Date(filters.dateRange.month);
          if (
            purchaseDate.getMonth() !== selectedMonth.getMonth() ||
            purchaseDate.getFullYear() !== selectedMonth.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [flattenedData, filters]);

  // Calculate pagination values
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, querySearcy]);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Ensure current page is valid when filtered data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getUniqueValues = (data, path) => {
    const values = new Set();
    data?.forEach((item) => {
      const value = path.split(".").reduce((obj, key) => obj?.[key], item);
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  const uniqueProcessTypes = getUniqueValues(
    flattenedData,
    "processing.processingType"
  );
  const uniqueWashingStations = getUniqueValues(
    flattenedData,
    "purchaseInfo.cwsName"
  );
  const uniqueGrades = [
    ...getUniqueValues(flattenedData, "transfer.0.cupProfile"),
    ...getUniqueValues(flattenedData, "qualityDelivery.0.category"),
  ].filter((value, index, self) => self.indexOf(value) === index);

  const handleFilterChange = (filterType, value) => {
    if (filterType.startsWith("dateRange.")) {
      const dateField = filterType.split(".")[1];
      setFilters((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateField]: value,
        },
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      process: "",
      washingStation: "",
      batch: "",
      grade: "",
      dateRange: {
        startDate: "",
        endDate: "",
        month: "",
      },
    });
    setQuerySearch("");
  };

  function handBatchSearch(value) {
    setQuerySearch(value);
    handleFilterChange("batch", value);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
  };

  if (isPending) {
    return <ProcessingTableSkeletonLoader rows={5} />;
  }

  return (
    <>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h5 style={{ margin: 0, color: "#495057" }}>Filters</h5>
          <button
            onClick={clearFilters}
            style={{
              background: "none",
              border: "1px solid #6c757d",
              color: "#6c757d",
              padding: "0.375rem 0.75rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Clear All
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Process
            </label>
            <select
              value={filters.process}
              onChange={(e) => handleFilterChange("process", e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            >
              <option value="">All Processes</option>
              {uniqueProcessTypes.map((type) => (
                <option key={type} value={type}>
                  {type?.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Washing Station
            </label>
            <select
              value={filters.washingStation}
              onChange={(e) =>
                handleFilterChange("washingStation", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            >
              <option value="">All Stations</option>
              {uniqueWashingStations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Grade
            </label>
            <select
              value={filters.grade}
              onChange={(e) => handleFilterChange("grade", e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            >
              <option value="">All Capping Score</option>
              {uniqueGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange.startDate}
              onChange={(e) =>
                handleFilterChange("dateRange.startDate", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange.endDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                handleFilterChange("dateRange.endDate", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
                fontSize: "0.875rem",
              }}
            >
              Month
            </label>
            <input
              type="month"
              value={filters.dateRange.month}
              max={new Date().toISOString().split("T")[0].slice(0, 7)}
              onChange={(e) =>
                handleFilterChange("dateRange.month", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: "#ffffff",
                color: "#374151",
                outline: "none",
                transition: "all 0.2s ease-in-out",
                cursor: "pointer",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
              }}
            />
          </div>
        </div>

        {/* Filter Summary */}
        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: "#6c757d",
            fontWeight: "bold",
          }}
        >
          Showing {paginatedData.length} of {filteredData.length} filtered
          records ({flattenedData.length} total records)
        </div>
      </div>

      <ReusableTable
        columns={Columns}
        data={paginatedData}
        onPageSizeChange={handlePageSizeChange}
        searchQuery={querySearcy}
        setSearchQuery={handBatchSearch}
        pageSizeOption={[25, 50, 100, 200]}
        itemsPerPage={itemsPerPage}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </ReusableTable>
    </>
  );
};
