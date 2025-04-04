import { Table, Button } from "react-bootstrap";

interface FontGroup {
  id: number;
  title: string;
  fonts: string[];
}

interface FontGroupListProps {
  fontGroups: FontGroup[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
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
            <tr key={group.id}>
              <td>
                <strong>{group.title}</strong>
              </td>
              <td>{group.fonts.join(", ")}</td>
              <td>{group.fonts.length}</td>
              <td>
                <Button
                  variant="link"
                  className="text-primary me-2"
                  onClick={() => onEdit(group.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="link"
                  className="text-danger"
                  onClick={() => onDelete(group.id)}
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
