import { Table, Button } from "react-bootstrap";

interface FontGroup {
  name: string;
  fonts: string[];
}

interface FontGroupListProps {
  fontGroups: FontGroup[];
  onEdit: (group: FontGroup) => void;
  onDelete: (name: string) => void;
}

const FontGroupList: React.FC<FontGroupListProps> = ({
  fontGroups,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mt-4">
      <h4>Our Font Groups</h4>
      <p>List of all available font groups.</p>

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
                  onClick={() => onEdit(group)}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  className="text-danger"
                  onClick={() => onDelete(group.name)}
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
