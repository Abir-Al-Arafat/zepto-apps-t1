import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { CloudUpload } from "react-bootstrap-icons";
import FontList from "./FontList";
import FontGroupsContainer from "./FontGroupsContainer";

const UploadFont = () => {
  const [fonts, setFonts] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState("");
  const [fontToDelete, setFontToDelete] = useState<null | {
    name: string;
    usedInGroups: string[];
  }>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            url: `http://localhost:5001${font.path}`,
          })
        );

        setFonts(formattedFonts);
      }
    } catch (error) {
      console.error("Failed to fetch fonts:", error);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  // 🧨 Delete Trigger - Fetch Groups Before Confirming
  const handleDelete = async (fontName: string) => {
    try {
      const response = await fetch("http://localhost:5001/groups");
      const result = await response.json();
      if (!result.success) throw new Error("Failed to fetch groups");

      const groupsUsingFont = result.data
        .filter((group: { name: string; fonts: string[] }) =>
          group.fonts.includes(fontName)
        )
        .map((group: { name: string }) => group.name);

      setFontToDelete({ name: fontName, usedInGroups: groupsUsingFont });
      setShowDeleteModal(true);
    } catch (err) {
      console.error("Error checking font usage in groups:", err);
      setError("Couldn't check group usage.");
    }
  };

  // 🧨 Confirm Actual Deletion
  const confirmDelete = async () => {
    if (!fontToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5001/delete-font?name=${encodeURIComponent(
          fontToDelete.name
        )}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (result.success) {
        setFonts((prevFonts) =>
          prevFonts.filter((f) => f.name !== fontToDelete.name)
        );
        setError("");
      } else {
        setError(result.message || "Failed to delete font.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting font.");
    } finally {
      setFontToDelete(null);
      setShowDeleteModal(false);
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

      <FontGroupsContainer />

      {/* Confirmation Modal */}
      {showDeleteModal && fontToDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 9999 }}
        >
          <div
            className="bg-white rounded shadow p-4"
            style={{ width: "90%", maxWidth: "400px" }}
          >
            <h5 className="text-danger">Delete Font</h5>
            <p>
              Are you sure you want to delete{" "}
              <strong>{fontToDelete.name}</strong>?
            </p>

            {fontToDelete.usedInGroups.length > 0 && (
              <div className="mb-3">
                <p>This font is used in the following group(s):</p>
                <ul>
                  {fontToDelete.usedInGroups.map((group) => (
                    <li key={group}>{group}</li>
                  ))}
                </ul>
                <small className="text-danger">
                  It will be removed from those groups. Groups with fewer than 2
                  fonts will be deleted.
                </small>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFont;
