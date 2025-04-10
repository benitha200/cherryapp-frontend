import React from 'react';
import { Card, Button, Container, Row, Col, DropdownToggle } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const processingTheme = {
    primary: '#008080',    // Sucafina teal
    secondary: '#4FB3B3',  // Lighter teal
    neutral: '#E6F3F3',    // Very light teal
    tableHover: '#F8FAFA', // Ultra light teal for table hover
};

const WetTransferBoth = () => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('user'));
    const cwsInfo = JSON.parse(localStorage.getItem('cws'));

    const handleSendClick = () => {
        navigate('/wet-transfer');
    };

    const handleReceiveClick = () => {
        navigate('/wet-transfer-receiver');
    };

    return (
        <Container fluid className="py-5">
            <Row className="justify-content-center">
                <Col xs={12} lg={10} xl={8}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header
                            className="py-3"
                            style={{
                                backgroundColor: processingTheme.neutral,
                                borderBottom: `3px solid ${processingTheme.primary}`
                            }}
                        >
                            <h3 className="m-0" style={{ color: processingTheme.primary }}>Wet Transfer Operations</h3>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <p className="lead">Welcome to the Wet Transfer Center for {cwsInfo?.name || 'your CWS'}</p>
                                <p>Please select whether you would like to send coffee to another CWS or receive coffee from another CWS.</p>
                            </div>

                            <Row className="g-4">
                                <Col xs={12} md={6}>
                                    <Card
                                        className="h-100 border-0 shadow-sm transition-card"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onClick={handleSendClick}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
                                        }}
                                    >
                                        <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                                            <div
                                                className="icon-container mb-3 d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    backgroundColor: processingTheme.neutral,
                                                    width: '80px',
                                                    height: '80px'
                                                }}
                                            >
                                                <i className="bi bi-box-arrow-right fa-2x" style={{ color: processingTheme.primary, fontSize: '2rem' }}></i>
                                            </div>
                                            <h4 className="card-title">Send Coffee</h4>
                                            <p className="text-muted">Transfer processed coffee to another CWS for further processing</p>
                                            <div className="mt-auto pt-3">
                                                <Button
                                                    variant="sucafina"
                                                    className="w-100"
                                                    style={{
                                                        backgroundColor: processingTheme.primary,
                                                        borderColor: processingTheme.primary
                                                    }}
                                                >
                                                    Send Coffee
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col xs={12} md={6}>
                                    <Card
                                        className="h-100 border-0 shadow-sm transition-card"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                        }}
                                        onClick={handleReceiveClick}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
                                        }}
                                    >
                                        <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                                            <div
                                                className="icon-container mb-3 d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    backgroundColor: processingTheme.neutral,
                                                    width: '80px',
                                                    height: '80px'
                                                }}
                                            >
                                                <i className="bi bi-cloud-download fa-2x" style={{ color: processingTheme.primary, fontSize: '2rem' }}></i>
                                            </div>
                                            <h4 className="card-title">Receive Coffee</h4>
                                            <p className="text-muted">Receive transferred coffee for processing and bag off</p>
                                            <div className="mt-auto pt-3">
                                                <Button
                                                    variant="outline-sucafina"
                                                    className="w-100"
                                                    style={{
                                                        color: processingTheme.primary,
                                                        borderColor: processingTheme.primary
                                                    }}
                                                >
                                                    Receive Coffee
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Improved Additional Information Card */}
                    <Card className="shadow-sm border-0">
                        <Card.Header
                            className="py-3"
                            style={{
                                backgroundColor: `${processingTheme.neutral}80`,
                                borderBottom: `2px solid ${processingTheme.primary}80`
                            }}
                        >
                            <h5 className="m-0" style={{ color: processingTheme.primary }}>
                                <i className="bi bi-info-circle me-2"></i>
                                Wet Transfer Process Guide
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="p-3 h-100" style={{ backgroundColor: `${processingTheme.neutral}30`, borderRadius: '8px' }}>
                                        <h6 className="d-flex align-items-center mb-3">
                                            <span className="icon-container d-inline-flex align-items-center justify-content-center me-2 rounded-circle"
                                                style={{
                                                    backgroundColor: `${processingTheme.primary}20`,
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <i className="bi bi-box-arrow-right" style={{ color: processingTheme.primary }}></i>
                                            </span>
                                            Sending Process
                                        </h6>
                                        <ol className="ps-3">
                                            <li className="mb-2">Select batches from your in-progress fully washed processing</li>
                                            <li className="mb-2">Specify output grades (A0, A1) and respective weights</li>
                                            <li className="mb-2">Add moisture percentage for each grade</li>
                                            <li className="mb-2">Choose destination CWS from approved mapping list</li>
                                            <li>Confirm transfer details before submission</li>
                                        </ol>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 h-100" style={{ backgroundColor: `${processingTheme.neutral}30`, borderRadius: '8px' }}>
                                        <h6 className="d-flex align-items-center mb-3">
                                            <span className="icon-container d-inline-flex align-items-center justify-content-center me-2 rounded-circle"
                                                style={{
                                                    backgroundColor: `${processingTheme.primary}20`,
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <i className="bi bi-cloud-download" style={{ color: processingTheme.primary }}></i>
                                            </span>
                                            Receiving Process
                                        </h6>
                                        <ol className="ps-3">
                                            <li className="mb-2">View pending transfers from other CWS stations</li>
                                            <li className="mb-2">Receive batches individually or in bulk</li>
                                            <li className="mb-2">Verify moisture content and grade quality</li>
                                            <li className="mb-2">Process the received coffee through bag off</li>
                                            <li>Track received batches through your inventory system</li>
                                        </ol>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default WetTransferBoth;