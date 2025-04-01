import { useState } from "react";
import { Form } from "react-bootstrap";

import { CloudUpload } from "react-bootstrap-icons";

const UploadFont = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  console.log("file", file);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    console.log("uploadedFile", uploadedFile);

    if (uploadedFile && uploadedFile.name.toLowerCase().endsWith(".ttf")) {
      setFile(uploadedFile);
      setError("");
    } else {
      setFile(null);
      setError("Only TTF files are allowed.");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".ttf")) {
      setFile(droppedFile);
      setError("");
    } else {
      setFile(null);
      setError("Only TTF files are allowed.");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center border rounded p-5"
      style={{ width: "100%", height: "150px", borderStyle: "dashed" }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <span>
        <CloudUpload size={40} className="text-secondary" />
      </span>

      <Form.Label htmlFor="file-upload" className="text-primary cursor-pointer">
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
      <CloudUpload />
      {file && <p className="text-success mt-2">Uploaded: {file.name}</p>}
      {error && <p className="text-danger mt-2">{error}</p>}
      <i className="bi bi-cloud-upload"></i>
    </div>
  );
};

export default UploadFont;
