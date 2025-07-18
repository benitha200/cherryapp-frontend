import React, { useState } from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';

const CSVExporter = ({ 
  columns, 
  data, 
  filename = 'export', 
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If the value contains comma, newline, or double quote, wrap in quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // Escape double quotes by doubling them
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  const generateCSV = () => {
    if (!columns || !data || data.length === 0) {
      console.warn('No data or columns provided for CSV export');
      return '';
    }

    // Create header row
    const headers = columns.map(col => escapeCSVValue(col.header));
    const csvContent = [headers.join(',')];

    // Create data rows
    data.forEach(row => {
      const values = columns.map(col => {
        const value = row[col.field];
        return escapeCSVValue(value);
      });
      csvContent.push(values.join(','));
    });

    return csvContent.join('\n');
  };

  const downloadCSV = async () => {
    if (!columns || !data) {
      console.error('Missing columns or data for CSV export');
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Style variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonClasses = `
    inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 
    focus:ring-blue-500 focus:ring-offset-2 ${variants[variant]} ${sizes[size]} ${className}
  `;

  return (
    <button
      onClick={downloadCSV}
      disabled={isExporting || !data || data.length === 0}
      className={buttonClasses}
      title={`Export ${data?.length || 0} records to CSV`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          Exporting...
        </>
      ) : exportSuccess ? (
        <>
          <CheckCircle className={iconSizes[size]} />
          Exported!
        </>
      ) : (
        <>
          <Download className={iconSizes[size]} />
          Export CSV
        </>
      )}
    </button>
  );
};

// Demo component to show usage
const CSVExportDemo = () => {
  // Example data structure matching your format
  const columns = [
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
    {
      field: "status",
      header: "Status",
    },
    {
      field: "last_updated",
      header: "Last Updated",
    }
  ];

  const sampleData = [
    {
      cws_name: "Nyabugogo CWS",
      total_kgs: 1250.5,
      transitKgs: 300.2,
      status: "Active",
      last_updated: "2024-07-17"
    },
    {
      cws_name: "Kimisagara CWS",
      total_kgs: 890.0,
      transitKgs: 150.8,
      status: "Pending",
      last_updated: "2024-07-16"
    },
    {
      cws_name: "Gisozi CWS",
      total_kgs: 2100.7,
      transitKgs: 450.3,
      status: "Active",
      last_updated: "2024-07-17"
    },
    {
      cws_name: "Kacyiru CWS",
      total_kgs: 1680.4,
      transitKgs: 200.1,
      status: "Maintenance",
      last_updated: "2024-07-15"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CSV Export Component</h1>
        <p className="text-gray-600 mb-4">
          A powerful component for exporting your data to CSV format with custom headers and proper formatting.
        </p>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <CSVExporter
            columns={columns}
            data={sampleData}
            filename="cws_transport_data"
            variant="primary"
            size="md"
          />
          <CSVExporter
            columns={columns}
            data={sampleData}
            filename="cws_data_outline"
            variant="outline"
            size="md"
          />
          <CSVExporter
            columns={columns}
            data={sampleData}
            filename="cws_data_small"
            variant="success"
            size="sm"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Sample Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {columns.map((col, index) => (
                    <th key={index} className="text-left py-2 px-3 font-medium text-gray-700 text-sm">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="py-2 px-3 text-sm text-gray-600">
                        {row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Usage Example</h3>
          <pre className="text-sm text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
{`const columns = [
  { field: "cws_name", header: "CWS" },
  { field: "total_kgs", header: "Transported (kg)" },
  { field: "transitKgs", header: "In Transit (kg)" }
];

<CSVExporter
  columns={columns}
  data={yourData}
  filename="my_export"
  variant="primary"
  size="md"
/>`}
          </pre>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Custom Headers</h3>
              <p className="text-sm text-gray-600">Define custom column headers different from field names</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Proper CSV Formatting</h3>
              <p className="text-sm text-gray-600">Handles commas, quotes, and special characters correctly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Multiple Variants</h3>
              <p className="text-sm text-gray-600">Different button styles and sizes for various use cases</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-orange-600 rounded mt-0.5 flex-shrink-0"></div>
            <div>
              <h3 className="font-medium text-gray-900">Export Feedback</h3>
              <p className="text-sm text-gray-600">Loading states and success indicators for better UX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVExportDemo;