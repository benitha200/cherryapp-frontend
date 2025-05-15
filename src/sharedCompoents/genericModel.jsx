import { Modal, Button } from "react-bootstrap";

const processingTheme = {
  primary: "#008080",
  secondary: "#4FB3B3",
  accent: "#D95032",
  neutral: "#E6F3F3",
  tableHover: "#F8FAFA",
  directDelivery: "#4FB3B3",
  centralStation: "#008080",
  buttonHover: "#006666",
  tableHeader: "#E0EEEE",
  tableBorder: "#D1E0E0",
  emptyStateBackground: "#F5FAFA",
};

export const GenericModel = ({
  children,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  modalSize = "lg",
  onConfirmDisalbe = false,
}) => {
  return (
    <Modal show={isOpen} onHide={onClose} size={modalSize}>
      <Modal.Header
        style={{
          backgroundColor: processingTheme.neutral,
          borderBottom: `1px solid ${processingTheme.primary}`,
        }}
      >
        <Modal.Title style={{ color: processingTheme.primary }}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer style={{ backgroundColor: processingTheme.neutral }}>
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelButtonText}
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            disabled={isLoading || onConfirmDisalbe}
          >
            {confirmButtonText}
          </Button>
        </>
      </Modal.Footer>
    </Modal>
  );
};
