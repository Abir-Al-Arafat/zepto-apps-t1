import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";

interface Font {
  name: string;
  url: string;
}

interface FontGroupProps {
  availableFonts: Font[];
  onGroupCreated?: () => void;
  initialGroup?: { name: string; fonts: string[] };
}

const FontGroup: React.FC<FontGroupProps> = ({
  availableFonts,
  onGroupCreated,
  initialGroup,
}) => {
  const [fontRows, setFontRows] = useState([{ id: Date.now(), font: "" }]);
  const [groupTitle, setGroupTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialGroup) {
      setGroupTitle(initialGroup.name);
      setFontRows(
        initialGroup.fonts.map((font) => ({
          id: Date.now() + Math.random(),
          font,
        }))
      );
    }
  }, [initialGroup]);

  const handleAddRow = () => {
    setFontRows([...fontRows, { id: Date.now(), font: "" }]);
  };

  const handleRemoveRow = (id: number) => {
    if (fontRows.length > 1) {
      setFontRows(fontRows.filter((row) => row.id !== id));
    }
  };

  const handleFontChange = (id: number, font: string) => {
    setFontRows(
      fontRows.map((row) => (row.id === id ? { ...row, font } : row))
    );
  };

  const handleSubmit = async () => {
    const selectedFonts = fontRows
      .filter((row) => row.font !== "")
      .map((row) => row.font);

    if (selectedFonts.length < 2) {
      setError("You must select at least two fonts.");
      return;
    }

    if (!groupTitle.trim()) {
      setError("Group title is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const url = initialGroup
        ? "http://localhost:5001/edit-group"
        : "http://localhost:5001/create-group";

      const method = initialGroup ? "PUT" : "POST";

      const body = initialGroup
        ? {
            oldName: initialGroup.name,
            newName: groupTitle,
            fonts: selectedFonts,
          }
        : {
            name: groupTitle,
            fonts: selectedFonts,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setGroupTitle("");
        setFontRows([{ id: Date.now(), font: "" }]);
        onGroupCreated?.();
      } else {
        setError(data.message || "Failed to save group");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h4>Create Font Group</h4>
      <p>You have to select at least two fonts</p>

      <Form.Control
        type="text"
        placeholder="Group Title"
        value={groupTitle}
        onChange={(e) => setGroupTitle(e.target.value)}
        className="mb-3"
      />

      {fontRows.map((row) => (
        <Row key={row.id} className="mb-2 align-items-center">
          <Col xs={1}>☰</Col>
          <Col xs={5}>
            <Form.Control
              type="text"
              placeholder="Font Name"
              value={row.font}
              readOnly
            />
          </Col>
          <Col xs={5}>
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
          <Col xs={1} className="d-flex justify-content-center">
            {fontRows.length > 1 && (
              <XCircle
                size={20}
                color="red"
                className="cursor-pointer"
                onClick={() => handleRemoveRow(row.id)}
              />
            )}
          </Col>
        </Row>
      ))}

      <Button variant="success" onClick={handleAddRow} className="mt-2">
        + Add Row
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        className="mt-2 ms-2"
        disabled={loading}
      >
        {initialGroup ? "Edit Group" : "Create Group"}
      </Button>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default FontGroup;
