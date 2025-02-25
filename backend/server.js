const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Improved static file serving with proper MIME types - CASE INSENSITIVE
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path) => {
      const lowercasePath = path.toLowerCase();
      if (lowercasePath.endsWith(".mp4") || lowercasePath.endsWith(".MP4")) {
        res.setHeader("Content-Type", "video/mp4");
      } else if (
        lowercasePath.endsWith(".webm") ||
        lowercasePath.endsWith(".WEBM")
      ) {
        res.setHeader("Content-Type", "video/webm");
      } else if (
        lowercasePath.endsWith(".mov") ||
        lowercasePath.endsWith(".MOV")
      ) {
        res.setHeader("Content-Type", "video/quicktime");
      } else if (
        lowercasePath.endsWith(".avi") ||
        lowercasePath.endsWith(".AVI")
      ) {
        res.setHeader("Content-Type", "video/x-msvideo");
      }
    },
  })
);

// Connect to MongoDB with improved error handling
console.log("Attempting to connect to MongoDB...");
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartfarm")
  .then(() => console.log("MongoDB connection established successfully"))
  .catch((err) => {
    console.log("MongoDB connection error details:");
    console.error(err);
  });

// Add connection event listeners
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory at:", uploadsDir);
}

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Create a more friendly filename with lowercase extension
    const originalExtension = path.extname(file.originalname);
    const lowercaseExtension = originalExtension.toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + lowercaseExtension);
  },
});

// File filter to accept only video files - MORE PERMISSIVE
const fileFilter = (req, file, cb) => {
  // List of allowed video mime types and extensions
  const allowedMimes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
    "video/3gpp",
  ];

  // Check for mime type
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  // If mime type check fails, try extension check
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    [".mp4", ".webm", ".mov", ".avi", ".mpeg", ".3gp", ".mkv"].includes(ext)
  ) {
    cb(null, true);
    return;
  }

  // If both checks fail, reject the file
  cb(
    new Error(
      `Not a supported video file! Supported formats: MP4, WebM, MOV, AVI. Received: ${file.mimetype}`
    ),
    false
  );
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB limit
  },
});

// Create schemas
const Schema = mongoose.Schema;

// Updated Item schema with video support
const ItemSchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  videoUrl: { type: String },
  videoTitle: { type: String },
  mimeType: { type: String },
});

const Item = mongoose.model("Item", ItemSchema);

// Routes with improved error handling and logging
app.get("/api/items", async (req, res) => {
  try {
    console.log("Attempting to fetch items...");
    const items = await Item.find().sort({ date: -1 });
    console.log(`Successfully retrieved ${items.length} items`);
    res.json(items);
  } catch (err) {
    console.error("Error in /api/items route:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  try {
    console.log("Creating new item:", req.body);
    const newItem = new Item({
      name: req.body.name,
    });

    const savedItem = await newItem.save();
    console.log("Item created:", savedItem);
    res.json(savedItem);
  } catch (err) {
    console.error("Error in POST /api/items:", err);
    res.status(400).json({ error: err.message });
  }
});

// Delete an item by ID
app.delete("/api/items/:id", async (req, res) => {
  try {
    console.log(`Attempting to delete item with ID: ${req.params.id}`);

    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    console.log("Item deleted successfully:", deletedItem);
    res.json({ message: "Item deleted successfully", item: deletedItem });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a video file
app.delete("/api/delete-video/:filename", (req, res) => {
  try {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    console.log(`Attempting to delete file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(filePath);
    console.log("File deleted successfully");
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ error: err.message });
  }
});

// Added endpoint to check if a file exists
app.get("/api/check-file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.json({
        exists: false,
        path: filePath,
        error: err.message,
      });
    } else {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        path: filePath,
        size: stats.size,
        isFile: stats.isFile(),
        created: stats.birthtime,
      });
    }
  });
});

// Video upload route
app.post("/api/upload-video", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    console.log("Video uploaded:", req.file);

    // Create new item with video URL
    // Ensure the URL starts with a slash
    const videoUrl = `/uploads/${req.file.filename}`;

    const newItem = new Item({
      name: req.file.originalname || "Uploaded Video",
      videoUrl: videoUrl,
      videoTitle: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    const savedItem = await newItem.save();
    console.log("Video item saved to database:", savedItem);
    res.json(savedItem);
  } catch (err) {
    console.error("Error in video upload:", err);
    res.status(400).json({ error: err.message });
  }
});

// Test endpoint to verify server is running
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running correctly" });
});

// Error handling for multer
app.use((err, req, res, next) => {
  console.error("Express error handler caught:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "File too large. Max size is 100MB." });
    }
    return res.status(400).json({ error: err.message });
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
