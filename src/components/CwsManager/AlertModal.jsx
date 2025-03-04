import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const AlertModal = ({ show, onHide, title, message, buttonText = "OKAY" }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="sucafina" onClick={onHide}>
                    {buttonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AlertModal;