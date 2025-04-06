import { useEffect, useState } from "react";
import { Table, Button, Alert } from "react-bootstrap";

interface FontGroup {
  name: string;
  fonts: string[];
}

const FontGroupList: React.FC = () => {
  const [fontGroups, setFontGroups] = useState<FontGroup[]>([]);
  const [error, setError] = useState("");

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

  const handleEdit = async (group: FontGroup) => {
    const newTitle = prompt("Edit Group Title", group.name);
    if (!newTitle || newTitle === group.name) return;

    const selectedFonts = group.fonts; // Assuming fonts won't change, else you could allow font changes as well.

    try {
      const res = await fetch("http://localhost:5001/edit-group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldName: group.name,
          newName: newTitle,
          fonts: selectedFonts,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update the group name locally after successful edit
        setFontGroups((prevGroups) =>
          prevGroups.map((g) =>
            g.name === group.name ? { ...g, name: newTitle } : g
          )
        );
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Edit failed.");
    }
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
    </div>
  );
};

export default FontGroupList;
