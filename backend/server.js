const http = require("http");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, "utf-8").split("\n");
  envLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, value] = trimmed.split("=");
      if (key && value !== undefined) {
        process.env[key] = value.trim();
      }
    }
  });
}

const UPLOADS_DIR = path.join(__dirname, process.env.UPLOADS_DIR || "uploads");
const DATABASE_FILE = path.join(
  __dirname,
  process.env.DATABASE_FILE || "database.json"
);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5174";
const PORT = parseInt(process.env.PORT || "5001", 10);

// const UPLOADS_DIR = path.join(__dirname, "uploads");
// const DATABASE_FILE = path.join(__dirname, "database.json");

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Ensure the database file exists
if (!fs.existsSync(DATABASE_FILE)) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify({ fonts: [] }, null, 2));
}

// Helper functions
const success = (message, data = null) => {
  return {
    success: true,
    message: message,
    data: data,
  };
};

const failure = (message, error = null) => {
  return {
    success: false,
    message: message,
    error: error,
  };
};

function serveStaticFile(req, res) {
  const filePath = path.join(__dirname, req.url);
  if (filePath.startsWith(UPLOADS_DIR) && fs.existsSync(filePath)) {
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, {
      "Content-Type": "font/ttf",
      "Access-Control-Allow-Origin": CORS_ORIGIN,
    });
    stream.pipe(res);
    return true;
  }
  return false;
}

function parseRequestBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => callback(body));
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, PUT, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Serve static .ttf files
  if (serveStaticFile(req, res)) return;
  if (req.method === "POST" && req.url === "/upload") {
    const boundary = req.headers["content-type"].split("boundary=")[1];

    parseRequestBody(req, (body) => {
      const parts = body.split(`--${boundary}`);
      let fileData = null;
      let fileName = "";

      parts.forEach((part) => {
        if (part.includes("filename=")) {
          const match = part.match(/filename="([^"]+)"/);
          if (match) {
            fileName = match[1];
          }

          const fileContentIndex = part.indexOf("\r\n\r\n") + 4;
          fileData = part.substring(
            fileContentIndex,
            part.lastIndexOf("\r\n--")
          );
        }
      });

      if (!fileData || !fileName.endsWith(".ttf")) {
        return sendJSON(res, 400, failure("Invalid TTF file"));
      }

      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, fileData, "binary");

      let db;
      try {
        const dbContent = fs.readFileSync(DATABASE_FILE, "utf-8") || "{}";
        db = JSON.parse(dbContent);
      } catch (err) {
        db = { fonts: [] }; // Fallback in case of invalid JSON
      }
      db.fonts.push({ name: fileName, path: `/uploads/${fileName}` });
      fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));

      sendJSON(
        res,
        200,
        success("File uploaded successfully", { name: fileName })
      );
    });
  } else if (req.method === "GET" && req.url === "/fonts") {
    let dbContent = fs.readFileSync(DATABASE_FILE, "utf-8") || "{}";
    let db;
    try {
      db = JSON.parse(dbContent);
    } catch (err) {
      db = { fonts: [] };
    }

    if (!db.fonts || db.fonts.length === 0) {
      sendJSON(res, 200, success("No fonts found in the database.", []));
    } else {
      sendJSON(res, 200, success("Fonts fetched successfully", db.fonts));
    }
  } else if (req.method === "DELETE" && req.url.startsWith("/delete-font")) {
    const fontName = decodeURIComponent(req.url.split("?name=")[1]);
    if (!fontName) {
      return sendJSON(res, 400, failure("Font name is required"));
    }

    const db = JSON.parse(fs.readFileSync(DATABASE_FILE));
    const fontIndex = db.fonts.findIndex((f) => f.name === fontName);

    if (fontIndex === -1) {
      return sendJSON(res, 404, failure("Font not found"));
    }

    // Remove font from any groups
    if (db.groups && Array.isArray(db.groups)) {
      db.groups = db.groups
        .map((group) => {
          const newFonts = group.fonts.filter((f) => f !== fontName);
          return { ...group, fonts: newFonts };
        })
        .filter((group) => group.fonts.length >= 2); // Delete group if < 2 fonts
    }
    // Remove the font entry
    db.fonts.splice(fontIndex, 1);
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));

    const filePath = path.join(UPLOADS_DIR, fontName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    sendJSON(res, 200, success("Font deleted successfully"));
  } else if (req.method === "POST" && req.url === "/create-group") {
    parseRequestBody(req, (body) => {
      try {
        const { name, fonts } = JSON.parse(body);

        if (!name || !Array.isArray(fonts) || fonts.length < 2) {
          return sendJSON(
            res,
            400,
            failure("Group name and at least two fonts are required")
          );
        }

        const db = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf-8"));
        if (!db.groups) db.groups = [];

        if (db.groups.find((g) => g.name === name)) {
          return sendJSON(res, 409, failure("Group name already exists"));
        }

        const allFontNames = db.fonts.map((f) => f.name);
        const invalidFonts = fonts.filter((f) => !allFontNames.includes(f));

        if (invalidFonts.length > 0) {
          return sendJSON(
            res,
            400,
            failure(`Invalid font names: ${invalidFonts.join(", ")}`)
          );
        }

        db.groups.push({ name, fonts });
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
        sendJSON(res, 201, success("Group created successfully"));
      } catch (err) {
        sendJSON(res, 500, failure("Failed to create group", err));
      }
    });
  } else if (req.method === "PUT" && req.url === "/edit-group") {
    parseRequestBody(req, (body) => {
      try {
        const { oldName, newName, fonts } = JSON.parse(body);

        if (!oldName || (!newName && !fonts)) {
          return sendJSON(res, 400, failure("Invalid edit request"));
        }

        const db = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf-8"));
        if (!db.groups) db.groups = [];

        const group = db.groups.find((g) => g.name === oldName);
        if (!group) {
          return sendJSON(res, 404, failure("Group not found"));
        }

        if (newName) group.name = newName;
        if (fonts) {
          const allFontNames = db.fonts.map((f) => f.name);
          const invalidFonts = fonts.filter((f) => !allFontNames.includes(f));
          if (invalidFonts.length > 0) {
            return sendJSON(
              res,
              400,
              failure(`Invalid font names: ${invalidFonts.join(", ")}`)
            );
          }
          group.fonts = fonts;
        }

        fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
        sendJSON(res, 200, success("Group updated successfully"));
      } catch (err) {
        sendJSON(res, 500, failure("Failed to update group", err));
      }
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/delete-group")) {
    const groupName = req.url.split("?name=")[1];
    if (!groupName) {
      return sendJSON(res, 400, failure("Group name is required"));
    }

    const db = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf-8"));
    if (!db.groups) db.groups = [];

    const groupIndex = db.groups.findIndex((g) => g.name === groupName);
    if (groupIndex === -1) {
      return sendJSON(res, 404, failure("Group not found"));
    }

    db.groups.splice(groupIndex, 1);
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
    sendJSON(res, 200, success("Group deleted successfully"));
  } else if (req.method === "GET" && req.url === "/groups") {
    try {
      const dbContent = fs.readFileSync(DATABASE_FILE, "utf-8") || "{}";
      const db = JSON.parse(dbContent);
      const groups = db.groups || [];

      if (groups.length === 0) {
        sendJSON(res, 200, success("No groups found", []));
      } else {
        sendJSON(res, 200, success("Groups fetched successfully", groups));
      }
    } catch (err) {
      sendJSON(res, 500, failure("Failed to fetch groups", err));
    }
  } else {
    sendJSON(res, 404, failure("Not Found"));
  }
});

// Start the server
// const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
