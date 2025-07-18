import { useState } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { Button, Spinner } from 'react-bootstrap';

const CSVExporter = ({
  columns,
  data,
  filename = 'export',
  buttonName = 'Download',
  className = '',
  variant = 'primary',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const generateCSV = () => {
    if (!columns || !data || data.length === 0) return '';

    const headers = columns.map(col => escapeCSVValue(col.header));
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const rowData = columns.map(col => {
        let value = '';

        const renderFn = col.render || col.reder; // support both spellings

        if (typeof renderFn === 'function') {
          value = renderFn(row);
        } else if (col.field && row[col.field] !== undefined) {
          value = row[col.field];
        }

        return escapeCSVValue(value);
      });

      csvRows.push(rowData.join(','));
    });

    return csvRows.join('\n');
  };

  const downloadCSV = async () => {
    if (!columns || !data) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error('CSV Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={downloadCSV}
      disabled={isExporting || !data || data.length === 0}
      variant={exportSuccess ? 'success' : variant}
      size={size}
      title={`Export ${data?.length || 0} records to CSV`}
      className={`d-inline-flex align-items-center gap-2 px-3 py-2 rounded ${className}`}
    >
      {isExporting ? (
        <>
          <Spinner
            animation="border"
            size="sm"
            role="status"
            className="me-2"
            style={{ borderWidth: '2px' }}
          />
          Exporting...
        </>
      ) : exportSuccess ? (
        <>
          <CheckCircle size={16} className="text-light me-1" />
          Exported!
        </>
      ) : (
        <>
          <Download size={16} className="me-1" />
          {buttonName}
        </>
      )}
    </Button>
  );
};

export default CSVExporter;
