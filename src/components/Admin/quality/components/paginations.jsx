import { Pagination as BSPagination } from "react-bootstrap";

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageItems = () => {
    const pages = [];
    const delta = 2;

    const range = [];
    const rangeWithDots = [];
    let l;

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      for (let i = 1; i < Math.max(2, currentPage - delta); i++) {
        rangeWithDots.push(i);
      }
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      for (let i = currentPage + delta + 1; i <= totalPages; i++) {
        rangeWithDots.push(i);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
      <span className="text-muted small mb-2">
        Showing {from} to {to} of {totalItems} entries
      </span>
      <BSPagination className="mb-0">
        <BSPagination.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />
        {getPageItems().map((item, idx) =>
          item === "..." ? (
            <BSPagination.Ellipsis key={`ellipsis-${idx}`} disabled />
          ) : (
            <BSPagination.Item
              key={item}
              active={item === currentPage}
              onClick={() => onPageChange(item)}
            >
              {item}
            </BSPagination.Item>
          )
        )}
        <BSPagination.Next
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
      </BSPagination>
    </div>
  );
};
