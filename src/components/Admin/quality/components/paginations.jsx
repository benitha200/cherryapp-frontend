export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  paginationStyle = {
    activePageLink: {
      backgroundColor: "#008080",
      borderColor: "#008080",
      color: "white",
    },
    pageLink: {
      color: "#4FB3B3",
      border: `1px solid "#008080" `,
      ":hover": {
        backgroundColor: "#008080",
      },
    },
  },
}) => {
  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageItems = () => {
    if (totalPages <= 1) return [];

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    if (currentPage - delta > 1) {
      rangeWithDots.push(1);
      if (currentPage - delta > 2) {
        rangeWithDots.push("...");
      }
    }

    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }

    if (currentPage + delta < totalPages) {
      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4 px-3">
      <div className="text-muted">
        Showing {from} to {to} of {totalItems} entries
      </div>
      <nav>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={
                currentPage === 1
                  ? paginationStyle.disabledPageLink
                  : paginationStyle.pageLink
              }
            >
              Previous
            </button>
          </li>
          {getPageItems().map((item, idx) => (
            <li
              key={idx}
              className={`page-item ${item === currentPage ? "active" : ""}`}
            >
              {item === "..." ? (
                <span className="page-link" style={paginationStyle.pageLink}>
                  ...
                </span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => onPageChange(item)}
                  style={
                    item === currentPage
                      ? paginationStyle.activePageLink
                      : paginationStyle.pageLink
                  }
                >
                  {item}
                </button>
              )}
            </li>
          ))}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={
                currentPage === totalPages
                  ? paginationStyle.disabledPageLink
                  : paginationStyle.pageLink
              }
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
