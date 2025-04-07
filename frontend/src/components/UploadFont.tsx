import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

import { CloudUpload } from "react-bootstrap-icons";
import FontList from "./FontList";
// import FontGroup from "./FontGroup";
import FontGroupsContainer from "./FontGroupsContainer";
const UploadFont = () => {
  const [fonts, setFonts] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.toLowerCase().endsWith(".ttf")) {
      setError("Only TTF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        const url = URL.createObjectURL(uploadedFile);
        setFonts((prevFonts) => [
          ...prevFonts,
          { name: uploadedFile.name, url },
        ]);
        setError("");
      } else {
        setError(result.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!droppedFile.name.toLowerCase().endsWith(".ttf")) {
      setError("Only TTF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", droppedFile);

    try {
      const response = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        const url = URL.createObjectURL(droppedFile);
        setFonts((prevFonts) => [
          ...prevFonts,
          { name: droppedFile.name, url },
        ]);
        setError("");
      } else {
        setError(result.message || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
    }
  };

  const fetchFonts = async () => {
    try {
      const response = await fetch("http://localhost:5001/fonts");
      const result = await response.json();

      if (result.success && result.data) {
        const formattedFonts = result.data.map(
          (font: { name: string; path: string }) => ({
            name: font.name,
            url: `http://localhost:5001${font.path}`, // 👈 Build full font URL
          })
        );

        setFonts(formattedFonts); // Pass this into <FontList fonts={fonts} />
      }
    } catch (error) {
      console.error("Failed to fetch fonts:", error);
    }
  };
  useEffect(() => {
    fetchFonts();
  }, []);
  // 🧨 DELETE API Integration
  const handleDelete = async (fontName: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/delete-font?name=${encodeURIComponent(
          fontName
        )}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setFonts((prevFonts) =>
          prevFonts.filter((font) => font.name !== fontName)
        );
        setError("");
      } else {
        setError(result.message || "Failed to delete font.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting font.");
    }
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
      {/* <FontGroup availableFonts={fonts} /> */}
      <FontGroupsContainer />
    </div>
  );
};

export default UploadFont;
