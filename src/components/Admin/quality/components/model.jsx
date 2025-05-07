import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const GenericModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  message,
  confirmButtonText,
  confirmButtonColor,
  cancelButtonText = "Cancel",
  cancelButtonColor = "secondary",
}) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <p>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant={cancelButtonColor} onClick={onClose}>
          {cancelButtonText}
        </Button>
        <Button
          variant={confirmButtonColor}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Loading...
            </>
          ) : (
            confirmButtonText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenericModal;
