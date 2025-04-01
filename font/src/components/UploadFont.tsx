import { useState } from "react";
import { Form } from "react-bootstrap";

import { CloudUpload } from "react-bootstrap-icons";
import FontList from "./FontList";
const UploadFont = () => {
  const [fonts, setFonts] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    console.log("uploadedFile", uploadedFile);

    if (uploadedFile && uploadedFile.name.toLowerCase().endsWith(".ttf")) {
      const url = URL.createObjectURL(uploadedFile);
      setFonts((prevFonts) => [...prevFonts, { name: uploadedFile.name, url }]);
      setError("");
    } else {
      setError("Only TTF files are allowed.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith(".ttf")) {
      const url = URL.createObjectURL(droppedFile);
      setFonts((prevFonts) => [...prevFonts, { name: droppedFile.name, url }]);
      setError("");
    } else {
      setError("Only TTF files are allowed.");
    }
  };

  const handleDelete = (fontName: string) => {
    setFonts((prevFonts) => prevFonts.filter((font) => font.name !== fontName));
  };

  return (
    <div className="container mt-4">
      <div
        className="d-flex flex-column align-items-center justify-content-center border rounded p-5"
        style={{ width: "100%", height: "150px", borderStyle: "dashed" }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <span>
          <CloudUpload size={40} className="text-secondary" />
        </span>

        <Form.Label
          htmlFor="file-upload"
          className="text-primary cursor-pointer"
        >
          Click to upload
        </Form.Label>
        <span className="text-muted">or drag and drop</span>
        <span className="text-muted">Only TTF File Allowed</span>
        <Form.Control
          type="file"
          id="file-upload"
          accept=".ttf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
      <FontList fonts={fonts} onDelete={handleDelete} />
    </div>
  );
};

export default UploadFont;
