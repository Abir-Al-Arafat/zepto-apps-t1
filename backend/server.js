const http = require("http");
const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "uploads");
const DATABASE_FILE = path.join(__dirname, "database.json");

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Ensure the database file exists
if (!fs.existsSync(DATABASE_FILE)) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify({ fonts: [] }, null, 2));
}

// Helper function to parse request body
function parseRequestBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => callback(body));
}

// Helper function to send JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    // Handle font file upload
    const boundary = req.headers["content-type"].split("boundary=")[1];

    parseRequestBody(req, (body) => {
      const parts = body.split(`--${boundary}`);
      let fileData = null;
      let fileName = "";

      parts.forEach((part) => {
        if (part.includes("filename=")) {
          // Extract filename
          const match = part.match(/filename="([^"]+)"/);
          if (match) {
            fileName = match[1];
          }

          // Extract file content
          const fileContentIndex = part.indexOf("\r\n\r\n") + 4;
          fileData = part.substring(
            fileContentIndex,
            part.lastIndexOf("\r\n--")
          );
        }
      });

      if (!fileData || !fileName.endsWith(".ttf")) {
        return sendJSON(res, 400, { error: "Invalid TTF file" });
      }

      // Save file
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, fileData, "binary");

      // Update database
      const db = JSON.parse(fs.readFileSync(DATABASE_FILE));
      db.fonts.push({ name: fileName, path: `/uploads/${fileName}` });
      fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));

      sendJSON(res, 200, {
        message: "File uploaded successfully",
        name: fileName,
      });
    });
  } else if (req.method === "GET" && req.url === "/fonts") {
    // Fetch all fonts
    let dbContent = fs.readFileSync(DATABASE_FILE, "utf-8") || "{}";
    let db;
    try {
      db = JSON.parse(dbContent);
    } catch (err) {
      db = { fonts: [] }; // fallback default
    }

    if (!db.fonts || db.fonts.length === 0) {
      sendJSON(res, 200, { message: "No fonts found in the database." });
    } else {
      sendJSON(res, 200, { fonts: db.fonts });
    }
  } else if (req.method === "DELETE" && req.url.startsWith("/delete-font")) {
    // Delete a font file
    const fontName = req.url.split("?name=")[1];
    if (!fontName) {
      return sendJSON(res, 400, { error: "Font name is required" });
    }

    const db = JSON.parse(fs.readFileSync(DATABASE_FILE));
    const fontIndex = db.fonts.findIndex((f) => f.name === fontName);

    if (fontIndex === -1) {
      return sendJSON(res, 404, { error: "Font not found" });
    }

    // Remove from database
    db.fonts.splice(fontIndex, 1);
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));

    // Remove file from uploads folder
    const filePath = path.join(UPLOADS_DIR, fontName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    sendJSON(res, 200, { message: "Font deleted successfully" });
  } else {
    // Handle 404
    sendJSON(res, 404, { error: "Not Found" });
  }
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
