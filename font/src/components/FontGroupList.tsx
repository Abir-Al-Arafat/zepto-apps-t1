import { useEffect, useState } from "react";
import { Table, Button, Alert, Modal, Form } from "react-bootstrap";

interface FontGroup {
  name: string;
  fonts: string[];
}

const FontGroupList: React.FC = () => {
  const [fontGroups, setFontGroups] = useState<FontGroup[]>([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<FontGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFonts, setSelectedFonts] = useState<string[]>([]);

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:5001/groups");
      const data = await res.json();
      if (data.success) {
        setFontGroups(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to fetch font groups.");
    }
  };

  const handleDelete = async (groupName: string) => {
    try {
      const res = await fetch(
        `http://localhost:5001/delete-group?name=${groupName}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        setFontGroups((prev) => prev.filter((g) => g.name !== groupName));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleEdit = (group: FontGroup) => {
    setSelectedGroup(group);
    setNewGroupName(group.name);
    setSelectedFonts(group.fonts);
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleModalSave = async () => {
    if (!newGroupName.trim()) {
      setError("Group name is required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/edit-group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldName: selectedGroup?.name,
          newName: newGroupName,
          fonts: selectedFonts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFontGroups((prevGroups) =>
          prevGroups.map((g) =>
            g.name === selectedGroup?.name
              ? { ...g, name: newGroupName, fonts: selectedFonts }
              : g
          )
        );
        setShowModal(false); // Close modal after saving
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Edit failed.");
    }
  };

  const handleFontSelection = (fontName: string) => {
    setSelectedFonts((prev) =>
      prev.includes(fontName)
        ? prev.filter((font) => font !== fontName)
        : [...prev, fontName]
    );
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="mt-4">
      <h4>Our Font Groups</h4>
      <p>List of all available font groups.</p>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Fonts</th>
            <th>Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fontGroups.map((group) => (
            <tr key={group.name}>
              <td>
                <strong>{group.name}</strong>
              </td>
              <td>{group.fonts.join(", ")}</td>
              <td>{group.fonts.length}</td>
              <td>
                <Button
                  variant="link"
                  className="text-primary me-2"
                  onClick={() => handleEdit(group)}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  className="text-danger"
                  onClick={() => handleDelete(group.name)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for editing font group */}
      {selectedGroup && (
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Font Group</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="groupName">
                <Form.Label>Group Name</Form.Label>
                <Form.Control
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="fontSelection" className="mt-3">
                <Form.Label>Select Fonts</Form.Label>
                {fontGroups
                  .flatMap((group) => group.fonts)
                  .map((font) => (
                    <Form.Check
                      type="checkbox"
                      key={font}
                      label={font}
                      checked={selectedFonts.includes(font)}
                      onChange={() => handleFontSelection(font)}
                    />
                  ))}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleModalSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default FontGroupList;
