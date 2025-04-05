import { Table, Button } from "react-bootstrap";

interface FontListProps {
  fonts: { name: string; url: string }[];
  onDelete: (fontName: string) => void;
}

const FontList: React.FC<FontListProps> = ({ fonts, onDelete }) => {
  return (
    <div className="mt-4">
      <h4>Our Fonts</h4>
      <p>Browse a list of Zepto fonts to build your font group.</p>

      {/* Dynamically inject font-face styles */}
      <style>
        {fonts
          .map((font) => {
            const sanitizedFontName = font.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9]/g, "-");

            console.log("sanitizedFontName", sanitizedFontName);
            console.log("sanitizedFontName", typeof sanitizedFontName);

            return `
              @font-face {
                font-family: '${sanitizedFontName}';
                src: url('${font.url}') format('truetype');
                font-display: swap;
              }
            `;
          })
          .join("\n")}
      </style>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Font Name</th>
            <th>Preview</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fonts.map((font, index) => {
            const sanitizedFontName = font.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9]/g, "-");

            return (
              <tr key={index}>
                <td>{font.name}</td>
                <td>
                  <span
                    style={{ fontFamily: sanitizedFontName, fontSize: "16px" }}
                  >
                    Example Style
                  </span>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(font.name)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default FontList;
