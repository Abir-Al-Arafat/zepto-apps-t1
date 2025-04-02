import { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";

interface Font {
  name: string;
  url: string;
}

interface FontGroupProps {
  availableFonts: Font[];
}

const FontGroup: React.FC<FontGroupProps> = ({ availableFonts }) => {
  const [fontRows, setFontRows] = useState([{ id: Date.now(), font: "" }]);
  const [groupTitle, setGroupTitle] = useState("");
  const [error, setError] = useState("");

  const handleAddRow = () => {
    setFontRows([...fontRows, { id: Date.now(), font: "" }]);
  };

  const handleFontChange = (id: number, font: string) => {
    setFontRows(
      fontRows.map((row) => (row.id === id ? { ...row, font } : row))
    );
  };

  const handleSubmit = () => {
    const selectedFonts = fontRows
      .filter((row) => row.font !== "")
      .map((row) => row.font);

    if (selectedFonts.length < 2) {
      setError("You must select at least two fonts.");
      return;
    }

    setError("");
    console.log("Font Group Created:", {
      title: groupTitle,
      fonts: selectedFonts,
    });
  };

  return (
    <div className="p-4 border rounded">
      <h4>Create Font Group</h4>
      <p>You have to select at least two fonts</p>

      {/* Group Title */}
      <Form.Control
        type="text"
        placeholder="Group Title"
        value={groupTitle}
        onChange={(e) => setGroupTitle(e.target.value)}
        className="mb-3"
      />

      {/* Font Selection Rows */}
      {fontRows.map((row) => (
        <Row key={row.id} className="mb-2">
          <Col xs={1} className="d-flex align-items-center">
            ☰
          </Col>
          <Col xs={5}>
            <Form.Control
              type="text"
              placeholder="Font Name"
              value={row.font}
              readOnly
            />
          </Col>
          <Col xs={6}>
            <Form.Select
              value={row.font}
              onChange={(e) => handleFontChange(row.id, e.target.value)}
            >
              <option value="">Select a Font</option>
              {availableFonts.map((font, index) => (
                <option key={index} value={font.name}>
                  {font.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      ))}

      {/* Add Row Button */}
      <Button variant="success" onClick={handleAddRow} className="mt-2">
        + Add Row
      </Button>

      {/* Submit Button */}
      <Button variant="primary" onClick={handleSubmit} className="mt-2 ms-2">
        Create Group
      </Button>

      {/* Validation Error */}
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default FontGroup;
