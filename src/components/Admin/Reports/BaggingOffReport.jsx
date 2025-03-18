import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../constants/Constants';
import BaggingOffDetailModal from './BaggingOffDetailModal';

const theme = {
    primary: '#008080',
    secondary: '#4FB3B3',
    accent: '#D95032',
    neutral: '#E6F3F3',
    tableHover: '#F8FAFA'
};

// Skeleton loading component
const SkeletonRow = ({ cols }) => (
    <tr>
        {Array(cols).fill(0).map((_, index) => (
            <td key={index}>
                <div className="placeholder-glow">
                    <span className="placeholder col-12"></span>
                </div>
            </td>
        ))}
    </tr>
);

// Empty state component
const EmptyState = ({ message }) => (
    <tr>
        <td colSpan="100%" className="text-center py-4">
            <div className="d-flex flex-column align-items-center">
                <i className="bi bi-box-seam fs-1 text-muted mb-2"></i>
                <p className="text-muted">{message || 'No records found'}</p>
            </div>
        </td>
    </tr>
);

const BaggingOffReport = () => {
    // State for report type selection
    const [reportType, setReportType] = useState('batch'); // 'batch' or 'station'

    // Data states
    const [batchReports, setBatchReports] = useState([]);
    const [stationSummaries, setStationSummaries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleRowClick = (item) => {
        console.log(item);
        setSelectedItem(item);
        setShowDetailModal(true);
    };


    // Filter states
    const [filters, setFilters] = useState({
        batchNo: '',
        station: '',
        processingType: '',
        startDate: '',
        endDate: ''
    });

    // Available options for filters
    const [filterOptions, setFilterOptions] = useState({
        stations: [],
        processingTypes: []
    });

    const [overallMetrics, setOverallMetrics] = useState({
        totalNonNaturalInputKgs: 0,
        totalNonNaturalOutputKgs: 0,
        overallNonNaturalOutturn: 0,
        totalBatches: 0,
        totalStations: 0,
        totalProcessings: 0
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');

            // Fetch batch-wise reports
            const batchResponse = await axios.get(`${API_URL}/bagging-off/report/completed`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (batchResponse.data.reports) {
                setBatchReports(batchResponse.data.reports);
                setOverallMetrics(prev => ({
                    ...prev,
                    totalNonNaturalInputKgs: batchResponse.data.overallMetrics.totalNonNaturalInputKgs,
                    totalNonNaturalOutputKgs: batchResponse.data.overallMetrics.totalNonNaturalOutputKgs,
                    overallNonNaturalOutturn: batchResponse.data.overallMetrics.overallNonNaturalOutturn,
                    totalBatches: batchResponse.data.totalRecords
                }));

                // Extract unique filter options
                const stations = [...new Set(batchResponse.data.reports.map(report => report.batchInfo.station))];
                const processingTypes = [...new Set(batchResponse.data.reports.map(report => report.batchInfo.processingType))];

                setFilterOptions({
                    stations,
                    processingTypes
                });
            }

            // Fetch station-wise summaries
            const stationResponse = await axios.get(`${API_URL}/bagging-off/report/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (stationResponse.data.stationSummaries) {
                setStationSummaries(stationResponse.data.stationSummaries);
                setOverallMetrics(prev => ({
                    ...prev,
                    totalStations: stationResponse.data.overall.totalStations,
                    totalBatches: stationResponse.data.overall.totalBatches,
                    totalProcessings: stationResponse.data.overall.totalProcessings
                }));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error fetching bagging-off reports');
            console.error('Error fetching bagging-off reports:', err);
        } finally {
            setLoading(false);
        }
    };


    const applyFilters = (data) => {
        return data.filter(item => {
            const report = reportType === 'batch' ? item.batchInfo : item;

            if (filters.batchNo && reportType === 'batch' && !report.batchNo.includes(filters.batchNo)) {
                return false;
            }

            if (filters.station && report.station !== filters.station &&
                report.stationName !== filters.station) { // Handle both naming conventions
                return false;
            }

            if (filters.processingType && report.processingType !== filters.processingType) {
                return false;
            }

            if (filters.startDate && filters.endDate && reportType === 'batch') {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                const reportDate = new Date(report.startDate);

                if (reportDate < startDate || reportDate > endDate) {
                    return false;
                }
            }

            return true;
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({
            batchNo: '',
            station: '',
            processingType: '',
            startDate: '',
            endDate: ''
        });
        setCurrentPage(1);
    };

    const handleReportTypeChange = (type) => {
        setReportType(type);
        setCurrentPage(1);
    };

    // Get filtered and paginated data
    const filteredData = reportType === 'batch'
        ? applyFilters(batchReports)
        : applyFilters(stationSummaries);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Downloads
    const downloadTableAsExcel = () => {
        if (filteredData.length === 0) return;

        const filename = `bagging_off_${reportType}_report_${new Date().toISOString().slice(0, 10)}.xls`;
        let htmlContent = '';

        if (reportType === 'batch') {
            htmlContent = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            table { border-collapse: collapse; width: 100%; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: ${theme.neutral}; }
                            .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="title">Batch Out Turns Report</div>
                        <div>Total Batches: ${summaries.totalRecords}</div>
                        <div>Total Input KGs: ${summaries.totalNonNaturalInputKgs.toLocaleString()}</div>
                        <div>Total Output KGs: ${summaries.totalNonNaturalOutputKgs.toLocaleString()}</div>
                        <div>Overall Outturn (Without NATURAL): ${summaries.overallNonNaturalOutturn}%</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Batch No</th>
                                    <th>Station</th>
                                    <th>Processing Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Total Input KGs</th>
                                    <th>Total Output KGs</th>
                                    <th>Outturn</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredData.map(report => `
                                    <tr>
                                        <td>${report.batchInfo.batchNo}</td>
                                        <td>${report.batchInfo.station}</td>
                                        <td>${report.batchInfo.processingType}</td>
                                        <td>${new Date(report.batchInfo.startDate).toLocaleDateString()}</td>
                                        <td>${report.batchInfo.endDate ? new Date(report.batchInfo.endDate).toLocaleDateString() : 'N/A'}</td>
                                        <td>${report.batchInfo.status}</td>
                                        <td>${report.batchInfo.totalInputKgs}</td>
                                        <td>${report.batchInfo.totalOutputKgs}</td>
                                        <td>${report.batchInfo.outturn}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
        } else {
            htmlContent = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            table { border-collapse: collapse; width: 100%; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: ${theme.neutral}; }
                            .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="title">Station-wise Bagging Off Summary</div>
                        <div>Total Stations: ${summaries.totalRecords}</div>
                        <div>Total Input KGs: ${summaries.totalNonNaturalInputKgs.toLocaleString()}</div>
                        <div>Total Output KGs: ${summaries.totalNonNaturalOutputKgs.toLocaleString()}</div>
                        <div>Overall Outturn (Without NATURAL): ${summaries.overallNonNaturalOutturn}%</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Station Name</th>
                                    <th>Total Input KGs</th>
                                    <th>Total Output KGs</th>
                                    <th>Outturn</th>
                                    <th>Processing Types</th>
                                    <th>Grade Breakdown</th>
                                    <th>Total Batches</th>
                                    <th>Total Processings</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredData.map(summary => `
                                    <tr>
                                        <td>${summary.stationName}</td>
                                        <td>${summary.totalNonNaturalInputKgs}</td>
                                        <td>${summary.totalNonNaturalOutputKgs}</td>
                                        <td>${summary.outturn}</td>
                                        <td>${Object.entries(summary.processingTypes).map(([type, kgs]) => `${type}: ${kgs} KGs`).join(', ')}</td>
                                        <td>${Object.entries(summary.gradeBreakdown).map(([grade, kgs]) => `${grade}: ${kgs} KGs`).join(', ')}</td>
                                        <td>${summary.totalBatches}</td>
                                        <td>${summary.totalProcessings}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
        }

        const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadTableAsCSV = () => {
        if (filteredData.length === 0) return;

        const filename = `bagging_off_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
        let headers = [];
        let csvData = [];

        if (reportType === 'batch') {
            headers = [
                'Batch No',
                'Station',
                'Processing Type',
                'Start Date',
                'End Date',
                'Status',
                'Total Input KGs',
                'Total Output KGs',
                'Outturn',
            ];

            csvData = filteredData.map(report => [
                report.batchInfo.batchNo,
                report.batchInfo.station,
                report.batchInfo.processingType,
                new Date(report.batchInfo.startDate).toLocaleDateString(),
                report.batchInfo.endDate ? new Date(report.batchInfo.endDate).toLocaleDateString() : 'N/A',
                report.batchInfo.status,
                report.batchInfo.totalInputKgs,
                report.batchInfo.totalOutputKgs,
                report.batchInfo.outturn
            ]);
        } else {
            headers = [
                'Station Name',
                'Total Input KGs',
                'Total Output KGs',
                'Outturn',
                'Processing Types',
                'Grade Breakdown',
                'Total Batches',
                'Total Processings'
            ];

            csvData = filteredData.map(summary => [
                summary.stationName,
                summary.totalNonNaturalInputKgs,
                summary.totalNonNaturalOutputKgs,
                summary.outturn,
                Object.entries(summary.processingTypes).map(([type, kgs]) => `${type}: ${kgs} KGs`).join('; '),
                Object.entries(summary.gradeBreakdown).map(([grade, kgs]) => `${grade}: ${kgs} KGs`).join('; '),
                summary.totalBatches,
                summary.totalProcessings
            ]);
        }

        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const calculateSummaries = () => {
        if (reportType === 'batch') {
            return {
                totalNonNaturalInputKgs: overallMetrics.totalNonNaturalInputKgs,
                totalNonNaturalOutputKgs: overallMetrics.totalNonNaturalOutputKgs,
                overallNonNaturalOutturn: overallMetrics.overallNonNaturalOutturn,
                totalRecords: overallMetrics.totalBatches
            };
        } else {
            return {
                totalNonNaturalInputKgs: overallMetrics.totalNonNaturalInputKgs,
                totalNonNaturalOutputKgs: overallMetrics.totalNonNaturalOutputKgs,
                overallNonNaturalOutturn: overallMetrics.overallNonNaturalOutturn,
                totalRecords: overallMetrics.totalStations,
                totalBatches: overallMetrics.totalBatches,
                totalProcessings: overallMetrics.totalProcessings
            };
        }
    };

    const summaries = calculateSummaries();

    const renderBatchTable = () => (
        <table className="table table-hover">
            <thead>
                <tr style={{ backgroundColor: theme.neutral }}>
                    <th>Batch No</th>
                    <th>Station</th>
                    <th>Processing Type</th>
                    <th className="text-end">Total Input KGs</th>
                    <th className="text-end">Total Output KGs</th>
                    <th className="text-end">Outturn</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    Array(10).fill(0).map((_, index) => (
                        <SkeletonRow key={index} cols={9} />
                    ))
                ) : currentItems.length > 0 ? (
                    currentItems.map((report, index) => (
                        <tr
                            key={index}
                            style={{ backgroundColor: index % 2 === 0 ? 'white' : theme.tableHover, cursor: 'pointer' }}
                            onClick={() => handleRowClick(report)}
                        >
                            <td>{report.batchInfo.batchNo}</td>
                            <td>{report.batchInfo.station}</td>
                            <td>{report.batchInfo.processingType}</td>
                            <td className="text-end">{report.batchInfo.totalInputKgs.toLocaleString()}</td>
                            <td className="text-end">{report.batchInfo.totalOutputKgs.toLocaleString()}</td>
                            <td
                                style={{
                                    textAlign: 'right',
                                    color: report.batchInfo.outturn >= 20 && report.batchInfo.outturn <= 25 ? theme.primary : 'red',
                                    backgroundColor: theme.neutral,
                                }}
                            >
                                {report.batchInfo.outturn}%
                            </td>
                            <td>{new Date(report.batchInfo.startDate).toLocaleDateString()}</td>
                            <td>{report.batchInfo.endDate ? new Date(report.batchInfo.endDate).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <span className={`badge bg-${report.batchInfo.status === 'Completed' ? 'success' : 'warning'}`}>
                                    {report.batchInfo.status}
                                </span>
                            </td>
                        </tr>
                    ))
                ) : (
                    <EmptyState message="No batch reports found matching your filters" />
                )}
            </tbody>
        </table>
    );


    const renderStationTable = () => (
        <table className="table table-hover">
            <thead>
                <tr style={{ backgroundColor: theme.neutral }}>
                    <th>Station</th>
                    <th className="text-end">Input KGs</th>
                    <th className="text-end">Output KGs</th>
                    <th className="text-end">Outturn</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    Array(5).fill(0).map((_, index) => (
                        <SkeletonRow key={index} cols={4} />
                    ))
                ) : currentItems.length > 0 ? (
                    currentItems.map((summary, index) => (
                        <tr
                            key={index}
                            style={{ backgroundColor: index % 2 === 0 ? 'white' : theme.tableHover, cursor: 'pointer' }}
                            onClick={() => handleRowClick(summary)}
                        >
                            <td>{summary.stationName}</td>
                            <td className="text-end">{summary.nonNaturalInputKgs.toLocaleString()}</td>
                            <td className="text-end">{summary.nonNaturalOutputKgs.toLocaleString()}</td>
                            <td className="text-end">{summary.outturn}%</td>
                        </tr>
                    ))
                ) : (
                    <EmptyState message="No station summaries found matching your filters" />
                )}
            </tbody>
        </table>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Out Turns Report</h2>
                {!loading && !error && filteredData.length > 0 && (
                    <div className="btn-group">
                        <button
                            className="btn btn-primary"
                            onClick={downloadTableAsExcel}
                            style={{
                                backgroundColor: theme.primary,
                                borderColor: theme.primary
                            }}
                        >
                            <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                            Download Excel
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={downloadTableAsCSV}
                            style={{
                                backgroundColor: theme.secondary,
                                borderColor: theme.secondary
                            }}
                        >
                            <i className="bi bi-file-earmark-text me-2"></i>
                            Download CSV
                        </button>
                    </div>
                )}
            </div>

            {/* Report Type Selection */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex align-items-center">
                        <label className="me-3 fw-bold">View Report By:</label>
                        <div className="btn-group">
                            <button
                                className={`btn ${reportType === 'batch' ? 'btn-primary' : 'btn-outline-sucafina'}`}
                                onClick={() => handleReportTypeChange('batch')}
                                style={reportType === 'batch' ? {
                                    backgroundColor: theme.secondary,
                                    borderColor: theme.secondary
                                } : { color: theme.secondary, borderColor: theme.secondary }}
                            >
                                <i className="bi bi-boxes me-2"></i>
                                Batch
                            </button>
                            <button
                                className={`btn ${reportType === 'station' ? 'btn-primary' : 'btn-outline-sucafina'}`}
                                onClick={() => handleReportTypeChange('station')}
                                style={reportType === 'station' ? {
                                    backgroundColor: theme.secondary,
                                    borderColor: theme.secondary
                                } : { color: theme.secondary, borderColor: theme.secondary }}
                            >
                                <i className="bi bi-building me-2"></i>
                                Station
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Filters</h5>
                    <div className="row g-3">
                        {reportType === 'batch' && (
                            <div className="col-md-3">
                                <label className="form-label">Batch No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="batchNo"
                                    value={filters.batchNo}
                                    onChange={handleFilterChange}
                                    placeholder="Enter batch number"
                                />
                            </div>
                        )}

                        <div className="col-md-3">
                            <label className="form-label">Station</label>
                            <select
                                className="form-select"
                                name="station"
                                value={filters.station}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Stations</option>
                                {filterOptions.stations.map((station, index) => (
                                    <option key={index} value={station}>{station}</option>
                                ))}
                            </select>
                        </div>



                        {reportType === 'batch' && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label">Processing Type</label>
                                    <select
                                        className="form-select"
                                        name="processingType"
                                        value={filters.processingType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Types</option>
                                        {filterOptions.processingTypes.map((type, index) => (
                                            <option key={index} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </>
                        )}

                        <div className="col-md-3 d-flex align-items-end">
                            <button
                                className="btn btn-secondary me-2"
                                onClick={clearFilters}
                                style={{ backgroundColor: theme.secondary, borderColor: theme.secondary }}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {!loading && !error && filteredData.length > 0 && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">
                                    {reportType === 'batch' ? 'Total Batches' : 'Total Stations'}
                                </h6>
                                <h4 className="card-text">{summaries.totalRecords}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Input KGs</h6>
                                <h4 className="card-text">{summaries.totalNonNaturalInputKgs.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Output KGs</h6>
                                <h4 className="card-text">{summaries.totalNonNaturalOutputKgs.toLocaleString()}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Overall Outturn (Without NATURAL)</h6>
                                <h4 className="card-text">{summaries.overallNonNaturalOutturn}%</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {loading && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">
                                    {reportType === 'batch' ? 'Total Batches' : 'Total Stations'}
                                </h6>
                                <h4 className="card-text">-</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Input KGs</h6>
                                <h4 className="card-text">-</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Total Output KGs</h6>
                                <h4 className="card-text">-</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card" style={{ backgroundColor: theme.neutral }}>
                            <div className="card-body">
                                <h6 className="card-title">Overall Outturn (Without NATURAL)</h6>
                                <h4 className="card-text">-</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0">
                            {reportType === 'batch' ? 'Batch Out Turns Report' : 'Station Bagging Off Summary'}
                        </h4>

                        <div className="d-flex align-items-center">
                            <span className="me-2">Show</span>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: '80px' }}
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            <span className="ms-2">entries</span>
                        </div>
                    </div>

                    <div className="table-responsive">
                        {reportType === 'batch' ? renderBatchTable() : renderStationTable()}
                    </div>

                    {/* Pagination */}
                    {!loading && !error && filteredData.length > itemsPerPage && (
                        <nav>
                            <ul className="pagination justify-content-center mt-4">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{ color: theme.primary }}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Calculate which page numbers to show
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <li key={i} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(pageNum)}
                                                style={currentPage === pageNum ?
                                                    { backgroundColor: theme.primary, borderColor: theme.primary } :
                                                    { color: theme.primary }}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{ color: theme.primary }}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}
                </div>
                {/* Add BaggingOffDetailModal */}
                <BaggingOffDetailModal
                    show={showDetailModal}
                    onHide={() => setShowDetailModal(false)}
                    data={selectedItem}
                    reportType={reportType}
                />
            </div>
        </div>
    );
};

export default BaggingOffReport;