import { Alert } from "react-bootstrap";

export const Error = ({ error }) => (
  <Alert variant="danger" className="mt-3 text-center">
    {error}
  </Alert>
);

export const Success = ({ message }) => (
  <Alert variant="success" className="mt-3 text-center">
    {message}
  </Alert>
);
