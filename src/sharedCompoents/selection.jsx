import { Col, Form } from "react-bootstrap";

export const SelectionBox = ({
  handleSelection,
  disable,
  placeHolder,
  selectionOPtions,
}) => {
  return (
    <Col md={2}>
      <Form.Select
        onChange={(e) => handleSelection(e.target.value)}
        disabled={disable}
      >
        {selectionOPtions?.map((type) => (
          <option
            disabled={type == `${placeHolder}`}
            key={type == `${placeHolder}` ? `${placeHolder}` : type}
            value={type == `${placeHolder}` ? "" : type}
          >
            {type}
          </option>
        ))}
      </Form.Select>
    </Col>
  );
};
